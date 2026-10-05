import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.post('/signature', UploadController.getUploadSignature);
router.post('/document', UploadController.uploadDocument);
router.get('/documents', UploadController.getDocuments);

export default router;
