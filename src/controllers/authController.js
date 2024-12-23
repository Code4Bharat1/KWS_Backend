import argon2 from "argon2";

import prisma from '../prismaClient.js';


// export const registerUser = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const existingUser = await prisma.users_user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await prisma.users_user.create({
//       data: {
//         username,
//         email,
//         password: hashedPassword,
//         is_active: true,
//         date_joined: new Date(),
//         is_superuser: false,
//         is_staff: false,
//         staff_roles: [],
//       },
//     });

//     res.status(201).json({ message: 'User registered successfully', user: newUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// };

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