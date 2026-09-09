import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_POLLS } from '../../lib/api';
import { Poll } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Vote, PlusCircle, Users, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const ManagementSurveysPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Campus Amenities');
  const [option1, setOption1] = useState('Option A');
  const [option2, setOption2] = useState('Option B');
  const [option3, setOption3] = useState('Option C');

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const createdPoll: Poll = {
      id: `poll-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'active',
      createdBy: user?.id || 'u-dean',
      createdByName: user?.name || 'Academic Dean',
      options: [
        { id: 'opt-1', text: option1.trim() || 'Strongly Agree', votes: 0 },
        { id: 'opt-2', text: option2.trim() || 'Neutral', votes: 0 },
        { id: 'opt-3', text: option3.trim() || 'Strongly Disagree', votes: 0 },
      ],
    };

    setPolls([createdPoll, ...polls]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
    showToast('Campus Survey Published', 'Student body can now cast real-time votes.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Vote className="h-6 w-6 text-[#fca311]" />
            <span>Campus Surveys & Student Opinion Mining</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish institutional referendums and monitor real-time student consensus.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          <span>Launch New Campus Poll</span>
        </Button>
      </div>

      {/* Grid of Surveys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {polls.map((poll) => {
          const leaderOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];

          return (
            <Card key={poll.id} className="p-6 space-y-5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fca311]/15 text-[#fca311] border border-[#fca311]/30 font-semibold">
                  {poll.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Closes {formatDate(poll.expiresAt)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{poll.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{poll.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Leading Consensus</span>
                  <span className="text-xs font-bold text-[#fca311]">{leaderOption.text}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Participation</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {poll.totalVotes} Verified Votes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.map((opt) => {
                  const pct =
                    poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{opt.text}</span>
                        <span className="font-mono text-slate-400">{opt.votes} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-700 to-[#fca311] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Poll Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Campus Poll"
        description="Launch an official survey for student and faculty feedback."
      >
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <Input
            label="Survey Title"
            placeholder="e.g. Should central library reading room hours be extended to 2:00 AM?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Textarea
            label="Context & Details"
            rows={3}
            placeholder="Describe the proposal, relevant committee notes, or logistics..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full h-10 rounded-xl glass-input px-3.5 py-2 text-sm text-white bg-slate-900 border border-white/10"
            >
              <option value="Campus Amenities">Campus Amenities</option>
              <option value="Dining & Mess">Dining & Mess</option>
              <option value="Academic Policies">Academic Policies</option>
              <option value="Hostel Governance">Hostel Governance</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Survey Ballot Options
            </label>
            <Input
              label="Option 1"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              required
            />
            <Input
              label="Option 2"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              required
            />
            <Input
              label="Option 3 (Optional)"
              value={option3}
              onChange={(e) => setOption3(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              <Vote className="h-4 w-4" />
              <span>Publish Survey</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
