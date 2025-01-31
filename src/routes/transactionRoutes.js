import { Router } from 'express';
import {getTransactions,addTransactions,getTransactionofIndividual,editTransactionofIndividual,deleteTransactionofIndividual,getTransactionslogs,viewlogs,transactioncount} from '../controllers/transactionController.js';


const router = Router();

router.get('/gettransactions',getTransactions);


router.get('/get/:id',getTransactionofIndividual);

router.post('/addtransactions',addTransactions);


router.put('/edit/:id',editTransactionofIndividual);

router.delete('/delete/:id',deleteTransactionofIndividual);


router.get('/getlogs/:id',getTransactionslogs);

router.get('/viewlogs/:id',viewlogs);


router.get('/transactioncount', transactioncount);



export default router;
