import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from './primitives/Badge';
import { Button } from './primitives/Button';
import { cn } from '@/utils';

export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RecommendationItem {
  id: string;
  title: string;
  priority: RecommendationPriority;
  reason?: string;
  description?: string;
  impact?: string;
  expectedImpact?: string;
  action?: string;
  actionLabel?: string;
  actionType?: 'PRICING' | 'MARKETING' | 'FLEET' | 'SYSTEM';
  source?: string;
}

export interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onExecute?: (recommendation: RecommendationItem) => Promise<void> | void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onExecute,
  className,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  const priorityVariant = {
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'info',
  } as const;

  const priorityLabels = {
    HIGH: 'Mức Ưu Tiên Cao',
    MEDIUM: 'Mức Trung Bình',
    LOW: 'Khuyên Dùng',
  };

  const priorityIcon = {
    HIGH: <AlertTriangle className="w-3 h-3 text-rose-500" />,
    MEDIUM: <Zap className="w-3 h-3 text-amber-500" />,
    LOW: <TrendingUp className="w-3 h-3 text-sky-500" />,
  };

  const displayImpact = recommendation.impact || recommendation.expectedImpact || 'Tối Ưu Hiệu Suất';
  const displayReason = recommendation.reason || recommendation.description || '';
  const displayAction = recommendation.action || recommendation.actionLabel || 'Kích Hoạt Hành Động';

  const handleActionClick = async () => {
    if (!onExecute || isExecuted || isExecuting) return;
    setIsExecuting(true);
    try {
      await onExecute(recommendation);
      setIsExecuted(true);
    } catch (error) {
      console.error('Failed to execute recommendation action:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'p-5 rounded-2xl border transition-all duration-300 shadow-md flex flex-col justify-between gap-4',
        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
        isExecuted && 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30',
        className
      )}
    >
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={priorityVariant[recommendation.priority] || 'info'} icon={priorityIcon[recommendation.priority]}>
            {priorityLabels[recommendation.priority] || recommendation.priority}
          </Badge>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {displayImpact}
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mt-1">
          {recommendation.title}
        </h4>

        {displayReason && (
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            {displayReason}
          </p>
        )}

        {recommendation.source && (
          <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 italic">
            Nguồn: {recommendation.source}
          </p>
        )}
      </div>

      {/* Footer Action Trigger Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {isExecuted ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Đã Thực Thi Thành Công</span>
          </div>
        ) : (
          <Button
            variant={recommendation.priority === 'HIGH' ? 'primary' : 'secondary'}
            size="sm"
            isLoading={isExecuting}
            onClick={handleActionClick}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between"
          >
            <span>{displayAction}</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
};
