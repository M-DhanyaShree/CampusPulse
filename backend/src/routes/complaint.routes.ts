import { Router } from 'express';
import { complaintController } from '../controllers/complaint.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  updateComplaintStatusSchema,
  addCommentSchema,
  checkDuplicateSchema,
} from '../validations/complaint.validation.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Submit complaint (multipart with attachments)
router.post(
  '/',
  authenticateToken,
  upload.array('files', 5),
  complaintController.createComplaint
);

// Check duplicate before submission
router.post(
  '/check-duplicate',
  authenticateToken,
  validateRequest(checkDuplicateSchema),
  complaintController.checkDuplicates
);

// Get complaints list (filtered by role and params)
router.get('/', authenticateToken, complaintController.getComplaints);

// Get single complaint details
router.get('/:id', authenticateToken, complaintController.getComplaintById);

// Update status (Department Admin, Management, Superadmin)
router.patch(
  '/:id/status',
  authenticateToken,
  requireRoles(UserRole.DEPT_ADMIN, UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  validateRequest(updateComplaintStatusSchema),
  complaintController.updateStatus
);

// Upvote complaint
router.post('/:id/upvote', authenticateToken, complaintController.upvoteComplaint);

// Add comment / official resolution update
router.post(
  '/:id/comments',
  authenticateToken,
  validateRequest(addCommentSchema),
  complaintController.addComment
);

export default router;
