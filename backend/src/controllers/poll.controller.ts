import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { pollService } from '../services/poll.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { PollStatus } from '../constants/complaint.js';

export class PollController {
  async createPoll(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, category, options, departmentId, endDate, allowMultipleVotes, isAnonymous } = req.body;

      const poll = await pollService.createPoll({
        title,
        description,
        category,
        options,
        departmentId,
        createdBy: req.user!.userId,
        endDate: new Date(endDate),
        allowMultipleVotes: allowMultipleVotes === true,
        isAnonymous: isAnonymous !== false,
      });

      return sendSuccess(res, poll, 'Opinion poll created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getPolls(req: AuthenticatedRequest, res: Response) {
    try {
      const filter = {
        status: req.query.status as PollStatus,
        category: req.query.category as string,
        departmentId: req.query.departmentId as string,
      };

      const polls = await pollService.getPolls(filter);
      return sendSuccess(res, polls, 'Polls retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getPollById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await pollService.getPollById(id, req.user?.userId);
      return sendSuccess(res, data, 'Poll details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async vote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { selectedOptionId, feedbackText } = req.body;

      const result = await pollService.submitVote(
        id,
        req.user!.userId,
        req.user!.role,
        selectedOptionId,
        feedbackText,
        req.user!.departmentId ? req.user!.departmentId.toString() : undefined
      );

      return sendSuccess(res, result.poll, 'Vote recorded successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getPollAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const results = await pollService.getPollResultsWithOpinionMining(id);
      return sendSuccess(res, results, 'Poll opinion mining analysis retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const pollController = new PollController();
