import express from 'express';
import { dashboardStats, getAllUsers } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Dashboard
 */
router.use(protect, authorize('admin'));
router.get('/dashboard-stats', dashboardStats);
router.get('/users', getAllUsers);
router.get('/logs', (req,res)=> res.json({ success: true, logs: 'System logs mock' }));
export default router;