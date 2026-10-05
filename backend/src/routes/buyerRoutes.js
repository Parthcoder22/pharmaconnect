import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireBuyer, requireVerifiedBusiness } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createOrderSchema } from '../validators/orderValidator.js';

const router = Router();

router.use(requireAuth);
router.use(requireBuyer);

router.post('/orders', requireVerifiedBusiness, validateRequest(createOrderSchema), OrderController.createOrder);
router.get('/orders', OrderController.listOrders);
router.get('/orders/:id', OrderController.getOrderById);
router.post('/orders/:id/cancel', OrderController.cancelOrder);

export default router;
