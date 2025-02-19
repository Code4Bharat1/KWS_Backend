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
            kuwait_contact:true,
             
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
        holderName = `${member.first_name} ${member.last_name} -${member.kwsid}- ${member.zone_member || "No Zone"}`;
        holderContact =  member.kuwait_contact || "No Contact";
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
    const { boxFor, boxNumber, inUse, dateIssued, remarks, referredBy,committedId } = req.body;

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
    // console.log(req.user_id);
    
    // Now, create a log entry for this action (Box Created)
    const logData = {
      action: "CREATED", // Action is 'CREATE' as we're adding a new box
      committed_id: req.user_id, // The user who committed the change (should be fetched from local storage or passed in the request header)
      created_at: new Date(), // Timestamp of the action
      number: parseInt(boxNumber), // Store the same box number in the log
      in_use: inUse === "Yes", // Store the same in_use value in the log
      core_sandouqchaboxholder: { connect: { id: newBox.id } },
      core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember: {
        connect: { user_id: committedId }, // Link the committed user_id to the log
      }, // Correctly link to the box using a relation
    };

    // Create a log entry in the audit table
    const newLog = await prisma.core_auditsandouqchaboxholder.create({
      data: logData,
    });

    res.status(201).json({
      message: "Box added successfully.",
      box: newBox,
      log: newLog, // Return the newly created log
    });
  } catch (error) {
    console.error("Error adding box:", error);
    res.status(500).json({
      error: "An error occurred while adding the box.",
    });
  }
};



export const addBoxForNon =async(req,res)=> {
  try {
    const { boxFor, boxNumber, inUse, dateIssued, remarks, referredBy } = req.body;

    // Validate input
    if (!boxFor || !boxNumber || !inUse || !dateIssued) {
      return res.status(400).json({
        error: "Non-KWS ID, Box Number, In Use, and Date Issued are required fields.",
      });
    }

    let nonKwsMemberId = null;

    // Ensure the Non-KWS ID exists in the core_nonkwsmember schema
    if (boxFor.startsWith("KWSKWN")) {
      const nonKwsId = boxFor.replace(/^KWSKWN/, ""); // Remove the prefix
      const parsedId = parseInt(nonKwsId, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ error: "Invalid Non-KWS ID format." });
      }

      // Look up the non-KWS member in the database
      const nonKwsMember = await prisma.core_nonkwsmember.findFirst({
        where: { id: parsedId },
        select: { id: true },
      });

      if (!nonKwsMember) {
        return res.status(404).json({
          error: "No Non-KWS member found with the provided KWSKWN ID.",
        });
      }

      nonKwsMemberId = nonKwsMember.id; // Assign the Non-KWS member's ID
    } else {
      return res.status(400).json({
        error: "Invalid Non-KWS ID format. It must start with 'KWSKWN'.",
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
        non_member_id: nonKwsMemberId, // Link the box to the non-KWS member ID
        referred_by_id: referredById, // Add referred_by_id if provided
      },
    });

    res.status(201).json({
      message: "Box added successfully.",
      box: newBox,
    });
  } catch (error) {
    console.error("Error adding box for Non-KWS ID:", error);
    res.status(500).json({
      error: "An error occurred while adding the box for Non-KWS ID.",
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
      return res
        .status(400)
        .json({ error: "Box Number must be a positive integer." });
    }

    // Fetch the box details including related member, non-member and referredBy relationships.
    const sandouqcha = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: parsedNumber },
      include: {
        // For KWS member relationship
        core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember: {
          select: {
            kwsid: true,
            first_name: true,
            last_name: true,
          },
        },
        // For referredBy relationship (always a KWS member)
        core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember: {
          select: {
            kwsid: true,
            first_name: true,
            last_name: true,
          },
        },
        // For non-KWS member relationship (if box was added for a non-KWS member)
        core_nonkwsmember: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            // add additional fields if needed
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
      return parsedDate.toISOString().split("T")[0];
    };

    // Determine if the box was issued to a KWS member or to a Non-KWS member.
    let memberDetails = "None";
    if (sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember) {
      memberDetails = {
        kwsid:
          sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.kwsid,
        name: `${sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.first_name} ${sandouqcha.core_kwsmember_core_sandouqchaboxholder_member_idTocore_kwsmember.last_name}`,
      };
    } else if (sandouqcha.core_nonkwsmember) {
      // For non-KWS members, you might display the member's id and/or full name.
      memberDetails = {
        nonKwsMemberId: sandouqcha.core_nonkwsmember.id,
        name: `${sandouqcha.core_nonkwsmember.first_name} ${sandouqcha.core_nonkwsmember.last_name}`,
      };
    }

    // Prepare the final details
    const sandouqchaDetails = {
      number: sandouqcha.number.toString().padStart(8, "0"),
      inUse: sandouqcha.in_use ? "True" : "False",
      dateIssued: formatDate(sandouqcha.date_issued),
      member: memberDetails,
      referredBy: sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember
        ? {
            kwsid:
              sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.kwsid,
            name: `${sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.first_name} ${sandouqcha.core_kwsmember_core_sandouqchaboxholder_referred_by_idTocore_kwsmember.last_name}`,
          }
        : "None",
      remarks: sandouqcha.remarks || "No Remarks",
    };

    res.status(200).json(sandouqchaDetails);
  } catch (error) {
    console.error("Error fetching box details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching box details." });
  }
};


