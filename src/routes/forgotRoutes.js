import { Router } from 'express';
import { Forgot } from '../controllers/forgotController.js';

const router  = Router();



router.put('/forgotpassword/username',Forgot);





export default router;