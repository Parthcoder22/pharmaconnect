import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/supplier/overview', ReportController.getSupplierOverview);
router.get('/buyer/overview', ReportController.getBuyerOverview);
router.get('/batch-surveillance', ReportController.getBatchSurveillance);

export default router;
