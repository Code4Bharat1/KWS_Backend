import { Router } from "express";
import {
  getEventList,
  addEvent,
  editEvent,
  getEvent,
  deleteEvent,
  getTicketList,
  addTicket,
  getTicket,
  editTicket,
  deleteTicket,
  getAttendanceList,
  markAttendance,
} from "../controllers/eventController.js";

const router = Router();

router.get("/get", getEventList);

router.post("/add", addEvent);

router.get("/get/:id", getEvent);

router.put("/edit/:id", editEvent);

router.delete("/delete/:id", deleteEvent);

router.get("/tickets/:id", getTicketList);

router.post("/addticket/:id", addTicket);

router.get("/ticket/:ticket_no", getTicket);

router.put("/editticket/:ticket_no", editTicket);

router.delete("/deleteticket/:ticket_no", deleteTicket);

router.get("/attendancelist/:event_id", getAttendanceList);

router.get("/attendancelist/:event_id", getAttendanceList);

router.post("/markattendance/:event_id", markAttendance);

export default router;
