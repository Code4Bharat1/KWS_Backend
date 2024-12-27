import { Router } from 'express';
import { updateApprovalStatus,getPendingApprovals} from '../controllers/memberController.js'
import {uploadFiles } from '../middleware/fileUpload.js';

const router  = Router();

router.get('/pending',getPendingApprovals);
router.put('/update/:user_id', uploadFiles,updateApprovalStatus);

export default router;