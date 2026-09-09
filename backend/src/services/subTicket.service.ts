import { Types } from 'mongoose';
import { SubTicket, ISubTicket } from '../models/SubTicket.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { SubTicketStatus, NotificationType } from '../constants/complaint.js';
import { auditService } from './audit.service.js';
import { notificationService } from './notification.service.js';

export interface CreateSubTicketDto {
  parentComplaintId: string;
  title: string;
  description: string;
  assignedDepartmentId: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  createdBy: string;
  createdByName: string;
  createdByRole: string;
}

export class SubTicketService {
  async createSubTicket(dto: CreateSubTicketDto): Promise<ISubTicket> {
    const complaint = await Complaint.findById(dto.parentComplaintId);
    if (!complaint) {
      throw new Error('Parent complaint ticket not found.');
    }

    const subTicket = await SubTicket.create({
      parentComplaintId: new Types.ObjectId(dto.parentComplaintId),
      title: dto.title,
      description: dto.description,
      assignedDepartmentId: new Types.ObjectId(dto.assignedDepartmentId),
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : null,
      createdBy: new Types.ObjectId(dto.createdBy),
      priority: dto.priority || 'medium',
      status: SubTicketStatus.ASSIGNED,
    });

    await auditService.log({
      entityType: 'sub_ticket',
      entityId: subTicket._id,
      performedBy: dto.createdBy,
      performedByName: dto.createdByName,
      performedByRole: dto.createdByRole,
      action: 'SUB_TICKET_CREATED',
      newState: { title: dto.title, assignedDept: dto.assignedDepartmentId },
      metadata: { parentComplaintId: dto.parentComplaintId },
    });

    if (dto.assignedTo) {
      await notificationService.notify({
        recipientId: dto.assignedTo,
        title: `Assigned Sub-Ticket: ${dto.title}`,
        message: `You have been delegated a sub-ticket under complaint ${complaint.trackingCode}.`,
        type: NotificationType.SUB_TICKET_ASSIGNED,
        referenceId: subTicket._id,
        referenceType: 'sub_ticket',
      });
    }

    return subTicket;
  }

  async getSubTicketsForComplaint(complaintId: string) {
    return SubTicket.find({ parentComplaintId: new Types.ObjectId(complaintId) })
      .populate('assignedDepartmentId', 'name code')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateSubTicketStatus(
    subTicketId: string,
    status: SubTicketStatus,
    notes?: string,
    performedBy?: { id: string; name: string; role: string }
  ) {
    const update: any = { status };
    if (notes) update.notes = notes;
    if (status === SubTicketStatus.COMPLETED) {
      update.completedAt = new Date();
    }

    const subTicket = await SubTicket.findByIdAndUpdate(subTicketId, update, { new: true })
      .populate('assignedDepartmentId', 'name code')
      .populate('assignedTo', 'name email');

    if (!subTicket) {
      throw new Error('Sub-ticket not found.');
    }

    if (performedBy) {
      await auditService.log({
        entityType: 'sub_ticket',
        entityId: subTicket._id,
        performedBy: performedBy.id,
        performedByName: performedBy.name,
        performedByRole: performedBy.role,
        action: 'SUB_TICKET_STATUS_UPDATED',
        newState: { status, notes },
      });
    }

    return subTicket;
  }
}

export const subTicketService = new SubTicketService();
