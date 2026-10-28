import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart & Wishlist - 5 APIs
 */
router.use(protect);
router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:productId', removeFromCart);
router.put('/quantity', addToCart);
router.post('/wishlist/toggle', (req,res)=> res.json({ success: true, message: 'Wishlist toggled' }));
export default router;