import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { uploadFiles } from "../middleware/fileUpload.js";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import * as XLSX from "xlsx"


export const getTransactionList = async (req, res) => {
  try {
    // Parse recentCount from query parameters
    const recentCount = parseInt(req.query.recentCount);

    // Build the findMany options
    const findManyOptions = {
      include: {
        core_sandouqchaboxholder: {
          select: {
            id: true, // Ensure the `id` is fetched for validation
            number: true, // Fetch the box number
            core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                indian_contact_no_1: true,
                indian_contact_no_2: true,
                kuwait_contact: true,
                zone_member: true,
                kwsid: true,
              },
            },
            core_nonkwsmember: {
              select: {
                first_name: true,
                last_name: true,
                contact: true,
              },
            },
          },
        },
        core_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    };

    // If recentCount is provided and valid, add the take parameter
    if (!isNaN(recentCount) && recentCount > 0) {
      findManyOptions.take = recentCount;
    }

    const transactions = await prisma.core_sandouqchatransaction.findMany(findManyOptions);

    // Get the total count of transactions
    const totalTransactions = await prisma.core_sandouqchatransaction.count();

    // Map transactions to include the box number and other details
    const transactionsWithDetails = transactions.map((transaction) => {
      const holderDetails =
        transaction.core_sandouqchaboxholder?.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember ||
        transaction.core_sandouqchaboxholder?.core_nonkwsmember ||
        null;

      const holderName = holderDetails
        ? `${holderDetails.first_name} ${holderDetails.last_name}${holderDetails.kwsid ? `-${holderDetails.kwsid}` : ""}`
        : "Unknown";

      const zone = holderDetails?.zone_member;

      const holderContact =
        holderDetails?.indian_contact_no_1 ||
        holderDetails?.indian_contact_no_2 ||
        holderDetails?.kuwait_contact ||
        "No Contact";

      // Enhanced total calculation logic
      const total =
        (transaction.note_20 || 0) * 20 +
        (transaction.note_10 || 0) * 10 +
        (transaction.note_5 || 0) * 5 +
        (transaction.note_1 || 0) * 1 +
        (transaction.note_0_5 || 0) * 0.5 + // 0.5 KD = 500 fils
        (transaction.note_0_25 || 0) * 0.25 + // 0.25 KD = 250 fils
        (transaction.coin_100 || 0) * 0.1 + // 100 fils = 0.1 KD
        (transaction.coin_50 || 0) * 0.05 + // 50 fils = 0.05 KD
        (transaction.coin_20 || 0) * 0.02 + // 20 fils = 0.02 KD
        (transaction.coin_10 || 0) * 0.01 + // 10 fils = 0.01 KD
        (transaction.coin_5 || 0) * 0.005; // 5 fils = 0.005 KD

      return {
        id: transaction.id,
        transactionId: transaction.TID,
        status: transaction.status,
        date: transaction.date.toISOString().split("T")[0], // Format date
        boxNumber: transaction.core_sandouqchaboxholder?.number || "Unknown", // Display the box number
        collectedBy: transaction.core_kwsmember
          ? `${transaction.core_kwsmember.first_name} ${transaction.core_kwsmember.last_name}`
          : "Unknown",
        holderName,
        zone,
        holderContact,
        total: parseFloat(total.toFixed(3)), // Round total to 3 decimal places
        transactionSlip: transaction.slip || null,
      };
    });

    res.status(200).json({
      transactions: transactionsWithDetails,
      totalTransactions: totalTransactions, // Add total count of transactions
    });
  } catch (error) {
    console.error("Error fetching transaction list:", error);
    res.status(500).json({ error: "An error occurred while fetching the transaction list." });
  }
};




