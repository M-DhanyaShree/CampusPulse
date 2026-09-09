import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { MOCK_NOTIFICATIONS } from '../../lib/api';
import { Notification } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Bell,
  CheckCheck,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Vote,
  MessageSquare,
} from 'lucide-react';
import { timeAgo } from '../../lib/utils';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Updated', 'All items marked as read.', 'info');
  };

  const markOne = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Campus Notifications & Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status alerts, broadcast notices, and campus survey announcements.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={markAllAsRead}>
          <CheckCheck className="h-4 w-4" />
          <span>Mark All Read</span>
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          let Icon = Bell;
          let iconColor = 'text-[#fca311]';
          let bgColor = 'bg-slate-900/60';

          if (n.type === 'status_updated') {
            Icon = CheckCircle2;
            iconColor = 'text-sky-400';
          } else if (n.type === 'sla_breach_warning') {
            Icon = Flame;
            iconColor = 'text-rose-400';
            bgColor = 'bg-rose-950/30 border-rose-500/30';
          } else if (n.type === 'poll_published') {
            Icon = Vote;
            iconColor = 'text-purple-400';
          } else if (n.type === 'comment_added') {
            Icon = MessageSquare;
            iconColor = 'text-emerald-400';
          }

          return (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-all border ${bgColor} ${
                !n.read ? 'border-l-4 border-l-[#fca311]' : 'border-white/10 opacity-80'
              }`}
            >
              <div className={`p-2.5 rounded-xl bg-slate-950/80 shrink-0 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-4 pt-2">
                  {n.complaintId && (
                    <Link
                      to={`/complaints/${n.complaintId}`}
                      onClick={() => markOne(n.id)}
                      className="text-xs text-[#fca311] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Ticket Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => markOne(n.id)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
