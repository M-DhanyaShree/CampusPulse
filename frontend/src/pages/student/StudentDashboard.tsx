import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_COMPLAINTS, MOCK_POLLS } from '../../lib/api';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  ThumbsUp,
  Vote,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [upvotedIds, setUpvotedIds] = useState<string[]>(['c-101']);

  const myComplaints = complaints.filter((c) => c.studentId === user?.id);
  const openCount = myComplaints.filter((c) => c.status !== 'resolved').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'resolved').length;
  const totalUpvotes = myComplaints.reduce((acc, c) => acc + c.upvotes, 0);

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

  return (
    <div className="space-y-7">
      {/* Welcome & Action Banner */}
      <div className="relative rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#fca311]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fca311]/15 text-[#fca311] border border-[#fca311]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CampusPulse AI Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your voice powers campus improvements. Lodge complaints with real-time AI triage, track live resolution workflows, and vote on campus proposals.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/student/submit">
              <Button variant="accent" size="lg" className="shadow-xl">
                <PlusCircle className="h-5 w-5" />
                <span>Submit Complaint</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency / Critical Safety Alert if any */}
      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Critical Safety Advisory in Effect
            </h4>
            <p className="text-xs text-rose-200">
              Emergency electrical hazard reported in Hostel Block A, Wing 4. Electricians on-site.
            </p>
          </div>
        </div>
        <Link to="/complaints/c-102">
          <Button size="sm" variant="outline" className="border-rose-500/50 text-rose-300">
            View Live Status
          </Button>
        </Link>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">My Open Tickets</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-[#fca311]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{openCount}</p>
          <span className="text-[10px] text-slate-400">Currently in triage or resolution</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Resolved Complaints</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-400 font-medium">100% verified resolution</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Community Upvotes</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalUpvotes}</p>
          <span className="text-[10px] text-slate-400">Campus student endorsements</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Surveys</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Vote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{MOCK_POLLS.length}</p>
          <span className="text-[10px] text-purple-400 font-medium">Open for student voice</span>
        </div>
      </div>

      {/* Main Split Content: Active Complaints & Quick Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Campus Complaints Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Active Campus Grievance Feed
            </h3>
            <Link
              to="/student/complaints"
              className="text-xs font-semibold text-[#fca311] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {complaints.slice(0, 3).map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onUpvote={handleUpvote}
                isUpvoted={upvotedIds.includes(complaint.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Active Campus Surveys / Polls Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Campus Opinion Polls
            </h3>
            <Link
              to="/student/surveys"
              className="text-xs font-semibold text-[#fca311] hover:underline flex items-center gap-1"
            >
              <span>All Polls</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {MOCK_POLLS.map((poll) => (
              <Card key={poll.id} className="p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-[#fca311] font-semibold">{poll.category}</span>
                    <span>{poll.totalVotes} votes</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{poll.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{poll.description}</p>
                </div>

                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">{opt.text}</span>
                          <span className="font-mono text-slate-400 shrink-0">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#14213d] to-[#fca311] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link to="/student/surveys" className="block w-full">
                  <Button size="sm" variant="outline" className="w-full">
                    <span>Vote in Survey</span>
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
