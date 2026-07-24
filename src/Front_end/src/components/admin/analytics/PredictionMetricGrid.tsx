import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Clock, Calendar, BarChart3, Target } from 'lucide-react';
import { Card } from './primitives/Card';
import { Badge } from './primitives/Badge';
import { cn } from '@/utils';

export interface TelemetryMetricsPayload {
  confidence?: number;
  confidenceRating?: 'HIGH' | 'MEDIUM' | 'LOW';
  modelName?: string;
  inferenceTimeMs?: number;
  trainingWindowDays?: number;
  mape?: number;
  r2Score?: number;
}

export interface PredictionMetricGridProps {
  telemetryMetrics?: TelemetryMetricsPayload;
  confidence?: number;
  confidenceRating?: 'HIGH' | 'MEDIUM' | 'LOW';
  modelName?: string;
  inferenceTimeMs?: number;
  trainingWindowDays?: number;
  mape?: number;
  r2Score?: number;
  className?: string;
}

export const PredictionMetricGrid: React.FC<PredictionMetricGridProps> = ({
  telemetryMetrics,
  confidence: confidenceProp,
  confidenceRating: ratingProp,
  modelName: modelProp,
  inferenceTimeMs: inferenceProp,
  trainingWindowDays: windowProp,
  mape: mapeProp,
  r2Score: r2Prop,
  className,
}) => {
  const confidence = telemetryMetrics?.confidence ?? confidenceProp;
  const rating = telemetryMetrics?.confidenceRating ?? ratingProp ?? 'HIGH';
  const modelName = telemetryMetrics?.modelName ?? modelProp;
  const inferenceTimeMs = telemetryMetrics?.inferenceTimeMs ?? inferenceProp;
  const trainingWindowDays = telemetryMetrics?.trainingWindowDays ?? windowProp;
  const mape = telemetryMetrics?.mape ?? mapeProp;
  const r2Score = telemetryMetrics?.r2Score ?? r2Prop;

  if (
    confidence === undefined &&
    modelName === undefined &&
    inferenceTimeMs === undefined &&
    mape === undefined &&
    r2Score === undefined
  ) {
    return null;
  }

  const ratingText = {
    HIGH: 'Rất Cao',
    MEDIUM: 'Trung Bình',
    LOW: 'Thấp',
  };

  const metrics = [
    ...(confidence !== undefined
      ? [
          {
            id: 'confidence',
            title: 'Độ Tin Cậy',
            value: `${Math.round(confidence * 100)}%`,
            subtitle: `Mức độ ${ratingText[rating]}`,
            icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
            badge: <Badge variant="success">{ratingText[rating]}</Badge>,
          },
        ]
      : []),
    ...(modelName
      ? [
          {
            id: 'model',
            title: 'Mô Hình AI',
            value: modelName,
            subtitle: 'Thuật toán Backend',
            icon: <Cpu className="w-4 h-4 text-indigo-500" />,
            badge: <Badge variant="indigo">Production API</Badge>,
          },
        ]
      : []),
    ...(inferenceTimeMs !== undefined
      ? [
          {
            id: 'inference',
            title: 'Tốc Độ Suy Luận',
            value: `${inferenceTimeMs} ms`,
            subtitle: 'Độ trễ API',
            icon: <Clock className="w-4 h-4 text-purple-500" />,
            badge: <Badge variant="slate">Realtime</Badge>,
          },
        ]
      : []),
    ...(trainingWindowDays !== undefined
      ? [
          {
            id: 'training',
            title: 'Cửa Sổ Huấn Luyện',
            value: `${trainingWindowDays} Ngày`,
            subtitle: 'Dữ liệu lịch sử DB',
            icon: <Calendar className="w-4 h-4 text-amber-500" />,
            badge: <Badge variant="warning">{trainingWindowDays} Ngày</Badge>,
          },
        ]
      : []),
    ...(mape !== undefined
      ? [
          {
            id: 'mape',
            title: 'Chỉ Số Lỗi MAPE',
            value: `${mape}%`,
            subtitle: 'Sai số tuyệt đối TB',
            icon: <Target className="w-4 h-4 text-sky-500" />,
            badge: <Badge variant="info">Telemetry API</Badge>,
          },
        ]
      : []),
    ...(r2Score !== undefined
      ? [
          {
            id: 'r2',
            title: 'Hệ Số R² Score',
            value: `${r2Score.toFixed(2)}`,
            subtitle: 'Độ giải thích biến số',
            icon: <BarChart3 className="w-4 h-4 text-emerald-500" />,
            badge: <Badge variant="success">R² = {r2Score.toFixed(2)}</Badge>,
          },
        ]
      : []),
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5', className)}>
      {metrics.map((m, idx) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
        >
          <Card
            variant="default"
            hoverEffect
            className="p-4 flex flex-col justify-between gap-2.5 h-full border rounded-2xl"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate">
                {m.title}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex-shrink-0">
                {m.icon}
              </div>
            </div>

            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {m.value}
              </div>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {m.subtitle}
              </p>
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-start">
              {m.badge}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
