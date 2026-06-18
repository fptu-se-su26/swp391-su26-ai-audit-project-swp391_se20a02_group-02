import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Car, Users, Globe, Star } from 'lucide-react';
import type { HomeStats } from '@/services/homeService';
import { useUIStore } from '@/store';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// =====================================================
// SHARED SKELETON COMPONENT
// =====================================================
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} />
);

// =====================================================
// ANIMATED COUNTER
// =====================================================
const AnimatedCounter: React.FC<{ to: number; suffix?: string; duration?: number; decimal?: boolean }> = ({
  to, suffix = '', duration = 1.8, decimal = false,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || to === 0) return;
    let start = 0;
    const increment = to / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [started, to, duration]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = decimal
    ? count.toFixed(1)
    : count >= 1000 ? `${Math.floor(count / 1000)}K` : Math.floor(count).toLocaleString();

  return <span ref={ref}>{display}{suffix}</span>;
};

interface StatsBarProps {
  stats: HomeStats | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const language = useUIStore((s: any) => s.language);

  const getLabel = (type: string) => {
    if (language === 'ja') {
      if (type === 'vehicles') return '高品質の車両';
      if (type === 'clients') return '満足しているお客様';
      if (type === 'provinces') return '対応都道府県';
      if (type === 'rating') return '平均評価';
    }
    if (language === 'ko') {
      if (type === 'vehicles') return '고품질 차량';
      if (type === 'clients') return '만족한 고객';
      if (type === 'provinces') return '서비스 지역';
      if (type === 'rating') return '평균 평점';
    }
    if (language === 'vi') {
      if (type === 'vehicles') return 'XE CHẤT LƯỢNG';
      if (type === 'clients') return 'KHÁCH HÀNG HÀI LÒNG';
      if (type === 'provinces') return 'TỈNH THÀNH';
      if (type === 'rating') return 'ĐÁNH GIÁ TRUNG BÌNH';
    }
    if (type === 'vehicles') return 'QUALITY VEHICLES';
    if (type === 'clients') return 'HAPPY CLIENTS';
    if (type === 'provinces') return 'PROVINCES';
    return 'AVERAGE RATING';
  };

  return (
  <section className="bg-[#0F172A] py-12 border-t border-white/5">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {[
          { icon: Car, value: stats?.totalVehicles ?? 0, suffix: '+', label: getLabel('vehicles') },
          { icon: Users, value: stats?.totalCustomers ?? 0, suffix: '+', label: getLabel('clients') },
          { icon: Globe, value: stats?.provinces ?? 63, suffix: '', label: getLabel('provinces') },
          { icon: Star, value: stats?.averageRating ?? 4.9, suffix: '/5', label: getLabel('rating'), decimal: true },
        ].map(({ icon: Icon, value, suffix, label, decimal }) => (
          <motion.div key={label} variants={staggerItem} className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/5 border border-white/10 mb-3 group-hover:border-amber-400/40 transition-colors">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white font-mono tabular-nums mb-1">
              {stats ? (
                <AnimatedCounter to={value} suffix={suffix} decimal={decimal} />
              ) : (
                <Skeleton className="h-8 w-20 mx-auto bg-white dark:bg-slate-900/10" />
              )}
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
  );
};

export default StatsBar;
