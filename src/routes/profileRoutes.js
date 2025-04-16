import { Router } from "express";
import {
  getProfile,
  editProfile,
  checkPendingRequest,
  getProfileAllDetails,
  getPendingUpdateRequests,
  createUpdateRequest,
  approveUpdateRequest,
  pendingrequest,
  updateProfilePhoto,
} from "../controllers/profileController.js";
import { uploadFiles } from "../middleware/fileUpload.js";
const router = Router();

router.get("/getprofile/:user_id", getProfile);
router.put("/editprofile/:user_id", uploadFiles, editProfile);

router.get("/get/:user_id", getProfileAllDetails);

router.post("/update-request", createUpdateRequest);

router.get("/check/:user_id", checkPendingRequest);
router.get("/pending-updates", getPendingUpdateRequests);

router.post("/approve", approveUpdateRequest);

router.get("/pendingrequest", pendingrequest);

router.put("/updatephoto/:user_id", uploadFiles, updateProfilePhoto);

export default router;
