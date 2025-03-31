import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as TransactionController from '../controllers/transactionController';

const router = Router();

router.get('/', authMiddleware, TransactionController.getTransactions);
router.post('/expenses/register', authMiddleware, TransactionController.registerExpenseTransaction);
router.post('/incomes/register', authMiddleware, TransactionController.registerIncomeTransaction);
router.post('/transfers/register', authMiddleware, TransactionController.registerTransferTransction);

export default router;