export const addTransaction = async (req, res) => {
  try {
    // Use multer to handle file uploads (only transactionSlip)
    uploadFiles(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Extract the form data and file URL from req.body
      const {
        transactionId,
        date,
        boxId, // Should be passed as a number string
        collectedByKwsid,
        note_20,
        note_10,
        note_5,
        note_1,
        note_0_5,
        note_0_25,
        coin_100,
        coin_50,
        coin_20,
        coin_10,
        coin_5,
        // Do not use status from req.body as it is being overwritten with "Pending"
      } = req.body;

      // Handle the transaction slip file URL
      const transactionSlipUrl = req.files?.transactionSlip
        ? `/uploads/transaction-slips/${req.files.transactionSlip[0].filename}`
        : null;

      // Validate required fields
      if (!transactionId || !date || !boxId || !collectedByKwsid) {
        return res.status(400).json({ error: "Transaction ID, Date, boxId, and collectedByKwsid are required." });
      }

      // Convert boxId to a number
      const boxIdNumber = parseInt(boxId, 10);

      // Fetch the box holder's details using the box number
      const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
        where: {
          number: boxIdNumber,
        },
      });

      if (!boxHolder) {
        return res.status(400).json({ error: `Box number ${boxId} does not exist.` });
      }

      // Fetch the member's details using the collectedByKwsid
      const member = await prisma.core_kwsmember.findFirst({
        where: {
          kwsid: collectedByKwsid,
        },
      });

      if (!member) {
        return res.status(400).json({ error: "Invalid collectedByKwsid." });
      }

      // Create a new transaction entry with proper type conversion for numeric fields
      const newTransaction = await prisma.core_sandouqchatransaction.create({
        data: {
          TID: transactionId,
          date: new Date(date),
          box_id: boxHolder.id, // Using the resolved box holder ID
          collected_by_id: member.user_id, // Using the resolved member user ID
          note_20: parseInt(note_20, 10) || 0,
          note_10: parseInt(note_10, 10) || 0,
          note_5: parseInt(note_5, 10) || 0,
          note_1: parseInt(note_1, 10) || 0,
          note_0_5: parseFloat(note_0_5) || 0,
          note_0_25: parseFloat(note_0_25) || 0,
          coin_100: parseInt(coin_100, 10) || 0,
          coin_50: parseInt(coin_50, 10) || 0,
          coin_20: parseInt(coin_20, 10) || 0,
          coin_10: parseInt(coin_10, 10) || 0,
          coin_5: parseInt(coin_5, 10) || 0,
          slip: transactionSlipUrl, // Store the file URL here
          status: "Pending",  // Set status as "Pending"
        },
      });

      // Respond with the newly created transaction
      res.status(201).json({
        message: "Transaction added successfully.",
        transaction: newTransaction,
      });
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "An error occurred while adding the transaction." });
  }
};





export const viewTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Extract transaction ID from request parameters

    // Validate transaction ID
    if (!id) {
      return res.status(400).json({ error: "Transaction ID is required." });
    }

    // Fetch the transaction details.
    // Note: We assume the primary key is of type BigInt,
    // so we convert the id parameter from string to BigInt.
    const transaction = await prisma.core_sandouqchatransaction.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        // Include associated box-holder data
        core_sandouqchaboxholder: {
          select: {
            number: true, // This will be used for the box number
            // If you have holder details (for non-members or members linked to the box holder),
            // you can select them as needed. For example:
            core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: {
              select: {
                first_name: true,
                last_name: true,
                kwsid: true,
              },
            },
            core_nonkwsmember: {
              select: {
                first_name: true,
                last_name: true,
                contact: true,
              },
            },
          },
        },
        // Include the member who collected the transaction
        core_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Construct 'collectedBy' using the core_kwsmember details.
    // If core_kwsmember is not available, return "Unknown".
    const collectedBy = transaction.core_kwsmember
      ? ` ${transaction.core_kwsmember.kwsid}`
      : "Unknown";

    // Construct 'holderName'. We attempt to get holder info from box holder.
    // Adjust this according to your actual relations. Here we consider two possibilities:
    // 1. If the box holder has a linked member from core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.
    // 2. Otherwise, if it has core_nonkwsmember details.
    let holderName = "Unknown";
    if (transaction.core_sandouqchaboxholder) {
      if (transaction.core_sandouqchaboxholder.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember) {
        const memberData = transaction.core_sandouqchaboxholder.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember;
        holderName = `${memberData.first_name} ${memberData.last_name} - ${memberData.kwsid}`;
      } else if (transaction.core_sandouqchaboxholder.core_nonkwsmember) {
        const nonMemberData = transaction.core_sandouqchaboxholder.core_nonkwsmember;
        holderName = `${nonMemberData.first_name} ${nonMemberData.last_name}`;
      }
    }

    // Compute the total from notes and coins
    const total = parseFloat(
      (
        (transaction.note_20 || 0) * 20 +
        (transaction.note_10 || 0) * 10 +
        (transaction.note_5 || 0) * 5 +
        (transaction.note_1 || 0) * 1 +
        (transaction.note_0_5 || 0) * 0.5 +
        (transaction.note_0_25 || 0) * 0.25 +
        (transaction.coin_100 || 0) * 0.1 +
        (transaction.coin_50 || 0) * 0.05 +
        (transaction.coin_20 || 0) * 0.02 +
        (transaction.coin_10 || 0) * 0.01 +
        (transaction.coin_5 || 0) * 0.005
      ).toFixed(3)
    );

    const response = {
      id: transaction.id,
      transactionId: transaction.TID, // Transaction ID
      date: transaction.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      boxNumber: transaction.core_sandouqchaboxholder?.number || "",
      collectedByKwsid: collectedBy,
      holderName: holderName,
      // If you need to include the file URL for the transaction slip:
      transactionSlipUrl: transaction.slip || "",
      notes: {
        note_20: transaction.note_20,
        note_10: transaction.note_10,
        note_5: transaction.note_5,
        note_1: transaction.note_1,
        note_0_5: transaction.note_0_5,
        note_0_25: transaction.note_0_25,
      },
      coins: {
        coin_100: transaction.coin_100,
        coin_50: transaction.coin_50,
        coin_20: transaction.coin_20,
        coin_10: transaction.coin_10,
        coin_5: transaction.coin_5,
      },
      total: total,
      status: transaction.status,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error viewing transaction:", error);
    res.status(500).json({ error: "An error occurred while retrieving the transaction." });
  }
};






