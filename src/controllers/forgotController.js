import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import crypto from "crypto"; // To generate a unique token
import nodemailer from "nodemailer"; // For sending emails

const prisma = new PrismaClient();

// In-memory storage for reset tokens (not recommended for production)
let resetTokens = {};

export const requestPasswordReset = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    // Fetch the user by username
    const user = await prisma.users_user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex"); // Generate a unique token
    const resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // Store the reset token and expiration in memory (use a persistent store in production)
    resetTokens[resetToken] = { username: user.username, expiration: resetTokenExpiration };

    // Set up email transport using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use the email provider of your choice (e.g., Gmail, SendGrid)
      auth: {
        user: process.env.EMAIL_USER, // Use the environment variable for email user
        pass: process.env.EMAIL_PASS, // Use the environment variable for email password
      },
    });

    // Prepare the reset email with a reset token (no frontend URL)
    const mailOptions = {
      from: "no-reply@example.com", // Sender address
      to: user.email, // Recipient address
      subject: "Password Reset Request", // Subject line
      text: `You requested a password reset. Please use the token below to reset your password:\n\nToken: ${resetToken}`,
      html: `<p>You requested a password reset. Please use the token below to reset your password:</p><p><b>Token: ${resetToken}</b></p>`,
    };

    // Send email with reset token
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Password reset token sent to your email." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while processing your request." });
  }
};

export const verifyEmailAndAllowReset = async (req, res) => {
  const { token } = req.body; // Get the token from the body (no frontend URL)

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  try {
    // Check if the token exists in the in-memory storage
    const resetTokenData = resetTokens[token];

    if (!resetTokenData) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Check if the token has expired
    const now = new Date();
    if (resetTokenData.expiration < now) {
      return res.status(400).json({ message: "Token has expired." });
    }

    // At this point, the email is verified, and we allow the user to reset the password
    return res.status(200).json({ message: "Email verified. You can now reset your password." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while verifying the email." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  try {
    // Find the user based on the reset token (stored in memory)
    const resetTokenData = resetTokens[token];

    if (!resetTokenData) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    // Check if the token has expired
    const now = new Date();
    if (resetTokenData.expiration < now) {
      return res.status(400).json({ message: "Token has expired." });
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update the password in the database (without updating resetToken and resetTokenExpiration)
    await prisma.users_user.update({
      where: { username: resetTokenData.username },
      data: {
        password: `argon2${hashedPassword}`, // Store the hashed password in the database
      },
    });

    // After resetting the password, delete the token from memory (it's no longer needed)
    delete resetTokens[token];

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while resetting the password." });
  }
};
