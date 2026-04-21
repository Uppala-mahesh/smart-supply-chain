import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getInventory, addInventory, adjustInventory } from '../controllers/inventoryController.js';

const router = express.Router();
router.get('/', authMiddleware, getInventory);
router.post('/', authMiddleware, addInventory);
router.put('/:id', authMiddleware, adjustInventory);

export default router;
