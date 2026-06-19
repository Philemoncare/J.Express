import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate, requireSecureSession } from '../middleware/auth.middleware';
import { passwordChangeLimiter, authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes
router.post('/login', authLimiter, AuthController.login);
router.post('/resend-otp', authLimiter, AuthController.resendOtp);
router.post('/verify-otp', authLimiter, AuthController.verifyOtp);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

// Protected routes (Normal Level)
router.post('/logout', authenticate, AuthController.logout);
router.get('/user', authenticate, AuthController.getCurrentUser);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/profile/image', authenticate, AuthController.upload.single('image'), AuthController.uploadProfileImage);
router.delete('/profile/image', authenticate, AuthController.deleteProfileImage);
router.get('/login-attempts', authenticate, AuthController.getLoginAttempts);
router.get('/security-logs', authenticate, AuthController.getSecurityLogs);

// High Security routes (Secure Level Only)
router.post('/change-password', authenticate, requireSecureSession, passwordChangeLimiter, AuthController.changePassword);

export default router;
