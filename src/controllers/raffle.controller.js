import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @desc		Get All Raffle draws
 * @route		GET /api/raffle
 * @access	Public
 */
export const getDrawList = async (req, res) => {
  try {
    // Fetch events from the database
    const events = await prisma.core_event.findMany({
      include: {
        core_attendee: true,
        core_auditevent: true,
        core_eventticket: true,
      },
    });

    // Function to format date as "Jan 26, 2023, 7:30 PM" in Kuwait Time
    const formatDate = (date) => {
      if (!date) return "Invalid Date"; // Check if the date is valid

      // Format date in the required format with Kuwait timezone
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kuwait",
      };
      const formattedDate = new Date(date).toLocaleString("en-US", options);

      if (!formattedDate || formattedDate === "Invalid Date") {
        return "Invalid Date";
      }

      return formattedDate;
    };

    // Format the start_date and end_date for each event
    const formattedEvents = events.map((event) => {
      const formattedStartDate = formatDate(event.start_date);
      const formattedEndDate = formatDate(event.end_date);

      return {
        ...event,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };
    });

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching event list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the event list." });
  }
};

// export const addEvent = async (req, res) => {
//   try {
//     const { name, start_date, end_date } = req.body;

//     if (!name || !start_date || !end_date) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const newEvent = await prisma.core_event.create({
//       data: {
//         name: name,
//         start_date: new Date(start_date),
//         end_date: new Date(end_date),
//       },
//     });

//     res.status(201).json(newEvent);
//   } catch (error) {
//     console.error("Error adding event:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding the event." });
//   }
// };

// export const getDrawList = async (req, res) => {
//   try {
//     // Fetch events from the database
//     const raffleDraws = await prisma.core_raffle.findMany({});

//     // Function to format date as "Jan 26, 2023, 7:30 PM" in Kuwait Time
//     const formatDate = (date) => {
//       if (!date) return "Invalid Date"; // Check if the date is valid

//       // Format date in the required format with Kuwait timezone
//       const options = {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "numeric",
//         minute: "numeric",
//         hour12: true,
//         timeZone: "Asia/Kuwait",
//       };
//       const formattedDate = new Date(date).toLocaleString("en-US", options);

//       if (!formattedDate || formattedDate === "Invalid Date") {
//         return "Invalid Date";
//       }

//       return formattedDate;
//     };

//     // Format the start_date and end_date for each event
//     const formattedEvents = raffleDraws.map((draw) => {
//       const formattedStartDate = formatDate(draw.start_time);
//       const formattedEndDate = formatDate(draw.end_time);

//       return {
//         ...draw,
//         start_time: formattedStartDate,
//         end_time: formattedEndDate,
//       };
//     });

//     res.status(200).json(formattedEvents);
//   } catch (error) {
//     console.error("Error fetching event list:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the event list." });
//   }
// };

/**
 * @desc		Create new raffle draw
 * @route		GET /api/raffle/add
 * @access	Public
 */

// export const addDraw = async (req, res) => {
//   try {
//     const { name, start_time, end_time } = req.body;

//     if (!name || !start_time || !end_time) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const newDraw = await prisma.core_raffle.create({
//       data: {
//         name,
//         start_time: new Date(start_time),
//         end_time: new Date(end_time),
//       },
//     });

//     res.status(201).json(newDraw);
//   } catch (error) {
//     console.error("Error adding Raffle Draw:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding the Raffle Draw." });
//   }
// };

/**
 * @desc		Delete Raffle Draw
 * @route		DELETE /api/raffle/delete/:id
 * @access	Public
 */
// export const deleteDraw = async (req, res) => {
//   const { raffleId } = req.params;

//   try {
//     // Delete related winners first
//     await prisma.raffle_winners.deleteMany({
//       where: { raffleid: BigInt(raffleId) },
//     });

//     // Find the lucky draw entry
//     const raffleDraw = await prisma.core_raffle.findUnique({
//       where: { id: BigInt(raffleId) },
//     });

//     if (!raffleDraw) {
//       return res.status(404).json({ message: "Raffle draw not found" });
//     }

//     // Delete the lucky draw entry
//     await prisma.core_raffle.delete({
//       where: { id: BigInt(raffleId) },
//     });

//     res.status(200).json({ message: "Raffle draw deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting Raffle draw:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

/**
 * @desc		Get all raffle draw tickets
 * @route		GET /api/raffle/tickets/:id
 * @access	Public
 */
