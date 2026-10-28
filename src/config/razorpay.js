import Razorpay from 'razorpay';
import crypto from 'crypto';
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const verifyRazorpaySignature = (payload, signature, secret) => {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
};