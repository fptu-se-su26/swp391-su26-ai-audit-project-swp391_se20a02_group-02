import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { Card } from './primitives/Card';
import { cn } from '@/utils';

export interface ReasoningFeatureItem {
  key?: string;
  name?: string;
  label?: string;
  importance?: number;
  importancePercentage?: number;
  impactDirection?: 'POSITIVE' | 'NEGATIVE';
  description?: string;
  icon?: React.ReactNode;
}

export interface AIReasoningCardProps {
  title?: string;
  subtitle?: string;
  features?: ReasoningFeatureItem[];
  defaultExpanded?: boolean;
  className?: string;
}

export const AIReasoningCard: React.FC<AIReasoningCardProps> = ({
  title = 'Trọng Số Đặc Trưng & Lý Giải Mô Hình AI (XAI)',
  subtitle = 'Bảng giải trình các biến số quan trọng tác động trực tiếp tới kết quả dự báo',
  features,
  defaultExpanded = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!features || features.length === 0) {
    return null;
  }

  return (
    <Card
      variant="default"
      hoverEffect={false}
      className={cn('p-6 rounded-3xl border space-y-4 transition-all duration-300', className)}
    >
      {/* Header Bar / Collapsible Trigger */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </h4>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Animated Collapsible Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden space-y-4 pt-1"
          >
            <div className="space-y-3.5">
              {features.map((item, idx) => {
                const itemLabel = item.label || item.name || `Biến số đặc trưng #${idx + 1}`;
                const val = item.importancePercentage ?? item.importance ?? 0;
                const isPositive = item.impactDirection !== 'NEGATIVE';
                const barColor = isPositive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500';

                return (
                  <div key={item.key || idx} className="space-y-1.5">
                    {/* Feature Title & Percentage */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        {item.icon || <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{itemLabel}</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        Trọng Số {typeof val === 'number' ? val.toFixed(1) : val}%
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', barColor)}
                      />
                    </div>

                    {/* Explanation Subtext */}
                    {item.description && (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pl-6">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Trust Note */}
            <div className="pt-3 border-t dark:border-slate-800 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Chỉ số trọng số SHAP Feature Importance được trích xuất từ dữ liệu phân tích Backend API.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
