import { Types } from 'mongoose';
import { Notification, INotification } from '../models/Notification.model.js';
import { NotificationType } from '../constants/complaint.js';
import { sendUserNotification } from '../socket/events.js';
import { logger } from '../utils/logger.js';

export interface CreateNotificationParams {
  recipientId: Types.ObjectId | string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: Types.ObjectId | string | null;
  referenceType?: 'complaint' | 'sub_ticket' | 'poll' | 'system';
}

export class NotificationService {
  async notify(params: CreateNotificationParams): Promise<INotification | null> {
    try {
      const doc = await Notification.create({
        recipientId: new Types.ObjectId(params.recipientId),
        title: params.title,
        message: params.message,
        type: params.type,
        referenceId: params.referenceId ? new Types.ObjectId(params.referenceId) : null,
        referenceType: params.referenceType || 'complaint',
      });

      // Send real-time notification to user socket room
      sendUserNotification(params.recipientId.toString(), doc);

      return doc;
    } catch (err) {
      logger.error('Failed to create notification', err);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 30) {
    return Notification.find({ recipientId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), recipientId: new Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
}

export const notificationService = new NotificationService();
