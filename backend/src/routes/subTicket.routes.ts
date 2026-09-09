import { Router } from 'express';
import { subTicketController } from '../controllers/subTicket.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Create sub-ticket under a complaint (Admin roles)
router.post(
  '/',
  authenticateToken,
  requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  subTicketController.createSubTicket
);

// Get all sub-tickets for a complaint
router.get(
  '/complaint/:complaintId',
  authenticateToken,
  subTicketController.getSubTicketsForComplaint
);

// Update sub-ticket status
router.patch(
  '/:id/status',
  authenticateToken,
  requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  subTicketController.updateSubTicketStatus
);

export default router;
