import Cart from '../models/cart.model.js';
import { asyncHandler } from '../utils/ApiError.js';

export const addToCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === req.body.productId);
  if (existing) existing.quantity += req.body.quantity || 1;
  else cart.items.push({ product: req.body.productId, quantity: req.body.quantity || 1 });
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json({ success: true, cart: cart || { items: [] } });
});
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, cart });
});