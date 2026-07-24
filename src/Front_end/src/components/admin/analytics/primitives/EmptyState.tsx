import React from 'react';
import { Card } from './Card';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'All Systems Operating Normally',
  description = 'No active alerts, churn risks, or unexpected revenue anomalies detected.',
  icon = <ShieldCheck className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />,
  action,
  className,
}) => {
  return (
    <Card
      hoverEffect={false}
      variant="default"
      className={cn('p-8 flex flex-col items-center justify-center text-center gap-3', className)}
    >
      <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20">{icon}</div>
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
        {title}
      </h4>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
};
