import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Webhook endpoint (must accept raw payload before json parsing if needed, but handled cleanly)
router.post('/webhook', PaymentController.webhook);

// Protected payment endpoints
router.use(requireAuth);
router.post('/create-order', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);
router.get('/history', PaymentController.getHistory);

export default router;
