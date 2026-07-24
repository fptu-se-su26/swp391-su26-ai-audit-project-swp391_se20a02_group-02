import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Car, ChevronDown, Star,
  Shield, Sparkles, FileText, Lock, BadgeCheck, Headphones
} from 'lucide-react';
import type { HomeStats } from '@/services/homeService';
import { useT } from '@/i18n/translations';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// =====================================================
// TRUST BADGE ROW
// =====================================================
const TrustBadges: React.FC = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
    {[
      { icon: BadgeCheck, label: 'KYC Verified Owners' },
      { icon: FileText, label: 'Digital Contracts' },
      { icon: Lock, label: 'VNPay Secured' },
      { icon: Headphones, label: '24/7 Support' },
    ].map(({ icon: Icon, label }) => (
      <div key={label} className="flex items-center gap-1.5 text-white/60 text-xs font-medium">
        <Icon className="w-3.5 h-3.5 text-amber-400" />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

// =====================================================
// HERO FLOATING METRIC CARDS
// =====================================================
const HeroFloatingCards: React.FC<{ stats: HomeStats | null }> = ({ stats }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-6">
    {[
      { icon: Star, value: stats?.averageRating?.toFixed(1) ?? '4.9', label: 'Avg Rating', color: 'text-amber-400' },
      { icon: Car, value: stats ? `${Math.floor(stats.totalVehicles / 100) * 100}+` : '1000+', label: 'Vehicles', color: 'text-sky-400' },
      { icon: Shield, value: `${stats?.totalBookings?.toLocaleString() ?? '15K'}+`, label: 'Protected Trips', color: 'text-emerald-400' },
    ].map(({ icon: Icon, value, label, color }) => (
      <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-white text-sm font-bold">{value}</span>
        <span className="text-white/60 text-xs">{label}</span>
      </div>
    ))}
  </div>
);

interface HeroSectionProps {
  stats: HomeStats | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  const navigate = useNavigate();
  const t = useT();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [heroImage, setHeroImage] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2560&auto=format&fit=crop',
  ];

  useEffect(() => {
    const timer = setInterval(() => setHeroImage(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (location) p.append('city', location);
    if (vehicleType) p.append('type', vehicleType);
    if (startDate) p.append('startDate', startDate);
    if (endDate) p.append('endDate', endDate);
    navigate(`/marketplace?${p.toString()}`);
  };

  return (
    <section className="relative h-screen min-h-[680px] max-h-[900px] overflow-hidden bg-[#0F172A]">
      {/* Background parallax */}
      <motion.div className="absolute inset-0 scale-110" style={{ y }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={heroImage}
            src={HERO_IMAGES[heroImage]}
            alt="LuxeWay premium vehicle"
            loading="eager"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-[#0F172A]/50 to-[#0F172A]/80" />
      </motion.div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setHeroImage(i)}
            className={`transition-all duration-300 rounded-full ${heroImage === i ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t.hero?.badge || "VIETNAM'S PREMIER VEHICLE RENTAL PLATFORM"}
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={staggerItem}
            className="font-extrabold text-white leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            {t.hero?.title1 || 'Explore Vietnam'}{' '}
            <span
              className="block"
              style={{ background: 'linear-gradient(90deg,#D4AF37,#F5D547)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {t.hero?.title2 || 'Your Way.'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t.hero?.subtitle || 'Rent the perfect car or motorbike for any journey — delivered to your door.'}
          </motion.p>

          {/* Search card */}
          <motion.div
            variants={staggerItem}
            className="w-full max-w-4xl mx-auto bg-[#0F172A]/40 backdrop-blur-xl border border-white/15 rounded-3xl p-3 sm:p-4 shadow-2xl"
          >
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
              {/* Location */}
              <div className="col-span-2 flex items-center gap-3 px-4 py-3 sm:py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Location</p>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Ho Chi Minh, Ha Noi..."
                    className="w-full text-sm sm:text-base font-semibold text-white placeholder:text-white/30 outline-none bg-transparent"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Pickup */}
              <div className="col-span-1 flex items-center gap-3 px-4 py-3 sm:py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Pick-up</p>
                  <input type="date" value={startDate} min={today}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-white outline-none bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

              {/* Return */}
              <div className="col-span-1 flex items-center gap-3 px-4 py-3 sm:py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Return</p>
                  <input type="date" value={endDate} min={startDate || today}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-white outline-none bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="col-span-2 lg:col-span-1 flex items-center gap-3 px-4 py-3 sm:py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Type</p>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                    className="w-full text-sm font-semibold text-white outline-none bg-transparent cursor-pointer appearance-none">
                    <option value="" className="text-slate-800">Any type</option>
                    <option value="economy" className="text-slate-800">Economy</option>
                    <option value="suv" className="text-slate-800">SUV</option>
                    <option value="business" className="text-slate-800">Luxury</option>
                    <option value="electric" className="text-slate-800">Electric</option>
                    <option value="motorbike" className="text-slate-800">Motorbike</option>
                  </select>
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-amber-400 hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={staggerItem}>
            <TrustBadges />
          </motion.div>

          {/* Floating metric cards */}
          <motion.div variants={staggerItem}>
            <HeroFloatingCards stats={stats} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
      >
        <span className="text-white/40 text-[10px] tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white/40" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
