import { Router } from 'express';
import * as ExpenseController from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ExpenseController.getAll);
router.post('/', ExpenseController.create);
router.delete('/:id', ExpenseController.remove);

export default router;
