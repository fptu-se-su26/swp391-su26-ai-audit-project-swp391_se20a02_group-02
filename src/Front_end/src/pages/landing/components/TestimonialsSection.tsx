import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Quote } from 'lucide-react';
import type { TestimonialsData } from '@/services/homeService';

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
  <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} />
);

interface TestimonialsSectionProps {
  data: TestimonialsData | null;
  loading: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ data, loading }) => {
  const [idx, setIdx] = useState(0);
  const reviews = data?.reviews ?? [];
 
  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => setIdx(p => (p + 1) % reviews.length), 4500);
    return () => clearInterval(t);
  }, [reviews.length]);
 
  return (
    <section className="py-24 bg-[#0F172A] overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3 block">What Customers Say</span>
          <h2 className="font-bold text-3xl md:text-5xl text-white mb-5">Customer Testimonials</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-white font-black text-4xl md:text-5xl ml-2">{data?.averageRating?.toFixed(1) ?? '4.9'}</span>
            <span className="text-slate-400 text-sm md:text-base">from {data?.totalReviews?.toLocaleString() ?? '0'} verified reviews</span>
          </div>
        </motion.div>
 
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 bg-white dark:bg-slate-900/5 rounded-2xl" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Quote className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No reviews yet. Be the first to book and review!</p>
            <Link to="/marketplace" className="mt-5 inline-block text-amber-400 font-semibold text-base hover:underline">Browse Vehicles →</Link>
          </div>
        ) : (
          <>
            {/* Desktop grid */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hidden md:grid grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((r) => (
                <motion.div key={r.id} variants={staggerItem} className="p-8 rounded-3xl border border-white/10 bg-white dark:bg-slate-900/5 backdrop-blur-sm flex flex-col animate-hover">
                  <Quote className="w-8 h-8 text-amber-400 mb-4 opacity-70" />
                  <p className="text-white/90 text-sm md:text-base leading-relaxed flex-1 mb-6 line-clamp-4 font-medium italic">"{r.comment}"</p>
                  <div className="flex items-center gap-4 pt-5 border-t border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700 overflow-hidden flex-shrink-0 border border-white/10">
                      {r.avatar ? <img src={r.avatar} alt={r.customerName} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-base">{r.customerName?.[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-white text-sm truncate">{r.customerName}</p>
                      <p className="text-slate-400 text-xs truncate">{r.rentedVehicle}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={reviews[idx]?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white dark:bg-slate-900/5"
                >
                  <Quote className="w-6 h-6 text-amber-400 mb-3 opacity-70" />
                  <p className="text-white/80 text-sm leading-relaxed mb-5">{reviews[idx]?.comment}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                      {reviews[idx]?.avatar
                        ? <img src={reviews[idx].avatar} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">{reviews[idx]?.customerName?.[0]}</div>}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{reviews[idx]?.customerName}</p>
                      <p className="text-slate-400 text-[10px]">{reviews[idx]?.rentedVehicle}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-4">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={`transition-all rounded-full ${i === idx ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white dark:bg-slate-900/20'}`} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
