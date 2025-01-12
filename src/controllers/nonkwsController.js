import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getnonkwsList = async (req, res) => {
    const { name, kwskwnId, isCompany, address } = req.query;
  
    try {
      // Build the filter object dynamically based on the query parameters
      const filters = {};
      if (name) filters.first_name = { contains: name, mode: 'insensitive' }; // Case-insensitive name filter
      if (kwskwnId) filters.id = parseInt(kwskwnId); // Convert kwskwnId to integer and apply filter
      if (isCompany && isCompany !== 'all') filters.is_company = isCompany === 'yes';
      if (address) filters.building_name_no = { contains: address, mode: 'insensitive' }; // Case-insensitive address filter
  
      // Fetch the filtered list of non-KWS members
      const nonkwsList = await prisma.core_nonkwsmember.findMany({
        where: filters,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          zone_member: true,
          contact: true,
          is_company: true,
          building_name_no: true,
          flat_no: true,
          floor_no: true,
        },
      });
  
      // Format the result for a better response
      const formattedList = nonkwsList.map(member => {
        const formattedId = `KWSKWN${String(member.id).padStart(4, '0')}`;
        return {
          ID: formattedId,
          Name: `${member.first_name || ''} ${member.last_name || ''}`,
          Address: `${member.building_name_no || ''} ${member.flat_no || ''} ${member.floor_no || ''}`,
          Zone: member.zone_member || 'Not Available',
          Contact: member.contact || 'Not Available',
          IsCompany: member.is_company, // Add the isCompany flag
        };
      });
  
      res.status(200).json(formattedList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the data' });
    }
  };


  export const addnonkws = async (req, res) => {
    try {
      // Extract the data from the request body
      const {
        isCompany,
        firstName,
        middleName,
        lastName,
        gender,
        maritalStatus,
        familyInKuwait,
        zoneMember,
        bloodGroup,
        educationQualification,
        profession,
        relationToKws,
        contact,
        whatsapp,
        email,
        flatNo,
        floorNo,
        blockNo,
        buildingNameNo,
        streetNameNo,
        area
      } = req.body;
  
      // Create a new non-KWS member entry
      const newNonKwsMember = await prisma.core_nonkwsmember.create({
        data: {
          is_company: isCompany === 'yes',  
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          gender: gender,
          marital_status: maritalStatus,
          family_in_kuwait: familyInKuwait,
          zone_member:zoneMember,
          blood_group:bloodGroup,
          education_qualification:educationQualification,
          profession:profession,
          relation_to_kws:relationToKws,
          contact: contact,
          whatsapp: whatsapp,
          email: email,
          building_name_no: buildingNameNo,
          flat_no: flatNo,
          floor_no: floorNo,
          block_no: blockNo,
          street_no_name: streetNameNo,
          area: area
        }
      });
  
      res.status(201).json(newNonKwsMember);
    } catch (error) {
      console.error("Error adding new non-KWS member:", error);
      res.status(500).json({ error: "An error occurred while adding the new member" });
    }
  };


export const viewnonkws = async (req, res) => {
    let { id } = req.params;  // Get the ID from the request parameters

    try {
        // Remove the prefix "KWSKWN" or any similar prefixes before the numeric part
        id = id.replace(/^KWSKWN/, '');  // Remove "KWSKWN" prefix, if present

        // Ensure the ID is parsed as an integer
        id = parseInt(id);

        // Fetch the non-KWS member from the database using Prisma
        const nonKwsMember = await prisma.core_nonkwsmember.findUnique({
            where: {
                id: id,  // Use the cleaned ID (after removing the prefix)
            },
        });

        if (!nonKwsMember) {
            return res.status(404).json({ message: "Non-KWS member not found" });
        }

        // If the member is found, send the data as the response
        res.status(200).json(nonKwsMember);
    } catch (error) {
        console.error("Error fetching non-KWS member:", error);
        res.status(500).json({ error: "An error occurred while fetching the member" });
    }
};

