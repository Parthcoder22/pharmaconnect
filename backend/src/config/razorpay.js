import Razorpay from 'razorpay';
import { env } from './env.js';

let razorpayInstance = null;

const isValidKey = (key) => key && !key.includes('placeholder') && key.startsWith('rzp_');

if (isValidKey(env.RAZORPAY_KEY_ID) && env.RAZORPAY_KEY_SECRET && !env.RAZORPAY_KEY_SECRET.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
    console.log('[Razorpay] Live/Test client initialized successfully');
  } catch (err) {
    console.warn('[Razorpay] Client initialization failed:', err.message);
  }
} else {
  console.log('[Razorpay] Using development simulation mode (placeholder credentials).');
}

export { razorpayInstance };
