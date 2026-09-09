import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Restricted to Admins, Management, and SuperAdmin
router.use(authenticateToken, requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN));

router.get('/overview', analyticsController.getOverview);
router.get('/sentiment-trends', analyticsController.getSentimentTrends);
router.get('/category-distribution', analyticsController.getCategoryDistribution);
router.get('/hotspots', analyticsController.getHotspots);
router.get('/opinion-mining', analyticsController.getOpinionMiningSummary);

export default router;
