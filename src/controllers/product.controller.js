import * as productService from '../services/product.service.js';
import storageService from '../services/storage.service.js';
import { asyncHandler } from '../utils/ApiError.js';

export const uploadProductImage = asyncHandler(async (req, res) => {
  const image = await storageService.uploadImage(req.file);
  res.status(201).json({
    success: true,
    image: {
      id: image.imageId,
      key: image.key,
      url: `/api/v1/products/images/${image.imageId}`,
    },
  });
});
export const getProductImage = asyncHandler(async (req, res) => {
  const signedUrl = await storageService.getImageUrl(req.params.imageId);
  res.redirect(302, signedUrl);
});
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, product });
});
export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(req.query);
  res.json({ success: true, count: products.length, products });
});
export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, product });
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, product });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
export const searchProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts({ search: req.query.q });
  res.json({ success: true, products });
});