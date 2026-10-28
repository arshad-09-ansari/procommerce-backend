import Product from '../models/product.model.js';
export const createProduct = (data) => Product.create(data);
export const getAllProducts = (query) => {
  const { page=1, limit=10, category, search, sort='-createdAt' } = query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  return Product.find(filter).sort(sort).limit(limit*1).skip((page-1)*limit).populate('seller','name email');
};
export const getProductById = (id) => Product.findById(id);
export const updateProduct = (id, data) => Product.findByIdAndUpdate(id, data, { new: true });
export const deleteProduct = (id) => Product.findByIdAndDelete(id);