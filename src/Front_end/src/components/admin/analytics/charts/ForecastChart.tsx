import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn, formatCurrency } from '@/utils';
import { useUIStore } from '@/store';

export interface ForecastChartDataPoint {
  date: string;
  actual?: number | null;
  predicted?: number | null;
  lowerBound?: number | null;
  upperBound?: number | null;
  confidenceRange?: [number, number] | null;
}

export interface ForecastChartProps {
  data: ForecastChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  valuePrefix?: string;
  isCurrency?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1 dark:border-slate-800">
          Ngày {label}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'confidenceRange') return null;
          const formattedVal = isCurrency
            ? formatCurrency(entry.value || 0)
            : `${entry.value?.toLocaleString() || 0}`;

          return (
            <div key={index} className="flex items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-bold">{entry.name}:</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-white">
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  title = 'Biểu Đồ Dự Báo AI & Phân Tích Xu Hướng',
  subtitle = 'So sánh dữ liệu thực tế lịch sử với dự báo máy học (kèm khoảng tin cậy 95%)',
  height = 320,
  isCurrency = true,
  className,
}) => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((pt) => ({
    ...pt,
    confidenceRange:
      pt.lowerBound !== undefined && pt.upperBound !== undefined && pt.lowerBound !== null && pt.upperBound !== null
        ? [pt.lowerBound, pt.upperBound]
        : null,
  }));

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div
      className={cn(
        'p-6 rounded-3xl border shadow-xl transition-all duration-300 space-y-4',
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontWeight: '700', fill: textColor }}
              stroke="transparent"
              dy={5}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: '700', fill: textColor }}
              stroke="transparent"
              tickFormatter={(val) =>
                isCurrency ? `${(val / 1000000).toFixed(0)}M` : `${val}`
              }
            />
            <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '15px', fontSize: '11px', fontWeight: '700' }}
            />

            {/* Shaded 95% Confidence Interval Area */}
            <Area
              type="monotone"
              dataKey="confidenceRange"
              name="Khoảng Tin Cậy 95%"
              stroke="none"
              fill={isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.12)'}
            />

            {/* Upper Bound Reference Line */}
            <Line
              type="monotone"
              dataKey="upperBound"
              name="Biên Trên Dự Báo"
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="2 2"
              dot={false}
              activeDot={false}
            />

            {/* Lower Bound Reference Line */}
            <Line
              type="monotone"
              dataKey="lowerBound"
              name="Biên Dưới Dự Báo"
              stroke="#06b6d4"
              strokeWidth={1}
              strokeDasharray="2 2"
              dot={false}
              activeDot={false}
            />

            {/* Historical Actual Line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Thực Tế Lịch Sử"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />

            {/* AI Predicted Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="Dự Báo Máy Học AI"
              stroke="#6366f1"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#6366f1' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
