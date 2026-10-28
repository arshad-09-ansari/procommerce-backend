import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created','paid','failed','refunded'], default: 'created' }
}, { timestamps: true });
export default mongoose.model('Payment', paymentSchema);