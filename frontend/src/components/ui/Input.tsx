import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>{label}</span>
            {hint && <span className="text-slate-500 font-normal">{hint}</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-xl glass-input px-3.5 py-2 text-sm text-white placeholder:text-slate-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>{label}</span>
            {hint && <span className="text-slate-500 font-normal">{hint}</span>}
          </label>
        )}
        <textarea
          rows={rows}
          className={cn(
            'flex w-full rounded-xl glass-input px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
