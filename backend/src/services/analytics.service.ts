import { Types } from 'mongoose';
import { Complaint } from '../models/Complaint.model.js';
import { Department } from '../models/Department.model.js';
import { Poll } from '../models/Poll.model.js';
import { ComplaintStatus } from '../constants/complaint.js';

export class AnalyticsService {
  async getOverviewMetrics(departmentId?: string) {
    const filter: any = {};
    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    const [total, resolved, inProgress, critical, openBreachedSLA] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: ComplaintStatus.RESOLVED }),
      Complaint.countDocuments({
        ...filter,
        status: { $in: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.TRIAGED] },
      }),
      Complaint.countDocuments({
        ...filter,
        urgency: 'critical',
        status: { $ne: ComplaintStatus.RESOLVED },
      }),
      Complaint.countDocuments({
        ...filter,
        status: { $ne: ComplaintStatus.RESOLVED },
        slaDeadline: { $lt: new Date() },
      }),
    ]);

    // Average resolution time (in hours) for resolved tickets
    const resolvedTickets = await Complaint.find({
      ...filter,
      status: ComplaintStatus.RESOLVED,
      resolvedAt: { $exists: true, $ne: null },
    })
      .select('createdAt resolvedAt')
      .limit(200)
      .lean();

    let avgResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((acc, curr) => {
        const diff = (new Date(curr.resolvedAt!).getTime() - new Date(curr.createdAt).getTime()) / (1000 * 60 * 60);
        return acc + Math.max(0, diff);
      }, 0);
      avgResolutionHours = parseFloat((totalHours / resolvedTickets.length).toFixed(1));
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      totalTickets: total,
      resolvedTickets: resolved,
      inProgressTickets: inProgress,
      criticalUnresolved: critical,
      slaBreachedTickets: openBreachedSLA,
      resolutionRatePercentage: resolutionRate,
      averageResolutionHours: avgResolutionHours,
    };
  }

  async getSentimentTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const complaints = await Complaint.find({
      createdAt: { $gte: startDate },
    })
      .select('createdAt sentiment.label sentiment.score')
      .lean();

    const dailyMap: Record<string, { positive: number; neutral: number; negative: number; count: number }> = {};

    complaints.forEach((c) => {
      const dateStr = new Date(c.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { positive: 0, neutral: 0, negative: 0, count: 0 };
      }
      dailyMap[dateStr].count++;
      const label = c.sentiment?.label || 'neutral';
      if (label === 'positive') dailyMap[dateStr].positive++;
      else if (label === 'negative') dailyMap[dateStr].negative++;
      else dailyMap[dateStr].neutral++;
    });

    const series = Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date,
        ...dailyMap[date],
      }));

    return { days, series };
  }

  async getCategoryDistribution(departmentId?: string) {
    const filter: any = {};
    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    const aggregation = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = aggregation.reduce((acc, curr) => acc + curr.count, 0);

    return aggregation.map((item) => ({
      category: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }

  async getCampusHotspots() {
    // Group complaints by campus block to find infrastructure pain points
    const hotspots = await Complaint.aggregate([
      {
        $match: {
          status: { $ne: ComplaintStatus.RESOLVED },
        },
      },
      {
        $group: {
          _id: '$location.campusBlock',
          totalComplaints: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] },
          },
          topCategories: { $push: '$category' },
        },
      },
      { $sort: { totalComplaints: -1 } },
      { $limit: 10 },
    ]);

    return hotspots.map((h) => {
      // Find most frequent category
      const freq: Record<string, number> = {};
      h.topCategories.forEach((c: string) => { freq[c] = (freq[c] || 0) + 1; });
      let mostCommonCategory = 'General';
      let maxCount = 0;
      Object.entries(freq).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonCategory = cat;
        }
      });

      return {
        campusBlock: h._id || 'Unknown Block',
        activeComplaints: h.totalComplaints,
        criticalIssues: h.criticalCount,
        primaryIssueCategory: mostCommonCategory,
      };
    });
  }

  async getOpinionMiningSummary() {
    const [recentNegativeComplaints, activePolls] = await Promise.all([
      Complaint.find({ 'sentiment.label': 'negative' })
        .select('title category sentiment location createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Poll.find({ status: 'active' }).select('title totalVotes sentimentSummary').lean(),
    ]);

    return {
      topNegativeIssues: recentNegativeComplaints,
      activePollsSummary: activePolls,
    };
  }
}

export const analyticsService = new AnalyticsService();
