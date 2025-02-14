import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const formatDate = (date) => {
  if (!date) return "N/A";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options); // Example: "6 June 2024"
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.000";
  return parseFloat(amount).toFixed(3); // Ensure it's a number and format to 3 decimal places
};

export const addTransactions = async (req, res) => {
  try {
    const {
      kwsId,
      paymentFor, // Maps to `category` field
      cardPrintedDate,
      cardExpiryDate,
      amountKWD,
      date,
      remarks,
      committedId,
    } = req.body;

    // Validate the input
    if (!kwsId || !paymentFor || !amountKWD || !date) {
      return res.status(400).json({
        error:
          "KWS ID, Payment For, Amount (KWD), and Date are required fields.",
      });
    }

    // Find the member by KWS ID
    const member = await prisma.core_kwsmember.findFirst({
      where: { kwsid: kwsId },
      select: {
        user_id: true,
        card_printed_date: true,
        card_expiry_date: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        error: "No member found with the provided KWS ID.",
      });
    }

    // Validate and parse the dates
    const parseDate = (dateString) => {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate)) {
        return null; // Invalid date format
      }
      return parsedDate;
    };

    const validCardPrintedDate = cardPrintedDate
      ? parseDate(cardPrintedDate)
      : member.card_printed_date;
    const validCardExpiryDate = cardExpiryDate
      ? parseDate(cardExpiryDate)
      : member.card_expiry_date;

    if (!validCardPrintedDate && cardPrintedDate) {
      return res
        .status(400)
        .json({ error: "Invalid Card Printed Date format." });
    }

    if (!validCardExpiryDate && cardExpiryDate) {
      return res
        .status(400)
        .json({ error: "Invalid Card Expiry Date format." });
    }

    // Update `core_kwsmember` fields if provided
    await prisma.core_kwsmember.update({
      where: { user_id: member.user_id },
      data: {
        card_printed_date: validCardPrintedDate,
        card_expiry_date: validCardExpiryDate,
      },
    });

    // Create a new transaction
    const newTransaction = await prisma.core_membertransaction.create({
      data: {
        member_id: member.user_id,
        category: paymentFor,
        amount: parseFloat(amountKWD),
        date: new Date(date),
        remarks: remarks || null,
      },
    });

    // ==============================
    // LOG CREATION
    // ==============================
    await prisma.core_auditmembertransactions.create({
      data: {
        category: newTransaction.category,
        amount: newTransaction.amount,
        date: newTransaction.date,
        remarks: newTransaction.remarks,
        action: "CREATED",
        created_date: new Date(),
        committed_id: committedId, // or some valid user ID if available
        member_id: newTransaction.member_id,
        transaction_id: newTransaction.id,
      },
    });

    res.status(201).json({
      message: "Transaction added successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      error: "An error occurred while adding the transaction.",
    });
  }
};

export const editTransactionofIndividual = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      cardPrintedDate,
      cardExpiryDate,
      amountKWD,
      date,
      remarks,
      committedId,
    } = req.body;

    // Validate transaction_id
    if (!id) {
      return res.status(400).json({ error: "Transaction ID is required." });
    }

    // Validate that at least one field to update is provided
    if (
      !category &&
      !cardPrintedDate &&
      !cardExpiryDate &&
      !amountKWD &&
      !date &&
      !remarks
    ) {
      return res
        .status(400)
        .json({ error: "At least one field to update must be provided." });
    }

    // Find the existing transaction (for error checking)
    const oldTransaction = await prisma.core_membertransaction.findUnique({
      where: { id: BigInt(id) },
    });

    if (!oldTransaction) {
      return res
        .status(404)
        .json({ error: "No transaction found with the provided ID." });
    }

    // Build the update data for core_membertransaction
    const updateData = {};
    if (category) updateData.category = category;
    if (amountKWD !== undefined) updateData.amount = parseFloat(amountKWD);
    if (date) updateData.date = new Date(date);
    if (remarks !== undefined) updateData.remarks = remarks;

    // Update the transaction in the database
    const updatedTransaction = await prisma.core_membertransaction.update({
      where: {
        id: BigInt(id),
      },
      data: updateData,
    });

    // Update related fields in core_kwsmember if provided
    if (cardPrintedDate !== undefined || cardExpiryDate !== undefined) {
      const updateCoreMemberData = {};

      // If `cardPrintedDate` is `null`, we remove it; if string, we parse it.
      if (cardPrintedDate !== undefined) {
        updateCoreMemberData.card_printed_date =
          cardPrintedDate === null ? null : new Date(cardPrintedDate);
      }

      // Same logic for expiry date
      if (cardExpiryDate !== undefined) {
        updateCoreMemberData.card_expiry_date =
          cardExpiryDate === null ? null : new Date(cardExpiryDate);
      }

      if (Object.keys(updateCoreMemberData).length > 0) {
        await prisma.core_kwsmember.update({
          where: { user_id: updatedTransaction.member_id },
          data: updateCoreMemberData,
        });
      }
    }

    // ==============================
    // LOG UPDATE
    // ==============================
    // The table does not store old vs. new, so we just log the new data:
    await prisma.core_auditmembertransactions.create({
      data: {
        category: updatedTransaction.category,
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        remarks: updatedTransaction.remarks,
        action: "UPDATED",
        created_date: new Date(),
        committed_id: committedId || null, // or the user ID that performed the update
        member_id: updatedTransaction.member_id,
        transaction_id: updatedTransaction.id,
      },
    });

    res.status(200).json({
      message: "Transaction and related member updated successfully.",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the transaction." });
  }
};

