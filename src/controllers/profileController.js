import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { log } from "console";
const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    let parsedUserId;
    try {
      parsedUserId = BigInt(user_id);
    } catch (err) {
      return res.status(400).json({ error: "User ID must be a valid number." });
    }
    const formatDate = (date) => {
      if (!date) return null;
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return formattedDate;
    };

    const user = await prisma.users_user.findUnique({
      where: { id: parsedUserId },
      select: {
        username: true,
        core_kwsmember: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            type_of_member: true,
            profile_picture: true,
            card_printed_date: true,
            card_expiry_date: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const response = {
      username: user.username,
      core_kwsmember: user.core_kwsmember
        ? {
            firstName: user.core_kwsmember.first_name,
            middleName: user.core_kwsmember.middle_name,
            lastName: user.core_kwsmember.last_name,
            typeOfMember: user.core_kwsmember.type_of_member,
            cardPrinted: formatDate(user.core_kwsmember.card_printed_date),
            cardExpiry: formatDate(user.core_kwsmember.card_expiry_date),
            profilePicture: user.core_kwsmember.profile_picture
              ? `https://api.kwskwt.com/${user.core_kwsmember.profile_picture}`
              : null,
          }
        : null,
    };

    return res.status(200).json({ user: response });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the user profile." });
  }
};

export const editProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    let parsedUserId;
    try {
      parsedUserId = BigInt(user_id);
    } catch (err) {
      return res.status(400).json({ error: "User ID must be a valid number." });
    }

    const {
      profile_picture,
      form_scanned,
      application_date,
      membership_status,
      kwsid,
      dob,
      ...otherFields
    } = req.body;
    const updateData = { ...otherFields };

    const existingUser = await prisma.core_kwsmember.findUnique({
      where: { user_id: parsedUserId },
      select: { civil_id: true },
    });

    if (updateData.civil_id && existingUser.civil_id === updateData.civil_id) {
      delete updateData.civil_id; // Prevent updating the same civil_id
    } else if (updateData.civil_id) {
      const duplicateUser = await prisma.core_kwsmember.findFirst({
        where: { civil_id: updateData.civil_id },
      });
      if (duplicateUser) {
        return res.status(400).json({ error: "Civil ID already exists." });
      }
    }

    if (dob) {
      const parsedDob = new Date(dob);
      if (isNaN(parsedDob)) {
        return res
          .status(400)
          .json({ error: "Invalid dob format. Expected ISO-8601 DateTime." });
      }
      updateData.dob = parsedDob.toISOString();
    }

    if (application_date) {
      const parsedDate = new Date(application_date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({
          error: "Invalid application_date format. Expected ISO-8601 DateTime.",
        });
      }
      updateData.application_date = parsedDate;
    }

    if (req.files?.profile_picture?.length > 0) {
      const profilePic = req.files.profile_picture[0];
      const uploadDir = path.resolve("uploads/profile-pictures");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, profilePic.filename);
      fs.renameSync(profilePic.path, uploadPath);
      updateData.profile_picture = `uploads/profile-pictures/${profilePic.filename}`;
    }

    if (updateData.card_expiry_date) {
      const parsedExpiryDate = new Date(updateData.card_expiry_date);
      if (isNaN(parsedExpiryDate)) {
        return res
          .status(400)
          .json({ error: "Invalid card_expiry_date format." });
      }
      updateData.card_expiry_date = parsedExpiryDate.toISOString();
    }

    if (updateData.card_printed_date) {
      const parsedPrintedDate = new Date(updateData.card_printed_date);
      if (isNaN(parsedPrintedDate)) {
        return res
          .status(400)
          .json({ error: "Invalid card_printed_date format." });
      }
      updateData.card_printed_date = parsedPrintedDate.toISOString();
    }

    ["percentage_1", "percentage_2", "percentage_3", "percentage_4"].forEach(
      (field) => {
        if (updateData[field]) {
          const parsedValue = parseInt(updateData[field], 10);
          if (isNaN(parsedValue)) {
            return res
              .status(400)
              .json({ error: `${field} must be a valid integer.` });
          }
          updateData[field] = parsedValue;
        }
      }
    );

    if (req.files?.form_scanned?.length > 0) {
      const scannedForm = req.files.form_scanned[0];
      const uploadDir = path.resolve("uploads/form-scanned");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, scannedForm.filename);
      fs.renameSync(scannedForm.path, uploadPath);
      updateData.form_scanned = `uploads/form-scanned/${scannedForm.filename}`;
    }

    let isActiveStatus = null;
    if (membership_status) {
      if (membership_status.toLowerCase() === "inactive") {
        isActiveStatus = false;
      } else if (membership_status.toLowerCase() === "approved") {
        isActiveStatus = true;
      }
      updateData.membership_status = membership_status;
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.core_kwsmember.update({
        where: { user_id: parsedUserId },
        data: { ...updateData, kwsid: kwsid },
      }),
      kwsid
        ? prisma.users_user.update({
            where: { id: parsedUserId },
            data: { username: kwsid },
          })
        : Promise.resolve(),
      isActiveStatus !== null
        ? prisma.users_user.update({
            where: { id: parsedUserId },
            data: { is_active: isActiveStatus },
          })
        : Promise.resolve(),
    ]);

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.code === "P2002" && error.meta?.target.includes("civil_id")) {
      return res.status(400).json({ error: "Civil ID already exists." });
    }
    return res
      .status(500)
      .json({ error: "An error occurred while updating the user profile." });
  }
};

