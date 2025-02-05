import { Router } from 'express';
import { loginUser, registerUser , getUser ,allUsers,checkkwsid, editUser,checkcivilid, checkemail} from '../controllers/authController.js';
import { uploadFiles } from '../middleware/fileUpload.js';
const router = Router();


router.post('/register', uploadFiles,registerUser);


router.get('/civilid', checkcivilid);

router.get('/email', checkemail);

router.get('/kwsid',checkkwsid);




router.get('/get/:user_id', getUser);
router.get('/getall', allUsers);
router.put('/edit/:user_id', editUser);

router.post('/login', loginUser);

export default router;
