import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className,
}) => {
  return (
    <Card hoverEffect variant="default" className={cn('p-5 flex flex-col justify-between gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
};