export const editBox = async (req, res) => {
  try {
    const { number } = req.params;
    const { inUse, dateIssued, remarks, referredBy,committedId } = req.body;

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
    // committedId
    const logData = {
      action: "MODIFIED", // Action is 'CREATE' as we're adding a new box
      committed_id: req.user_id, // The user who committed the change (should be fetched from local storage or passed in the request header)
      created_at: new Date(), // Timestamp of the action
      number: parseInt(parsedNumber), // Store the same box number in the log
      in_use: inUse === "Yes", // Store the same in_use value in the log
      core_sandouqchaboxholder: { connect: { id: updatedBox.id } },
      core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember: {
        connect: { user_id: committedId }, // Link the committed user_id to the log
      }, // Correctly link to the box using a relation
    };

    // Create a log entry in the audit table
    const newLog = await prisma.core_auditsandouqchaboxholder.create({
      data: logData,
    });
    // console.log(
    //   "yhis is new logs",newLog
    // );
    




    res.status(200).json({
      message: "Box updated successfully.",
      box: {
        number: updatedBox.number,
        inUse: updatedBox.in_use ? "Yes" : "No",
        dateIssued: updatedBox.date_issued ? updatedBox.date_issued.toISOString().split("T")[0] : "None",
        remarks: updatedBox.remarks || "No Remarks",
        referredBy: referredBy || "None",
      },
      newLog,
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

    // Delete the related audit records first
    await prisma.core_auditsandouqchaboxholder.deleteMany({
      where: { box_id: existingBox.id },
    });

    // Now, delete the box
    await prisma.core_sandouqchaboxholder.delete({
      where: { number: parsedNumber },
    });

    res.status(200).json({ message: "Box deleted successfully." });
  } catch (error) {
    console.error("Error deleting box:", error);
    res.status(500).json({ error: "An error occurred while deleting the box." });
  }
};



export const getBoxLogs = async (req, res) => {
  const { number } = req.params; // Retrieve box number from URL parameters

  if (!number) {
    return res.status(400).json({ error: "Box number is required." });
  }

  try {
    // Fetch the box ID and 'in_use' status from the core_sandouqchaboxholder table using the box number
    const box = await prisma.core_sandouqchaboxholder.findUnique({
      where: { number: parseInt(number, 10) },
      select: { id: true, in_use: true }, // Retrieve box ID and in_use field
    });

    if (!box) {
      return res.status(404).json({ error: "Box not found." });
    }

    // Fetch logs associated with the box ID from the core_auditsandouqchaboxholder table
    const logs = await prisma.core_auditsandouqchaboxholder.findMany({
      where: {
        box_id: box.id, // Use the box's ID to filter logs
      },
      include: {
        core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember: {
          select: {
            user_id: true, // Get the user_id (committed_by field)
            first_name: true,
            last_name: true,
            kwsid: true,
          },
        },
        core_sandouqchaboxholder: {
          select: {
            number: true, // Get the box number
            in_use: true, // Get the in_use status of the box
          },
        },
      },
      orderBy: {
        created_at: "desc", // Order logs by timestamp (most recent first)
      },
    });

    if (logs.length === 0) {
      return res.status(404).json({ error: "No logs found for this box." });
    }

    // Format the logs to include committed_by (fetch user details using user_id)
    const formattedLogs = logs.map((log) => ({
      ...log,
      in_use: box.in_use, // Attach the in_use status from the box to each log
      committed_by: {
        user_id: log.core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember.user_id,
        kwsid: log.core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember.kwsid,
        name: ` ${log.core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember.kwsid} -${log.core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember.first_name} ${log.core_kwsmember_core_auditsandouqchaboxholder_committed_idTocore_kwsmember.last_name}`,
      },
    }));

    // Return the formatted logs in the response
    return res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error fetching box logs:", error);
    return res.status(500).json({ error: "An error occurred while fetching the box logs." });
  }
};



export const getboxcount = async (req, res) => {
  try {
    // Get total count of transactions (counting rows in core_membertransaction)
    const count = await prisma.core_sandouqchaboxholder.count();

    return res.status(200).json({ count }); // Returning "count" instead of "transaction_count"
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res.status(500).json({ error: "Server error while fetching transaction count." });
  }
};



export const inusecount = async (req, res) => {
  try {
    // Count boxes that are currently in use (where in_use is true)
    const inUse = await prisma.core_sandouqchaboxholder.count({
      where: { in_use: true }, // Boolean field
    });

    // Count total number of boxes
    const total = await prisma.core_sandouqchaboxholder.count();

    // Calculate usage percentage
    const usagePercentage = total > 0 ? ((inUse / total) * 100).toFixed(2) : 0;

    return res.status(200).json({
      in_use: inUse,
      total: total,
      usage_percentage: usagePercentage,
    });
  } catch (error) {
    console.error("Error fetching in-use count:", error);
    return res.status(500).json({ error: "Server error while fetching in-use count." });
  }
};