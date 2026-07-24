import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils';

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'critical';
  action?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  variant = 'info',
  action,
  className,
}) => {
  const variantBorder = {
    info: 'border-l-4 border-l-sky-500',
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    critical: 'border-l-4 border-l-rose-500',
  };

  return (
    <Card
      hoverEffect={false}
      variant="default"
      className={cn('p-5 flex items-start gap-4', variantBorder[variant], className)}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 space-y-1">
        <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          {title}
        </h5>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {description}
        </p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </Card>
  );
};
