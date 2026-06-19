import { Router } from 'express';
import * as ReportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/summary', ReportController.getSummary);
router.get('/analysis', ReportController.getAIAnalysis);
router.post('/chat', ReportController.chatWithAI);
router.get('/vehicle/:id', ReportController.getVehiclePerformance);

export default router;
