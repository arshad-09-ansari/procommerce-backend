import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text' });
export default mongoose.model('Product', productSchema);