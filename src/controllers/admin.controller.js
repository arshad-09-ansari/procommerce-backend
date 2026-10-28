import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { asyncHandler } from '../utils/ApiError.js';

export const dashboardStats = asyncHandler(async (req, res) => {
  const [users, products, orders, revenue] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }])
  ]);
  res.json({ success: true, stats: { users, products, orders, revenue: revenue[0]?.total || 0 } });
});
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, users });
});