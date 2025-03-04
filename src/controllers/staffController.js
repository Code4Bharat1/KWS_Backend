import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getStaffList = async (req, res) => {
  try {
    // Fetch the staff data from the `users_user` table
    const staff = await prisma.users_user.findMany({
      where: {
        core_kwsmember: {
          membership_status: {
            equals: "Approved",
            mode: "insensitive",
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        date_joined: true,
        staff_roles: true,
        core_kwsmember: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            kwsid: true,
          },
        },
      },
    });

    // Format the staff data to include `fullName`, `phoneNumber`, and `roles`
    const formattedStaff = staff.map((staffMember) => {
      const memberInfo = staffMember.core_kwsmember || {};
      const fullName = `${memberInfo.first_name || ""} ${
        memberInfo.middle_name || ""
      } ${memberInfo.last_name || ""}`.trim();
      const phoneNumber = memberInfo.phone_number || "No Contact";

      return {
        id: staffMember.id,
        username: staffMember.username,
        email: staffMember.email,
        isActive: staffMember.is_active ? "Active" : "Inactive",
        dateJoined: new Date(staffMember.date_joined).toLocaleDateString(
          "en-GB"
        ),
        roles: staffMember.staff_roles,
        fullName: fullName || "Unknown",
        phoneNumber: phoneNumber,
        kwsid: memberInfo.kwsid || "No KWSID",
      };
    });

    res.status(200).json(formattedStaff); // Respond with the formatted staff list
  } catch (error) {
    console.error("Error fetching staff list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the staff list." });
  }
};

export const editStaff = async (req, res) => {
  try {
    const { username, roles } = req.body;

    if (!username || !roles) {
      return res
        .status(400)
        .json({ error: "Username and roles are required." });
    }

    // Fetch the staff member by username
    const staff = await prisma.users_user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        staff_roles: true, // Directly access staff_roles (if it's a Json field)
      },
    });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found." });
    }

    // Update the roles (assuming roles is a JSON object)
    const updatedStaff = await prisma.users_user.update({
      where: { username },
      data: {
        staff_roles: roles, // Assuming roles is a JSON object
      },
    });

    return res.status(200).json({
      message: "Roles updated successfully",
      updatedStaff,
    });
  } catch (error) {
    console.error("Error editing staff:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the staff." });
  }
};
