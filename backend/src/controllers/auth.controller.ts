import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { UserRole } from '../constants/roles.js';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      return sendSuccess(res, user, 'Current user profile retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = {
        role: req.query.role as string,
        departmentId: req.query.departmentId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };
      const result = await authService.listUsers(query);
      return sendSuccess(res, result.users, 'Users listed successfully', 200, result.pagination);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role, departmentId } = req.body;
      const updatedUser = await authService.updateUserRole(id, role as UserRole, departmentId);
      return sendSuccess(res, updatedUser, 'User role updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();
