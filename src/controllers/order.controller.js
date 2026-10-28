import * as orderService from '../services/order.service.js';
import { asyncHandler } from '../utils/ApiError.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  const io = req.app.get('io');
  io.emit('admin:new_order', order);
  io.emit('order:placed', { orderId: order._id, userId: req.user._id });
  res.status(201).json({ success: true, order });
});
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);
  res.json({ success: true, orders });
});
export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json({ success: true, order });
});
export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  const io = req.app.get('io');
  io.to(req.params.id).emit('order:status_update', { orderId: order._id, status: order.orderStatus });
  res.json({ success: true, order });
});
export const getAllOrders = asyncHandler(async (req, res) => {
  const Order = (await import('../models/order.model.js')).default;
  const orders = await Order.find().populate('user','name email').sort('-createdAt');
  res.json({ success: true, count: orders.length, orders });
});