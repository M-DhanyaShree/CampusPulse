import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/AuditLog.model.js';
import { logger } from '../utils/logger.js';

export interface CreateAuditLogParams {
  entityType: 'complaint' | 'sub_ticket' | 'user' | 'department' | 'poll';
  entityId: Types.ObjectId | string;
  performedBy: Types.ObjectId | string;
  performedByName: string;
  performedByRole: string;
  action: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async log(params: CreateAuditLogParams): Promise<IAuditLog | null> {
    try {
      const entry = await AuditLog.create({
        ...params,
        entityId: new Types.ObjectId(params.entityId),
        performedBy: new Types.ObjectId(params.performedBy),
      });
      return entry;
    } catch (err) {
      logger.error('Failed to write audit log entry', err);
      return null;
    }
  }

  async getLogsForEntity(entityId: string, limit = 50) {
    return AuditLog.find({ entityId: new Types.ObjectId(entityId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getRecentLogs(limit = 100, skip = 0) {
    return AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

export const auditService = new AuditService();