export const editTransaction = async (req, res) => {
  try {
    // Use multer to handle file uploads (if a new transactionSlip is provided)
    uploadFiles(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Extract form data and (optionally) a file from req.body/req.files
      const {
        id, 
        date,
        boxId, 
        collectedByKwsid,
        note_20,
        note_10,
        note_5,
        note_1,
        note_0_5,
        note_0_25,
        coin_100,
        coin_50,
        coin_20,
        coin_10,
        coin_5,
        status,
      } = req.body;

      // Log the collectedByKwsid for debugging:
      // console.log("Received collectedByKwsid:", collectedByKwsid);

      // If a new transaction slip file is uploaded, build its URL;
      // if not, leave the field unchanged.
      const transactionSlipUrl = req.files?.transactionSlip
        ? `/uploads/transaction-slips/${req.files.transactionSlip[0].filename}`
        : undefined; // undefined means "no change" to the field

      // Validate required fields
      if (!id || !date || !boxId || !collectedByKwsid) {
        return res.status(400).json({ error: "Transaction ID, date, boxId, and collectedByKwsid are required." });
      }

      // Look up the member by kwsid. Trim the value in case of extra spaces.
      const member = await prisma.core_kwsmember.findFirst({
        where: { kwsid: collectedByKwsid.trim() },
      });
      if (!member) {
        return res.status(400).json({ error: "Invalid collectedByKwsid." });
      }

      // Convert boxId to a number and check if the box exists
      const boxIdNumber = parseInt(boxId, 10);
      const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
        where: { number: boxIdNumber },
      });
      if (!boxHolder) {
        return res.status(400).json({ error: "Invalid box number." });
      }

      // Prepare update data with proper type conversions
      const updateData = {
        date: new Date(date),
        box_id: boxHolder.id,
        collected_by_id: member.user_id, // Use member.user_id as done in addTransaction
        note_20: parseInt(note_20, 10) || 0,
        note_10: parseInt(note_10, 10) || 0,
        note_5: parseInt(note_5, 10) || 0,
        note_1: parseInt(note_1, 10) || 0,
        note_0_5: parseFloat(note_0_5) || 0,
        note_0_25: parseFloat(note_0_25) || 0,
        coin_100: parseInt(coin_100, 10) || 0,
        coin_50: parseInt(coin_50, 10) || 0,
        coin_20: parseInt(coin_20, 10) || 0,
        coin_10: parseInt(coin_10, 10) || 0,
        coin_5: parseInt(coin_5, 10) || 0,
        status: status || "pending", // Update the status (default "pending" if not provided)
      };

      // Only update the transaction_slip field if a new file was uploaded.
      if (transactionSlipUrl !== undefined) {
        updateData.slip = transactionSlipUrl;
      }

      // Update the transaction in the database
      const updatedTransaction = await prisma.core_sandouqchatransaction.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        message: "Transaction updated successfully.",
        transaction: updatedTransaction,
      });
    });
  } catch (error) {
    console.error("Error editing transaction:", error);
    res.status(500).json({ error: "An error occurred while editing the transaction." });
  }
};




