import { Router } from 'express';

import {getBoxList,addBox,getBox,editBox,deleteBox,addBoxForNon,getBoxLogs,getboxcount,inusecount} from '../controllers/sandouqchaController.js';

const router = Router();


router.get('/getboxlist',getBoxList);

router.post('/add',addBox);

router.post('/addnon',addBoxForNon);

router.get('/getbox/:number',getBox);

router.put('/editbox/:number',editBox);

router.delete('/deletebox/:number',deleteBox);


router.get('/getboxlogs/:number',getBoxLogs);


router.get('/getcount',getboxcount);


router.get('/inusecount', inusecount);




export default router;