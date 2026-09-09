import { Router } from 'express';
import authRoutes from './auth.routes.js';
import complaintRoutes from './complaint.routes.js';
import subTicketRoutes from './subTicket.routes.js';
import pollRoutes from './poll.routes.js';
import departmentRoutes from './department.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';
import auditRoutes from './audit.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/sub-tickets', subTicketRoutes);
router.use('/polls', pollRoutes);
router.use('/departments', departmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CampusPulse AI Backend',
    timestamp: new Date().toISOString(),
  });
});

export default router;
