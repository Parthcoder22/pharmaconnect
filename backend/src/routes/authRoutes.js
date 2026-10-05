import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  registerSchema,
  loginSchema,
  businessProfileSchema,
  documentUploadSchema,
  adminReviewSchema
} from '../validators/authValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/register', authRateLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), AuthController.login);
router.get('/demo-token/:role', AuthController.getDemoToken);

// Protected user profile & documents
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', requireAuth, AuthController.logout);
router.post('/business', requireAuth, validateRequest(businessProfileSchema), AuthController.updateBusiness);
router.post('/verify-self', requireAuth, AuthController.verifySelf);
router.post('/documents', requireAuth, validateRequest(documentUploadSchema), AuthController.submitDocument);
router.get('/documents', requireAuth, AuthController.getDocuments);

// Admin compliance review
router.post('/admin/review/:docId', requireAuth, requireAdmin, validateRequest(adminReviewSchema), AuthController.reviewDocument);

export default router;