// export const getTicketList = async (req, res) => {
//   try {
//     const { id } = req.params; // Get the raffle ID from the URL params

//     if (!id) {
//       return res.status(400).json({ error: "Raffle ID is required" });
//     }

//     // Fetch the tickets for the specific raffle draw ID
//     const tickets = await prisma.core_raffleTicket.findMany({
//       where: {
//         raffle_id: Number(id), // Match tickets by event ID
//       },
//       include: {
//         core_raffle: true, // Include related event if necessary
//       },
//     });

//     // if (!tickets || tickets.length === 0) {
//     //   return res.json({ message: "No tickets found for this event" });
//     // }

//     // Format the ticket data
//     const formattedTickets = tickets.map((ticket) => {
//       const formattedTimestamp = new Date(ticket.timestamp).toLocaleString(
//         "en-US",
//         {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//           hour: "numeric",
//           minute: "numeric",
//           hour12: true,
//           timeZone: "Asia/Kuwait", // Ensures the time is in Kuwait time zone
//         }
//       );

//       return {
//         ticketNo: ticket.ticket_no,
//         ticketId: ticket.id,
//         timeSold: formattedTimestamp,
//       };
//     });

//     // Send the response with the formatted tickets
//     res.status(200).json(formattedTickets);
//   } catch (error) {
//     console.error("Error fetching tickets:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the tickets." });
//   }
// };

/**
 * @desc		Create new raffle draw ticket
 * @route		POST /api/raffle/tickets/:id
 * @access	Public
 */
// export const addTicket = async (req, res) => {
//   try {
//     // Extract the event ID from the URL parameter
//     const { id } = req.params;

//     // Destructure the ticket details from the request body
//     const { name, phone, civil_id, ticket_no, amount_in_kwd } = req.body;

//     // Check if all required fields are present
//     if (!name || !phone || !civil_id || !ticket_no || !amount_in_kwd) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Find the user based on ticket_no (username)
//     const user = await prisma.users_user.findUnique({
//       where: {
//         username: ticket_no,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the user is not active
//     if (user.is_active) {
//       // Create the ticket if the user is not active
//       const newTicket = await prisma.core_raffleTicket.create({
//         data: {
//           name,
//           phone,
//           civil_id,
//           ticket_no,
//           amount_in_kwd: parseFloat(amount_in_kwd), // Convert to float
//           raffle_id: BigInt(id), // Convert event ID to BigInt
//           timestamp: new Date(),
//         },
//       });

//       return res.status(201).json(newTicket);
//     } else {
//       return res.status(400).json({ error: "Your Membership has expired" });
//     }
//   } catch (error) {
//     console.error("Error adding ticket:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while adding the ticket." });
//   }
// };

/**
 * @desc		Get raffle draw ticket details
 * @route		GET /api/raffle/ticket/:ticket_no
 * @access	Public
 */
// export const getTicket = async (req, res) => {
//   try {
//     const { ticket_no } = req.params; // Get the ticket number from the URL parameters
//     const { raffle_id } = req.query; // Get event_id from query parameters

//     // Ensure both ticket_no and event_id are provided
//     if (!ticket_no || !raffle_id) {
//       return res
//         .status(400)
//         .json({ error: "Ticket number and Event ID are required" });
//     }

//     // Fetch the specific ticket using the composite unique constraint
//     const ticket = await prisma.core_raffleTicket.findUnique({
//       where: {
//         raffle_id_ticket_no: {
//           // Use the composite unique field
//           raffle_id: Number(raffle_id),
//           ticket_no,
//         },
//       },
//     });

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Format the ticket data
//     const formattedTicket = {
//       ticketNo: ticket.ticket_no,
//       name: ticket.name,
//       phone: ticket.phone,
//       civil_id: ticket.civil_id,
//       amount_in_kwd: ticket.amount_in_kwd,
//       timeSold: new Date(ticket.timestamp).toLocaleString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "numeric",
//         minute: "numeric",
//         hour12: true,
//         timeZone: "Asia/Kuwait", // Ensures the time is in Kuwait time zone
//       }),
//     };

//     // Send the response with the formatted ticket
//     res.status(200).json(formattedTicket);
//   } catch (error) {
//     console.error("Error fetching single ticket:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the ticket." });
//   }
// };

/**
 * @desc		Get attendee details details
 * @route		POST /api/raffle/attendace
 * @access	Public
 */
