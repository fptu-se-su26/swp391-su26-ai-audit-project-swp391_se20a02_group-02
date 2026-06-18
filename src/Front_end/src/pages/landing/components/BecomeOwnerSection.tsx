import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, CheckCircle, Star, Sparkles } from 'lucide-react';
import type { OwnerStats } from '@/services/homeService';
import { formatCurrency } from '@/utils';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

interface BecomeOwnerSectionProps {
  ownerStats: OwnerStats | null;
}

export const BecomeOwnerSection: React.FC<BecomeOwnerSectionProps> = ({ ownerStats }) => {
  const [days, setDays] = useState(15);
  const [pricePerDay, setPricePerDay] = useState(800000);
  const estimatedRevenue = Math.round(days * pricePerDay * 0.8);

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden bg-[#0F172A] flex flex-col lg:flex-row border border-white/5">
          {/* Left */}
          <div className="lg:w-1/2 p-10 lg:p-14">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={staggerItem} className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3 block">
                LuxeWay for Owners
              </motion.span>
              <motion.h2 variants={staggerItem} className="font-bold text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                Turn Your Idle Vehicle<br />Into Monthly Income
              </motion.h2>
              <motion.p variants={staggerItem} className="text-slate-400 mb-10 leading-relaxed text-base md:text-lg">
                Join thousands of owners earning consistent income on LuxeWay. We handle verification, contracts, payments, and support — you just provide the vehicle.
              </motion.p>
 
              {/* Stats */}
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-5 mb-10">
                {[
                  { label: 'Avg Monthly Revenue', value: ownerStats ? formatCurrency(ownerStats.averageMonthlyRevenue) : '₫15M', icon: TrendingUp },
                  { label: 'Fleet Utilization', value: `${ownerStats?.vehicleUtilization?.toFixed(0) ?? 78}%`, icon: BarChart3 },
                  { label: 'Completed Bookings', value: ownerStats?.completedBookings?.toLocaleString() ?? '0', icon: CheckCircle },
                  { label: 'Owner Avg Rating', value: `${ownerStats?.averageRating?.toFixed(1) ?? 4.8}/5`, icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <motion.div key={label} variants={staggerItem}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/5 border border-white/10">
                    <Icon className="w-6 h-6 text-amber-400 mb-3" />
                    <p className="font-black text-white text-xl md:text-2xl mb-1">{value}</p>
                    <p className="text-slate-400 text-sm">{label}</p>
                  </motion.div>
                ))}
              </motion.div>
 
              {/* Earnings Calculator */}
              <motion.div variants={staggerItem} className="p-6 rounded-2xl bg-white dark:bg-slate-900/5 border border-white/10 mb-8">
                <p className="text-white font-extrabold text-base mb-5">Earnings Calculator</p>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-slate-355 text-sm w-36 flex-shrink-0">Days rented / month</label>
                  <input type="range" min={5} max={28} value={days} onChange={e => setDays(+e.target.value)}
                    className="flex-1 accent-amber-400" />
                  <span className="text-white font-black text-base w-8 text-right">{days}</span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-slate-355 text-sm w-36 flex-shrink-0">Price per day (₫)</label>
                  <input type="range" min={200000} max={2000000} step={50000} value={pricePerDay}
                    onChange={e => setPricePerDay(+e.target.value)}
                    className="flex-1 accent-amber-400" />
                  <span className="text-amber-400 font-black text-base w-24 text-right">{formatCurrency(pricePerDay)}</span>
                </div>
                <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-amber-400/10 border border-amber-400/30">
                  <span className="text-slate-300 text-sm font-semibold">Estimated monthly income</span>
                  <span className="font-black text-amber-400 text-xl md:text-2xl">{formatCurrency(estimatedRevenue)}</span>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Link to="/owner"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-sm text-black transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D547)' }}>
                  <Sparkles className="w-4 h-4" /> Start Earning Now
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right image */}
          <div className="lg:w-1/2 relative min-h-[280px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop"
              alt="Vehicle owner" loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/30 to-transparent lg:block hidden" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeOwnerSection;
