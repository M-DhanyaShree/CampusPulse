import React from 'react';
import { ComplaintUrgency } from '../../types';
import { Badge } from '../ui/Badge';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const UrgencyBadge: React.FC<{ urgency: ComplaintUrgency; className?: string }> = ({
  urgency,
  className,
}) => {
  switch (urgency) {
    case 'critical':
      return (
        <Badge
          variant="danger"
          className={`bg-rose-950/60 text-rose-300 border-rose-500/50 font-bold gap-1.5 shadow-sm shadow-rose-950/50 ${className}`}
        >
          <AlertOctagon className="h-3 w-3 text-rose-400 animate-pulse" />
          <span>Critical</span>
        </Badge>
      );
    case 'high':
      return (
        <Badge
          variant="warning"
          className={`bg-amber-950/50 text-amber-300 border-amber-500/40 font-semibold gap-1.5 ${className}`}
        >
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span>High Urgency</span>
        </Badge>
      );
    case 'medium':
      return (
        <Badge
          variant="secondary"
          className={`bg-[#14213d] text-blue-300 border-blue-800/40 gap-1.5 ${className}`}
        >
          <span>Medium</span>
        </Badge>
      );
    case 'low':
      return (
        <Badge
          variant="outline"
          className={`border-slate-700 text-slate-400 gap-1.5 ${className}`}
        >
          <Info className="h-2.5 w-2.5" />
          <span>Low</span>
        </Badge>
      );
    default:
      return <Badge>{urgency}</Badge>;
  }
};
