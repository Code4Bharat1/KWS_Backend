import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from 'fs';
import path from "path";
import { generateNextKwsId } from "../utils/kwsIdGenerator.js";
import { sendApprovalEmail } from "../utils/mail.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pending hai
export const getPendingApprovals = async (req, res) => {
  try {
    // Fetch users with membership status "pending" and order them by their application date
    const pendingApprovals = await prisma.core_kwsmember.findMany({
      where: {
        membership_status: "pending",
      },
      orderBy: {
        application_date: "desc",
      },
    });

    // Format the application_date to 'dd mm yyyy' for each record
    const formattedPendingApprovals = pendingApprovals.map((approval) => {
      let applicationDate;

      // Ensure proper date parsing
      if (typeof approval.application_date === "string") {
        applicationDate = new Date(approval.application_date.replace(" ", "T")); // Fix for inconsistent date formats
      } else {
        applicationDate = new Date(approval.application_date);
      }

      // Ensure date is valid before formatting
      if (!isNaN(applicationDate.getTime())) {
        const day = String(applicationDate.getDate()).padStart(2, "0"); // Ensure 2-digit day
        const month = String(applicationDate.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month (Months are 0-based)
        const year = applicationDate.getFullYear();

        return {
          ...approval,
          application_date: `${day} ${month} ${year}`, // Format: 'dd mm yyyy'
        };
      }

      return {
        ...approval,
        application_date: "Invalid Date", // Handle invalid dates
      };
    });

    res.status(200).json(formattedPendingApprovals); // Return the result as JSON
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({
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
    const {
      membership_status,
      dob,
      card_printed_date,
      card_expiry_date,
      percentage_1,
      percentage_2,
      percentage_3,
      percentage_4,
      ...updatedFields
    } = req.body;

   

    let userId;
    try {
      userId = BigInt(user_id); // Ensure user_id is a BigInt
  
    } catch (err) {
      console.error("[ERROR] Invalid user_id format:", err.message);
      return res.status(400).json({ message: "Invalid user_id format." });
    }

    // Validate and parse `percentage_*` fields
    const parsedPercentages = {
      percentage_1: percentage_1 ? parseInt(percentage_1, 10) : null,
      percentage_2: percentage_2 ? parseInt(percentage_2, 10) : null,
      percentage_3: percentage_3 ? parseInt(percentage_3, 10) : null,
      percentage_4: percentage_4 ? parseInt(percentage_4, 10) : null,
    };

    if (
      Object.values(parsedPercentages).some(
        (value) => value !== null && isNaN(value)
      )
    ) {
      console.error("[ERROR] Invalid percentage values provided:", parsedPercentages);
      return res.status(400).json({ message: "Invalid percentage values provided." });
    }

    // Validate date fields
    const parseDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format.");
      }
      return date;
    };

    let dobAsDate = dob ? parseDate(dob) : null;
    let cardPrintedDateAsDate = card_printed_date
      ? parseDate(card_printed_date)
      : null;
    let cardExpiryDateAsDate = card_expiry_date
      ? parseDate(card_expiry_date)
      : null;

   

    // Fetch existing member
    const existingMember = await prisma.core_kwsmember.findUnique({
      where: { user_id: userId },
    });

    if (!existingMember) {
      console.error("[ERROR] Member not found for user_id:", userId);
      return res.status(404).json({ message: "Member not found." });
    }


    let newKwsId = existingMember.kwsid || "NA";


    if (
      membership_status.toLowerCase() === "approved" &&
      (!existingMember.kwsid || existingMember.kwsid === "NA")
    ) {
      newKwsId = await generateNextKwsId();
     
    }


    const memberUpdateData = {
      ...updatedFields,
      ...parsedPercentages,
      membership_status,
      dob: dobAsDate,
      card_printed_date: cardPrintedDateAsDate,
      card_expiry_date: cardExpiryDateAsDate,
      updated_date: new Date(),
      ...(membership_status.toLowerCase() === "approved" && { kwsid: newKwsId }),
    
    };

    delete memberUpdateData.user_id;


   

    const uploadedFiles = req.files;
    if (uploadedFiles) {
      if (uploadedFiles.profile_picture) {
        memberUpdateData.profile_picture = uploadedFiles.profile_picture[0].path;
      }
      if (uploadedFiles.form_scanned) {
        memberUpdateData.form_scanned = uploadedFiles.form_scanned[0].path;
      }
      if (uploadedFiles.transactionSlip) {
        memberUpdateData.transactionSlip = uploadedFiles.transactionSlip[0].path;
      }
    }


  
    const transaction = [
      prisma.core_kwsmember.update({
        where: { user_id: userId },
        data: memberUpdateData,
      }),
   
    ];
    if (membership_status.toLowerCase() === "approved") {
      transaction.push(
        prisma.users_user.update({
          where: { id: userId },
          data: { username: newKwsId },
        })
      );
    }

    let updatedMember, updatedUser;

    try {
      const results = await prisma.$transaction(transaction);
      updatedMember = results[0];
      updatedUser = results[1];
      // console.log("[DEBUG] Transaction successful:", { updatedMember, updatedUser });
    } catch (transactionError) {
      console.error("[ERROR] Transaction failed:", transactionError.message);
      return res.status(500).json({ message: "Failed to update user information." });
    }

    if (membership_status.toLowerCase() === "approved") {
      try {
        await sendApprovalEmail(updatedUser.email, newKwsId);
        // console.log("[DEBUG] Approval email sent to:", updatedUser.email);
      } catch (emailError) {
        console.error("[ERROR] Error sending approval email:", emailError.message);
      }
    }

    res.status(200).json({
      message: "Membership status, user data, and files updated successfully.",
      updatedMember,
      updatedUser,
    });
  } catch (error) {
    console.error("[ERROR] Internal Server Error:", error.message);
    res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};





export const getAllMembers = async (req, res) => {
  const formatDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };
  try {
    const members = await prisma.core_kwsmember.findMany({
      where: {
        membership_status: {
          in: ["approved", "inactive"],
            mode: "insensitive", 
        
        },
      },
      select: {
        user_id:true,
        kwsid: true,
        civil_id: true,
        first_name: true,
        middle_name: true, 
        last_name: true, 
        zone_member: true,
        kuwait_contact: true, 
        type_of_member: true, 
        card_printed_date:true,
        card_expiry_date:true,
        membership_status: true,
      },
      orderBy: {
        kwsid: "asc", 
      },
    });


    const formattedMembers = members.map((member) => {
 
      return {
      user_id:member.user_id,
      kwsid: member.kwsid,
      civil_id: member.civil_id,
      name: `${member.first_name} ${member.middle_name || ""} ${member.last_name}`.trim(),
      zone: member.zone_member,
      contact: member.kuwait_contact,
      typeOfMember: member.type_of_member,
      cardPrinted:formatDate(member.card_printed_date),
      cardValidty: formatDate(member.card_expiry_date) ,
      status: member.membership_status === "approved" ? "active" : "inactive" ,
  };
  });

    // Send response
    res.status(200).json({ members: formattedMembers });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
};




export const getChart = async (req, res) => {
  try {
    // Query to get the count of members per zone
    const rawZoneData = await prisma.core_kwsmember.findMany({
      select: { zone_member: true },
    });

    // Normalize zone names (case-insensitive grouping)
    const zoneCounts = {};
    const originalZoneNames = {};

    rawZoneData.forEach((entry) => {
      if (!entry.zone_member) return; // Skip if zone_member is null

      const normalizedZone = entry.zone_member.trim().toLowerCase(); // Convert to lowercase
      if (!zoneCounts[normalizedZone]) {
        zoneCounts[normalizedZone] = 0;
        originalZoneNames[normalizedZone] = entry.zone_member.trim(); // Store original name
      }
      zoneCounts[normalizedZone] += 1;
    });

    // Convert grouped data to array
    const zoneData = Object.keys(zoneCounts).map((normalizedZone) => ({
      zone_member: originalZoneNames[normalizedZone], // Restore original casing
      count: zoneCounts[normalizedZone],
    }));

    // Define a larger set of predefined colors
    const predefinedColors = [
      "#CCDF92", "#DE3163", "#10B981", "#BE3144", "#FFA520",
      "#FF6384", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40",
    ];

    // Generate additional random colors if needed
    const getRandomColor = () =>
      `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Function to darken a color slightly for border contrast
    const darkenColor = (hex, amount = 20) => {
      let color = hex.replace(/^#/, "");
      if (color.length === 3) {
        color = color
          .split("")
          .map((char) => char + char)
          .join("");
      }
      const num = parseInt(color, 16);
      const r = Math.max(0, (num >> 16) - amount);
      const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
      const b = Math.max(0, (num & 0x0000ff) - amount);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Assign colors dynamically
    const backgroundColors = zoneData.map((_, index) =>
      predefinedColors[index] || getRandomColor()
    );

    // Generate darker border colors from background colors
    const borderColors = backgroundColors.map((color) => darkenColor(color));

    // Format the data for Chart.js
    const chartData = {
      labels: zoneData.map((zone) => zone.zone_member), // Restored original names
      datasets: [
        {
          data: zoneData.map((zone) => zone.count),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
        },
      ],
    };

    // Send response
    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "An error occurred while fetching chart data" });
  }
};




export const memberCount = async (req, res)=> {
  try {
    const count = await prisma.core_kwsmember.count();

    return res.status(200).json({ count }); 
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res.status(500).json({ error: "Server error while fetching transaction count." });
  }
};


export const pendingCount = async(req, res)=> {
  try {
    const count = await prisma.core_kwsmember.count(
      {
        where: {
          membership_status: "pending", 
        },
      },
    );

    return res.status(200).json({ count }); 
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res.status(500).json({ error: "Server error while fetching transaction count." });
  }

}

