import { Router } from 'express';
import { departmentController } from '../controllers/department.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validations/department.validation.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Create and update restricted to Management and Superadmin
router.post(
  '/',
  authenticateToken,
  requireRoles(UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  validateRequest(createDepartmentSchema),
  departmentController.createDepartment
);

router.patch(
  '/:id',
  authenticateToken,
  requireRoles(UserRole.MANAGEMENT, UserRole.SUPER_ADMIN),
  validateRequest(updateDepartmentSchema),
  departmentController.updateDepartment
);

export default router;
