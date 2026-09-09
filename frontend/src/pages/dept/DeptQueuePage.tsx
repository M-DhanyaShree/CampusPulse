import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_COMPLAINTS } from '../../lib/api';
import { Complaint, ComplaintStatus, ComplaintUrgency } from '../../types';
import { StatusBadge } from '../../components/complaints/StatusBadge';
import { UrgencyBadge } from '../../components/complaints/UrgencyBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  ListTodo,
  Search,
  Filter,
  UserCheck,
  PlusCircle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const DeptQueuePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Sub-ticket / Assign Modal State
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [technicianName, setTechnicianName] = useState('Staff Engineer Suresh Kumar');
  const [taskTitle, setTaskTitle] = useState('');

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || c.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleStatusUpdate = (ticketId: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, status: newStatus } : c))
    );
    showToast('Status Updated', `Ticket status set to ${newStatus.toUpperCase()}`, 'success');
  };

  const handleCreateSubTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !taskTitle.trim()) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      complaintId: selectedTicket.id,
      title: taskTitle.trim(),
      assignedToName: technicianName,
      status: 'assigned' as const,
      priority: 'high' as const,
      createdAt: new Date().toISOString(),
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === selectedTicket.id) {
          const subs = c.subTickets || [];
          return {
            ...c,
            status: c.status === 'submitted' ? 'triaged' : c.status,
            subTickets: [...subs, newSub],
          };
        }
        return c;
      })
    );

    setIsAssignModalOpen(false);
    setTaskTitle('');
    showToast(
      'Technician Dispatched',
      `Sub-ticket assigned to ${technicianName} for ticket ${selectedTicket.trackingCode}`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Department Complaint Queue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Triaging and workflow management for {user?.departmentName || 'IT & Campus Facilities'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dept/kanban">
            <Button variant="secondary" size="sm">
              <Layers className="h-4 w-4" />
              <span>Switch to Kanban View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search tickets, tracking ID, rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl glass-input px-3 text-xs text-white bg-slate-900 border border-white/10"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="triaged">Triaged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="h-10 rounded-xl glass-input px-3 text-xs text-white bg-slate-900 border border-white/10"
        >
          <option value="all">All Urgencies</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tickets Table / List */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Tracking ID</th>
                <th className="py-3.5 px-4 font-semibold">Grievance & AI Summary</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Urgency</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Dispatched</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    <Link
                      to={`/complaints/${ticket.id}`}
                      className="hover:text-[#fca311] flex items-center gap-1"
                    >
                      <span>{ticket.trackingCode}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-bold text-white line-clamp-1">{ticket.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {ticket.aiSummary || ticket.description}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    {ticket.location}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <UrgencyBadge urgency={ticket.urgency} />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusUpdate(ticket.id, e.target.value as ComplaintStatus)
                      }
                      className="bg-slate-900 text-xs text-white border border-white/10 rounded-lg px-2 py-1 focus:border-[#fca311]"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="triaged">Triaged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    {ticket.subTickets && ticket.subTickets.length > 0 ? (
                      <span className="text-[#fca311] font-semibold">
                        {ticket.subTickets.length} Assigned
                      </span>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#14213d] hover:bg-[#1d2f56] text-[#fca311] font-semibold border border-[#fca311]/30 transition"
                    >
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician / Create Sub-Ticket Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Dispatch Technician for ${selectedTicket?.trackingCode}`}
        description="Assign field maintenance personnel and generate a tracked sub-ticket task."
      >
        <form onSubmit={handleCreateSubTicket} className="space-y-4">
          <Input
            label="Sub-Task Title"
            placeholder="e.g. Inspect floor distribution box and replace 16A breaker"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Designated Staff / Technician
            </label>
            <select
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full h-10 rounded-xl glass-input px-3.5 py-2 text-sm text-white bg-slate-900 border border-white/10"
            >
              <option value="Staff Engineer Suresh Kumar">Staff Engineer Suresh Kumar (Electrical)</option>
              <option value="Technician Amit Patel">Technician Amit Patel (Network/LAN)</option>
              <option value="Praveen Singh">Praveen Singh (Plumbing & Sanitization)</option>
              <option value="Ramesh Chandra">Ramesh Chandra (Hardware / Facilities)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-1">
            <p>• Location: <strong>{selectedTicket?.location}</strong></p>
            <p>• Priority: <strong className="text-[#fca311] capitalize">{selectedTicket?.urgency}</strong></p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              <UserCheck className="h-4 w-4" />
              <span>Confirm & Dispatch</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
