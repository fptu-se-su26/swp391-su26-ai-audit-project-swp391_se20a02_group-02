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
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

interface TrendingSectionProps {
  vehicles: TrendingVehicle[];
  loading: boolean;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ vehicles, loading }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">🔥 Popular Right Now</span>
            <h2 className="font-bold text-3xl md:text-5xl text-[#0F172A]">Trending Vehicles</h2>
            <p className="text-slate-500 mt-1 text-base">Most booked on LuxeWay this week</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#0F172A] transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={() => scroll(1)} className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#0F172A] transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </motion.div>
 
        <div ref={ref} className="flex gap-6 overflow-x-auto pb-6 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-80 h-[28rem] rounded-2xl" />)
            : vehicles.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex-shrink-0 w-80 bg-white border border-slate-100 rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-350"
                onClick={() => navigate(`/vehicles/${v.id}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Car className="w-14 h-14 text-slate-300" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {v.isOwnerVerified && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                        <BadgeCheck className="w-3.5 h-3.5" /> KYC
                      </span>
                    )}
                    {v.instantBook && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-black text-[11px] font-black uppercase tracking-wider shadow-sm">
                        <Zap className="w-3.5 h-3.5" /> Instant
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-xl">
                    <p className="text-white text-sm font-black">{formatCurrency(v.pricePerDay)}<span className="text-white/60 text-xs font-medium">/day</span></p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-widest">{v.brand}</p>
                  <h3 className="font-extrabold text-[#0F172A] text-base leading-snug mb-3 group-hover:text-amber-500 transition-colors truncate">{v.name}</h3>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-700">{Number(v.rating).toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({v.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>{v.totalBookings} bookings</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.city}
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
