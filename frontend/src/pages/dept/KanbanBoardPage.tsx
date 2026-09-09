import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { MOCK_COMPLAINTS } from '../../lib/api';
import { Complaint, ComplaintStatus } from '../../types';
import { UrgencyBadge } from '../../components/complaints/UrgencyBadge';
import { Button } from '../../components/ui/Button';
import {
  Kanban,
  ArrowRight,
  ArrowLeft,
  Flame,
  ThumbsUp,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const COLUMNS: { id: ComplaintStatus; label: string; color: string }[] = [
  { id: 'submitted', label: 'Submitted (Inbox)', color: 'border-slate-500/40' },
  { id: 'triaged', label: 'Triaged / Reviewed', color: 'border-sky-500/40' },
  { id: 'in_progress', label: 'In Progress (Active)', color: 'border-[#fca311]/50' },
  { id: 'resolved', label: 'Resolved', color: 'border-emerald-500/40' },
  { id: 'escalated', label: 'Escalated / Critical', color: 'border-rose-500/50' },
];

export const KanbanBoardPage: React.FC = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  const moveTicket = (ticketId: string, nextStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, status: nextStatus } : c))
    );
    showToast('Moved Ticket', `Transferred to ${nextStatus.replace('_', ' ').toUpperCase()}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Kanban className="h-6 w-6 text-[#fca311]" />
            <span>Department Kanban Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual stage management for rapid ticket movement and status synchronization.
          </p>
        </div>

        <Link to="/dept/queue">
          <Button variant="outline" size="sm">
            <span>Switch to Table Queue</span>
          </Button>
        </Link>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col, colIdx) => {
          const colTickets = complaints.filter((c) => c.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl glass-card border ${col.color} p-4 flex flex-col min-h-[550px] bg-slate-950/60`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {col.label}
                  </h4>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                {colTickets.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-xl">
                    No tickets in stage
                  </div>
                ) : (
                  colTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-white/20 transition space-y-2.5 bg-slate-900/90 shadow-md group"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/complaints/${ticket.id}`}
                          className="font-mono text-xs font-bold text-white group-hover:text-[#fca311] flex items-center gap-1"
                        >
                          <span>{ticket.trackingCode}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </Link>
                        <UrgencyBadge urgency={ticket.urgency} />
                      </div>

                      {/* Title */}
                      <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                        {ticket.title}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                        <span className="truncate">{ticket.location}</span>
                      </div>

                      {/* Meta stats: upvotes, sub-tasks */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-slate-500" />
                            {ticket.upvotes}
                          </span>
                          {ticket.subTickets && ticket.subTickets.length > 0 && (
                            <span className="flex items-center gap-1 text-[#fca311]">
                              <Layers className="h-3 w-3" />
                              {ticket.subTickets.length}
                            </span>
                          )}
                        </div>

                        {/* Move Actions */}
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => moveTicket(ticket.id, COLUMNS[colIdx - 1].id)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              title={`Move to ${COLUMNS[colIdx - 1].label}`}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {colIdx < COLUMNS.length - 1 && (
                            <button
                              onClick={() => moveTicket(ticket.id, COLUMNS[colIdx + 1].id)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-[#fca311]"
                              title={`Move to ${COLUMNS[colIdx + 1].label}`}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
