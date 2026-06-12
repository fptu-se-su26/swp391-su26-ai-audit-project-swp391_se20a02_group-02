import React from 'react';
import { cn } from '@/utils';

export type BadgeStatusType = 'rent' | 'pending' | 'inactive' | 'available' | 'active' | 'completed' | 'cancelled' | 'maintenance' | 'succeeded' | 'failed';

interface StatusBadgeProps {
  status: BadgeStatusType | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normStatus = (status || '').toLowerCase();

  const getStyleConfig = (type: string) => {
    switch (type) {
      case 'rent':
      case 'available':
      case 'active':
      case 'succeeded':
        return {
          wrapper: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
          dot: 'bg-emerald-500 dark:bg-emerald-400',
          defaultLabel: 'For Rent',
        };
      case 'pending':
      case 'maintenance':
        return {
          wrapper: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
          dot: 'bg-amber-500 dark:bg-amber-400',
          defaultLabel: 'Pending',
        };
      case 'inactive':
      case 'cancelled':
      case 'failed':
      default:
        return {
          wrapper: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30',
          dot: 'bg-slate-400 dark:bg-slate-500',
          defaultLabel: 'Inactive',
        };
    }
  };

  const config = getStyleConfig(normStatus);
  const displayLabel = label || config.defaultLabel;

  return (
    <span className={cn('lw-status-badge border', config.wrapper, className)}>
      <span className={cn('dot', config.dot)} />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
