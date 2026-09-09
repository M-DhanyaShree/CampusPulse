import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="h-8 w-8 text-[#fca311] animate-spin" />
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
};
