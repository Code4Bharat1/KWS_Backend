import { Router } from "express";
import {
  updateApprovalStatus,
  getPendingApprovals,
  getAllMembers,
  getChart,
  memberCount,
  pendingCount,
} from "../controllers/memberController.js";
import { uploadFiles } from "../middleware/fileUpload.js";

const router = Router();

router.get("/pending", getPendingApprovals);
router.put("/update/:user_id", uploadFiles, updateApprovalStatus);

router.get("/getmembers", getAllMembers);

router.get("/getchart", getChart);

router.get("/count", memberCount);

router.get("/pendingcount", pendingCount);

export default router;
