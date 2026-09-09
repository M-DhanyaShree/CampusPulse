import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export class AuditController {
  async getRecentLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
      const logs = await auditService.getRecentLogs(limit, skip);
      return sendSuccess(res, logs, 'Recent audit logs retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getLogsForEntity(req: AuthenticatedRequest, res: Response) {
    try {
      const { entityId } = req.params;
      const logs = await auditService.getLogsForEntity(entityId);
      return sendSuccess(res, logs, 'Entity audit history retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const auditController = new AuditController();