export const getProfileAllDetails = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    let parsedUserId;
    try {
      parsedUserId = BigInt(user_id);
    } catch (error) {
      console.error("Failed to parse user_id to BigInt:", user_id, error);
      return res.status(400).json({ error: "User ID must be a valid number." });
    }

    // Fetch member details
    const coreKwsMember = await prisma.core_kwsmember.findUnique({
      where: {
        user_id: parsedUserId,
      },
      select: {
        civil_id: true,
        user_id: true,
        kwsid: true,
        first_name: true,
        email: true,
        form_scanned: true,
        middle_name: true,
        last_name: true,
        type_of_member: true,
        profile_picture: true,
        dob: true,
        type_of_member: true,
        card_expiry_date: true,
        gender: true,
        blood_group: true,
        education_qualification: true,
        profession: true,
        kuwait_contact: true,
        kuwait_whatsapp: true,
        marital_status: true,
        family_in_kuwait: true,
        flat_no: true,
        floor_no: true,
        block_no: true,
        building_name_no: true,
        street_no_name: true,
        area: true,
        residence_complete_address: true,
        pin_no_india: true,
        mohalla_village: true,
        taluka: true,
        district: true,
        native_pin_no: true,
        indian_contact_no_1: true,
        indian_contact_no_2: true,
        indian_contact_no_3: true,
        emergency_name_kuwait: true,
        emergency_contact_kuwait: true,
        emergency_name_india: true,
        emergency_contact_india: true,
        father_name: true,
        mother_name: true,
        spouse_name: true,
        child_name_1: true,
        child_name_2: true,
        child_name_3: true,
        child_name_4: true,
        child_name_5: true,
        additional_information: true,
        full_name_1: true,
        relation_1: true,
        percentage_1: true,
        mobile_1: true,
        full_name_2: true,
        relation_2: true,
        percentage_2: true,
        mobile_2: true,
        full_name_3: true,
        relation_3: true,
        percentage_3: true,
        mobile_3: true,
        full_name_4: true,
        relation_4: true,
        percentage_4: true,
        mobile_4: true,
        application_date: true,
        admin_charges: true,
        amount_in_kwd: true,
        form_received_by: true,
        form_scanned: true,
        card_printed: true,
        card_printed_date: true,
        card_expiry_date: true,
        zone_member: true,
        follow_up_member: true,
        office_comments: true,
        membership_status: true,
      },
    });

    if (!coreKwsMember) {
      return res
        .status(404)
        .json({ error: "No record found with the provided User ID." });
    }

    // Format date fields
    const formatDate = (date) => {
      if (!date) return null;
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return formattedDate;
    };

    coreKwsMember.dob = formatDate(coreKwsMember.dob);
    coreKwsMember.application_date = formatDate(coreKwsMember.application_date);
    coreKwsMember.card_printed_date = formatDate(
      coreKwsMember.card_printed_date
    );
    coreKwsMember.card_expiry_date = formatDate(coreKwsMember.card_expiry_date);

    const BASE_URL = "https://api.kwskwt.com"; // Base URL of your production server

    // Ensure the profile_picture URL is correctly formed
    coreKwsMember.profile_picture = coreKwsMember.profile_picture
      ? coreKwsMember.profile_picture.startsWith("http")
        ? coreKwsMember.profile_picture.includes("localhost")
          ? coreKwsMember.profile_picture.replace(
              "http://localhost:5786",
              BASE_URL
            ) // Remove localhost and add BASE_URL
          : coreKwsMember.profile_picture
        : `${BASE_URL}/${
            coreKwsMember.profile_picture.startsWith("") ? "" : ""
          }${coreKwsMember.profile_picture}` // If it's a relative URL, prepend BASE_URL with a slash
      : null;

    // Ensure the form_scanned URL is correctly formed
    coreKwsMember.form_scanned = coreKwsMember.form_scanned
      ? coreKwsMember.form_scanned.startsWith("http")
        ? coreKwsMember.form_scanned.includes("localhost")
          ? coreKwsMember.form_scanned.replace(
              "http://localhost:5786",
              BASE_URL
            ) // Remove localhost and add BASE_URL
          : coreKwsMember.form_scanned
        : `${BASE_URL}/${coreKwsMember.form_scanned.startsWith("") ? "" : ""}${
            coreKwsMember.form_scanned
          }` // If it's a relative URL, prepend BASE_URL with a slash
      : null;

    // console.log("Final Profile Picture URL:", coreKwsMember.profile_picture);
    // console.log("Final Scanned Form URL:", coreKwsMember.form_scanned);

    return res.status(200).json({ data: coreKwsMember });
  } catch (error) {
    console.error("Error fetching core_kwsmember details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the details." });
  }
};

