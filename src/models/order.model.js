import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, price: Number }],
  totalAmount: Number,
  shippingAddress: { street: String, city: String, pincode: String, phone: String },
  paymentInfo: { razorpay_order_id: String, razorpay_payment_id: String, status: { type: String, default: 'pending' } },
  orderStatus: { type: String, enum: ['pending','paid','shipped','delivered','cancelled'], default: 'pending' },
  paidAt: Date
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);