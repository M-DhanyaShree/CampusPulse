import { Types } from 'mongoose';
import { Poll, IPoll } from '../models/Poll.model.js';
import { PollResponse } from '../models/PollResponse.model.js';
import { PollStatus } from '../constants/complaint.js';
import { mlClientService } from './mlClient.service.js';
import { broadcastPollVote } from '../socket/events.js';

export interface CreatePollDto {
  title: string;
  description: string;
  category: string;
  options: string[];
  departmentId?: string;
  createdBy: string;
  endDate: Date;
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
}

export class PollService {
  async createPoll(dto: CreatePollDto): Promise<IPoll> {
    const formattedOptions = dto.options.map((opt) => ({
      text: opt,
      voteCount: 0,
    }));

    const poll = await Poll.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      options: formattedOptions,
      departmentId: dto.departmentId ? new Types.ObjectId(dto.departmentId) : null,
      createdBy: new Types.ObjectId(dto.createdBy),
      status: PollStatus.ACTIVE,
      startDate: new Date(),
      endDate: dto.endDate,
      allowMultipleVotes: dto.allowMultipleVotes || false,
      isAnonymous: dto.isAnonymous !== undefined ? dto.isAnonymous : true,
      totalVotes: 0,
    });

    return poll;
  }

  async getPolls(filter: { status?: PollStatus; category?: string; departmentId?: string }) {
    const query: any = {};
    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;
    if (filter.departmentId) query.departmentId = new Types.ObjectId(filter.departmentId);

    return Poll.find(query)
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getPollById(pollId: string, userId?: string) {
    const poll = await Poll.findById(pollId)
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name role')
      .lean();

    if (!poll) {
      throw new Error('Poll not found.');
    }

    let userVote = null;
    if (userId) {
      userVote = await PollResponse.findOne({
        pollId: new Types.ObjectId(pollId),
        userId: new Types.ObjectId(userId),
      }).lean();
    }

    return {
      poll,
      hasVoted: !!userVote,
      userSelectedOptionId: userVote?.selectedOptionId || null,
    };
  }

  async submitVote(
    pollId: string,
    userId: string,
    userRole: string,
    selectedOptionId: string,
    feedbackText?: string,
    departmentId?: string
  ) {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found.');
    }

    if (poll.status !== PollStatus.ACTIVE || new Date() > poll.endDate) {
      throw new Error('This poll is closed or expired.');
    }

    const existingVote = await PollResponse.findOne({
      pollId: new Types.ObjectId(pollId),
      userId: new Types.ObjectId(userId),
    });

    if (existingVote && !poll.allowMultipleVotes) {
      throw new Error('You have already submitted your response to this poll.');
    }

    const option = poll.options.find((opt) => opt._id?.toString() === selectedOptionId);
    if (!option) {
      throw new Error('Selected poll option is invalid.');
    }

    // Optional Opinion Sentiment on qualitative feedback
    let sentimentScore: number | undefined = undefined;
    if (feedbackText && feedbackText.trim().length > 5) {
      const sentiment = await mlClientService.analyzeSentiment(feedbackText);
      sentimentScore = sentiment.score;
    }

    await PollResponse.create({
      pollId: poll._id,
      userId: new Types.ObjectId(userId),
      selectedOptionId: new Types.ObjectId(selectedOptionId),
      userRole,
      departmentId: departmentId ? new Types.ObjectId(departmentId) : null,
      feedbackText,
      sentimentScore,
    });

    // Increment option count & total votes
    option.voteCount += 1;
    poll.totalVotes += 1;
    await poll.save();

    broadcastPollVote(pollId, poll);

    return { success: true, poll };
  }

  async getPollResultsWithOpinionMining(pollId: string) {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      throw new Error('Poll not found.');
    }

    const responses = await PollResponse.find({ pollId: new Types.ObjectId(pollId) })
      .select('selectedOptionId userRole feedbackText sentimentScore createdAt')
      .lean();

    // Aggregate demographics and sentiment
    const roleBreakdown: Record<string, number> = {};
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalFeedbackWithSentiment = 0;

    responses.forEach((r) => {
      roleBreakdown[r.userRole] = (roleBreakdown[r.userRole] || 0) + 1;
      if (r.sentimentScore !== undefined && r.sentimentScore !== null) {
        totalFeedbackWithSentiment++;
        if (r.sentimentScore > 0.15) positiveCount++;
        else if (r.sentimentScore < -0.15) negativeCount++;
        else neutralCount++;
      }
    });

    const sentimentSummary = {
      positivePercentage: totalFeedbackWithSentiment ? Math.round((positiveCount / totalFeedbackWithSentiment) * 100) : 0,
      neutralPercentage: totalFeedbackWithSentiment ? Math.round((neutralCount / totalFeedbackWithSentiment) * 100) : 0,
      negativePercentage: totalFeedbackWithSentiment ? Math.round((negativeCount / totalFeedbackWithSentiment) * 100) : 0,
      totalFeedbackCount: totalFeedbackWithSentiment,
    };

    return {
      poll,
      totalResponses: responses.length,
      roleBreakdown,
      sentimentSummary,
      qualitativeFeedback: responses.filter((r) => r.feedbackText).map((r) => ({
        feedbackText: r.feedbackText,
        sentimentScore: r.sentimentScore,
        createdAt: r.createdAt,
      })),
    };
  }
}

export const pollService = new PollService();
