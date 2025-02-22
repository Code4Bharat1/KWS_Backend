import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { uploadFiles } from "../middleware/fileUpload.js";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import * as XLSX from "xlsx"


export const getTransactionList = async (req, res) => {
  try {
    const recentCount = parseInt(req.query.recentCount);

    const findManyOptions = {
      include: {
        core_sandouqchaboxholder: {
          select: {
            id: true,
            number: true,
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
            kwsid: true,
          },
        },
        core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    };

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
        holderDetails?.kuwait_contact ||
        holderDetails?.indian_contact_no_1 ||
        holderDetails?.indian_contact_no_2 ||
        "No Contact";

      // Enhanced total calculation logic
      const total =
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
        (transaction.coin_5 || 0) * 0.005;

      return {
        id: transaction.id,
        transactionId: transaction.TID,
        status: transaction.status,
        date: transaction.date.toISOString().split("T")[0],
        boxNumber: transaction.core_sandouqchaboxholder?.number || "Unknown",
        collectedBy: transaction.core_kwsmember
          ? `${transaction.core_kwsmember.first_name} ${transaction.core_kwsmember.last_name} - ${transaction.core_kwsmember.kwsid}`
          : "Unknown",
        approvedByKwsid: transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember
          ? `${transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember.first_name} ${transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember.last_name} - ${transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember.kwsid}`
          : "Not Approved",
        holderName,
        zone,
        holderContact,
        total: parseFloat(total.toFixed(3)),
        transactionSlip: transaction.slip || null,
      };
    });

    res.status(200).json({
      transactions: transactionsWithDetails,
      totalTransactions,
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
        committedId // Get the logged-in user's ID from the request body or headers
      } = req.body;

      // Handle the transaction slip file URL
      const transactionSlipUrl = req.files?.transactionSlip
        ? `/uploads/transaction-slips/${req.files.transactionSlip[0].filename}`
        : null;

      // Validate required fields
      if (  !date || !boxId || !collectedByKwsid || !committedId) {
        return res.status(400).json({ error: "Transaction ID, Date, boxId, collectedByKwsid, and committedId are required." });
      }

      // Convert date to a Date object and validate
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Expected ISO-8601 DateTime." });
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

      // Create a new transaction entry
      const newTransaction = await prisma.core_sandouqchatransaction.create({
        data: {
          TID: transactionId,
          date: parsedDate, // Pass the validated date
          box_id: boxHolder.id,
          collected_by_id: member.user_id,
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
          slip: transactionSlipUrl,
          status: "Pending",  // Set status as "Pending"
        },
      });

      // Create a log for this transaction
      await prisma.core_auditsandouqchatransaction.create({
        data: {
          action: "CREATED",
          transaction_id: newTransaction.id,
          committed_id: committedId,
          date: new Date(date), // Ensure date is a valid Date object
          note_20: parseInt(note_20, 10) || 0, // Convert note_20 to an integer
          note_10: parseInt(note_10, 10) || 0, // Convert note_10 to an integer
          note_5: parseInt(note_5, 10) || 0, // Convert note_5 to an integer
          note_1: parseInt(note_1, 10) || 0, // Convert note_1 to an integer
          note_0_5: parseFloat(note_0_5) || 0, // Convert note_0_5 to a float
          note_0_25: parseFloat(note_0_25) || 0, // Convert note_0_25 to a float
          coin_100: parseInt(coin_100, 10) || 0, // Convert coin_100 to an integer
          coin_50: parseInt(coin_50, 10) || 0, // Convert coin_50 to an integer
          coin_20: parseInt(coin_20, 10) || 0, // Convert coin_20 to an integer
          coin_10: parseInt(coin_10, 10) || 0, // Convert coin_10 to an integer
          coin_5: parseInt(coin_5, 10) || 0, // Convert coin_5 to an integer
          created_at: new Date(), // Set the created_at field to the current date and time
          status: "Pending", // Set the status as Pending
          TID: newTransaction.TID || transactionId, // Use transactionId as fallback for TID
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

    const transaction = await prisma.core_sandouqchatransaction.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        core_sandouqchaboxholder: {
          select: {
            number: true, // Box number
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
        core_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
        core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember: {
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

    // Collected By KWSID
    const collectedBy = transaction.core_kwsmember
      ? `${transaction.core_kwsmember.kwsid}`
      : "Unknown";

    // Approved By KWSID
    const approvedBy = transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember
      ? `${transaction.core_kwsmember_core_sandouqchatransaction_approved_by_idTocore_kwsmember.kwsid}`
      : "Not Approved";

    // Holder Name (KWS or Non-KWS)
    let holderName = "Unknown";
    if (transaction.core_sandouqchaboxholder) {
      const memberData = transaction.core_sandouqchaboxholder.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember;
      const nonMemberData = transaction.core_sandouqchaboxholder.core_nonkwsmember;

      if (memberData) {
        holderName = `${memberData.first_name} ${memberData.last_name} - ${memberData.kwsid}`;
      } else if (nonMemberData) {
        holderName = `${nonMemberData.first_name} ${nonMemberData.last_name}`;
      }
    }

    // Calculate Total
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

    // Prepare Response
    const response = {
      id: transaction.id,
      transactionId: transaction.TID,
      date: transaction.date.toISOString().split("T")[0], // Format date
      boxNumber: transaction.core_sandouqchaboxholder?.number || "Unknown",
      collectedByKwsid: collectedBy,
      approvedByKwsid: approvedBy,
      holderName: holderName,
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
        approvedByKwsid,
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


      let approve = null;
      if (approvedByKwsid) {
        approve = await prisma.core_kwsmember.findFirst({
          where: { kwsid: approvedByKwsid.trim() },
        });
        if (!approve) {
          return res.status(400).json({ error: "Invalid approvedByKwsid." });
        }
      }

      // Convert boxId to a number and check if the box exists
      const boxIdNumber = parseInt(boxId, 10);
      const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
        where: { number: boxIdNumber },
      });
      if (!boxHolder) {
        return res.status(400).json({ error: "Invalid box number." });
      }

      const updateData = {
        date: new Date(date),
        box_id: boxHolder.id,
        collected_by_id: member.user_id,
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
      if (approvedByKwsid) {
        updateData.approved_by_id = approve?.user_id;
      }
      // Only update the transaction_slip field if a new file was uploaded.
      if (transactionSlipUrl !== undefined) {
        updateData.slip = transactionSlipUrl;
      }

      // Update the transaction in the database
      const updatedTransaction = await prisma.core_sandouqchatransaction.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      // Create a log for this modification with action "MODIFIED"
      await prisma.core_auditsandouqchatransaction.create({
        data: {
          action: "MODIFIED",  // Action type for the log
          transaction_id: updatedTransaction.id,
          committed_id: req.body.committedId,
          date: new Date(date), // Ensure date is a valid Date object
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
          created_at: new Date(), // Set the created_at field to the current date and time
          status: status || "pending", // Set the status as Pending
          TID: updatedTransaction.TID || req.body.transactionId, // Use transactionId as fallback for TID
        },
      });

      // Respond with the updated transaction
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
    // First, delete the dependent records in the related table (e.g., core_auditsandouqcha)
    await prisma.core_auditsandouqchatransaction.deleteMany({
      where: {
        transaction_id: BigInt(id), // Ensure the ID is treated as BigInt
      },
    });

    // Now, delete the transaction itself
    const deletedTransaction = await prisma.core_sandouqchatransaction.delete({
      where: {
        id: BigInt(id), // Ensure the ID is treated as BigInt
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




export const logs = async (req, res) => {
  const { id } = req.params; // Retrieve 'transaction_id' from the request params

  if (!id) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  try {
    // Fetch logs based on the transaction_id
    const logs = await prisma.core_auditsandouqchatransaction.findMany({
      where: {
        transaction_id: id, 
      },
      include: {
        core_kwsmember_core_auditsandouqchatransaction_collected_by_idTocore_kwsmember: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
        core_kwsmember_core_auditsandouqchatransaction_committed_idTocore_kwsmember: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
      },
      orderBy: {
        created_at: "desc", // Order logs by timestamp (most recent first)
      },
    });

    if (logs.length === 0) {
      return res.status(404).json({ error: "No logs found for this transaction ID." });
    }

    // Format the logs to include required fields and user details
    const formattedLogs = logs.map((log) => {
      // Calculate the total value from coins and notes
      const total =
        log.note_20 * 20 +
        log.note_10 * 10 +
        log.note_5 * 5 +
        log.note_1 * 1 +
        log.note_0_5 * 0.5 +
        log.note_0_25 * 0.25 +
        log.coin_100 * 100 +
        log.coin_50 * 50 +
        log.coin_20 * 20 +
        log.coin_10 * 10 +
        log.coin_5 * 5;

      return {
        id: log.id,
        action: log.action || "N/A",
        transaction_id: log.transaction_id || "N/A",
        date: log.date ? new Date(log.date).toLocaleDateString() : "N/A", // Format the date
        note_20: log.note_20 || 0,
        note_10: log.note_10 || 0,
        note_5: log.note_5 || 0,
        note_1: log.note_1 || 0,
        note_0_5: log.note_0_5 || 0,
        note_0_25: log.note_0_25 || 0,
        coin_100: log.coin_100 || 0,
        coin_50: log.coin_50 || 0,
        coin_20: log.coin_20 || 0,
        coin_10: log.coin_10 || 0,
        coin_5: log.coin_5 || 0,
        total: total, // Add the calculated total here
        collected_by: log.core_kwsmember_core_auditsandouqchatransaction_collected_by_idTocore_kwsmember
          ? `${log.core_kwsmember_core_auditsandouqchatransaction_collected_by_idTocore_kwsmember.kwsid} - ${log.core_kwsmember_core_auditsandouqchatransaction_collected_by_idTocore_kwsmember.first_name} ${log.core_kwsmember_core_auditsandouqchatransaction_collected_by_idTocore_kwsmember.last_name}`
          : "Unknown",
        committed_by: log.core_kwsmember_core_auditsandouqchatransaction_committed_idTocore_kwsmember
          ? `${log.core_kwsmember_core_auditsandouqchatransaction_committed_idTocore_kwsmember.kwsid} - ${log.core_kwsmember_core_auditsandouqchatransaction_committed_idTocore_kwsmember.first_name} ${log.core_kwsmember_core_auditsandouqchatransaction_committed_idTocore_kwsmember.last_name}`
          : "Unknown",
      };
    });

    // Return the formatted logs in the response
    return res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ error: "An error occurred while fetching the logs." });
  }
};




export const count = async (req, res)=> {
  try {
    // Get total count of transactions (counting rows in core_membertransaction)
    const count = await prisma.core_sandouqchatransaction.count();

    return res.status(200).json({ count }); // Returning "count" instead of "transaction_count"
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res.status(500).json({ error: "Server error while fetching transaction count." });
  }
};