import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { subTicketService } from '../services/subTicket.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { SubTicketStatus } from '../constants/complaint.js';

export class SubTicketController {
  async createSubTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const { parentComplaintId, title, description, assignedDepartmentId, assignedTo, priority } = req.body;

      const subTicket = await subTicketService.createSubTicket({
        parentComplaintId,
        title,
        description,
        assignedDepartmentId,
        assignedTo,
        priority,
        createdBy: req.user!.userId,
        createdByName: req.user!.email.split('@')[0],
        createdByRole: req.user!.role,
      });

      return sendSuccess(res, subTicket, 'Sub-ticket created and assigned successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getSubTicketsForComplaint(req: AuthenticatedRequest, res: Response) {
    try {
      const { complaintId } = req.params;
      const subTickets = await subTicketService.getSubTicketsForComplaint(complaintId);
      return sendSuccess(res, subTickets, 'Sub-tickets retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async updateSubTicketStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const subTicket = await subTicketService.updateSubTicketStatus(
        id,
        status as SubTicketStatus,
        notes,
        {
          id: req.user!.userId,
          name: req.user!.email.split('@')[0],
          role: req.user!.role,
        }
      );

      return sendSuccess(res, subTicket, `Sub-ticket status updated to ${status}`);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const subTicketController = new SubTicketController();
