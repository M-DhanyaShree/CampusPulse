import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_COMPLAINTS } from '../../lib/api';
import { ComplaintStatus, SubTicket } from '../../types';
import { StatusBadge } from '../../components/complaints/StatusBadge';
import { UrgencyBadge } from '../../components/complaints/UrgencyBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ThumbsUp,
  Brain,
  Sparkles,
  CheckCircle2,
  Send,
  Layers,
  Building,
  User,
  AlertOctagon,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const complaint = MOCK_COMPLAINTS.find((c) => c.id === id) || MOCK_COMPLAINTS[0];

  const [comments, setComments] = useState(complaint.comments || []);
  const [newComment, setNewComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>(complaint.status);
  const [upvotes, setUpvotes] = useState(complaint.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `cm-${Date.now()}`,
      authorId: user?.id || 'u-1',
      authorName: user?.name || 'Aarav Sharma',
      authorRole: role,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, commentObj]);
    setNewComment('');
    showToast('Comment Posted', 'Your message was added to the audit discussion.', 'success');
  };

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    setCurrentStatus(newStatus);
    complaint.status = newStatus;
    showToast('Ticket Status Updated', `Ticket is now marked as: ${newStatus.toUpperCase()}`, 'success');
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((v) => v - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((v) => v + 1);
      setHasUpvoted(true);
      showToast('Upvoted', 'Your support was registered on this ticket.', 'success');
    }
  };

  const stages: { key: ComplaintStatus; label: string }[] = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'triaged', label: 'Triaged' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === currentStatus);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              hasUpvoted
                ? 'bg-[#fca311] text-black shadow-lg shadow-[#fca311]/25'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{upvotes} Upvotes</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-white/15 text-slate-200 font-bold">
              {complaint.trackingCode}
            </span>
            <span className="text-xs text-[#fca311] font-semibold bg-[#fca311]/10 px-2.5 py-1 rounded-lg border border-[#fca311]/20">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <UrgencyBadge urgency={complaint.urgency} />
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {complaint.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Location & Metadata Bar */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-white font-medium">{complaint.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Submitted {formatDate(complaint.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span>Lodgee: {complaint.studentName}</span>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-[#14213d]/40 to-slate-950 border border-[#fca311]/25 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#fca311]">
            <Brain className="h-4 w-4" />
            <span>CampusPulse AI Executive Brief & Sentiment</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {complaint.aiSummary ||
              'Automated summarization identifies immediate resolution requirement for campus residents.'}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>
              Classification Confidence:{' '}
              <strong className="text-white">
                {Math.round((complaint.aiClassificationConfidence || 0.94) * 100)}%
              </strong>
            </span>
            <span>
              Detected Sentiment:{' '}
              <strong className="text-rose-400 uppercase font-semibold">
                {complaint.sentiment || 'Negative'}
              </strong>
            </span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolution Workflow Timeline
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, idx) => {
              const isPast = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage.key} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isPast ? 'bg-[#fca311]' : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[11px] block text-center font-medium ${
                      isCurrent
                        ? 'text-[#fca311] font-bold'
                        : isPast
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Status Quick Action Bar (Visible if Dept Admin or Management) */}
        {(role === 'dept_admin' || role === 'management' || role === 'superadmin') && (
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Department Admin Workflow Controls
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {(['submitted', 'triaged', 'in_progress', 'resolved', 'escalated'] as ComplaintStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      currentStatus === st
                        ? 'bg-[#fca311] text-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Mark as {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tickets Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#fca311]" />
            <h3 className="text-base font-bold text-white">
              Delegated Sub-Tickets & Action Tasks
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {complaint.subTickets?.length || 0} Sub-Tasks
          </span>
        </div>

        {complaint.subTickets && complaint.subTickets.length > 0 ? (
          <div className="space-y-2.5">
            {complaint.subTickets.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-white">{sub.title}</h5>
                  <p className="text-[11px] text-slate-400">
                    Assigned to: <strong className="text-slate-200">{sub.assignedToName || 'Technician'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 font-medium text-slate-300 capitalize">
                    {sub.priority} priority
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#14213d] text-[#fca311] font-semibold capitalize">
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No sub-tasks currently required. The department will log delegated repair orders as needed.
          </p>
        )}
      </div>

      {/* Discussion & Audit Comments Thread */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight">
          Audit Log & Staff Updates Discussion
        </h3>

        {/* Existing Comments */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400">No messages logged yet.</p>
          ) : (
            comments.map((cm) => (
              <div
                key={cm.id}
                className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{cm.authorName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {cm.authorRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{formatDate(cm.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cm.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-white/10">
          <Textarea
            rows={3}
            placeholder="Post an inquiry or update regarding this complaint..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              <Send className="h-3.5 w-3.5 mr-1" />
              <span>Post Update</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
