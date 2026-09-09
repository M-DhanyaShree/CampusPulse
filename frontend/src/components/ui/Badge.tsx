import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'danger'
    | 'warning'
    | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    secondary: 'bg-[#14213d] text-blue-200 border-blue-900/40',
    accent: 'bg-[#fca311]/15 text-[#fca311] border-[#fca311]/30 font-semibold',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-medium',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium',
    outline: 'border-white/20 text-white bg-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none select-none whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
