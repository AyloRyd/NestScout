import { Router } from 'express';
import StatisticsController from '../controllers/StatisticsController.js';

const router = Router();

router.get('/:userId', StatisticsController.getStatisticsPage);

router.get('/pdf/:userId', StatisticsController.downloadStatisticsPDF);

export default router;
