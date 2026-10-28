 import express from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct, searchProducts, uploadProductImage, getProductImage } from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadProductImage as parseProductImage, validateProductImage } from '../middlewares/productImageUpload.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product Management - 9 APIs
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with filter, search, pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of products }
 *   post:
 *     summary: Create product (seller/admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: iPhone 15 }
 *               price: { type: number, example: 80000 }
 *               stock: { type: number, example: 10 }
 *               category: { type: string, example: electronics }
 *               description: { type: string }
 *     responses:
 *       201: { description: Product created }
 */

/**
 * @swagger
 * /api/v1/products/images:
 *   post:
 *     summary: Upload a product image to private S3 storage
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Image uploaded; use the returned URL in the product images array }
 *       400: { description: Unsupported image or invalid image content }
 *       401: { description: Authentication required }
 *       403: { description: Seller or admin role required }
 *       413: { description: Image exceeds the 5 MB limit }
 * /api/v1/products/images/{imageId}:
 *   get:
 *     summary: Redirect to a short-lived URL for a private product image
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       302: { description: Redirects to a temporary S3 URL }
 */

router.get('/search', searchProducts);
router.post('/images', protect, authorize('seller', 'admin'), parseProductImage.single('image'), validateProductImage, uploadProductImage);
router.get('/images/:imageId', getProductImage);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('seller','admin'), createProduct);
router.put('/:id', protect, authorize('seller','admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, (req,res)=> res.json({ success: true, message: 'Review added mock' }));
router.get('/category/:cat', (req,res, next) => { req.query.category = req.params.cat; next(); }, getProducts);
router.put('/stock/bulk', protect, authorize('admin'), (req,res)=> res.json({ success: true, message: 'Bulk stock updated' }));
export default router;