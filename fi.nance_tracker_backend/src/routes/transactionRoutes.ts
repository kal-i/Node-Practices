import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as TransactionController from '../controllers/transactionController';

const router = Router();

router.get('/', authMiddleware, TransactionController.getTransactions);
router.post('/expenses/register', authMiddleware, TransactionController.registerExpenseTransaction);

export default router;