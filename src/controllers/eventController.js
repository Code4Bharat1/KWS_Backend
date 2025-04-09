import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getEventList = async (req, res) => {
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

export const addEvent = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = await prisma.core_event.create({
      data: {
        name: name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error adding event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the event." });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const event = await prisma.core_event.findUnique({
      where: {
        id: Number(id), // Ensure the id is treated as a number
      },
      include: {
        core_attendee: true,
        core_auditevent: true,
        core_eventticket: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event); // Respond with event data
  } catch (error) {
    console.error("Error fetching event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the event" });
  }
};

export const editEvent = async (req, res) => {
  try {
    const { id, name, start_date, end_date } = req.body;

    if (!id || !name || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedEvent = await prisma.core_event.update({
      where: { id: Number(id) },
      data: {
        name: name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the event." });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params; // Get the event ID from request parameters

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const numericId = Number(id); // Ensure ID is treated as a number

    // Step 1: Delete dependent records from related tables first
    await prisma.core_attendee.deleteMany({
      where: {
        event_id: numericId,
      },
    });

    await prisma.core_eventticket.deleteMany({
      where: {
        event_id: numericId,
      },
    });

    // Step 2: Now, delete the event from core_event
    const deletedEvent = await prisma.core_event.delete({
      where: {
        id: numericId,
      },
    });

    // Return success message
    res
      .status(200)
      .json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found." });
    }

    res
      .status(500)
      .json({ error: "An error occurred while deleting the event." });
  }
};

export const getTicketList = async (req, res) => {
  try {
    const { id } = req.params; // Get the event ID from the URL params

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    // Fetch the tickets for the specific event ID
    const tickets = await prisma.core_eventticket.findMany({
      where: {
        event_id: Number(id), // Match tickets by event ID
      },
      include: {
        core_event: true, // Include related event if necessary
      },
    });

    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this event" });
    }

    // Format the ticket data
    const formattedTickets = tickets.map((ticket) => {
      const formattedTimestamp = new Date(ticket.timestamp).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "Asia/Kuwait", // Ensures the time is in Kuwait time zone
        }
      );

      return {
        ticketNo: ticket.ticket_no,
        ticketId: ticket.id,
        timeSold: formattedTimestamp,
      };
    });

    // Send the response with the formatted tickets
    res.status(200).json(formattedTickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the tickets." });
  }
};

export const addTicket = async (req, res) => {
  try {
    // Extract the event ID from the URL parameter
    const { id } = req.params;

    // Destructure the ticket details from the request body
    const { name, phone, civil_id, ticket_no, amount_in_kwd } = req.body;

    // Check if all required fields are present
    if (!name || !phone || !civil_id || !ticket_no || !amount_in_kwd) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user based on ticket_no (username)
    const user = await prisma.users_user.findUnique({
      where: {
        username: ticket_no,
      },
    });

    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // Create the ticket if the user is not active
    const newTicket = await prisma.core_eventticket.create({
      data: {
        name,
        phone,
        civil_id,
        ticket_no,
        amount_in_kwd: parseFloat(amount_in_kwd), // Convert to float
        event_id: BigInt(id), // Convert event ID to BigInt
        timestamp: new Date(),
      },
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error adding ticket:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the ticket." });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { ticket_no } = req.params; // Get the ticket number from the URL parameters
    const { event_id } = req.query; // Get event_id from query parameters

    // Ensure both ticket_no and event_id are provided
    if (!ticket_no || !event_id) {
      return res
        .status(400)
        .json({ error: "Ticket number and Event ID are required" });
    }

    // Fetch the specific ticket using the composite unique constraint
    const ticket = await prisma.core_eventticket.findUnique({
      where: {
        event_id_ticket_no: {
          // Use the composite unique field
          event_id: Number(event_id),
          ticket_no: ticket_no,
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Format the ticket data
    const formattedTicket = {
      ticketNo: ticket.ticket_no,
      name: ticket.name,
      phone: ticket.phone,
      civil_id: ticket.civil_id,
      amount_in_kwd: ticket.amount_in_kwd,
      timeSold: new Date(ticket.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kuwait", // Ensures the time is in Kuwait time zone
      }),
    };

    // Send the response with the formatted ticket
    res.status(200).json(formattedTicket);
  } catch (error) {
    console.error("Error fetching single ticket:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the ticket." });
  }
};

export const editTicket = async (req, res) => {
  try {
    const { ticket_no } = req.params;
    const { event_id, name, phone, civil_id, amount_in_kwd } = req.body;

    if (!ticket_no || !event_id) {
      return res
        .status(400)
        .json({ error: "Ticket number and Event ID are required" });
    }

    const updatedTicket = await prisma.core_eventticket.update({
      where: {
        event_id_ticket_no: {
          ticket_no,
          event_id: BigInt(event_id),
        },
      },
      data: { name, phone, civil_id, amount_in_kwd },
    });

    res
      .status(200)
      .json({ message: "Ticket updated successfully", updatedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the ticket." });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticket_no } = req.params; // Ticket Number from request
    const { event_id } = req.body; // Event ID from request body

    if (!ticket_no || !event_id) {
      return res
        .status(400)
        .json({ error: "Ticket number and event ID are required." });
    }

    const eventIdBigInt = BigInt(event_id);

    // Find ticket using findFirst
    const ticket = await prisma.core_eventticket.findFirst({
      where: {
        ticket_no: ticket_no,
        event_id: eventIdBigInt,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const ticketIdBigInt = ticket.id;

    // Delete attendees linked to the ticket
    await prisma.core_attendee.deleteMany({
      where: {
        ticket_id: ticketIdBigInt,
        event_id: eventIdBigInt,
      },
    });

    // Delete the ticket
    const deletedTicket = await prisma.core_eventticket.delete({
      where: {
        id: ticketIdBigInt,
      },
    });

    res
      .status(200)
      .json({ message: "Ticket deleted successfully", deletedTicket });
  } catch (error) {
    console.error("Error deleting ticket:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete ticket because it has associated records in core_attendee.",
      });
    }

    res
      .status(500)
      .json({ error: "An error occurred while deleting the ticket." });
  }
};

export const getAttendanceList = async (req, res) => {
  try {
    const { event_id } = req.params; // Get event_id from the route parameters

    if (!event_id) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Fetch attendance data including core_eventticket and core_kwsmember details
    const attendanceList = await prisma.core_attendee.findMany({
      where: {
        event_id: Number(event_id), // Ensure event_id is a number
      },
      include: {
        core_eventticket: {
          select: {
            ticket_no: true, // Fetch ticket number (ticket_no) from core_eventticket
          },
        },
        core_event: {
          select: {
            name: true, // Fetch event name from core_event
          },
        },
        core_kwsmember: {
          select: {
            kuwait_contact: true,
            kwsid: true,
            first_name: true,
            last_name: true, // Fetch user's first name and last name
          },
        },
      },
    });

    if (!attendanceList || attendanceList.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance data found for this event." });
    }

    // Format the attendance list to include ticket_no and user details (first_name, last_name)
    const formattedAttendanceList = attendanceList.map((attendance) => {
      const kwsmember = attendance.core_kwsmember;
      const ticket = attendance.core_eventticket;

      // Ensure ticket_no is the same as kwsid
      const ticketNo = kwsmember?.kwsid || ticket?.ticket_no;

      return {
        Name: attendance.core_event?.name,
        name: attendance.name,
        civil_id: attendance.civil_id,
        kws_id: attendance.kws_id,
        phone: attendance.phone,
        ticketNo, // Ensure ticket_no is same as kwsid
        firstname: kwsmember?.first_name,
        lastname: kwsmember?.last_name,
        contact: kwsmember?.kuwait_contact || kwsmember?.indian_contact_no_1,
        timeAttended: attendance.attended_time.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "Asia/Kuwait",
        }),
        numPeople: attendance.num_people,
      };
    });

    res.status(200).json(formattedAttendanceList);
  } catch (error) {
    console.error("Error fetching attendance list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the attendance list." });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { kws_id, name, phone, civil_id, num_people, event_id, ticket_no } =
      req.body;

    // console.log("Incoming Request Body:", req.body);

    if (!event_id || !ticket_no) {
      return res
        .status(400)
        .json({ error: "Event ID and Ticket No are required." });
    }

    // Step 1: Fetch the ticket using event_id and ticket_no (composite unique key)
    // const ticket = await prisma.core_eventticket.findUnique({
    //   where: {
    //     event_id_ticket_no: {
    //       // Use the composite unique key
    //       event_id: Number(event_id), // Ensure event_id is a number
    //       ticket_no: ticket_no, // Look for ticket using ticket_no
    //     },
    //   },
    // });

    // if (!ticket) {
    //   return res.status(404).json({ error: "Invalid ticket." });
    // }

    // Step 2: Check if attendance is already marked using ticket_id
    const existingAttendance = await prisma.core_attendee.findFirst({
      where: {
        kws_id: kws_id,
        event_id: Number(event_id), // Ensure event_id is a number
      },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ error: "Attendance already marked for this ticket." });
    }

    // Step 3: Mark attendance if no existing attendance
    const attendance = await prisma.core_attendee.create({
      data: {
        event_id: Number(event_id), // Ensure event_id is a number
        // ticket_id: ticket.id, // Reference ticket_id from core_eventticket
        attended_time: new Date(),
        kws_id: kws_id, // Reference ticket_id from core_eventticket
        name,
        phone: phone,
        civil_id,
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