export const getMemberByKwsId = async (req, res) => {
  try {
    const { kws_id } = req.body; // Extract kws_id from request body

    if (!kws_id) {
      return res.status(400).json({ error: "KWS ID is required" });
    }

    const member = await prisma.core_kwsmember.findFirst({
      where: { kwsid: kws_id }, // Ensure kws_id is unique in your schema
      select: {
        first_name: true,
        middle_name: true,
        last_name: true,
        kuwait_contact: true,
        civil_id: true,
      },
    });

    res.json(member);
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc		Mark Attendance
 * @route		POST /api/raffle/attendace/:ticket_no
 * @access	Public
 */
export const markAttendance = async (req, res) => {
  try {
    const { raffle_id, kws_id, name, phone, civil_id, num_people } = req.body;

    if (!raffle_id || !kws_id) {
      return res
        .status(400)
        .json({ error: "Event ID and Ticket No are required." });
    }

    // Step 2: Check if attendance is already marked using ticket_id
    const existingAttendance = await prisma.core_raffle_attendee.findFirst({
      where: {
        kws_id: kws_id, // Reference ticket_id in core_attendee
        raffle_id: Number(raffle_id), // Ensure event_id is a number
      },
    });

    const number = Number(phone);

    if (existingAttendance) {
      return res
        .status(400)
        .json({ error: "Attendance already marked for this ticket." });
    }

    // Step 3: Mark attendance if no existing attendance
    const attendance = await prisma.core_raffle_attendee.create({
      data: {
        raffle_id: Number(raffle_id), // Ensure event_id is a number
        kws_id: kws_id, // Reference ticket_id from core_eventticket
        name,
        phone: number,
        civil_id,
        attended_time: new Date(),
        num_people: 1 + Number(num_people),
      },
    });

    res.status(200).json({
      message: "Attendance marked successfully.",
      attendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Failed to mark attendance." });
  }
};

/**
 * @desc		Add Lucky Draw
 * @route		POST /api/raffle/:id
 * @access	Public
 */
export const addLuckyDraw = async (req, res) => {
  const { raffleId } = req.params;
  const { prize, sponsor, start_time } = req.body;

  try {
    // Find the existing raffle
    const raffle = await prisma.core_event.findUnique({
      where: { id: BigInt(raffleId) },
    });

    if (!raffle) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create a new lucky draw entry
    const newLuckyDraw = await prisma.lucky_draw.create({
      data: {
        prize,
        sponsor,
        start_time: new Date(start_time), // Ensure it's a Date object
        raffleid: BigInt(raffleId),
        status: false, // Default value
      },
    });

    res.status(201).json(newLuckyDraw);
  } catch (error) {
    console.error("Error adding lucky draw:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc		Get All Lucky Draws
 * @route		GET /api/raffle/:id
 * @access	Public
 */
export const getLuckyDrawsByRaffle = async (req, res, next) => {
  try {
    const { raffleId: raffleid } = req.params;

    // Validate raffleId
    if (!raffleid || isNaN(raffleid)) {
      return res.status(400).json({ error: "Invalid raffleId" });
    }

    // Fetch lucky draws related to the given raffleId
    const luckyDraws = await prisma.lucky_draw.findMany({
      where: { raffleid: parseInt(raffleid) }, // Convert raffleId to integer
      orderBy: { createdat: "desc" }, // Order by latest created
    });

    // Store the fetched luckyDraws in req object for next middleware
    req.luckyDraws = luckyDraws;

    next(); // Move to getAttendance controller
  } catch (error) {
    console.error("Error fetching lucky draws:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc		Delete Lucky Draw
 * @route		GET /api/raffle/:id
 * @access	Public
 */
export const deleteLuckyDraw = async (req, res) => {
  const { luckyDrawId } = req.params;

  try {
    // Find the lucky draw entry
    const luckyDraw = await prisma.lucky_draw.findUnique({
      where: { id: BigInt(luckyDrawId) },
    });

    if (!luckyDraw) {
      return res.status(404).json({ message: "Lucky draw not found" });
    }

    // Delete the lucky draw entry
    await prisma.lucky_draw.delete({
      where: { id: BigInt(luckyDrawId) },
    });

    res.status(200).json({ message: "Lucky draw deleted successfully" });
  } catch (error) {
    console.error("Error deleting lucky draw:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc		Update Lucky Draw
 * @route		PUT /api/raffle/:id
 * @access	Public
 */
export const updateLuckyDraw = async (req, res) => {
  const { spinId } = req.params;
  const { winnerData, attendees, prize } = req.body;

  if (
    !winnerData ||
    !winnerData.name ||
    !winnerData.kws_id ||
    !winnerData.event_id ||
    !prize
  ) {
    return res.json({ message: "Missing or invalid data" });
  }

  try {
    const luckyDraw = await prisma.lucky_draw.findUnique({
      where: { id: Number(spinId) },
    });

    if (!luckyDraw) {
      return res.status(404).json({ message: "Lucky draw not found" });
    }

    // Update lucky draw
    const updatedLuckyDraw = await prisma.lucky_draw.update({
      where: { id: Number(spinId) },
      data: {
        participants: attendees,
        status: true,
      },
    });

    const { name, kws_id, event_id } = winnerData;

    // Add Winner
    const addWinner = await prisma.raffle_winners.create({
      data: {
        spinId: BigInt(spinId),
        raffleid: BigInt(event_id),
        name,
        prize,
        kwsid: kws_id,
      },
    });

    res.status(200).json({
      message: "Lucky draw updated successfully",
      luckyDraw: updatedLuckyDraw,
      winner: addWinner,
    });
  } catch (error) {
    console.error("Error updating lucky draw:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc		Reset Lucky Draw
 * @route		PUT /api/raffle/rafflereset/:id
 * @access	Public
 */
export const resetLuckyDraw = async (req, res) => {
  const { luckyDrawId } = req.params;

  try {
    // Ensure luckyDrawId is a number
    const drawId = Number(luckyDrawId);

    if (isNaN(drawId)) {
      return res.status(400).json({ message: "Invalid Lucky Draw ID" });
    }

    // Find the lucky draw entry
    const luckyDraw = await prisma.lucky_draw.findUnique({
      where: { id: drawId },
    });

    if (!luckyDraw) {
      return res.status(404).json({ message: "Lucky draw not found" });
    }

    // Find and delete the winner
    const winner = await prisma.raffle_winners.findFirst({
      where: { spinId: drawId },
    });

    if (winner) {
      await prisma.raffle_winners.deleteMany({
        where: { spinId: BigInt(drawId) },
      });
    }

    // Update the lucky draw entry
    const updatedLuckyDraw = await prisma.lucky_draw.update({
      where: { id: drawId },
      data: {
        participants: null,
        status: false,
      },
    });

    res.status(200).json({
      message: "Lucky draw reset successfully, winner removed",
      luckyDraw: updatedLuckyDraw,
    });
  } catch (error) {
    console.error("Error resetting lucky draw:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc		Get All Attendees
 * @route		GET /api/raffle/:id
 * @access	Public
 */
export const getAttendance = async (req, res) => {
  try {
    const { raffleId: raffle_id } = req.params;

    // Validate raffleId
    if (!raffle_id || isNaN(raffle_id)) {
      return res.status(400).json({ error: "Invalid raffleId" });
    }

    // Fetch attendance related to the given raffleId
    const attendance = await prisma.core_attendee.findMany({
      where: { event_id: parseInt(raffle_id) },
      include: {
        core_eventticket: {
          select: {
            ticket_no: true, // Fetch ticket number (ticket_no) from core_eventticket
          },
        },
      },
    });

    // Send both luckyDraws and attendance in the response
    res.status(200).json({
      luckyDraws: req.luckyDraws || [],
      attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc		Get All WInners
 * @route		GET /api/raffle/winners/:raffleid
 * @access	Public
 */
export const getWinnerList = async (req, res) => {
  try {
    const { raffleId: raffleid } = req.params;

    // Validate raffleId
    if (!raffleid || isNaN(raffleid)) {
      return res.status(400).json({ error: "Invalid raffleId" });
    }

    // Fetch winners related to the given raffleId
    const winners = await prisma.raffle_winners.findMany({
      where: { raffleid: parseInt(raffleid) },
    });

    res.status(200).json({
      winners,
    });
  } catch (error) {
    console.error("Error fetching winners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc		Get Winner according to spinId
 * @route		GET /api/raffle/winners/:spinId
 * @access	Public
 */
export const getWinner = async (req, res) => {
  try {
    const { spinId } = req.params;

    // Validate raffleId
    if (!spinId || isNaN(spinId)) {
      return res.status(400).json({ error: "Invalid spinId" });
    }

    // Fetch winners related to the given raffleId
    const winner = await prisma.raffle_winners.findFirst({
      where: { spinId: parseInt(spinId) },
    });

    res.status(200).json({
      winner,
    });
  } catch (error) {
    console.error("Error fetching winner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
