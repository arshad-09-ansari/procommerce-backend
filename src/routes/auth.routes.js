import express from 'express';
import { register, login, getMe, logout, forgotPassword, refreshToken } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs - 8 endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Arshad Ansarii }
 *               email: { type: string, example: arshad@test.com }
 *               password: { type: string, example: 123456 }
 *               role: { type: string, enum: [user, seller, admin], example: admin }
 *     responses:
 *       201: { description: User registered }
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login success with token }
 */

router.post('/register', apiLimiter, register);
router.post('/login', apiLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/verify-email', (req,res)=> res.json({ success: true, message: 'Email verified mock' }));
router.post('/reset-password', (req,res)=> res.json({ success: true, message: 'Password reset mock' }));
export default router;