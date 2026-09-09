import { getIO } from './index.js';
import { logger } from '../utils/logger.js';

export const SocketEvents = {
  COMPLAINT_CREATED: 'complaint:created',
  COMPLAINT_STATUS_UPDATED: 'complaint:status_updated',
  COMPLAINT_UPVOTED: 'complaint:upvoted',
  COMPLAINT_COMMENT_ADDED: 'complaint:comment_added',
  SUB_TICKET_CREATED: 'sub_ticket:created',
  SUB_TICKET_UPDATED: 'sub_ticket:updated',
  POLL_VOTED: 'poll:voted',
  NOTIFICATION_NEW: 'notification:new',
};

export function broadcastComplaintCreated(complaint: any) {
  try {
    const io = getIO();
    // Notify department resolvers
    if (complaint.departmentId) {
      io.to(`dept:${complaint.departmentId}`).emit(SocketEvents.COMPLAINT_CREATED, complaint);
    }
    // Notify management & superadmin
    io.to('role:management').to('role:superadmin').emit(SocketEvents.COMPLAINT_CREATED, complaint);
  } catch (err) {
    logger.warn('Failed to emit complaint:created socket event', err);
  }
}

export function broadcastComplaintStatusUpdated(complaint: any) {
  try {
    const io = getIO();
    // Notify the student who created it
    io.to(`user:${complaint.createdBy}`).emit(SocketEvents.COMPLAINT_STATUS_UPDATED, complaint);
    // Notify the room of everyone currently viewing this complaint
    io.to(`complaint:${complaint._id}`).emit(SocketEvents.COMPLAINT_STATUS_UPDATED, complaint);
    // Notify department
    io.to(`dept:${complaint.departmentId}`).emit(SocketEvents.COMPLAINT_STATUS_UPDATED, complaint);
  } catch (err) {
    logger.warn('Failed to emit complaint:status_updated socket event', err);
  }
}

export function broadcastCommentAdded(complaintId: string, comment: any) {
  try {
    const io = getIO();
    io.to(`complaint:${complaintId}`).emit(SocketEvents.COMPLAINT_COMMENT_ADDED, {
      complaintId,
      comment,
    });
  } catch (err) {
    logger.warn('Failed to emit comment event', err);
  }
}

export function broadcastPollVote(pollId: string, updatedPoll: any) {
  try {
    const io = getIO();
    io.to(`poll:${pollId}`).emit(SocketEvents.POLL_VOTED, updatedPoll);
  } catch (err) {
    logger.warn('Failed to emit poll:voted event', err);
  }
}

export function sendUserNotification(userId: string, notification: any) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(SocketEvents.NOTIFICATION_NEW, notification);
  } catch (err) {
    logger.warn('Failed to send notification via socket', err);
  }
}
