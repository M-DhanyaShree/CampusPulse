import cron from 'node-cron';
import { Complaint } from '../models/Complaint.model.js';
import { Poll } from '../models/Poll.model.js';
import { ComplaintStatus, NotificationType, PollStatus } from '../constants/complaint.js';
import { notificationService } from './notification.service.js';
import { Department } from '../models/Department.model.js';
import { logger } from '../utils/logger.js';

export function initCronJobs(): void {
  // 1. SLA Breach Monitor (Runs every 30 minutes)
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('[CRON] Running SLA breach and escalation checker...');
      const now = new Date();

      const breachedTickets = await Complaint.find({
        status: { $in: [ComplaintStatus.SUBMITTED, ComplaintStatus.TRIAGED, ComplaintStatus.IN_PROGRESS] },
        slaDeadline: { $lt: now },
        isEscalated: false,
      }).populate('departmentId', 'name headOfDepartment');

      for (const ticket of breachedTickets) {
        ticket.isEscalated = true;
        ticket.escalatedAt = now;
        ticket.status = ComplaintStatus.ESCALATED;
        await ticket.save();

        logger.warn(`[CRON] Ticket ${ticket.trackingCode} escalated due to SLA breach!`);

        const dept = ticket.departmentId as any;
        if (dept && dept.headOfDepartment) {
          await notificationService.notify({
            recipientId: dept.headOfDepartment,
            title: `SLA Breached: ${ticket.trackingCode}`,
            message: `Ticket "${ticket.title}" in ${dept.name} has exceeded SLA deadline and has been escalated.`,
            type: NotificationType.SLA_BREACH_WARNING,
            referenceId: ticket._id,
          });
        }
      }
    } catch (err) {
      logger.error('[CRON] SLA Checker encountered an error', err);
    }
  });

  // 2. Expire Overdue Polls (Runs daily at midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('[CRON] Checking for expired opinion polls...');
      const now = new Date();

      const result = await Poll.updateMany(
        {
          status: PollStatus.ACTIVE,
          endDate: { $lt: now },
        },
        {
          status: PollStatus.EXPIRED,
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`[CRON] Marked ${result.modifiedCount} polls as expired.`);
      }
    } catch (err) {
      logger.error('[CRON] Poll expiration checker failed', err);
    }
  });

  logger.info('Background cron schedulers initialized.');
}
