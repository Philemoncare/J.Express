import { Router } from 'express';
import * as FuelController from '../controllers/fuel.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', FuelController.getAll);
router.post('/', FuelController.create);
router.delete('/:id', FuelController.remove);

export default router;
