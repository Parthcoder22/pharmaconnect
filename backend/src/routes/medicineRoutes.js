import { Router } from 'express';
import { MedicineController } from '../controllers/medicineController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { medicineQuerySchema } from '../validators/medicineValidator.js';

const router = Router();

// Public / Buyer Marketplace routes
router.get('/', validateRequest(medicineQuerySchema), MedicineController.searchMarketplace);
router.get('/categories', MedicineController.getCategories);
router.get('/:id', MedicineController.getMedicineById);

export default router;
