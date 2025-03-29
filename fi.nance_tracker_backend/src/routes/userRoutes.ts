import { Router } from 'express';
import * as UserController from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

// Create a router instance
// This router will be mounted on the /users path in the main app
const router = Router();

// This route will be mounted on the /users/register path
// The register function is the controller that will handle the register route
router.get('/', authMiddleware, UserController.getAllUsers);
router.get('/tokens', authMiddleware, UserController.getAllTokens);
router.post('/login', UserController.loginUser);
router.post('/register', UserController.registerUser);
router.post('/logout', authMiddleware, UserController.logoutUser);

export default router;