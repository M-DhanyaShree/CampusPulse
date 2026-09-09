import { Types } from 'mongoose';
import { Complaint, IComplaint, IAttachment } from '../models/Complaint.model.js';
import { Department } from '../models/Department.model.js';
import { ComplaintStatus, ComplaintUrgency, NotificationType } from '../constants/complaint.js';
import { generateTrackingCode } from '../utils/codeGenerator.js';
import { mlClientService } from './mlClient.service.js';
import { auditService } from './audit.service.js';
import { notificationService } from './notification.service.js';
import {
  broadcastComplaintCreated,
  broadcastComplaintStatusUpdated,
  broadcastCommentAdded,
} from '../socket/events.js';
import { UserRole } from '../constants/roles.js';

export interface CreateComplaintDto {
  title: string;
  description: string;
  createdBy: string;
  departmentId?: string;
  category?: string;
  isAnonymous?: boolean;
  location: {
    campusBlock: string;
    roomOrArea?: string;
    landmark?: string;
  };
  attachments?: IAttachment[];
}

export interface ComplaintQueryFilter {
  status?: string;
  urgency?: string;
  departmentId?: string;
  category?: string;
  search?: string;
  createdBy?: string;
  assignedResolver?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'upvoteCount' | 'urgencyScore';
  sortOrder?: 'asc' | 'desc';
}

export class ComplaintService {
  async createComplaint(dto: CreateComplaintDto) {
    const combinedText = `${dto.title}. ${dto.description}`;

    // 1. Run ML Classification & Sentiment Analysis
    const [mlClass, mlSentiment] = await Promise.all([
      mlClientService.classifyComplaint(combinedText),
      mlClientService.analyzeSentiment(combinedText),
    ]);

    // 2. Resolve Department
    let department = null;
    if (dto.departmentId) {
      department = await Department.findById(dto.departmentId);
    }

    // If department wasn't specified by user, look up department matching ML category
    if (!department) {
      department = await Department.findOne({
        $or: [
          { categories: mlClass.category },
          { name: { $regex: mlClass.category.split(' ')[0], $options: 'i' } },
        ],
      });
    }

    // Fallback to first active department
    if (!department) {
      department = await Department.findOne({ isActive: true });
    }

    if (!department) {
      throw new Error('No valid department found to route complaint to.');
    }

    // 3. Compute SLA Deadline
    const slaHours = department.slaHoursDefault || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // 4. Generate unique tracking code
    const trackingCode = generateTrackingCode('CP');

    // 5. Persist Complaint
    const complaint = await Complaint.create({
      trackingCode,
      title: dto.title,
      description: dto.description,
      createdBy: new Types.ObjectId(dto.createdBy),
      isAnonymous: dto.isAnonymous || false,
      departmentId: department._id,
      category: dto.category || mlClass.category,
      mlClassificationConfidence: mlClass.confidence,
      urgency: mlClass.urgency,
      urgencyScore: mlClass.urgencyScore,
      sentiment: mlSentiment,
      location: dto.location,
      status: ComplaintStatus.SUBMITTED,
      attachments: dto.attachments || [],
      slaDeadline,
    });

    // 6. Broadcast via Socket.io
    broadcastComplaintCreated(complaint);

    // 7. Notify department admins
    if (department.headOfDepartment) {
      await notificationService.notify({
        recipientId: department.headOfDepartment,
        title: `New Ticket: ${complaint.trackingCode}`,
        message: `A new ${complaint.urgency.toUpperCase()} priority complaint has been submitted in ${department.name}.`,
        type: NotificationType.TICKET_CREATED,
        referenceId: complaint._id,
      });
    }

    return complaint;
  }

  async getComplaints(filter: ComplaintQueryFilter, requestingUserRole?: UserRole, requestingUserId?: string) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const mongoFilter: any = {};

    if (filter.status) mongoFilter.status = filter.status;
    if (filter.urgency) mongoFilter.urgency = filter.urgency;
    if (filter.departmentId) mongoFilter.departmentId = new Types.ObjectId(filter.departmentId);
    if (filter.category) mongoFilter.category = filter.category;
    if (filter.assignedResolver) mongoFilter.assignedResolver = new Types.ObjectId(filter.assignedResolver);

    // If Student filter for only their own complaints (or public feed view)
    if (filter.createdBy) {
      mongoFilter.createdBy = new Types.ObjectId(filter.createdBy);
    }

