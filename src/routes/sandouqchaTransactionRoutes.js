import { Router } from 'express';

import {getTransactionList,addTransaction,viewTransaction,editTransaction,deleteTransaction,bulkTransaction,logs} from '../controllers/sandouqchaTransactionController.js';

const router = Router();

router.get('/getlist',getTransactionList);

router.post('/add',addTransaction);


router.get('/view/:id',viewTransaction);

router.put('/edit/:id',editTransaction);

router.delete('/delete/:id',deleteTransaction);

router.post('/bulk',bulkTransaction);


router.get('/log/:id',logs);






export default router;

