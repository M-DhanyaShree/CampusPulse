import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, changePasswordSchema, updateUserRoleSchema } from '../validations/auth.validation.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), authController.changePassword);

// Management & Admin only
router.get('/users', authenticateToken, requireRoles(UserRole.MANAGEMENT, UserRole.SUPER_ADMIN), authController.listUsers);
router.patch('/users/:id/role', authenticateToken, requireRoles(UserRole.SUPER_ADMIN), validateRequest(updateUserRoleSchema), authController.updateUserRole);

export default router;
