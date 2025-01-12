import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getBoxList = async (req, res) => {
  try {
    const boxes = await prisma.core_sandouqchaboxholder.findMany({
      select: {
        id: true,
        number: true,
        in_use: true,
        date_issued: true,
        remarks: true,
        member_id: true,
        non_member_id: true,
        referred_by_id: true,
        core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            indian_contact_no_1: true, 
            indian_contact_no_2: true,
            kuwait_contact: true, 
            zone_member: true,
            kwsid:true,
          }
        },
        core_nonkwsmember: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            contact: true,
          }
        },
        core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember: {
          select: {
            first_name: true,
            last_name: true,
            kwsid:true,
          },
        },
      },
      orderBy: {
        date_issued: "desc",
      },
    });

    // Map the boxes to include `holderName`, `holderContact`, and `referredBy`
    const formattedBoxes = boxes.map((box) => {
      let holderName = "Unknown";
      let holderContact = "Unknown";
      let referredBy = "None";

      // Format dateIssued
      const formattedDateIssued = box.date_issued ? new Date(box.date_issued).toLocaleDateString("en-GB") : "Not Available";

      // Check if the holder is a member
      if (box.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember) {
        const member = box.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember;
        holderName = `${member.first_name} ${member.last_name} - ${member.zone_member || "No Zone"}`;
        holderContact = member.indian_contact_no_1 || member.indian_contact_no_2 || member.kuwait_contact || "No Contact";
      }
      // Check if the holder is a non-member
      else if (box.core_nonkwsmember) {
        const nonMember = box.core_nonkwsmember;
        holderName = `${nonMember.first_name || ""} ${nonMember.last_name || ""} - Non-Member`.trim();
        holderContact = nonMember.contact || "No Contact";
      }

      // Check if there is a referredBy member
      if (box.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember) {
        const referredMember = box.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember;
        referredBy = `${referredMember.first_name} ${referredMember.last_name} - ${referredMember.kwsid}`;
      }

      return {
        id: box.id,
        number: box.number,
        inUse: box.in_use ? "Yes" : "No",
        dateIssued: formattedDateIssued,
        remarks: box.remarks,
        holderContact,
        holderName,
        referredBy,
      };
    });

    res.status(200).json(formattedBoxes);
  } catch (error) {
    console.error("Error fetching box list:", error);
    res.status(500).json({ error: "An error occurred while fetching the box list." });
  }
};


export const addBox = async (req, res) => {
  try {
    const { boxFor, boxNumber, inUse, dateIssued, remarks, referredBy } = req.body;

    // Validate input
    if (!boxFor || !boxNumber || !inUse || !dateIssued) {
      return res.status(400).json({
        error: "KWS ID, Box Number, In Use, and Date Issued are required fields.",
      });
    }

    // Ensure the KWS ID exists in the core_kwsmember schema
    const member = await prisma.core_kwsmember.findFirst({
      where: { kwsid: boxFor }, // Find member by KWS ID
      select: { user_id: true }, // Get the user_id
    });

    if (!member) {
      return res.status(404).json({
        error: "No member found with the provided KWS ID.",
      });
    }

    // Validate and parse the date
    const parseDate = (dateString) => {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate)) {
        return null; // Invalid date format
      }
      return parsedDate;
    };

    const validDateIssued = parseDate(dateIssued);

    if (!validDateIssued) {
      return res.status(400).json({ error: "Invalid Date Issued format." });
    }

    // Check if the box number already exists
    const existingBox = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: parseInt(boxNumber) },
    });

    if (existingBox) {
      return res.status(400).json({ error: "A box with this number already exists." });
    }

    // Handle referred_by field if provided
    let referredById = null;
    if (referredBy) {
      const referredMember = await prisma.core_kwsmember.findFirst({
        where: { kwsid: referredBy },
        select: { user_id: true },
      });

      if (!referredMember) {
        return res.status(404).json({
          error: "No member found with the provided referred_by KWS ID.",
        });
      }

      referredById = referredMember.user_id;
    }

    // Create a new box entry
    const newBox = await prisma.core_sandouqchaboxholder.create({
      data: {
        number: parseInt(boxNumber),
        in_use: inUse === "Yes", // Convert to boolean
        date_issued: validDateIssued,
        remarks: remarks || null,
        member_id: member.user_id, // Link the box to the user's ID via member_id
        referred_by_id: referredById, // Add referred_by_id if provided
      },
    });

    res.status(201).json({
      message: "Box added successfully.",
      box: newBox,
    });
  } catch (error) {
    console.error("Error adding box:", error);
    res.status(500).json({
      error: "An error occurred while adding the box.",
    });
  }
};




