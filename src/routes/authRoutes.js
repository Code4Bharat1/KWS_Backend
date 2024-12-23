import { Router } from 'express';
import { loginUser,  } from '../controllers/authController.js';
// registerUser
const router = Router();


// router.post('/register', registerUser);

router.post('/login', loginUser);

export default router;
