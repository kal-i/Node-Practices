import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as AccountController from '../controllers/accountController';

const router = Router();

router.get('/', authMiddleware, AccountController.getUserAccounts);
router.post('/register', authMiddleware, AccountController.registerAccount);
router.patch('/:accountId', authMiddleware, AccountController.updateAccount);

export default router;