export const getBox = async (req, res) => {
  try {
    const { number } = req.params;

    if (!number) {
      return res.status(400).json({ error: "Box Number is required." });
    }

    const parsedNumber = parseInt(number, 10);
    if (isNaN(parsedNumber) || parsedNumber <= 0) {
      return res.status(400).json({ error: "Box Number must be a positive integer." });
    }

    // Fetch the box details including member and referredBy relationships
    const sandouqcha = await prisma.core_sandouqchaboxholder.findUnique({
      where: {
        number: parsedNumber,
      },
      include: {
        core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: { // Member relationship
          select: {
            kwsid: true,
            first_name: true,
            last_name: true,
          },
        },
        core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember: { // ReferredBy relationship
          select: {
            kwsid: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!sandouqcha) {
      return res.status(404).json({ error: "Box not found." });
    }

    // Helper function to format the date
    const formatDate = (date) => {
      if (!date) return "None";
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return "Invalid Date";
      }
      return parsedDate.toISOString().split('T')[0];
    };

    // Format the response
    const sandouqchaDetails = {
      number: sandouqcha.number.toString().padStart(8, "0"),
      inUse: sandouqcha.in_use ? "True" : "False",
      dateIssued: formatDate(sandouqcha.date_issued),
      member: sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember
        ? {
            kwsid: sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.kwsid,
            name: `${sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.first_name} ${sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.last_name}`,
          }
        : "None",
      referredBy: sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember
        ? {
            kwsid: sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.kwsid,
            name: `${sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.first_name} ${sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.last_name}`,
          }
        : "None",
      remarks: sandouqcha.remarks || "No Remarks",
    };

    res.status(200).json(sandouqchaDetails);
  } catch (error) {
    console.error("Error fetching box details:", error);
    res.status(500).json({ error: "An error occurred while fetching box details." });
  }
};



export const editBox = async (req, res) => {
  try {
    const { number } = req.params;
    const { inUse, dateIssued, remarks, referredBy } = req.body;

    // Validate `number`
    if (!number) {
      return res.status(400).json({ error: "Box Number is required." });
    }

    const parsedNumber = parseInt(number, 10);
    if (isNaN(parsedNumber) || parsedNumber <= 0) {
      return res.status(400).json({ error: "Box Number must be a positive integer." });
    }

    // Check if the box exists
    const box = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: parsedNumber },
    });

    if (!box) {
      return res.status(404).json({ error: "Box not found." });
    }

    // Validate `dateIssued`
    let formattedDateIssued = null;
    if (dateIssued) {
      const parsedDate = new Date(dateIssued);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format for Date Issued." });
      }
      formattedDateIssued = parsedDate;
    }

    // Validate `referredBy` if provided
    let referredById = null;
    if (referredBy) {
      const referredMember = await prisma.core_kwsmember.findFirst({
        where: { kwsid: referredBy },
        select: { user_id: true },
      });

      if (!referredMember) {
        return res.status(404).json({ error: "Referred By KWS ID not found." });
      }

      referredById = referredMember.user_id;
    }

    // Update the box
    const updatedBox = await prisma.core_sandouqchaboxholder.update({
      where: { number: parsedNumber },
      data: {
        in_use: inUse === "Yes" || inUse === true, // Convert to boolean
        date_issued: formattedDateIssued || box.date_issued, // Keep existing date if not updated
        remarks: remarks || box.remarks, // Keep existing remarks if not updated
        referred_by_id: referredById || box.referred_by_id, // Keep existing referred_by_id if not updated
      },
    });

    res.status(200).json({
      message: "Box updated successfully.",
      box: {
        number: updatedBox.number,
        inUse: updatedBox.in_use ? "Yes" : "No",
        dateIssued: updatedBox.date_issued ? updatedBox.date_issued.toISOString().split("T")[0] : "None",
        remarks: updatedBox.remarks || "No Remarks",
        referredBy: referredBy || "None",
      },
    });
  } catch (error) {
    console.error("Error editing box:", error);
    res.status(500).json({ error: "An error occurred while editing the box." });
  }
};


export const deleteBox = async (req, res) => {
  try {
    const { number } = req.params;

    // Validate the number
    if (!number) {
      return res.status(400).json({ error: "Box Number is required." });
    }

    const parsedNumber = parseInt(number, 10);
    if (isNaN(parsedNumber) || parsedNumber <= 0) {
      return res.status(400).json({ error: "Box Number must be a positive integer." });
    }

    // Check if the box exists
    const existingBox = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: parsedNumber },
    });

    if (!existingBox) {
      return res.status(404).json({ error: "Box not found." });
    }

    // Delete the box
    await prisma.core_sandouqchaboxholder.delete({
      where: { number: parsedNumber },
    });

    res.status(200).json({ message: "Box deleted successfully." });
  } catch (error) {
    console.error("Error deleting box:", error);
    res.status(500).json({ error: "An error occurred while deleting the box." });
  }
};

