import * as paymentService from '../services/payment.service.js';
import { asyncHandler } from '../utils/ApiError.js';
import crypto from 'crypto';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;
  const razorOrder = await paymentService.createRazorpayOrder(amount, 'INR', `order_rcpt_${orderId}`);
  res.json({ success: true, razorOrder, key: process.env.RAZORPAY_KEY_ID });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPayment({ ...req.body, userId: req.user._id });
  const io = req.app.get('io');
  io.emit('payment:success', { orderId: req.body.orderId, paymentId: payment._id });
  res.json({ success: true, payment, message: 'Payment verified & order paid' });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex') === signature;
  console.log('Webhook received:', req.body.event, 'Valid:', isValid);
  res.json({ status: 'ok' });
});

export const paymentHistory = asyncHandler(async (req, res) => {
  const Payment = (await import('../models/payment.model.js')).default;
  const payments = await Payment.find({ user: req.user._id });
  res.json({ success: true, payments });
});