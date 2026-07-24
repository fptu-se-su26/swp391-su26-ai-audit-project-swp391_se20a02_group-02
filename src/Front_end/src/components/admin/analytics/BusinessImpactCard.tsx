import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, Car, Award } from 'lucide-react';
import { Card } from './primitives/Card';
import { cn, formatCurrency } from '@/utils';

export interface BusinessImpactMetric {
  revenueOpportunity?: number;
  occupancyRate?: number;
  bookingsDelta?: number;
  roiPercentage?: number;
  trendDirection?: 'UP' | 'DOWN' | 'STABLE';
}

export interface BusinessImpactCardProps {
  title?: string;
  subtitle?: string;
  metrics: BusinessImpactMetric;
  className?: string;
}

export const BusinessImpactCard: React.FC<BusinessImpactCardProps> = ({
  title = 'Tác Động Kinh Doanh & Dự Báo ROI',
  subtitle = 'Ước tính doanh thu tăng thêm và hiệu suất lấp đầy hạm đội xe',
  metrics,
  className,
}) => {
  const {
    revenueOpportunity = 14500000,
    occupancyRate = 78.5,
    bookingsDelta = 12,
    roiPercentage = 22.4,
    trendDirection = 'UP',
  } = metrics;

  const isRevenuePositive = revenueOpportunity >= 0;
  const isRoiPositive = roiPercentage >= 0;

  return (
    <Card
      variant="default"
      hoverEffect={false}
      className={cn('p-6 rounded-3xl border space-y-5', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            {title}
          </h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
            trendDirection === 'UP'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : trendDirection === 'DOWN'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
          )}
        >
          {trendDirection === 'UP' ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{trendDirection === 'UP' ? 'Tăng Trưởng Tích Cực' : 'Sụt Giảm Vận Hành'}</span>
        </div>
      </div>

      {/* Grid of 4 Key Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Revenue Opportunity */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Cơ Hội Doanh Thu
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'text-base sm:text-lg font-black tracking-tight',
              isRevenuePositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {isRevenuePositive ? '+' : ''}
            {formatCurrency(revenueOpportunity)}
          </motion.div>
          <span className="text-[9px] font-semibold text-slate-400 block">
            {isRevenuePositive ? 'Doanh thu thuần tăng thêm' : 'Nguy cơ sụt giảm doanh thu'}
          </span>
        </div>

        {/* 2. Projected ROI */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              ROI Kỳ Vọng
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className={cn(
              'text-base sm:text-lg font-black tracking-tight',
              isRoiPositive
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {isRoiPositive ? '+' : ''}
            {roiPercentage.toFixed(1)}%
          </motion.div>
          <span className="text-[9px] font-semibold text-slate-400 block">
            Hiệu quả chiến lược AI
          </span>
        </div>

        {/* 3. Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Lấp Đầy Hạm Đội
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-base sm:text-lg font-black tracking-tight text-sky-600 dark:text-sky-400"
          >
            {occupancyRate.toFixed(1)}%
          </motion.div>
          <span className="text-[9px] font-semibold text-slate-400 block">
            Tỷ lệ xe đang được thuê
          </span>
        </div>

        {/* 4. Bookings Volume Delta */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Biến Động Thuê Xe/Ngày
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-base sm:text-lg font-black tracking-tight text-amber-600 dark:text-amber-400"
          >
            +{bookingsDelta} chuyến/ngày
          </motion.div>
          <span className="text-[9px] font-semibold text-slate-400 block">
            Lượt đặt xe tăng thêm
          </span>
        </div>
      </div>
    </Card>
  );
};
