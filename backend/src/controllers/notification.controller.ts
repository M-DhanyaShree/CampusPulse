import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export class NotificationController {
  async getMyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const notifications = await notificationService.getUserNotifications(req.user!.userId, limit);
      return sendSuccess(res, notifications, 'Notifications retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id, req.user!.userId);
      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const notificationController = new NotificationController();
