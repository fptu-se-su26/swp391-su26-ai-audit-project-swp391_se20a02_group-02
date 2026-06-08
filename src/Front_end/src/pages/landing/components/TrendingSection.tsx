import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Car, Star, Shield, Zap, TrendingUp, MapPin, BadgeCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import type { TrendingVehicle } from '@/services/homeService';
import { formatCurrency } from '@/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] ${className}`} />
);

interface TrendingSectionProps {
  vehicles: TrendingVehicle[];
  loading: boolean;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ vehicles, loading }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">🔥 Popular Right Now</span>
            <h2 className="font-bold text-3xl md:text-5xl text-slate-900 dark:text-white">Trending Vehicles</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Most booked on LuxeWay this week</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-slate-900 dark:hover:border-amber-450 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button onClick={() => scroll(1)} className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-slate-900 dark:hover:border-amber-450 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </motion.div>
 
        <div ref={ref} className="flex gap-6 overflow-x-auto pb-6 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-80 h-[28rem]" />)
            : vehicles.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex-shrink-0 w-80 bg-white dark:bg-slate-900/40 border border-slate-105 dark:border-slate-850/80 rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-350"
                onClick={() => navigate(`/vehicles/${v.id}`)}
              >
                <div className="relative h-56 overflow-hidden bg-slate-950">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Car className="w-14 h-14 text-slate-700" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {v.isOwnerVerified && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm border border-blue-500/20">
                        <BadgeCheck className="w-3 h-3" /> KYC Verified
                      </span>
                    )}
                    {v.instantBook && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm border border-emerald-500/20">
                        <Zap className="w-3 h-3 fill-white text-emerald-600" /> Instant Book
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 dark:border-slate-800">
                    <p className="text-white text-xs font-black">{formatCurrency(v.pricePerDay)}<span className="text-white/60 text-[10px] font-medium">/d</span></p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-bold uppercase tracking-widest">{v.brand}</p>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug mb-3 group-hover:text-amber-500 transition-colors truncate">{v.name}</h3>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Number(v.rating).toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400">({v.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>{v.totalBookings} trips</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-450" /> {v.city}
                  </p>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
