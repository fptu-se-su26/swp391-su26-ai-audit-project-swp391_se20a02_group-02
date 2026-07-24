import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card } from './primitives/Card';
import { Badge } from './primitives/Badge';
import { cn } from '@/utils';

export interface ExecutiveSummaryCardProps {
  title?: string;
  summary: string;
  businessImpact?: string;
  urgency?: 'IMMEDIATE' | 'SEASONAL' | 'ROUTINE';
  confidence?: {
    score: number;
    rating: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  keyTakeaways?: string[];
  className?: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  title = 'Tóm Tắt Chiến Lược & Phát Hiện AI Chính',
  summary,
  businessImpact,
  urgency = 'ROUTINE',
  confidence,
  keyTakeaways,
  className,
}) => {
  const urgencyBadgeVariant = {
    IMMEDIATE: 'critical',
    SEASONAL: 'warning',
    ROUTINE: 'info',
  } as const;

  const urgencyLabels = {
    IMMEDIATE: 'Xử Lý Khẩn Cấp',
    SEASONAL: 'Cơ Hội Theo Mùa',
    ROUTINE: 'Thông Tin Tiêu Chuẩn',
  };

  const confidenceLabels = {
    HIGH: 'Rất Cao',
    MEDIUM: 'Trung Bình',
    LOW: 'Thấp',
  };

  const confScore = confidence?.score !== undefined ? confidence.score : 0.95;
  const confRating = confidence?.rating || 'HIGH';

  return (
    <Card
      variant="glass"
      hoverEffect={false}
      className={cn(
        'p-6 sm:p-7 border rounded-3xl relative overflow-hidden transition-all duration-300',
        'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-950',
        'border-indigo-200/80 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/5',
        className
      )}
    >
      {/* Decorative Copilot Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Card Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-indigo-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Copilot AI Executive Briefing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={urgencyBadgeVariant[urgency]}>
            {urgencyLabels[urgency]}
          </Badge>
          <Badge variant="indigo" icon={<ShieldCheck className="w-3 h-3 text-indigo-500" />}>
            Độ tin cậy {confidenceLabels[confRating]} ({Math.round(confScore * 100)}%)
          </Badge>
        </div>
      </div>

      {/* Main Narrative Text */}
      <div className="space-y-4">
        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
          {summary}
        </p>

        {/* Highlighted Business Impact Callout */}
        {businessImpact && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Tác Động Tài Chính Dự Kiến
              </span>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {businessImpact}
              </p>
            </div>
          </div>
        )}

        {/* Key Takeaways Checklist */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Các Điểm Ghi Nhận Chiến Lược Quan Trọng:
            </span>
            <ul className="space-y-2">
              {keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
