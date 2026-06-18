import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Promotion } from '@/services/homeService';
import { useUIStore } from '@/store';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

interface PromotionSectionProps {
  promotions: Promotion[];
  loading: boolean;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({ promotions, loading }) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const language = useUIStore((s: any) => s.language);

  const translateCta = (text: string) => {
    const upper = text?.toUpperCase();
    if (language === 'ja') {
      if (upper === 'BOOK NOW') return '今すぐ予約';
      if (upper === 'SEE DEALS') return 'キャンペーンを見る';
      if (upper === 'GET COUPON') return 'クーポンを取得';
    }
    if (language === 'ko') {
      if (upper === 'BOOK NOW') return '지금 예약하기';
      if (upper === 'SEE DEALS') return '특가 보기';
      if (upper === 'GET COUPON') return '쿠폰 받기';
    }
    if (language === 'vi') {
      if (upper === 'BOOK NOW') return 'ĐẶT NGAY';
      if (upper === 'SEE DEALS') return 'XEM ƯU ĐÃI';
      if (upper === 'GET COUPON') return 'NHẬN MÃ';
    }
    return text;
  };

  useEffect(() => {
    if (promotions.length <= 1) return;
    const t = setInterval(() => setActive(p => (p + 1) % promotions.length), 5500);
    return () => clearInterval(t);
  }, [promotions.length]);

  if (!loading && promotions.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">{language === 'ja' ? '現在のオファー' : language === 'ko' ? '현재 혜택' : language === 'vi' ? 'Ưu Đãi Hiện Tại' : 'Current Offers'}</span>
            <h2 className="font-bold text-3xl md:text-5xl text-[#0F172A]">{language === 'ja' ? 'お得なキャンペーン' : language === 'ko' ? '특가 및 프로모션' : language === 'vi' ? 'Khuyến Mãi & Ưu Đãi' : 'Deals & Promotions'}</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-semibold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition-colors">
            {language === 'ja' ? 'すべて見る' : language === 'ko' ? '모두 보기' : language === 'vi' ? 'Xem Tất Cả' : 'View All'} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
 
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Mobile: carousel */}
            <div className="md:hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={promotions[active]?.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-3xl overflow-hidden h-80 cursor-pointer"
                  onClick={() => navigate(promotions[active]?.ctaUrl ?? '/marketplace')}
                >
                  <img src={promotions[active]?.imageUrl} alt={promotions[active]?.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {promotions[active]?.discountPercent > 0 && (
                      <span className="inline-block px-3 py-1 bg-amber-400 text-black text-xs font-black rounded-full mb-3">
                        {promotions[active].discountPercent}% OFF
                      </span>
                    )}
                    <h3 className="font-bold text-white text-xl leading-tight">{promotions[active]?.title}</h3>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-4">
                {promotions.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`transition-all rounded-full ${i === active ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-slate-300'}`} />
                ))}
              </div>
            </div>
 
            {/* Desktop: grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="hidden md:grid grid-cols-3 gap-6"
            >
              {promotions.slice(0, 3).map((promo) => (
                <motion.div
                  key={promo.id}
                  variants={staggerItem}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative rounded-2xl overflow-hidden h-80 cursor-pointer group shadow-lg"
                  onClick={() => navigate(promo.ctaUrl ?? '/marketplace')}
                >
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {promo.discountPercent > 0 && (
                      <span className="px-3 py-1 bg-amber-400 text-black text-xs font-black rounded-full">
                        {promo.discountPercent}% OFF
                      </span>
                    )}
                    {promo.badgeText && (
                      <span className="px-3 py-1 bg-white dark:bg-slate-900/20 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                        {promo.badgeText}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-bold text-white text-lg md:text-xl leading-tight mb-3">{promo.title}</h3>
                    <button className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {translateCta(promo.ctaText)} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default PromotionSection;
