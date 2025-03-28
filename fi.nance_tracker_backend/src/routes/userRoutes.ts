import { Router } from 'express';
import * as UserController from '../controllers/userController';

// Create a router instance
// This router will be mounted on the /users path in the main app
const router = Router();

// This route will be mounted on the /users/register path
// The register function is the controller that will handle the register route
router.get('/', UserController.getAllUsers);
router.post('/login', UserController.loginUser);
router.post('/register', UserController.registerUser);
router.post('/logout', UserController.logoutUser);
router.post('/logout', UserController.logoutUserWithJwtBlacklisting);

export default router;