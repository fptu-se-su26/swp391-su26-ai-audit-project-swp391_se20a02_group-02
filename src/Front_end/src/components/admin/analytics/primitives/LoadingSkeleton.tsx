import React from 'react';
import { cn } from '@/utils';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'chart' | 'table' | 'text';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'chart') {
    return (
      <div
        className={cn(
          'w-full h-64 rounded-3xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse p-6 flex flex-col justify-between',
          className
        )}
        aria-busy="true"
        aria-label="Loading chart data"
      >
        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded-md" />
        <div className="flex items-end gap-3 h-40">
          <div className="flex-1 h-3/4 bg-slate-300 dark:bg-slate-700 rounded-t-lg" />
          <div className="flex-1 h-1/2 bg-slate-300 dark:bg-slate-700 rounded-t-lg" />
          <div className="flex-1 h-full bg-slate-300 dark:bg-slate-700 rounded-t-lg" />
          <div className="flex-1 h-2/3 bg-slate-300 dark:bg-slate-700 rounded-t-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className={cn(
          'w-full rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse',
          className
        )}
        aria-busy="true"
        aria-label="Loading table data"
      >
        <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
        {items.map((_, i) => (
          <div key={i} className="flex justify-between gap-4 py-2 border-b dark:border-slate-800">
            <div className="h-3 w-1/3 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-3 w-1/4 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2 animate-pulse', className)} aria-busy="true">
        {items.map((_, i) => (
          <div key={i} className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)} aria-busy="true">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse space-y-3"
        >
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-3 w-full bg-slate-300 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
};
