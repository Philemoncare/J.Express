import { Router } from 'express';
import * as IncomeController from '../controllers/income.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', IncomeController.getAll);
router.post('/', IncomeController.create);
router.delete('/:id', IncomeController.remove);

export default router;
