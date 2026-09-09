import React from 'react';
import { ComplaintStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, XCircle, Flame } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ComplaintStatus; className?: string }> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'submitted':
      return (
        <Badge variant="outline" className={`border-slate-500/50 text-slate-300 gap-1.5 ${className}`}>
          <Clock className="h-3 w-3" />
          <span>Submitted</span>
        </Badge>
      );
    case 'triaged':
      return (
        <Badge variant="secondary" className={`text-sky-400 border-sky-500/30 gap-1.5 ${className}`}>
          <AlertCircle className="h-3 w-3" />
          <span>Triaged</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="accent" className={`gap-1.5 ${className}`}>
          <PlayCircle className="h-3 w-3" />
          <span>In Progress</span>
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="success" className={`gap-1.5 ${className}`}>
          <CheckCircle2 className="h-3 w-3" />
          <span>Resolved</span>
        </Badge>
      );
    case 'escalated':
      return (
        <Badge variant="danger" className={`gap-1.5 ${className}`}>
          <Flame className="h-3 w-3 animate-pulse" />
          <span>Escalated</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className={`border-rose-500/40 text-rose-400 gap-1.5 ${className}`}>
          <XCircle className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};
