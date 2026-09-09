import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { complaintService } from '../services/complaint.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ComplaintStatus } from '../constants/complaint.js';
import { IAttachment } from '../models/Complaint.model.js';
import { UserRole } from '../constants/roles.js';

export class ComplaintController {
  async createComplaint(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, departmentId, category, isAnonymous, campusBlock, roomOrArea, landmark } = req.body;

      // Process uploaded files if any
      const files = req.files as Express.Multer.File[];
      const attachments: IAttachment[] = (files || []).map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      }));

      const complaint = await complaintService.createComplaint({
        title,
        description,
        createdBy: req.user!.userId,
        departmentId,
        category,
        isAnonymous: isAnonymous === 'true' || isAnonymous === true,
        location: {
          campusBlock: campusBlock || 'Main Campus',
          roomOrArea,
          landmark,
        },
        attachments,
      });

      return sendSuccess(res, complaint, 'Complaint submitted successfully and classified', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getComplaints(req: AuthenticatedRequest, res: Response) {
    try {
      const filter = {
        status: req.query.status as string,
        urgency: req.query.urgency as string,
        departmentId: req.query.departmentId as string,
        category: req.query.category as string,
        search: req.query.search as string,
        assignedResolver: req.query.assignedResolver as string,
        createdBy: req.query.createdBy as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      // If user is a Department Admin and no department query provided, scope to their department
      if (req.user?.role === UserRole.DEPT_ADMIN && req.user.departmentId && !filter.departmentId) {
        filter.departmentId = req.user.departmentId.toString();
      }

      const result = await complaintService.getComplaints(
        filter,
        req.user?.role,
        req.user?.userId
      );

      return sendSuccess(res, result.complaints, 'Complaints retrieved successfully', 200, result.pagination);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getComplaintById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const complaint = await complaintService.getComplaintById(
        id,
        req.user?.role,
        req.user?.userId
      );
      return sendSuccess(res, complaint, 'Complaint details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes, assignedResolverId } = req.body;

      const complaint = await complaintService.updateStatus(
        id,
        status as ComplaintStatus,
        {
          id: req.user!.userId,
          name: req.user!.email.split('@')[0],
          role: req.user!.role,
        },
        notes,
        assignedResolverId
      );

      return sendSuccess(res, complaint, `Complaint status updated to ${status}`);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async upvoteComplaint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await complaintService.upvoteComplaint(id, req.user!.userId);
      return sendSuccess(res, result, result.hasUpvoted ? 'Complaint upvoted' : 'Upvote removed');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { text, isOfficialUpdate } = req.body;

      const isOfficial =
        (isOfficialUpdate === true || isOfficialUpdate === 'true') &&
        req.user!.role !== UserRole.STUDENT;

      const comment = await complaintService.addComment(
        id,
        {
          id: req.user!.userId,
          name: req.user!.email.split('@')[0],
          role: req.user!.role,
        },
        text,
        isOfficial
      );

      return sendSuccess(res, comment, 'Comment added successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async checkDuplicates(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return sendError(res, 'Title and description are required for duplicate check', 400);
      }

      const duplicates = await complaintService.checkDuplicates(title, description);
      return sendSuccess(res, duplicates, 'Duplicate similarity analysis complete');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const complaintController = new ComplaintController();
