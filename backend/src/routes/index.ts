import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import reportRoutes from './report.routes';
import expenseRoutes from './expense.routes';
import incomeRoutes from './income.routes';
import fuelRoutes from './fuel.routes';
import maintenanceRoutes from './maintenance.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to JExpress API' });
});

router.use('/', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/reports', reportRoutes);
router.use('/expenses', expenseRoutes);
router.use('/income', incomeRoutes);
router.use('/fuel', fuelRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/notifications', notificationRoutes);

export default router;
