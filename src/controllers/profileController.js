import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Validate user_id
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    let parsedUserId;
    try {
      parsedUserId = BigInt(user_id);
    } catch (err) {
      return res.status(400).json({ error: "User ID must be a valid number." });
    }

    // Fetch user profile
    const user = await prisma.users_user.findUnique({
      where: {
        id: parsedUserId,
      },
      select: {
        username: true,
        core_kwsmember: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            type_of_member: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Construct response
    const response = {
      username: user.username,
      core_kwsmember: user.core_kwsmember
        ? {
            firstName: user.core_kwsmember.first_name,
            middleName: user.core_kwsmember.middle_name,
            lastName: user.core_kwsmember.last_name,
            typeOfMember: user.core_kwsmember.type_of_member,
          }
        : null,
    };

    return res.status(200).json({ user: response });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "An error occurred while fetching the user profile." });
  }
};
