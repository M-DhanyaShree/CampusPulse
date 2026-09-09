import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_COMPLAINTS } from '../../lib/api';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, Search, Filter } from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<string[]>(['c-101']);

  const handleUpvote = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isUp = upvotedIds.includes(id);
          return {
            ...c,
            upvotes: isUp ? c.upvotes - 1 : c.upvotes + 1,
          };
        }
        return c;
      })
    );
    setUpvotedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return c.status === 'in_progress' || c.status === 'triaged';
    if (activeTab === 'resolved') return c.status === 'resolved';
    if (activeTab === 'critical') return c.urgency === 'critical';
    if (activeTab === 'mine') return c.studentId === user?.id;

    return true;
  });

  const tabItems = [
    { id: 'all', label: 'All Tickets', count: complaints.length },
    {
      id: 'mine',
      label: 'My Submissions',
      count: complaints.filter((c) => c.studentId === user?.id).length,
    },
    {
      id: 'in_progress',
      label: 'Active / In Progress',
      count: complaints.filter((c) => c.status === 'in_progress' || c.status === 'triaged').length,
    },
    {
      id: 'critical',
      label: 'Critical / Urgent',
      count: complaints.filter((c) => c.urgency === 'critical').length,
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: complaints.filter((c) => c.status === 'resolved').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Campus Grievance Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse campus complaints, track real-time resolution stages, and upvote community tickets.
          </p>
        </div>

        <Link to="/student/submit">
          <Button variant="accent">
            <PlusCircle className="h-4 w-4" />
            <span>File New Complaint</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        <div className="w-full md:w-72 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search tickets, tracking IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No Complaints Found"
          description="No tickets match your filter criteria or search query."
          actionText="Submit a Complaint"
          onAction={() => (window.location.href = '/student/submit')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onUpvote={handleUpvote}
              isUpvoted={upvotedIds.includes(complaint.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
