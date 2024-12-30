import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import { generateNextKwsId } from "../utils/kwsIdGenerator.js";
import { sendApprovalEmail } from "../utils/mail.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pending hai
export const getPendingApprovals = async (req, res) => {
  try {
    // Fetch users with membership status "pending" from the core_kwsmember model
    const pendingApprovals = await prisma.core_kwsmember.findMany({
      where: {
        membership_status: "pending", // Filter by membership_status
      },
    });
    res.status(200).json(pendingApprovals); // Return the result as JSON
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res
      .status(500)
      .json({
        message: "Error fetching pending approvals.",
        error: error.message,
      });
  }
};

// update status
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { membership_status, dob, user_id: _ignoreUserId, ...updatedFields } = req.body;

    let userId;
    try {
      userId = BigInt(user_id);
    } catch (err) {
      return res.status(400).json({ message: "Invalid user_id format." });
    }

    if (typeof membership_status !== "string") {
      return res.status(400).json({ message: "Invalid membership_status value. Expected a string." });
    }

    let dobAsDate = null;
    if (dob) {
      dobAsDate = new Date(dob);
      if (isNaN(dobAsDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format for dob." });
      }
    }

    const existingMember = await prisma.core_kwsmember.findUnique({
      where: { user_id: userId },
    });

    if (!existingMember) {
      return res.status(404).json({ message: "Member not found." });
    }

    let newKwsId = existingMember.kwsid;
    let memberUpdateData = {
      ...updatedFields,
      membership_status,
      dob: dobAsDate,
      updated_date: new Date(),
    };

    if (
      membership_status.toLowerCase() === "approved" &&
      (!existingMember.kwsid || existingMember.kwsid === "NA")
    ) {
      newKwsId = await generateNextKwsId();
      memberUpdateData.kwsid = newKwsId;
    }

    const userUpdateData = { username: newKwsId };

    const transaction = [
      prisma.core_kwsmember.update({
        where: { user_id: userId },
        data: memberUpdateData,
      }),
      prisma.users_user.update({
        where: { id: userId },
        data: userUpdateData,
      }),
    ];

    let updatedMember;
    let updatedUser;

    try {
      const results = await prisma.$transaction(transaction);
      updatedMember = results[0];
      updatedUser = results[1];
      console.log(`Successfully updated username for user ID ${userId} to ${updatedUser.username}`);
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError.message);
      return res.status(500).json({ message: "Failed to update user information." });
    }

    if (membership_status.toLowerCase() === "approved") {
      try {
        await sendApprovalEmail(updatedUser.email, newKwsId);
        console.log("Approval email sent successfully.");
      } catch (emailError) {
        console.error("Error sending approval email:", emailError.message);
      }
    }

    res.status(200).json({
      message: "Membership status and user data updated successfully.",
      updatedMember,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};





export const getAllMembers = async (req, res) => {
  try {
    const members = await prisma.core_kwsmember.findMany({
      select: {
        kwsid: true, // KWS ID
        civil_id: true, // Civil ID
        first_name: true, // First Name
        middle_name: true, // Middle Name
        last_name: true, // Last Name
        zone_member: true, // Zone
        indian_contact_no_1: true, // Contact
        type_of_member: true, // Type of Member
      },
      orderBy: {
        kwsid: "asc", // Change "asc" to "desc" for descending order
      },
    });

    // Format data for response
    const formattedMembers = members.map((member) => ({
      kwsid: member.kwsid,
      civil_id: member.civil_id,
      name: `${member.first_name} ${member.middle_name || ""} ${member.last_name}`.trim(),
      zone: member.zone_member,
      contact: member.indian_contact_no_1,
      typeOfMember: member.type_of_member,
    }));

    // Send response
    res.status(200).json({ members: formattedMembers });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
};
