import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { UserRole } from '../constants/roles.js';

export class AnalyticsController {
  async getOverview(req: AuthenticatedRequest, res: Response) {
    try {
      let deptId = req.query.departmentId as string;
      if (req.user?.role === UserRole.DEPT_ADMIN && req.user.departmentId) {
        deptId = req.user.departmentId.toString();
      }

      const metrics = await analyticsService.getOverviewMetrics(deptId);
      return sendSuccess(res, metrics, 'Overview metrics retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getSentimentTrends(req: AuthenticatedRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trends = await analyticsService.getSentimentTrends(days);
      return sendSuccess(res, trends, 'Sentiment trends retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getCategoryDistribution(req: AuthenticatedRequest, res: Response) {
    try {
      let deptId = req.query.departmentId as string;
      if (req.user?.role === UserRole.DEPT_ADMIN && req.user.departmentId) {
        deptId = req.user.departmentId.toString();
      }

      const categories = await analyticsService.getCategoryDistribution(deptId);
      return sendSuccess(res, categories, 'Category breakdown retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getHotspots(req: AuthenticatedRequest, res: Response) {
    try {
      const hotspots = await analyticsService.getCampusHotspots();
      return sendSuccess(res, hotspots, 'Campus complaint hotspots retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getOpinionMiningSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const summary = await analyticsService.getOpinionMiningSummary();
      return sendSuccess(res, summary, 'Opinion mining summary retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const analyticsController = new AnalyticsController();