    if (filter.search) {
      mongoFilter.$or = [
        { trackingCode: { $regex: filter.search, $options: 'i' } },
        { title: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { 'location.campusBlock': { $regex: filter.search, $options: 'i' } },
      ];
    }

    const sortField = filter.sortBy || 'createdAt';
    const sortDirection = filter.sortOrder === 'asc' ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(mongoFilter)
        .populate('departmentId', 'name code buildingLocation')
        .populate('createdBy', 'name email avatarUrl studentId')
        .populate('assignedResolver', 'name email role')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(mongoFilter),
    ]);

    // Mask anonymity if requested
    const processed = complaints.map((c: any) => {
      if (c.isAnonymous && c.createdBy) {
        if (requestingUserRole !== UserRole.SUPER_ADMIN && requestingUserId !== c.createdBy._id?.toString()) {
          c.createdBy = { name: 'Anonymous Student', email: '', avatarUrl: null };
        }
      }
      return c;
    });

    return {
      complaints: processed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getComplaintById(id: string, requestingUserRole?: UserRole, requestingUserId?: string) {
    const complaint = await Complaint.findById(id)
      .populate('departmentId', 'name code slaHoursDefault buildingLocation')
      .populate('createdBy', 'name email avatarUrl studentId')
      .populate('assignedResolver', 'name email role')
      .populate('duplicateOf', 'trackingCode title status')
      .lean();

    if (!complaint) {
      throw new Error('Complaint ticket not found.');
    }

    if (complaint.isAnonymous && complaint.createdBy) {
      if (requestingUserRole !== UserRole.SUPER_ADMIN && requestingUserId !== (complaint.createdBy as any)._id?.toString()) {
        (complaint as any).createdBy = { name: 'Anonymous Student', email: '', avatarUrl: null };
      }
    }

    return complaint;
  }

  async updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    performedBy: { id: string; name: string; role: string },
    notes?: string,
    assignedResolverId?: string
  ) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const previousStatus = complaint.status;
    complaint.status = newStatus;

    if (newStatus === ComplaintStatus.RESOLVED) {
      complaint.resolvedAt = new Date();
      complaint.resolutionSummary = notes || 'Marked resolved by department administrator.';
    }

    if (assignedResolverId) {
      complaint.assignedResolver = new Types.ObjectId(assignedResolverId);
    }

    if (newStatus === ComplaintStatus.REJECTED && notes) {
      complaint.rejectionReason = notes;
    }

    await complaint.save();

    // Audit Log
    await auditService.log({
      entityType: 'complaint',
      entityId: complaint._id,
      performedBy: performedBy.id,
      performedByName: performedBy.name,
      performedByRole: performedBy.role,
      action: 'STATUS_TRANSITION',
      previousState: { status: previousStatus },
      newState: { status: newStatus, notes, assignedResolverId },
      metadata: { trackingCode: complaint.trackingCode },
    });

    // Socket Event Broadcast
    broadcastComplaintStatusUpdated(complaint);

    // Send Notification to Student
    await notificationService.notify({
      recipientId: complaint.createdBy,
      title: `Status Update: ${complaint.trackingCode}`,
      message: `Your complaint "${complaint.title}" has been updated to "${newStatus.replace('_', ' ').toUpperCase()}".`,
      type: NotificationType.STATUS_UPDATED,
      referenceId: complaint._id,
    });

    return complaint;
  }

  async upvoteComplaint(complaintId: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const hasUpvoted = complaint.upvotes.some((u) => u.toString() === userId);

    if (hasUpvoted) {
      // Toggle off upvote
      complaint.upvotes = complaint.upvotes.filter((u) => u.toString() !== userId);
      complaint.upvoteCount = Math.max(0, complaint.upvoteCount - 1);
    } else {
      complaint.upvotes.push(userObjectId);
      complaint.upvoteCount += 1;
    }

    await complaint.save();
    return { upvoteCount: complaint.upvoteCount, hasUpvoted: !hasUpvoted };
  }

  async addComment(
    complaintId: string,
    author: { id: string; name: string; role: string },
    text: string,
    isOfficial = false
  ) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const comment = {
      authorId: new Types.ObjectId(author.id),
      authorName: author.name,
      authorRole: author.role,
      text,
      isOfficialUpdate: isOfficial,
      createdAt: new Date(),
    };

    complaint.comments.push(comment as any);
    await complaint.save();

    broadcastCommentAdded(complaintId, comment);

    // Notify complainant if comment by staff
    if (author.id !== complaint.createdBy.toString()) {
      await notificationService.notify({
        recipientId: complaint.createdBy,
        title: `New Comment on ${complaint.trackingCode}`,
        message: `${author.name} (${author.role}) commented: "${text.substring(0, 80)}..."`,
        type: NotificationType.COMMENT_ADDED,
        referenceId: complaint._id,
      });
    }

    return comment;
  }

  async checkDuplicates(title: string, description: string) {
    const query = `${title} ${description}`;
    
    // Fetch last 50 active complaints to check similarity against
    const recent = await Complaint.find({
      status: { $in: [ComplaintStatus.SUBMITTED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.TRIAGED] },
    })
      .select('_id title description trackingCode location upvoteCount status')
      .limit(50)
      .lean();

    const corpus = recent.map((r) => ({
      id: r._id.toString(),
      text: `${r.title}. ${r.description} Location: ${(r as any).location?.campusBlock || ''}`,
    }));

    const matches = await mlClientService.checkSimilarity(query, corpus);

    // Hydrate top matches
    const duplicates = matches
      .filter((m) => m.similarityScore >= 0.5)
      .map((m) => {
        const item = recent.find((r) => r._id.toString() === m.id);
        return {
          complaint: item,
          similarityScore: m.similarityScore,
        };
      });

    return duplicates;
  }
}

export const complaintService = new ComplaintService();
