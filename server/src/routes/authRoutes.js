import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

// Authentifizierungs-Routen
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);

export default router;
