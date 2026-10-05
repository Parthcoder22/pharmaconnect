import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireSupplier, requireBuyer, requireVerifiedBusiness } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  createOrderSchema,
  rejectOrderSchema,
  dispatchOrderSchema,
  confirmDeliverySchema
} from '../validators/orderValidator.js';

const router = Router();

router.use(requireAuth);

// General order listing & retrieval
router.get('/', OrderController.listOrders);
router.get('/:id', OrderController.getOrderById);

// Buyer order creation & cancellation
router.post('/', requireBuyer, requireVerifiedBusiness, validateRequest(createOrderSchema), OrderController.createOrder);
router.post('/:id/cancel', requireBuyer, OrderController.cancelOrder);

// Supplier lifecycle actions
router.post('/:id/accept', requireSupplier, OrderController.acceptOrder);
router.post('/:id/reject', requireSupplier, validateRequest(rejectOrderSchema), OrderController.rejectOrder);
router.patch('/:id/dispatch', requireSupplier, validateRequest(dispatchOrderSchema), OrderController.dispatchOrder);

// Delivery confirmation (buyer or logistics receiver)
router.post('/:id/confirm-delivery', validateRequest(confirmDeliverySchema), OrderController.confirmDelivery);

export default router;
