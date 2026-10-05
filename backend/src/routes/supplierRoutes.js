import { Router } from 'express';
import { MedicineController } from '../controllers/medicineController.js';
import { OrderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireSupplier, requireVerifiedBusiness } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createMedicineSchema, updateMedicineSchema, createBatchSchema } from '../validators/medicineValidator.js';
import { rejectOrderSchema, dispatchOrderSchema, confirmDeliverySchema } from '../validators/orderValidator.js';

const router = Router();

// Protect all supplier routes
router.use(requireAuth);
router.use(requireSupplier);

// Medicine catalogue management
router.post('/medicines', requireVerifiedBusiness, validateRequest(createMedicineSchema), MedicineController.createMedicine);
router.get('/medicines', MedicineController.listSupplierMedicines);
router.get('/medicines/:id', MedicineController.getMedicineById);
router.patch('/medicines/:id', validateRequest(updateMedicineSchema), MedicineController.updateMedicine);
router.delete('/medicines/:id', MedicineController.deactivateMedicine);
router.post('/medicines/:id/batches', requireVerifiedBusiness, validateRequest(createBatchSchema), MedicineController.addBatch);

// Supplier order management & lifecycle
router.get('/orders', OrderController.listOrders);
router.get('/orders/:id', OrderController.getOrderById);
router.post('/orders/:id/accept', OrderController.acceptOrder);
router.post('/orders/:id/reject', validateRequest(rejectOrderSchema), OrderController.rejectOrder);
router.patch('/orders/:id/dispatch', validateRequest(dispatchOrderSchema), OrderController.dispatchOrder);
router.post('/orders/:id/confirm-delivery', validateRequest(confirmDeliverySchema), OrderController.confirmDelivery);

export default router;
