import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getTransactionList = async (req, res) => {
  try {
    const transactions = await prisma.core_sandouqchatransaction.findMany({
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
    });

    // Map transactions to include the box number and other details
    const transactionsWithDetails = transactions.map((transaction) => {
      const holderDetails =
        transaction.core_sandouqchaboxholder?.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember ||
        transaction.core_sandouqchaboxholder?.core_nonkwsmember ||
        null;

      const holderName = holderDetails
        ? `${holderDetails.first_name} ${holderDetails.last_name}${
            holderDetails.kwsid ? `-${holderDetails.kwsid}` : ""
          }`
        : "Unknown";

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
        date: transaction.date.toISOString().split("T")[0], // Format date
        boxNumber: transaction.core_sandouqchaboxholder?.number || "Unknown", // Display the box number
        collectedBy: transaction.core_kwsmember
          ? `${transaction.core_kwsmember.first_name} ${transaction.core_kwsmember.last_name}`
          : "Unknown",
        holderName,
        holderContact,
        total: parseFloat(total.toFixed(3)), // Round total to 3 decimal places
      };
    });

    res.status(200).json(transactionsWithDetails);
  } catch (error) {
    console.error("Error fetching transaction list:", error);
    res.status(500).json({ error: "An error occurred while fetching the transaction list." });
  }
};



export const addTransaction = async (req, res) => {
  try {
    const {
      date,
      boxId, // Refers to the number field in core_sandouqchaboxholder
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
    } = req.body;

    // Validate required fields
    if (!date || !boxId || !collectedByKwsid) {
      return res.status(400).json({ error: "Date, boxId (box number), and collectedByKwsid are required." });
    }

    // Fetch the box holder's ID using the box number
    const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
      where: {
        number: boxId, // The box number provided in the request
      },
    });

    if (!boxHolder) {
      return res.status(400).json({ error: `Box number ${boxId} does not exist.` });
    }

    // Fetch the member's user ID using the collectedByKwsid
    const member = await prisma.core_kwsmember.findFirst({
      where: {
        kwsid: collectedByKwsid,
      },
    });

    if (!member) {
      return res.status(400).json({ error: "Invalid collectedByKwsid." });
    }

    // Create the transaction
    const newTransaction = await prisma.core_sandouqchatransaction.create({
      data: {
        date: new Date(date),
        box_id: boxHolder.id, // Use the ID resolved from the box number
        collected_by_id: member.user_id, // Use the user's ID
        note_20: note_20 || 0,
        note_10: note_10 || 0,
        note_5: note_5 || 0,
        note_1: note_1 || 0,
        note_0_5: note_0_5 || 0,
        note_0_25: note_0_25 || 0,
        coin_100: coin_100 || 0,
        coin_50: coin_50 || 0,
        coin_20: coin_20 || 0,
        coin_10: coin_10 || 0,
        coin_5: coin_5 || 0,
      },
    });

    res.status(201).json({
      message: "Transaction added successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "An error occurred while adding the transaction." });
  }
};




export const viewTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Extract transaction ID from the request parameters

    // Validate the transaction ID
    if (!id) {
      return res.status(400).json({ error: "Transaction ID is required." });
    }

    // Fetch the transaction details
    const transaction = await prisma.core_sandouqchatransaction.findUnique({
      where: {
        id: BigInt(id), // Use BigInt for compatibility with the database schema
      },
      include: {
        core_sandouqchaboxholder: {
          select: {
            number: true, // Include the box number
            core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                indian_contact_no_1: true,
                indian_contact_no_2: true,
                kuwait_contact: true,
                kwsid:true,
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
            email: true,
            kwsid:true,
          },
        },
      },
    });

    // Handle case where transaction is not found
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Prepare holder details
    const holderDetails =
      transaction.core_sandouqchaboxholder?.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember ||
      transaction.core_sandouqchaboxholder?.core_nonkwsmember ||
      null;

    // Format response
    const response = {
      id: transaction.id,
      date: transaction.date.toISOString().split("T")[0],
      boxNumber: transaction.core_sandouqchaboxholder?.number || "Unknown",
      collectedBy: transaction.core_kwsmember
        ? `${transaction.core_kwsmember.first_name} ${transaction.core_kwsmember.last_name} - ${transaction.core_kwsmember.kwsid} `
        : "Unknown",
      holderName: holderDetails
        ? `${holderDetails.first_name} ${holderDetails.last_name}- ${holderDetails.kwsid}`
        : "Unknown",
      holderContact:
        holderDetails?.contact ||
        holderDetails?.indian_contact_no_1 ||
        holderDetails?.indian_contact_no_2 ||
        holderDetails?.kuwait_contact ||
        "No Contact",
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
      total: parseFloat(
        (
          (transaction.note_20 || 0) * 20 +
          (transaction.note_10 || 0) * 10 +
          (transaction.note_5 || 0) * 5 +
          (transaction.note_1 || 0) * 1 +
          (transaction.note_0_5 || 0) * 0.5 +
          (transaction.note_0_25 || 0) * 0.25 +
          (transaction.coin_100 || 0) * 1 +
          (transaction.coin_50 || 0) * 0.5 +
          (transaction.coin_20 || 0) * 0.2 +
          (transaction.coin_10 || 0) * 0.1 +
          (transaction.coin_5 || 0) * 0.05
        ).toFixed(3)
      ),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error viewing transaction:", error);
    res.status(500).json({ error: "An error occurred while retrieving the transaction." });
  }
};




export const editTransaction = async (req, res) => {
  try {
    const {
      id, // Transaction ID to edit
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
    } = req.body;

    // Validate required fields
    if (!id || !date || !boxId || !collectedByKwsid) {
      return res.status(400).json({ error: "Transaction ID, date, boxId, and collectedByKwsid are required." });
    }

    // Find the member by kwsid
    const member = await prisma.core_kwsmember.findFirst({
      where: { kwsid: collectedByKwsid },
    });

    if (!member) {
      return res.status(400).json({ error: "Invalid collectedByKwsid." });
    }

    // Check if the box exists
    const boxHolder = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: boxId },
    });

    if (!boxHolder) {
      return res.status(400).json({ error: "Invalid box number." });
    }

    // Update the transaction
    const updatedTransaction = await prisma.core_sandouqchatransaction.update({
      where: { id },
      data: {
        date: new Date(date), // Ensure date is in the correct format
        box_id: boxHolder.id,
        collected_by_id: member.id, // Use member's id
        note_20: note_20 || 0,
        note_10: note_10 || 0,
        note_5: note_5 || 0,
        note_1: note_1 || 0,
        note_0_5: note_0_5 || 0,
        note_0_25: note_0_25 || 0,
        coin_100: coin_100 || 0,
        coin_50: coin_50 || 0,
        coin_20: coin_20 || 0,
        coin_10: coin_10 || 0,
        coin_5: coin_5 || 0,
      },
    });

    res.status(200).json({
      message: "Transaction updated successfully.",
      transaction: updatedTransaction,
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
