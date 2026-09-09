import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Only Management and SuperAdmin can review platform audit logs
router.use(authenticateToken, requireRoles(UserRole.MANAGEMENT, UserRole.SUPER_ADMIN));

router.get('/recent', auditController.getRecentLogs);
router.get('/entity/:entityId', auditController.getLogsForEntity);

export default router;
