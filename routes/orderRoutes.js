import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { placeOrder, getOrders, getOrderById } from '../controllers/orderController.js';

const router = express.Router();
router.post('/', authMiddleware, placeOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;