export const createUpdateRequest = async (req, res) => {
  try {
    const { memberId, formData } = req.body; // Assume memberId and formData are in the request body

    if (!memberId || !formData) {
      return res.status(400).json({ message: "Missing required data." });
    }

    // Check if there are any pending update requests for this member
    const existingRequest = await prisma.core_informationupdate.findFirst({
      where: {
        member_id: memberId,
        processed: false, // Only check for unprocessed requests
      },
    });

    if (existingRequest) {
      // If there is an existing unprocessed request, prevent the new submission
      return res.status(400).json({
        message: "There is already a pending update request for this member.",
      });
    }

    // Create a new update request in the core_informationupdate table
    const newUpdateRequest = await prisma.core_informationupdate.create({
      data: {
        requested_date: new Date(),
        updated_date: new Date(),
        processed: false, // Initially, it's not processed
        data: formData, // Storing the form data as JSON
        member_id: memberId,
      },
    });

    return res.status(201).json({
      message: "Update request created successfully.",
      updateRequest: newUpdateRequest,
    });
  } catch (error) {
    console.error("Error in createUpdateRequest:", error.message);
    return res.status(500).json({ message: "Error creating update request." });
  }
};

export const checkPendingRequest = async (req, res) => {
  const { userId } = req.params; // Get userId from params

  try {
    // Check if there is any pending request for this user
    const existingRequest = await prisma.core_informationupdate.findFirst({
      where: {
        member_id: parseInt(userId), // Check against member_id (user_id) in core_informationupdate
        processed: false, // Only look for unprocessed requests
      },
    });

    if (existingRequest) {
      return res.status(200).json({ pending: true });
    }

    return res.status(200).json({ pending: false });
  } catch (error) {
    console.error("Error checking pending request:", error);
    return res.status(500).json({ message: "Error checking pending request." });
  }
};

