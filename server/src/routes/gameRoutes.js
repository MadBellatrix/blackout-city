import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getGameState, saveGameState } from '../controllers/gameController.js';

const router = express.Router();

router.get('/state', protect, getGameState);
router.post('/save', protect, saveGameState);

export default router;
