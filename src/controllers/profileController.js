
import { PrismaClient } from "@prisma/client";
import path from 'path';
import fs from 'fs';
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
            profilePicture: user.core_kwsmember.profile_picture
              ? `http://localhost:5786/${user.core_kwsmember.profile_picture}`
              : null,
          }
        : null,
    };

    // console.log("Constructed Response:", response);

    return res.status(200).json({ user: response });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "An error occurred while fetching the user profile." });
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

    const { profile_picture, form_scanned, application_date, dob, ...otherFields } = req.body;
    const updateData = { ...otherFields };

    // Validate and parse dob (date of birth)
    if (dob) {
      const parsedDob = new Date(dob);
      if (isNaN(parsedDob)) {
        return res.status(400).json({ error: "Invalid dob format. Expected ISO-8601 DateTime." });
      }
      updateData.dob = parsedDob.toISOString(); // Ensure ISO-8601 DateTime format
    }

    // Validate and parse application_date
    if (application_date) {
      const parsedDate = new Date(application_date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ error: "Invalid application_date format. Expected ISO-8601 DateTime." });
      }
      updateData.application_date = parsedDate; // Valid ISO-8601 DateTime
    }

    // Handle profile_picture upload
    if (req.files && req.files.profile_picture && req.files.profile_picture.length > 0) {
      const profilePic = req.files.profile_picture[0];
      const uploadDir = path.resolve("uploads/profile-pictures");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, profilePic.filename);
      fs.renameSync(profilePic.path, uploadPath);
      updateData.profile_picture = `uploads/profile-pictures/${profilePic.filename}`;
    }

    // Handle form_scanned upload
    if (req.files && req.files.form_scanned && req.files.form_scanned.length > 0) {
      const scannedForm = req.files.form_scanned[0];
      const uploadDir = path.resolve("uploads/form-scanned");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, scannedForm.filename);
      fs.renameSync(scannedForm.path, uploadPath);
      updateData.form_scanned = `uploads/form-scanned/${scannedForm.filename}`;
    }

    // Update the user data in Prisma
    const updatedUser = await prisma.core_kwsmember.update({
      where: { user_id: parsedUserId },
      data: {
        ...updateData, // Update all fields in the `updateData` object
      },
    });

    return res.status(200).json({ message: "User profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "An error occurred while updating the user profile." });
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
        type_of_member:true,
        card_expiry_date:true,
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
      },
    });

    if (!coreKwsMember) {
      return res.status(404).json({ error: "No record found with the provided User ID." });
    }

    // Format date fields
    const formatDate = (date) => {
      if (!date) return null;
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return formattedDate;
    };

    coreKwsMember.dob = formatDate(coreKwsMember.dob);
    coreKwsMember.application_date = formatDate(coreKwsMember.application_date);
    coreKwsMember.card_printed_date = formatDate(coreKwsMember.card_printed_date);
    coreKwsMember.card_expiry_date = formatDate(coreKwsMember.card_expiry_date);

    if (coreKwsMember.profile_picture) {
      coreKwsMember.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}${coreKwsMember.profile_picture}`;
    }

    if (coreKwsMember.form_scanned) {
      coreKwsMember.form_scanned = `${req.protocol}://${req.get(
        "host"
      )}${coreKwsMember.form_scanned}`;
    }

    return res.status(200).json({ data: coreKwsMember });
  } catch (error) {
    console.error("Error fetching core_kwsmember details:", error);
    return res.status(500).json({ error: "An error occurred while fetching the details." });
  }
};




/**
 * Creates a new update request based on the incoming form data.
 * The updateData is saved as JSON in the `data` field and linked to a member.
 */
export const editUser = async (req, res) => {
  try {
    // Expecting member_id and all updated form fields in req.body
    const memberId = req.body.member_id;
    const updateData = req.body; // Contains the entire update payload

    // Validate input
    if (!memberId || !updateData) {
      return res.status(400).json({ message: "Missing required update data." });
    }

    // Create a new update request record in core_informationupdate.
    const newUpdateRequest = await prisma.core_informationupdate.create({
      data: {
        requested_date: new Date(),
        updated_date: new Date(), // This can be updated upon processing, if desired.
        processed: false,
        data: updateData, // Save the entire update payload as JSON.
        member_id: memberId,
      },
    });

    return res.status(201).json({
      message: "Update request created successfully.",
      updateRequest: newUpdateRequest,
    });
  } catch (error) {
    console.error("Error in editUser:", error.message);
    return res
      .status(500)
      .json({ message: "Server error during update request." });
  }
};

/**
 * Returns all pending update requests.
 */
export const getUpdateRequests = async (req, res) => {
  try {
    const requests = await prisma.core_informationupdate.findMany({
      where: { processed: false },
      orderBy: { requested_date: "desc" },
    });

    return res.status(200).json({
      message: "Pending update requests retrieved successfully.",
      updateRequests: requests,
    });
  } catch (error) {
    console.error("Error in getUpdateRequests:", error.message);
    return res
      .status(500)
      .json({ message: "Server error retrieving update requests." });
  }
};

/**
 * Approves an update request:
 *  - Reads the stored JSON update data.
 *  - Updates the corresponding member in core_kwsmember.
 *  - Marks the update request as processed.
 */
export const approveUpdateRequest = async (req, res) => {
  try {
    const { updateRequestId, approved_by } = req.body;
    
    // Fetch the update request record by its id.
    const updateRequest = await prisma.core_informationupdate.findUnique({
      where: { id: Number(updateRequestId) },
    });

    if (!updateRequest) {
      return res.status(404).json({ message: "Update request not found." });
    }

    if (updateRequest.processed) {
      return res
        .status(400)
        .json({ message: "This update request has already been processed." });
    }

    // Extract the stored update data and member id.
    const { data: updateData, member_id } = updateRequest;

    // Update the member data in core_kwsmember.
    // Ensure that the keys in updateData match the columns of core_kwsmember.
    const updatedMember = await prisma.core_kwsmember.update({
      where: { user_id: Number(member_id) },
      data: {
        ...updateData,
      },
    });

    // Mark the update request as processed.
    const processedRequest = await prisma.core_informationupdate.update({
      where: { id: Number(updateRequestId) },
      data: {
        processed: true,
        updated_date: new Date(),
        approved_by: approved_by || null,
      },
    });

    return res.status(200).json({
      message:
        "Update request approved and member data updated successfully.",
      updatedMember,
      processedRequest,
    });
  } catch (error) {
    console.error("Error in approveUpdateRequest:", error.message);
    return res
      .status(500)
      .json({ message: "Server error during update approval." });
  }
};