export const getTransactionslogs = async (req, res) => {
  try {
    const { id } = req.params; // Fetching the UID from the route parameter

    // Check if id (UID) is provided
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ error: "Valid User ID (UID) is required." });
    }

    // Step 1: Find the member_id by using the UID from the core_membertransaction schema
    const memberTransaction = await prisma.core_membertransaction.findUnique({
      where: {
        id: BigInt(id), // Fetch the transaction using the UID (id)
      },
      select: {
        id: true,
        member_id: true, // Get member_id from the transaction
      },
    });

    // Step 2: Check if the transaction exists
    if (!memberTransaction) {
      return res
        .status(404)
        .json({ error: "No Logs found with the provided UID." });
    }

    // Step 3: Fetch user details from core_kwsmember schema using member_id
    const user = await prisma.core_kwsmember.findUnique({
      where: {
        user_id: memberTransaction.member_id, // Use member_id to fetch user
      },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        kwsid: true,
      },
    });

    // Step 4: Fetch all transactions for the `member_id` (from the core_membertransaction schema)
    const transactions = await prisma.core_membertransaction.findMany({
      where: {
        member_id: memberTransaction.member_id, // Use member_id to fetch all transactions
      },
      orderBy: {
        date: "desc", // Sort transactions by the most recent
      },
      select: {
        id: true,
        category: true,
        amount: true,
        date: true,
        remarks: true,
      },
    });
    
    // Step 5: Format dates for each transaction before sending the response
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      date: new Date(transaction.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }));

    // Step 6: Respond with the user's details and the formatted transaction logs
    res.status(200).json({ user: user, transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching transaction logs." });
  }
};

export const getTransactions = async (req, res) => {
  try {
    // Extract filters from query parameters
    const { kwsId, category, fromDate, toDate } = req.query;
    console.log("Received category:", category);


    // Set the default `toDate` to today's date
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Build the where clause dynamically based on filters
    const whereClause = {};
    if (kwsId) {
      whereClause.core_kwsmember = {
        kwsid: kwsId,
      };
    }
    if (category) {
      whereClause.category = {
        contains: category.toLowerCase(), // Convert input to lowercase
        mode: "insensitive", // Prisma's built-in case-insensitive filter
      };
    }
    
    if (fromDate || toDate) {
      whereClause.date = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate || formattedCurrentDate) }),
      };
    } else {
      // Default to fetching up to the current date if no date filters are provided
      whereClause.date = {
        lte: new Date(formattedCurrentDate),
      };
    }

    // Fetch transactions from the database
    const transactions = await prisma.core_membertransaction.findMany({
      where: whereClause,
      orderBy: {
        date: "desc", // Sort by date descending
      },
      select: {
        id: true,
        date: true,
        category: true,
        remarks: true,
        amount: true,
        core_kwsmember: {
          select: {
            user_id: true,
            kwsid: true,
            first_name: true,
            zone_member: true,
          },
        },
      },
    });

    // Count the total number of transactions matching the filters
    const totalTransactions = await prisma.core_membertransaction.count({
      where: whereClause,
    });

    // Format the response
    const formattedTransactions = transactions.map((transaction) => ({
      UID: `0000${transaction.id}`, // Prefix UID with 0000
      UserID: transaction.core_kwsmember?.user_id || "N/A",
      KWSID: transaction.core_kwsmember?.kwsid || "N/A",
      Date: formatDate(transaction.date), // Format the date
      Category: transaction.category,
      For: `${transaction.core_kwsmember?.first_name || "Unknown"}-${
        transaction.core_kwsmember?.kwsid || "N/A"
      }`, // Format: first_name-kwsid
      Remarks: transaction.remarks || "No remarks available",
      AmountKWD: formatAmount(transaction.amount), // Format the amount
    }));

    res.status(200).json({
      totalTransactions,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching transactions." });
  }
};

