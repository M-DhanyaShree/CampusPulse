import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_POLLS } from '../../lib/api';
import { Poll } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Vote, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const SurveysPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleVote = (pollId: string) => {
    const selectedOptionId = selectedOptions[pollId];
    if (!selectedOptionId) {
      showToast('Selection Required', 'Please choose an option before voting.', 'warning');
      return;
    }

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt) =>
            opt.id === selectedOptionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            hasVoted: true,
            userVotedOptionId: selectedOptionId,
            options: updatedOptions,
          };
        }
        return p;
      })
    );

    showToast('Vote Registered', 'Thank you for contributing to campus decision-making!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Campus Opinion Surveys & Polls
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Participate in active campus ballots. Aggregated poll results feed directly into management analytics and executive AI reports.
        </p>
      </div>

      <div className="space-y-6">
        {polls.map((poll) => {
          const hasVoted = poll.hasVoted;

          return (
            <Card key={poll.id} className="p-6 sm:p-7 space-y-5 border border-white/10">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fca311]/15 text-[#fca311] border border-[#fca311]/30 font-semibold">
                      {poll.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      By {poll.createdByName || 'Administration'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{poll.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Closes {formatDate(poll.expiresAt)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {poll.description}
              </p>

              {/* Options Form or Results */}
              <div className="space-y-3 pt-2">
                {poll.options.map((option) => {
                  const percentage =
                    poll.totalVotes > 0
                      ? Math.round((option.votes / poll.totalVotes) * 100)
                      : 0;
                  const isSelected = selectedOptions[poll.id] === option.id;
                  const isVotedOption = poll.userVotedOptionId === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() =>
                        !hasVoted &&
                        setSelectedOptions({ ...selectedOptions, [poll.id]: option.id })
                      }
                      className={`p-4 rounded-xl transition-all border ${
                        hasVoted
                          ? isVotedOption
                            ? 'bg-[#14213d]/80 border-[#fca311]'
                            : 'bg-slate-950/40 border-white/5'
                          : isSelected
                          ? 'bg-[#14213d] border-[#fca311] shadow-md shadow-[#fca311]/10 cursor-pointer'
                          : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:bg-slate-900/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                        <div className="flex items-center gap-2.5">
                          {!hasVoted && (
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#fca311] bg-[#fca311]'
                                  : 'border-white/30'
                              }`}
                            >
                              {isSelected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-black" />
                              )}
                            </div>
                          )}
                          <span className={isVotedOption ? 'text-[#fca311]' : 'text-white'}>
                            {option.text}
                          </span>
                        </div>

                        <span className="font-mono text-xs text-slate-400">
                          {option.votes} votes ({percentage}%)
                        </span>
                      </div>

                      {/* Percentage Bar */}
                      <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isVotedOption
                              ? 'bg-[#fca311]'
                              : 'bg-gradient-to-r from-blue-900 to-indigo-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <BarChart2 className="h-4 w-4 text-[#fca311]" />
                  <span>Total Participation: <strong>{poll.totalVotes} Votes</strong></span>
                </div>

                {!hasVoted ? (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => handleVote(poll.id)}
                  >
                    <Vote className="h-4 w-4" />
                    <span>Submit My Vote</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>You cast your vote</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
