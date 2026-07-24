import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { RecommendationCard, RecommendationItem } from './RecommendationCard';
import { Section } from './primitives/Section';
import { cn } from '@/utils';

export interface RecommendationListProps {
  title?: string;
  subtitle?: string;
  items?: RecommendationItem[];
  onExecuteRecommendation?: (recommendation: RecommendationItem) => Promise<void> | void;
  className?: string;
}

const defaultRecommendations: RecommendationItem[] = [
  {
    id: 'rec-1',
    title: 'Áp Dụng Tăng Giá Linh Hoạt Cuối Tuần Dòng Xe SUV (+8%)',
    description: 'Dự báo Weather AI nắng ráo thúc đẩy nhu cầu xe du lịch SUV tăng +18.5%. Tận dụng tỷ lệ chuyển đổi cao để tối ưu doanh thu.',
    priority: 'HIGH',
    expectedImpact: '+14,500,000 VNĐ Tăng Trưởng',
    actionLabel: 'Kích Hoạt Tăng Giá Dòng SUV',
    actionType: 'PRICING',
  },
  {
    id: 'rec-2',
    title: 'Triển Khai Chiến Dịch Push Notification Chăm Sóc Khách Hàng',
    description: 'Gửi mã ưu đãi giảm 15% tới 3 tài khoản khách hàng được hệ thống cảnh báo có điểm rủi ro rời bỏ cao (Score ≥ 60).',
    priority: 'HIGH',
    expectedImpact: 'Giảm Rủi Ro 3 Khách Hàng',
    actionLabel: 'Gửi Thông Báo Ưu Đãi',
    actionType: 'MARKETING',
  },
  {
    id: 'rec-3',
    title: 'Điều Chuyển 5 Xe Dòng Economy Sang Chi Nhánh Đà Nẵng',
    description: 'Xe phân khúc Economy hiện có tỷ lệ lấp đầy thấp (30%). Chuyển bớt xe về cụm điểm du lịch biển đang có nhu cầu cao.',
    priority: 'MEDIUM',
    expectedImpact: '+12% Tỷ Lệ Lấp Đầy',
    actionLabel: 'Kích Hoạt Điều Chuyển Xe',
    actionType: 'FLEET',
  },
];

export const RecommendationList: React.FC<RecommendationListProps> = ({
  title = 'Khuyến Nghị Hành Động Vận Hành Từ AI',
  subtitle = 'Các đề xuất chiến lược trực tiếp được tính toán tự động qua thuật toán máy học',
  items = defaultRecommendations,
  onExecuteRecommendation,
  className,
}) => {
  return (
    <Section title={title} subtitle={subtitle} className={cn('space-y-4', className)}>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
              >
                <RecommendationCard recommendation={item} onExecute={onExecuteRecommendation} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-500">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold">Hiện không có khuyến nghị vận hành nào cần xử lý khẩn cấp.</span>
        </div>
      )}
    </Section>
  );
};
