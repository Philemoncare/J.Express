import { Router } from 'express';
import * as NotificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getAll);
router.put('/:id/read', authenticate, NotificationController.markAsRead);
router.put('/read-all', authenticate, NotificationController.markAllAsRead);

export default router;
