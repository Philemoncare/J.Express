import { Router } from 'express';
import * as VehicleController from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.getAll);
router.post('/', VehicleController.create);
router.get('/:id', VehicleController.getOne);
router.put('/:id', VehicleController.update);
router.delete('/:id', VehicleController.remove);

export default router;
