import express from 'express';
import { createOrder, getMyOrders, getOrder, updateStatus, getAllOrders } from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order with RabbitMQ Queue - 7 APIs
 */

/**
 * @swagger
 * /api/v1/orders/create:
 *   post:
 *     summary: Create order - pushes to RabbitMQ ORDER_QUEUE
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items: { type: array, items: { type: object } }
 *               totalAmount: { type: number, example: 80000 }
 *               shippingAddress: { type: object }
 *     responses:
 *       201: { description: Order created and queued }
 */

router.post('/create', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/track/:id', protect, getOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin','seller'), updateStatus);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.post('/:id/cancel', protect, (req,res)=> res.json({ success: true, message: 'Order cancelled' }));
export default router;