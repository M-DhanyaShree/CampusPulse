import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { departmentService } from '../services/department.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export class DepartmentController {
  async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const dept = await departmentService.createDepartment(req.body);
      return sendSuccess(res, dept, 'Department created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getAllDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const activeOnly = req.query.all !== 'true';
      const departments = await departmentService.getAllDepartments(activeOnly);
      return sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getDepartmentById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const dept = await departmentService.getDepartmentById(id);
      return sendSuccess(res, dept, 'Department details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async updateDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const dept = await departmentService.updateDepartment(id, req.body);
      return sendSuccess(res, dept, 'Department updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const departmentController = new DepartmentController();
