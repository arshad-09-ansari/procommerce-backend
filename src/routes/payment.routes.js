import express from 'express';
import { createPaymentOrder, verifyPayment, razorpayWebhook, paymentHistory } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay Payment Integration - 6 APIs
 */

/**
 * @swagger
 * /api/v1/payments/create-intent:
 *   post:
 *     summary: Create Razorpay order (amount in INR)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 500 }
 *               orderId: { type: string, example: 64f... }
 *     responses:
 *       200: { description: Razorpay order created, returns razorpay_order_id }
 */

/**
 * @swagger
 * /api/v1/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature (HMAC)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_order_id: { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature: { type: string }
 *               orderId: { type: string }
 *     responses:
 *       200: { description: Payment verified }
 */

router.post('/create-intent', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhooks/razorpay', razorpayWebhook);
router.get('/history', protect, paymentHistory);
router.post('/refund', protect, (req,res)=> res.json({ success: true, message: 'Refund initiated mock' }));
router.get('/invoice/:id', protect, (req,res)=> res.json({ success: true, invoice: 'Invoice PDF mock for '+req.params.id }));
export default router;