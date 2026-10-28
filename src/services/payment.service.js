import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import Payment from '../models/payment.model.js';
import Order from '../models/order.model.js';

export const createRazorpayOrder = async (amount, currency='INR', receipt) => {
  const options = { amount: amount*100, currency, receipt: receipt || `receipt_${Date.now()}` };
  const order = await razorpay.orders.create(options);
  return order;
};

export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, orderId }) => {
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  const isValid = expected === razorpay_signature;
  if (!isValid) throw new Error('Invalid signature');

  const payment = await Payment.create({ user: userId, order: orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount: 0, status: 'paid' });
  await Order.findByIdAndUpdate(orderId, { 'paymentInfo.razorpay_payment_id': razorpay_payment_id, 'paymentInfo.status': 'paid', orderStatus: 'paid', paidAt: new Date() });

  // Publish payment success event
  const { publishToQueue } = await import('../config/rabbitmq.js');
  await publishToQueue('PAYMENT_QUEUE', { orderId, paymentId: payment._id, type: 'PAYMENT_SUCCESS' });

  return payment;
};