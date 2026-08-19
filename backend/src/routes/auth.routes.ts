import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Custom Email Login
router.post('/email-login', authController.emailLogin);

// Current user and logout
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

// Local developer 1-click test authentication
router.post('/dev-login', authController.devLogin);

export const authRoutes = router;
