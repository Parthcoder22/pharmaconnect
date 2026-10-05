import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/conversations', ChatController.getConversations);
router.get('/all-messages', ChatController.getAllUserMessages);
router.get('/:orderId/messages', ChatController.getMessages);
router.post('/:orderId/messages', ChatController.sendMessage);

export default router;