export const viewforedit = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Clean the ID and parse as BigInt
    const cleanedId = id.replace(/^KWSKWN/, ''); // Clean up the ID if needed (remove KWSKWN)
    const parsedId = BigInt(cleanedId); // Convert ID to BigInt

    // Find the non-KWS member by the cleaned ID
    const nonKwsMember = await prisma.core_nonkwsmember.findUnique({
      where: { id: parsedId },
    });

    if (!nonKwsMember) {
      return res.status(404).json({ message: "Non-KWS member not found" });
    }

    // Send the existing member data as the response
    // Here, we include all the fields in the response so the frontend can pre-fill the form
    const memberData = {
      isCompany: nonKwsMember.is_company,
      firstName: nonKwsMember.first_name,
      middleName: nonKwsMember.middle_name,
      lastName: nonKwsMember.last_name,
      gender: nonKwsMember.gender,
      maritalStatus: nonKwsMember.marital_status,
      familyInKuwait: nonKwsMember.family_in_kuwait,
      contact: nonKwsMember.contact,
      whatsapp: nonKwsMember.whatsapp,
      email: nonKwsMember.email,
      zoneMember: nonKwsMember.zone_member,
      bloodGroup: nonKwsMember.blood_group,
      educationQualification: nonKwsMember.education_qualification,
      profession: nonKwsMember.profession,
      relationToKws: nonKwsMember.relation_to_kws,
      flatNo: nonKwsMember.flat_no,
      floorNo: nonKwsMember.floor_no,
      blockNo: nonKwsMember.block_no,
      buildingNameNo: nonKwsMember.building_name_no,
      streetNameNo: nonKwsMember.street_no_name,
      area: nonKwsMember.area,
    };

    // Send the member data as the response to be used in the frontend form
    res.status(200).json(memberData);
  } catch (error) {
    console.error("Error fetching non-KWS member data:", error);
    res.status(500).json({ error: "An error occurred while fetching member data" });
  }
};



export const editnonkwsmember = async (req, res) => {
  const { id } = req.params;  // Get the ID from the request parameters
  const {
    isCompany,
    firstName,
    middleName,
    lastName,
    gender,
    maritalStatus,
    familyInKuwait,
    contact,
    whatsapp,
    email,
    zoneMember,
    bloodGroup,
    educationQualification,
    profession,
    relationToKws,
    flatNo,
    floorNo,
    blockNo,
    buildingNameNo,
    streetNameNo,
    area
  } = req.body;  // Extract the fields from the request body

  try {
    // Clean the ID and parse as BigInt
    const cleanedId = id.replace(/^KWSKWN/, '');  // Clean up the ID if needed (remove KWSKWN)
    const parsedId = BigInt(cleanedId); // Convert ID to BigInt

    // Log to ensure the correct data is being sent
    console.log("Request data:", req.body);
    console.log("Parsed ID:", parsedId);

    // Find the non-KWS member to edit
    const nonKwsMember = await prisma.core_nonkwsmember.findUnique({
      where: { id: parsedId },
    });

    if (!nonKwsMember) {
      return res.status(404).json({ message: "Non-KWS member not found" });
    }

    // Prepare the data for update
    const updateData = {};

    // Check if each field is provided in the request body, and update if necessary
    if (isCompany !== undefined) updateData.is_company = isCompany === 'yes';
    if (firstName !== undefined) updateData.first_name = firstName;
    if (middleName !== undefined) updateData.middle_name = middleName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (gender !== undefined) updateData.gender = gender;
    if (maritalStatus !== undefined) updateData.marital_status = maritalStatus;
    if (familyInKuwait !== undefined) updateData.family_in_kuwait = familyInKuwait;
    if (contact !== undefined) updateData.contact = contact;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (email !== undefined) updateData.email = email;
    if (zoneMember !== undefined) updateData.zone_member = zoneMember;
    if (bloodGroup !== undefined) updateData.blood_group = bloodGroup;
    if (educationQualification !== undefined) updateData.education_qualification = educationQualification;
    if (profession !== undefined) updateData.profession = profession;
    if (relationToKws !== undefined) updateData.relation_to_kws = relationToKws;
    if (flatNo !== undefined) updateData.flat_no = flatNo;
    if (floorNo !== undefined) updateData.floor_no = floorNo;
    if (blockNo !== undefined) updateData.block_no = blockNo;
    if (buildingNameNo !== undefined) updateData.building_name_no = buildingNameNo;
    if (streetNameNo !== undefined) updateData.street_no_name = streetNameNo;
    if (area !== undefined) updateData.area = area;

    // Log the update data before the update query
    console.log("Update Data:", updateData);

    // Update the non-KWS member with the new data
    const updatedNonKwsMember = await prisma.core_nonkwsmember.update({
      where: { id: parsedId },
      data: updateData,  // Update only the fields that were passed in the request body
    });

    console.log("Updated member:", updatedNonKwsMember);

    // Send the updated member data as the response
    res.status(200).json(updatedNonKwsMember);
  } catch (error) {
    console.error("Error updating non-KWS member:", error);
    res.status(500).json({ error: "An error occurred while updating the member" });
  }
};



