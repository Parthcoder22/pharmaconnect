import { Router } from 'express';
import { PatientBillController } from '../controllers/patientBillController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireBuyer } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createPatientBillSchema } from '../validators/patientBillValidator.js';

const router = Router();

router.use(requireAuth);
router.use(requireBuyer);

router.post('/', validateRequest(createPatientBillSchema), PatientBillController.createBill);
router.get('/', PatientBillController.listBills);

export default router;
