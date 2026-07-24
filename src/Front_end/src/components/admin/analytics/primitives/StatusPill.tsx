import React from 'react';
import { cn } from '@/utils';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'warning' | 'critical' | 'offline' | 'idle';
  label: string;
  pulse?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  pulse = true,
  className,
  ...props
}) => {
  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dot-bg-emerald-400',
    warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 dot-bg-amber-400',
    critical: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dot-bg-rose-400',
    offline: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 dot-bg-slate-400',
    idle: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 dot-bg-indigo-400',
  };

  const dotColors = {
    active: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-rose-400',
    offline: 'bg-slate-400',
    idle: 'bg-indigo-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border',
        statusStyles[status],
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[status]
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[status])} />
      </span>
      <span>{label}</span>
    </span>
  );
};
