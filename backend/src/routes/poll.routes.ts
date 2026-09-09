import { Router } from 'express';
import { pollController } from '../controllers/poll.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createPollSchema, votePollSchema } from '../validations/poll.validation.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Create opinion poll (Admins & Management)
router.post(
  '/',
  authenticateToken,
  requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  validateRequest(createPollSchema),
  pollController.createPoll
);

// Get list of active/all polls
router.get('/', authenticateToken, pollController.getPolls);

// Get poll details with user vote status
router.get('/:id', authenticateToken, pollController.getPollById);

// Submit vote on poll
router.post(
  '/:id/vote',
  authenticateToken,
  validateRequest(votePollSchema),
  pollController.vote
);

// Get comprehensive opinion mining breakdown
router.get(
  '/:id/analytics',
  authenticateToken,
  requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  pollController.getPollAnalytics
);

export default router;
