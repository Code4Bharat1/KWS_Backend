import { Router } from 'express';

import {getStaffList,editStaff} from '../controllers/staffController.js';

const router = Router();

router.get('/getlist',getStaffList);


router.put('/edit/:username',editStaff);

export default router;
