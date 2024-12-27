import argon2 from "argon2";

import prisma from '../prismaClient.js';


// register user (add)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const registerUser = async (req, res) => {
  try {
    const {
      civil_id,
      first_name,
      middle_name,
      last_name,
      email,
      password,
      dob,
      blood_group,
      education_qualification,
      profession,
      kuwait_contact,
      kuwait_whatsapp,
      gender,
      marital_status,
      family_in_kuwait,
      flat_no,
      floor_no,
      block_no,
      building_name_no,
      street_no_name,
      area,
      pin_no_india,
      mohalla_village,
      taluka,
      district,
      native_pin_no,
      indian_contact_no_1,
      indian_contact_no_2,
      indian_contact_no_3,
      emergency_name_kuwait,
      emergency_contact_kuwait,
      emergency_name_india,
      emergency_contact_india,
      father_name,
      mother_name,
      spouse_name,
      child_names = [],
      additional_information,
      nominations = [],
    } = req.body;

    // Validate required fields
    if (!email || !password || !civil_id || !first_name || !gender) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value. Must be 'Male' or 'Female'." });
    }

    // Check if the email is already registered
    const existingUser = await prisma.users_user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Check if civil_id is unique
    const existingMember = await prisma.core_kwsmember.findFirst({
      where: { civil_id },
    });

    if (existingMember) {
      return res.status(400).json({ message: "Civil ID already registered." });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);
    const hashedPasswordWithPrefix = `argon2${hashedPassword}`;

    // Create the user
    const newUser = await prisma.users_user.create({
      data: {
        email,
        username: email.split("@")[0],
        password: hashedPasswordWithPrefix,
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date(),
        staff_roles: {},
      },
    });

    // Parse child names
    const [child_name_1, child_name_2, child_name_3, child_name_4, child_name_5] = child_names;

    // Parse nominations
    const nominationsData = nominations.map((nomination, index) => ({
      [`full_name_${index + 1}`]: nomination?.name || null,
      [`relation_${index + 1}`]: nomination?.relation || null,
      [`percentage_${index + 1}`]: nomination?.percentage || null,
      [`mobile_${index + 1}`]: nomination?.contact || null,
    }));

    // Flatten nomination data
    const flattenedNominations = nominationsData.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    // Create the member
    const newMember = await prisma.core_kwsmember.create({
      data: {
        user_id: newUser.id,
        civil_id,
        first_name,
        middle_name,
        last_name,
        email,
        dob: dob ? new Date(dob) : null,
        blood_group,
        education_qualification,
        profession,
        kuwait_contact,
        kuwait_whatsapp,
        gender,
        marital_status,
        family_in_kuwait,
        flat_no,
        floor_no,
        block_no,
        building_name_no,
        street_no_name,
        area,
        pin_no_india,
        mohalla_village,
        taluka,
        district,
        native_pin_no,
        indian_contact_no_1,
        indian_contact_no_2,
        indian_contact_no_3,
        emergency_name_kuwait,
        emergency_contact_kuwait,
        emergency_name_india,
        emergency_contact_india,
        father_name,
        mother_name,
        spouse_name,
        child_name_1,
        child_name_2,
        child_name_3,
        child_name_4,
        child_name_5,
        additional_information,
        ...flattenedNominations,
        application_date: new Date(),
        updated_date: new Date(),
        membership_status: "pending",
      },
      include: {
        users_user: true, // Fetch the linked user
      },
    });

    // Send success response
    return res.status(201).json({
      message: "Registration successful",
      member: newMember,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res.status(500).json({ message: "Server error during registration." });
  }
};



// get a user (find)
 export const getUser = async (req, res) => {
  const { user_id } = req.params;  // Extract user_id from URL parameter
  try {
    const user = await prisma.core_kwsmember.findUnique({
      where: {
        user_id: BigInt(user_id),  // Querying by user_id, assuming it's a BigInt
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user data if found
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res.status(500).json({ message: "Server error during fetching user." });
  }
};

// get all users
export const allUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination parameters with defaults
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Fetch all users with pagination
    const users = await prisma.core_kwsmember.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: {
        updated_date: 'desc', // Sort by the updated date in descending order
      },
      include: {
        users_user: true, // Include linked user details
      },
    });

    // Get the total count of users
    const totalUsers = await prisma.core_kwsmember.count();

    // Send response with users and pagination info
    return res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    return res.status(500).json({ message: "Server error fetching users." });
  }
};


