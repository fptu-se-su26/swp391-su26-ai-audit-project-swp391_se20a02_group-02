import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils';

export interface StatisticCardProps {
  title: string;
  value: string | number;
  description?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  description,
  badge,
  footer,
  className,
}) => {
  return (
    <Card hoverEffect variant="default" className={cn('p-6 space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h4>
        {badge}
      </div>

      <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>

      {description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {description}
        </p>
      )}

      {footer && <div className="pt-3 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
    </Card>
  );
};
