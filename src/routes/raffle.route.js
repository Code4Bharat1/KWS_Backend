import { Router } from "express";
import {
  getDrawList,
  // addDraw,
  // getTicketList,
  // addTicket,
  // getTicket,
  getMemberByKwsId,
  // markAttendance,
  getLuckyDrawsByRaffle,
  addLuckyDraw,
  getAttendance,
  deleteLuckyDraw,
  updateLuckyDraw,
  resetLuckyDraw,
  getWinnerList,
  getWinner,
  // deleteDraw,
} from "../controllers/raffle.controller.js";

const router = Router();

router.get("/", getDrawList);

// router.post("/add", addDraw);

// router.get("/tickets/:id", getTicketList);

// router.post("/addticket/:id", addTicket);

// router.get("/ticket/:ticket_no", getTicket);

router.post("/memberdetail", getMemberByKwsId);

// router.post("/markAttendance/:raffle_id", markAttendance);

router.get("/:raffleId", getLuckyDrawsByRaffle, getAttendance);

// router.get("/attendancelist/:raffleId", getAttendance);

router.post("/:raffleId", addLuckyDraw);

router.delete("/:luckyDrawId", deleteLuckyDraw);

router.put("/:spinId", updateLuckyDraw);

router.put("/rafflereset/:luckyDrawId", resetLuckyDraw);

router.get("/winners/:raffleId", getWinnerList);

router.get("/winner/:spinId", getWinner);

// router.delete("/delete/:raffleId", deleteDraw);

export default router;
