import Order from '../models/order.model.js';
import { publishToQueue } from '../config/rabbitmq.js';

export const createOrder = async (userId, orderData) => {
  const order = await Order.create({ user: userId, ...orderData, orderStatus: 'pending' });
  // Push to RabbitMQ for async processing
  await publishToQueue('ORDER_QUEUE', { orderId: order._id, userId, type: 'NEW_ORDER' });
  await publishToQueue('EMAIL_QUEUE', { userId, orderId: order._id, type: 'ORDER_CONFIRMATION' });
  return order;
};
export const getMyOrders = (userId) => Order.find({ user: userId }).sort('-createdAt');
export const getOrderById = (id) => Order.findById(id).populate('items.product');
export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
  return order;
};