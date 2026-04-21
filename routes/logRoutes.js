import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getLogs } from '../controllers/logController.js';

const router = express.Router();
router.get('/', authMiddleware, getLogs);

export default router;