export const getPendingUpdateRequests = async (req, res) => {
  try {
    // Fetch all pending update requests from the core_informationupdate table
    const requests = await prisma.core_informationupdate.findMany({
      where: { processed: false }, // Only fetch unprocessed requests
      orderBy: { requested_date: "desc" }, // Ordering by requested date in descending order
      include: {
        core_kwsmember: {
          select: {
            user_id: true, // Select the user_id from core_kwsmember (which will correspond to member_id)
            type_of_member: true,
            zone_member: true,
            first_name: true,
            last_name: true,
            education_qualification: true,
            email: true,
            profession: true,
            kuwait_contact: true,
            kuwait_whatsapp: true,
            marital_status: true,
            family_in_kuwait: true,
            flat_no: true,
            floor_no: true,
            block_no: true,
            building_name_no: true,
            street_no_name: true,
            area: true,
            residence_complete_address: true,
            pin_no_india: true,
            mohalla_village: true,
            taluka: true,
            district: true,
            native_pin_no: true,
            emergency_name_kuwait: true,
            emergency_contact_kuwait: true,
            emergency_name_india: true,
            emergency_contact_india: true,
            father_name: true,
            mother_name: true,
            spouse_name: true,
            child_name_1: true,
            child_name_2: true,
            child_name_3: true,
            child_name_4: true,
            child_name_5: true,
            full_name_1: true,
            relation_1: true,
            percentage_1: true,
            mobile_1: true,
            full_name_2: true,
            relation_2: true,
            percentage_2: true,
            mobile_2: true,
            full_name_3: true,
            relation_3: true,
            percentage_3: true,
            mobile_3: true,
            full_name_4: true,
            relation_4: true,
            percentage_4: true,
            mobile_4: true,
          },
        },
      },
    });

    // Process each request to include both previous and requested data
    const detailedRequests = await Promise.all(
      requests.map(async (request) => {
        let user = null;

        if (request.core_kwsmember && request.core_kwsmember.user_id) {
          user = await prisma.users_user.findUnique({
            where: { id: request.core_kwsmember.user_id }, // Get the user based on user_id
            select: {
              username: true,
            },
          });
        }

        // Format the requested_date before adding it to the response
        const formattedDate = new Date(
          request.requested_date
        ).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return {
          ...request,
          username: user ? user.username : null,
          user_id: request.core_kwsmember?.user_id,
          type_of_member: request.core_kwsmember?.type_of_member, // Return type_of_member
          zone_member: request.core_kwsmember?.zone_member,
          name: `${request.core_kwsmember?.first_name || ""} ${
            request.core_kwsmember?.last_name || ""
          }`,
          requested_date: formattedDate, // Add the formatted requested_date

          // Add previous and requested data for display
          previous_data: request.core_kwsmember, // Previous data from core_kwsmember
          requested_data: request.data, // Requested update data from core_informationupdate (stored JSON)
        };
      })
    );

    // Sending the response back to the client with the fetched requests
    return res.status(200).json({
      message: "Pending update requests retrieved successfully.",
      updateRequests: detailedRequests, // The list of pending requests with additional user details
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error.message);
    // Handling errors if something goes wrong during fetching
    return res
      .status(500)
      .json({ message: "Error fetching pending update requests." });
  }
};

// Helper function to format date to ISO-8601 format
const formatDate = (date) => {
  // If the date is already in ISO format, just return it, otherwise format it
  return date ? new Date(date).toISOString() : null;
};

export const approveUpdateRequest = async (req, res) => {
  const { updateRequestId, approvedBy } = req.body;

  try {
    const updateRequest = await prisma.core_informationupdate.findUnique({
      where: { id: updateRequestId },
    });

    if (!updateRequest) {
      return res.status(404).json({ message: "Update request not found." });
    }

    if (updateRequest.processed) {
      return res
        .status(400)
        .json({ message: "This update request has already been processed." });
    }

    // Format date fields to ISO-8601 if needed
    const formattedData = { ...updateRequest.data };

    // Format application_date, card_expiry_date, dob (and any other date fields)
    if (formattedData.application_date) {
      formattedData.application_date = formatDate(
        formattedData.application_date
      ); // Ensure ISO format
    }

    if (formattedData.card_expiry_date) {
      formattedData.card_expiry_date = formatDate(
        formattedData.card_expiry_date
      ); // Ensure ISO format
    }

    if (formattedData.card_printed_date) {
      formattedData.card_printed_date = formatDate(
        formattedData.card_printed_date
      ); // Ensure ISO format
    }

    if (formattedData.dob) {
      formattedData.dob = formatDate(formattedData.dob); // Ensure ISO format
    }

    if (formattedData.percentage_1) {
      formattedData.percentage_1 = parseInt(formattedData.percentage_1, 10); // Convert to integer
    }

    if (formattedData.percentage_2) {
      formattedData.percentage_2 = parseInt(formattedData.percentage_2, 10); // Convert to integer
    }

    if (formattedData.percentage_3) {
      formattedData.percentage_3 = parseInt(formattedData.percentage_3, 10); // Convert to integer
    }

    if (formattedData.percentage_4) {
      formattedData.percentage_4 = parseInt(formattedData.percentage_4, 10); // Convert to integer
    }

    // Update the core_kwsmember table with the new data
    const updatedMember = await prisma.core_kwsmember.update({
      where: { user_id: updateRequest.member_id },
      data: formattedData,
    });

    // Mark the update request as processed
    await prisma.core_informationupdate.update({
      where: { id: updateRequestId },
      data: {
        processed: true,
        updated_date: new Date(),
        approved_by: approvedBy,
      },
    });

    return res.status(200).json({
      message:
        "Update request approved and member profile updated successfully.",
      updatedMember,
    });
  } catch (error) {
    console.error("Error approving update request:", error.message);
    return res.status(500).json({ message: "Error approving update request." });
  }
};

export const pendingrequest = async (req, res) => {
  try {
    const count = await prisma.core_informationupdate.count({
      where: { processed: false },
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching transaction count:", error.message);
    return res
      .status(500)
      .json({ error: "Server error while fetching transaction count." });
  }
};