export const deletenonkwsmember = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Clean the ID and parse as BigInt
    const cleanedId = id.replace(/^KWSKWN/, ''); // Clean up the ID if needed (remove KWSKWN)
    const parsedId = BigInt(cleanedId); // Convert ID to BigInt

    // Find the non-KWS member to delete
    const nonKwsMember = await prisma.core_nonkwsmember.findUnique({
      where: { id: parsedId },
    });

    if (!nonKwsMember) {
      return res.status(404).json({ message: "Non-KWS member not found" });
    }

    // Delete the non-KWS member
    await prisma.core_nonkwsmember.delete({
      where: { id: parsedId },
    });

    // Send a success response
    res.status(200).json({ message: "Non-KWS member deleted successfully" });
  } catch (error) {
    console.error("Error deleting non-KWS member:", error);
    res.status(500).json({ error: "An error occurred while deleting the member" });
  }
};


export const logsnonkwsmember = async (req, res) => {
  try {
    const { id } = req.params;  // Get the ID from the request parameters

    // Clean the ID (if needed) to remove any prefix, similar to how you did in editnonkwsmember
    const cleanedId = id.replace(/^KWSKWN/, '');  // Remove "KWSKWN" prefix if it exists
    const parsedId = BigInt(cleanedId);  // Convert the cleaned ID to BigInt

    // Log the cleaned and parsed ID for debugging
    console.log("Parsed ID:", parsedId);

    // Fetch logs using the cleaned and parsed account_id
    const logs = await prisma.core_auditnonkwsmember.findMany({
      where: {
        account_id: parsedId,  // Use parsed ID for querying logs
      },
      orderBy: {
        created_at: 'desc',  // Sort logs by created_at in descending order
      },
      include: {
        core_nonkwsmember: true,  // Include related core_nonkwsmember data
        core_kwsmember: true,     // Include related core_kwsmember data
      },
    });

    // Map logs to include all fields from core_auditnonkwsmember and associated data
    const mappedLogs = logs.map((log) => ({
      id: log.id,
      first_name: log.first_name,
      middle_name: log.middle_name,
      last_name: log.last_name,
      relation_to_kws: log.relation_to_kws,
      zone_member: log.zone_member,
      email: log.email,
      blood_group: log.blood_group,
      education_qualification: log.education_qualification,
      profession: log.profession,
      contact: log.contact,
      whatsapp: log.whatsapp,
      gender: log.gender,
      marital_status: log.marital_status,
      family_in_kuwait: log.family_in_kuwait,
      flat_no: log.flat_no,
      floor_no: log.floor_no,
      block_no: log.block_no,
      building_name_no: log.building_name_no,
      street_no_name: log.street_no_name,
      area: log.area,
      action: log.action,
      created_at: log.created_at,
      account_id: log.account_id,
      committed_id: log.committed_id,
      committed_by_kws_id: log.core_kwsmember ? log.core_kwsmember.kws_id : null,  // Fetching kws_id from core_kwsmember
      core_nonkwsmember: log.core_nonkwsmember,
      core_kwsmember: log.core_kwsmember,
    }));

    return res.status(200).json({ success: true, logs: mappedLogs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