export const getTransactionofIndividual = async (req, res) => {
  try {
    const { id } = req.params; // UID from route parameter

    // Validate UID
    if (!id) {
      return res.status(400).json({ error: "UID is required." });
    }

    // Fetch transaction details using UID
    const transaction = await prisma.core_membertransaction.findUnique({
      where: {
        id: BigInt(id), // Ensure `id` matches the database's schema type
      },
      include: {
        core_kwsmember: {
          select: {
            user_id: true,
            kwsid: true,
            first_name: true,
            last_name: true,
            card_printed_date: true,
            card_expiry_date: true,
          },
        },
      },
    });

    // If transaction not found
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Function to check and format the date
    const formatDate = (date) => {
      if (!date) return "Not Available";


      const parsedDate = new Date(date);

   
      if (isNaN(parsedDate)) {
        console.error(`Invalid date format: ${date}`);
        return "Invalid Date"; 
      }

      // Manually format the date to "YYYY-MM-DD" (ISO format without time)
      const formattedDate = parsedDate.toISOString().split("T")[0]; // "2025-01-01"

      return formattedDate; // Return the formatted date without time
    };

    // Format the response
    const transactionDetails = {
      UID: transaction.id.toString().padStart(8, "0"), // Pad with leading zeros
      KWSID: transaction.core_kwsmember?.kwsid || "N/A",
      Name: `${transaction.core_kwsmember?.first_name || "N/A"} ${
        transaction.core_kwsmember?.last_name || ""
      }`,
      Category: transaction.category,
      CardPrintedDate: formatDate(transaction.card_printed_date),
      CardExpiryDate: formatDate(transaction.card_expiry_date),
      AmountKWD: parseFloat(transaction.amount).toFixed(3),
      Date: formatDate(transaction.date),
      Remarks: transaction.remarks || "No Remarks",
    };

    // Respond with transaction details
    res.status(200).json(transactionDetails);
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching transaction details." });
  }
};

export const deleteTransactionofIndividual = async (req, res) => {
  try {
    const { id } = req.params; // UID of the transaction

    if (!id) {
      return res.status(400).json({ error: "Transaction ID is required." });
    }

    // Convert ID to BigInt if needed
    const transactionId = BigInt(id);

    // First, delete related records in core_auditmembertran
    await prisma.core_auditmembertransactions.deleteMany({
      where: {
        transaction_id: transactionId, // Adjust column name if needed
      },
    });

    // Now, delete the actual transaction
    const deletedTransaction = await prisma.core_membertransaction.delete({
      where: { id: transactionId },
    });

    res.status(200).json({
      message: "Transaction deleted successfully.",
      transaction: deletedTransaction,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(500).json({ error: "An error occurred while deleting the transaction." });
  }
};


export const viewlogs = async (req, res) => {
  try {
    // Extract the transaction ID (from core_membertransaction) from request parameters.
    let { id } = req.params;
    // console.log("Received id:", id);

    // Normalize id by removing any leading zeros.
    if (typeof id === "string") {
      id = id.replace(/^0+/, "") || "0"; // Default to "0" if it becomes empty
    }
    // console.log("Normalized id:", id);

    // Validate that the normalized id is a valid number.
    if (!id || isNaN(Number(id))) {
      console.error("Invalid transaction id provided:", id);
      return res.status(400).json({ error: "Valid transaction ID is required." });
    }

    // Convert the normalized id to a BigInt, as defined in your schema.
    const transactionId = BigInt(id);
    // console.log("Converted transactionId:", transactionId);

    // Validate existence of core member transaction (from core_membertransaction schema)
    const coreTransaction = await prisma.core_membertransaction.findUnique({
      where: { id: transactionId },
    });

    if (!coreTransaction) {
      console.warn("No core member transaction found with id:", transactionId);
      return res.status(404).json({ error: "Core member transaction not found." });
    }

    // console.log("Found core member transaction:", coreTransaction);

    // Fetch audit logs where the transaction_id matches the core member transaction id.
    const logs = await prisma.core_auditmembertransactions.findMany({
      where: {
        transaction_id: transactionId,
      },
      include: {
        // Include related member details for the committed_id.
        core_kwsmember_core_auditmembertransactions_committed_idTocore_kwsmember: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            kwsid:true,
          },
        },
      },
      orderBy: {
        created_date: "desc", // Order by newest first.
      },
    });

    // console.log("Fetched logs:", logs);

    // If no logs are found, return a 404.
    if (!logs || logs.length === 0) {
      console.warn("No audit logs found for transactionId:", transactionId);
      return res.status(404).json({ error: "No logs found for this transaction." });
    }

    // Format logs for cleaner output.
    const formattedLogs = logs.map((log) => {
      const committer = log.core_kwsmember_core_auditmembertransactions_committed_idTocore_kwsmember;
      return {
        log_id: log.id,
        category: log.category,
        amount: log.amount,
        date: log.date,
        remarks: log.remarks || "",
        action: log.action,
        created_date: log.created_date,
        committed_by: committer
          ? `${committer.first_name} ${committer.last_name} - ${committer.kwsid}`.trim()
          : "N/A",
      };
    });

    return res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};




export const transactioncount = async (req, res) => {
  try {
    // Get total count of transactions (counting rows in core_membertransaction)
    const count = await prisma.core_membertransaction.count();

    return res.status(200).json({ count }); // Returning "count" instead of "transaction_count"
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res.status(500).json({ error: "Server error while fetching transaction count." });
  }
};