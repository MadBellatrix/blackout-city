import express from 'express';
import { register, login, verifyEmail, redeemBetaCode, requestBetaAccess } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentifizierungs-Routen
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/redeem-beta', protect, redeemBetaCode);
router.post('/request-beta', requestBetaAccess);

export default router;
