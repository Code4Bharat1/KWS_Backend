import { Router } from 'express';
import { requestPasswordReset,resetPassword  } from '../controllers/forgotController.js';

const router  = Router();


// Route for requesting a password reset
router.post('/forgotpassword', requestPasswordReset);  // POST request to generate and send the reset token

// Route for resetting the password using the token
router.post('/resetpassword', resetPassword);




export default router;