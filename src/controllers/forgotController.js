import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import argon2 from 'argon2';


export const Forgot = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
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
  
      // Hash the new password
      const hashedPassword = await argon2.hash(password);
      const hashedPasswordWithPrefix = `argon2${hashedPassword}`;
  
      // Update the password in the database
      await prisma.users_user.update({
        where: {
          username: username,
        },
        data: {
          password: hashedPasswordWithPrefix,
        },
      });
  
      return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while updating the password." });
    }
  };