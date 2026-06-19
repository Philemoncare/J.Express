import { Router } from 'express';
import * as MaintenanceController from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', MaintenanceController.getAll);
router.post('/', MaintenanceController.create);

export default router;