export const deleteTransaction = async (req, res) => {
  const { id } = req.params; 

  if (!id) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  try {
  
    const deletedTransaction = await prisma.core_sandouqchatransaction.delete({
      where: {
        id: BigInt(id), // Ensure the ID is treated as a BigInt for Prisma
      },
    });

    return res.status(200).json({
      message: "Transaction deleted successfully.",
      deletedTransaction,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ error: "An error occurred while deleting the transaction." });
  }
};



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Bulk transaction handler
export const bulkTransaction = async (req, res) => {
  // Use multer middleware to process a single file upload
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const fileExtension = filePath.split('.').pop().toLowerCase();
    let transactions = [];

    try {
      // Parse the file based on its extension
      if (fileExtension === "csv") {
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
              transactions.push(row);
            })
            .on("end", () => resolve())
            .on("error", (error) => reject(error));
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        transactions = XLSX.utils.sheet_to_json(sheet);
      } else {
        return res.status(400).json({ error: "Invalid file type. Only CSV and Excel files are allowed." });
      }

      // Arrays to hold successful and failed transactions
      const createdTransactions = [];
      const errors = [];

      const transactionPromises = transactions.map(async (t) => {
        const {
          transactionId,
          date,
          boxId,
          collectedByKwsid, // collectedByKwsid is the identifier that links to user_id
          note_20,
          note_10,
          note_5,
          note_1,
          note_0_5,
          note_0_25,
          coin_100,
          coin_50,
          coin_20,
          coin_10,
          coin_5,
        } = t;

        // Validate required fields
        if (!transactionId || !date || !boxId || !collectedByKwsid) {
          errors.push({ transactionId, message: "Missing required fields." });
          return;
        }

        const boxIdNumber = parseInt(boxId, 10);
        // Fetch the box holder's details
        const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
          where: { number: boxIdNumber },
        });
        if (!boxHolder) {
          errors.push({ transactionId, message: `Box number ${boxId} does not exist.` });
          return;
        }

        // Fetch the member's details using collectedByKwsid and extract user_id
        const member = await prisma.core_kwsmember.findFirst({
          where: {
            kwsid: {
              equals: collectedByKwsid,
              mode: 'insensitive',  // Case-insensitive comparison
            }
          }
        });

        // console.log("Searching for member with kwsid:", collectedByKwsid);

        if (!member) {
          errors.push({ transactionId, message: `Invalid collectedByKwsid for transaction: ${collectedByKwsid}` });
          return;
        }

        const user_id = member.user_id; // Get the user_id from the fetched member

        // Create a new transaction using user_id instead of collectedByKwsid
        try {
          await prisma.core_sandouqchatransaction.create({
            data: {
              TID: transactionId,
              date: new Date(date),
              box_id: boxHolder.id,
              collected_by_id: user_id, // Store user_id instead of kwsid
              note_20: parseInt(note_20, 10) || 0,
              note_10: parseInt(note_10, 10) || 0,
              note_5: parseInt(note_5, 10) || 0,
              note_1: parseInt(note_1, 10) || 0,
              note_0_5: parseFloat(note_0_5) || 0,
              note_0_25: parseFloat(note_0_25) || 0,
              coin_100: parseInt(coin_100, 10) || 0,
              coin_50: parseInt(coin_50, 10) || 0,
              coin_20: parseInt(coin_20, 10) || 0,
              coin_10: parseInt(coin_10, 10) || 0,
              coin_5: parseInt(coin_5, 10) || 0,
            },
          });
          createdTransactions.push({ TID: transactionId, box_id: boxId, collected_by_id: user_id });
        } catch (error) {
          errors.push({ transactionId, message: `Failed to create transaction: ${error.message}` });
        }
      });

      // Wait until all transactions are processed
      await Promise.all(transactionPromises);

      // Send response with results (both successful and failed)
      res.status(201).json({
        message: "Bulk upload completed.",
        createdTransactions: createdTransactions, // Return successful transactions
        errors: errors.length > 0 ? errors : null, // Send error details if any
      });
    } catch (error) {
      console.error("Error processing bulk transactions:", error);
      res.status(500).json({ error: error.message });
    } finally {
      // Optionally delete the uploaded file after processing
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  });
};




export const Logs = async (req,res)=> {

};