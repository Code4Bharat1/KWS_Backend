import { Router } from 'express';
import { getProfile } from '../controllers/profileController.js';
const router = Router();




router.get('/getprofile/:user_id',getProfile);


export default router;