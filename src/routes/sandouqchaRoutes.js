import { Router } from 'express';

import {getBoxList,addBox,getBox,editBox,deleteBox} from '../controllers/sandouqchaController.js';

const router = Router();


router.get('/getboxlist',getBoxList);

router.post('/add',addBox);


router.get('/getbox/:number',getBox);

router.put('/editbox/:number',editBox);

router.delete('/deletebox/:number',deleteBox);




export default router;