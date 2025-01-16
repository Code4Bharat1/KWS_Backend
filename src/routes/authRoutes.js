import { Router } from 'express';
import { loginUser, registerUser , getUser ,allUsers, editUser} from '../controllers/authController.js';
import { uploadFiles } from '../middleware/fileUpload.js';
const router = Router();


router.post('/register', uploadFiles,registerUser);
router.get('/get/:user_id', getUser);
router.get('/getall', allUsers);
router.put('/edit/:user_id', editUser);

router.post('/login', loginUser);

export default router;
