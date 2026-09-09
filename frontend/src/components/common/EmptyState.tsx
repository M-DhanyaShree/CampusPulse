import React from 'react';
import { FolderX } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FolderX,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-white/5 space-y-4">
      <div className="p-3.5 rounded-2xl bg-[#14213d]/60 border border-white/10 text-[#fca311]">
        <Icon className="h-8 w-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-base font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
