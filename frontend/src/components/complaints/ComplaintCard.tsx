import React from 'react';
import { Link } from 'react-router-dom';
import { Complaint } from '../../types';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { MapPin, ThumbsUp, MessageSquare, Layers, Sparkles } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote?: (id: string) => void;
  isUpvoted?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onUpvote,
  isUpvoted = false,
}) => {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Top bar: Tracking code & Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-slate-300 font-semibold">
              {complaint.trackingCode}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {complaint.departmentName || complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={complaint.urgency} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/complaints/${complaint.id}`}
          className="block group"
        >
          <h4 className="text-base font-bold text-white group-hover:text-[#fca311] transition-colors line-clamp-1">
            {complaint.title}
          </h4>
        </Link>

        {/* Description or AI Summary */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {complaint.aiSummary ? (
            <span className="inline">
              <span className="inline-flex items-center gap-1 text-[#fca311] font-medium mr-1.5">
                <Sparkles className="h-3 w-3 inline" />
                AI Summary:
              </span>
              {complaint.aiSummary}
            </span>
          ) : (
            complaint.description
          )}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{complaint.location}</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpvote?.(complaint.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              isUpvoted
                ? 'bg-[#fca311]/20 text-[#fca311] font-semibold border border-[#fca311]/30'
                : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{complaint.upvotes}</span>
          </button>

          {complaint.subTickets && complaint.subTickets.length > 0 && (
            <div className="flex items-center gap-1" title="Sub-tickets">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              <span>{complaint.subTickets.length}</span>
            </div>
          )}

          {complaint.comments && complaint.comments.length > 0 && (
            <div className="flex items-center gap-1" title="Comments">
              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
              <span>{complaint.comments.length}</span>
            </div>
          )}
        </div>

        <span className="text-slate-500">{timeAgo(complaint.createdAt)}</span>
      </div>
    </div>
  );
};