// edit user (put)
export const editUser = async (req, res) => {
  try {
    const { user_id } = req.params; // Expecting `user_id` in the request parameters
    const {
      civil_id,
      first_name,
      middle_name,
      last_name,
      email,
      dob,
      blood_group,
      education_qualification,
      profession,
      kuwait_contact,
      kuwait_whatsapp,
      gender,
      marital_status,
      family_in_kuwait,
      flat_no,
      floor_no,
      block_no,
      building_name_no,
      street_no_name,
      area,
      pin_no_india,
      mohalla_village,
      taluka,
      district,
      native_pin_no,
      indian_contact_no_1,
      indian_contact_no_2,
      indian_contact_no_3,
      emergency_name_kuwait,
      emergency_contact_kuwait,
      emergency_name_india,
      emergency_contact_india,
      father_name,
      mother_name,
      spouse_name,
      child_names = [],
      additional_information,
      nominations = [],
    } = req.body;

    // Check if user exists
    const existingMember = await prisma.core_kwsmember.findUnique({
      where: { user_id: Number(user_id) },
    });

    if (!existingMember) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update child names and nominations if provided
    const [child_name_1, child_name_2, child_name_3, child_name_4, child_name_5] = child_names;
    const nominationsData = nominations.map((nomination, index) => ({
      [`full_name_${index + 1}`]: nomination?.name || null,
      [`relation_${index + 1}`]: nomination?.relation || null,
      [`percentage_${index + 1}`]: nomination?.percentage || null,
      [`mobile_${index + 1}`]: nomination?.contact || null,
    }));
    const flattenedNominations = nominationsData.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    // Update the user
    const updatedMember = await prisma.core_kwsmember.update({
      where: { user_id: Number(user_id) },
      data: {
        civil_id,
        first_name,
        middle_name,
        last_name,
        email,
        dob: dob ? new Date(dob) : undefined,
        blood_group,
        education_qualification,
        profession,
        kuwait_contact,
        kuwait_whatsapp,
        gender,
        marital_status,
        family_in_kuwait,
        flat_no,
        floor_no,
        block_no,
        building_name_no,
        street_no_name,
        area,
        pin_no_india,
        mohalla_village,
        taluka,
        district,
        native_pin_no,
        indian_contact_no_1,
        indian_contact_no_2,
        indian_contact_no_3,
        emergency_name_kuwait,
        emergency_contact_kuwait,
        emergency_name_india,
        emergency_contact_india,
        father_name,
        mother_name,
        spouse_name,
        child_name_1,
        child_name_2,
        child_name_3,
        child_name_4,
        child_name_5,
        additional_information,
        ...flattenedNominations,
        updated_date: new Date(),
      },
    });

    return res.status(200).json({
      message: "User updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({ message: "Server error during user update." });
  }
};



// login ka hai
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log("Login request received:", { username, password });

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Fetch user from the database
    const user = await prisma.users_user.findUnique({ where: { username } });

    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve and clean the hash
    let hashedPassword = user.password.trim();
    console.log("Retrieved hash from DB (before cleanup):", hashedPassword);

    // Remove the `argon2` prefix if present
    if (hashedPassword.startsWith('argon2$')) {
      hashedPassword = hashedPassword.replace(/^argon2/, ''); // Remove the `argon2` prefix
    }

    console.log("Cleaned hash for verification:", hashedPassword);

    // Verify password against the cleaned and prepared hash
    const isMatch = await argon2.verify(`${hashedPassword}`, password);
    console.log("Password verification result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Convert BigInt fields to strings (if necessary)
    const userId = user.id.toString();

    // Successful login
    return res.status(200).json({
      message: "Login successful",
      user: { id: userId, username: user.username },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};


