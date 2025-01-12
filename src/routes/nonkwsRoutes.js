import { Router } from 'express';
import {getnonkwsList,addnonkws,viewnonkws,editnonkwsmember,deletenonkwsmember,viewforedit,logsnonkwsmember} from '../controllers/nonkwsController.js';


const router  = Router();

router.get('/getlist',getnonkwsList);

router.post('/addnonkws',addnonkws);

router.get('/view/:id',viewforedit);

router.get('/viewnonkwsmember/:id',viewnonkws);

router.put('/editnonkwsmember/:id',editnonkwsmember);

router.delete('/deletenonkws/:id',deletenonkwsmember);

router.get('/logs/:id',logsnonkwsmember);




export default router;