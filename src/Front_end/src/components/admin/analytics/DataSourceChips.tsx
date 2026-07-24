import React from 'react';
import { Database, CloudSun, Cpu, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface DataSourceItem {
  id: string;
  name: string;
  type: 'DATABASE' | 'WEATHER' | 'ML_MODEL' | 'GOONG_MAPS';
  updatedAt?: string;
}

export interface DataSourceChipsProps {
  sources?: DataSourceItem[];
  className?: string;
}

const defaultSources: DataSourceItem[] = [
  { id: '1', name: 'CSDL Lịch Sử Analytics 90 Ngày', type: 'DATABASE', updatedAt: 'Vừa cập nhật' },
  { id: '2', name: 'Dịch Vụ AI Dự Báo Thời Tiết', type: 'WEATHER', updatedAt: '5 phút trước' },
  { id: '3', name: 'Mô Hình Kết hợp XGBoost + Prophet', type: 'ML_MODEL', updatedAt: 'Trực tiếp' },
];

export const DataSourceChips: React.FC<DataSourceChipsProps> = ({
  sources = defaultSources,
  className,
}) => {
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'WEATHER': return <CloudSun className="w-3 h-3 text-amber-500" />;
      case 'ML_MODEL': return <Cpu className="w-3 h-3 text-indigo-500" />;
      case 'DATABASE': default: return <Database className="w-3 h-3 text-sky-500" />;
    }
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap text-slate-500', className)}>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-emerald-500" />
        Nguồn Dữ Liệu Mô Hình:
      </span>
      {sources.map((src) => (
        <span
          key={src.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          {getSourceIcon(src.type)}
          <span>{src.name}</span>
          {src.updatedAt && <span className="opacity-60 text-[8px]">({src.updatedAt})</span>}
        </span>
      ))}
    </div>
  );
};
