import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Car, ChevronDown, ArrowRight, Star,
  Shield, Zap, Globe, TrendingUp, CheckCircle, Users, Clock,
  Sparkles, ChevronLeft, ChevronRight, Quote, FileText,
  MessageCircle, BarChart3, AlertTriangle, Truck, Award,
  Phone, Mail, Instagram, Twitter, Youtube, Facebook,
  Lock, BadgeCheck, Headphones, Bike
} from 'lucide-react';
import { homeService } from '@/services/homeService';
import type {
  HomeStats, Promotion, TrendingVehicle, CategoryData,
  Destination, TestimonialsData, OwnerStats, FAQ
} from '@/services/homeService';
import { formatCurrency } from '@/utils';
import logoImage from '@/image/logo.png';

// =====================================================
// ANIMATION VARIANTS
// =====================================================
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

// =====================================================
// SHARED SKELETON COMPONENT
// =====================================================
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
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
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [started, to, duration]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = decimal
    ? count.toFixed(1)
    : count >= 1000 ? `${Math.floor(count / 1000)}K` : Math.floor(count).toLocaleString();

  return <span ref={ref}>{display}{suffix}</span>;
};

// =====================================================
// TRUST BADGE ROW
// =====================================================
const TrustBadges: React.FC = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
    {[
      { icon: BadgeCheck, label: 'KYC Verified Owners' },
      { icon: FileText, label: 'Digital Contracts' },
      { icon: Lock, label: 'Secure VNPay Payments' },
      { icon: Headphones, label: '24/7 Customer Support' },
    ].map(({ icon: Icon, label }) => (
      <div key={label} className="flex items-center gap-2 text-white/90 text-sm font-medium">
        <Icon className="w-4 h-4 text-emerald-400" />
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
      { icon: Car, value: stats ? `${stats.totalVehicles < 100 ? stats.totalVehicles : Math.floor(stats.totalVehicles / 100) * 100}+` : '1000+', label: 'Vehicles', color: 'text-sky-400' },
      { icon: Shield, value: `${stats?.totalBookings?.toLocaleString() ?? '15K'}+`, label: 'Protected Trips', color: 'text-emerald-400' },
    ].map(({ icon: Icon, value, label, color }) => (
      <div key={label} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
        <Icon className={`w-4.5 h-4.5 ${color}`} />
        <span className="text-white text-base font-bold">{value}</span>
        <span className="text-white/70 text-sm">{label}</span>
      </div>
    ))}
  </div>
);

// =====================================================
// 1. HERO SECTION
// =====================================================
const HeroSection: React.FC<{ stats: HomeStats | null }> = ({ stats }) => {
  const navigate = useNavigate();
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
    const t = setInterval(() => setHeroImage(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (location) p.set('location', location);
    if (vehicleType) p.set('category', vehicleType);
    if (startDate) p.set('startDate', startDate);
    if (endDate) p.set('endDate', endDate);
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
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/25 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-bold tracking-wider uppercase mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Vietnam's Premier Vehicle Rental Platform
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={staggerItem}
            className="font-extrabold text-white leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            Explore Vietnam{' '}
            <span
              className="block"
              style={{ background: 'linear-gradient(90deg,#D4AF37,#F5D547)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Your Way.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Rent the perfect car or motorbike for any journey — delivered to your door.
            KYC-verified owners, digital contracts, and VNPay secured.
          </motion.p>

          {/* Search card */}
          <motion.div
            variants={staggerItem}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-1.5">
              {/* Location */}
              <div className="lg:col-span-2 flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50 rounded-xl transition-colors">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Location</p>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Ho Chi Minh, Ha Noi..."
                    className="w-full text-base font-semibold text-slate-800 placeholder:text-slate-300 outline-none bg-transparent"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Pickup */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-l border-slate-100 hover:bg-slate-50 rounded-xl transition-colors">
                <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Pick-up</p>
                  <input type="date" value={startDate} min={today}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-base font-semibold text-slate-800 outline-none bg-transparent cursor-pointer" />
                </div>
              </div>

              {/* Return */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-l border-slate-100 hover:bg-slate-50 rounded-xl transition-colors">
                <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Return</p>
                  <input type="date" value={endDate} min={startDate || today}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-base font-semibold text-slate-800 outline-none bg-transparent cursor-pointer" />
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#0F172A,#1e3a5f)' }}
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
        <span className="text-white/50 text-xs tracking-wider uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-white/50" />
      </motion.div>
    </section>
  );
};

// =====================================================
// 2. STATS BAR
// =====================================================
const StatsBar: React.FC<{ stats: HomeStats | null }> = ({ stats }) => (
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
          { icon: Car, value: stats?.totalVehicles ?? 0, suffix: '+', label: 'Verified Vehicles' },
          { icon: Users, value: stats?.totalCustomers ?? 0, suffix: '+', label: 'Happy Customers' },
          { icon: Globe, value: stats?.provinces ?? 63, suffix: '', label: 'Provinces Covered' },
          { icon: Star, value: stats?.averageRating ?? 4.9, suffix: '/5', label: 'Average Rating', decimal: true },
        ].map(({ icon: Icon, value, suffix, label, decimal }) => (
          <motion.div key={label} variants={staggerItem} className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-3 group-hover:border-amber-400/40 transition-colors">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tabular-nums mb-1.5">
              {stats ? (
                <AnimatedCounter to={value} suffix={suffix} decimal={decimal} />
              ) : (
                <Skeleton className="h-9 w-24 mx-auto bg-white/10" />
              )}
            </div>
            <p className="text-slate-300 text-sm font-semibold uppercase tracking-wider">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// =====================================================
// 3. PROMOTION SECTION
// =====================================================
const PromotionSection: React.FC<{ promotions: Promotion[]; loading: boolean }> = ({ promotions, loading }) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (promotions.length <= 1) return;
    const t = setInterval(() => setActive(p => (p + 1) % promotions.length), 5500);
    return () => clearInterval(t);
  }, [promotions.length]);

  if (!loading && promotions.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-amber-500 mb-2 block">Current Offers</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A]">Deals & Promotions</h2>
          </div>
          <Link to="/marketplace" className="text-base font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
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
                  className="relative rounded-3xl overflow-hidden h-56 cursor-pointer"
                  onClick={() => navigate(promotions[active]?.ctaUrl ?? '/marketplace')}
                >
                  <img src={promotions[active]?.imageUrl} alt={promotions[active]?.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {promotions[active]?.discountPercent > 0 && (
                      <span className="inline-block px-2.5 py-1 bg-amber-400 text-black text-xs font-black rounded-full mb-2">
                        {promotions[active].discountPercent}% OFF
                      </span>
                    )}
                    <h3 className="font-bold text-white text-lg leading-tight">{promotions[active]?.title}</h3>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-3">
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
              className="hidden md:grid grid-cols-3 gap-4"
            >
              {promotions.slice(0, 3).map((promo) => (
                <motion.div
                  key={promo.id}
                  variants={staggerItem}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative rounded-2xl overflow-hidden h-56 cursor-pointer group shadow-lg"
                  onClick={() => navigate(promo.ctaUrl ?? '/marketplace')}
                >
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {promo.discountPercent > 0 && (
                      <span className="px-3 py-1 bg-amber-400 text-black text-sm font-black rounded-full">
                        {promo.discountPercent}% OFF
                      </span>
                    )}
                    {promo.badgeText && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full">
                        {promo.badgeText}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-bold text-white text-lg leading-tight mb-2">{promo.title}</h3>
                    <button className="flex items-center gap-1 text-amber-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {promo.ctaText} <ArrowRight className="w-4 h-4" />
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

// =====================================================
// 4. TRENDING VEHICLES (Netflix carousel)
// =====================================================
const TrendingSection: React.FC<{ vehicles: TrendingVehicle[]; loading: boolean }> = ({ vehicles, loading }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">🔥 Popular Right Now</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A]">Trending Vehicles</h2>
            <p className="text-slate-500 mt-1 text-sm">Most booked on LuxeWay this week</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#0F172A] transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#0F172A] transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </motion.div>

        <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-64 h-80 rounded-2xl" />)
            : vehicles.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex-shrink-0 w-64 bg-white border border-slate-100 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300"
                onClick={() => navigate(`/marketplace/${v.id}`)}
              >
                <div className="relative h-44 overflow-hidden">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Car className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {v.isOwnerVerified && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                        <BadgeCheck className="w-3.5 h-3.5" /> KYC
                      </span>
                    )}
                    {v.instantBook && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" /> Instant
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                    <p className="text-white text-sm font-bold">{formatCurrency(v.pricePerDay)}<span className="text-white/60">/day</span></p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-400 mb-1 font-bold uppercase tracking-wider">{v.brand}</p>
                  <h3 className="font-extrabold text-[#0F172A] text-base leading-tight mb-2 truncate">{v.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">{Number(v.rating).toFixed(1)}</span>
                      <span className="text-sm text-slate-400">({v.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>{v.totalBookings} bookings</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {v.city}
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

// =====================================================
// 5. VEHICLE CATEGORIES
// =====================================================
const CAR_CATEGORIES = [
  { key: 'economy', label: 'Economy', icon: '🚗', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop' },
  { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800&auto=format&fit=crop' },
  { key: 'suv', label: 'SUV', icon: '🚙', image: 'https://images.unsplash.com/photo-1609166214994-502d326bafee?q=80&w=800&auto=format&fit=crop' },
  { key: 'business', label: 'Business', icon: '💼', image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop' },
  { key: 'electric', label: 'Electric', icon: '⚡', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop' },
];
const MOTO_CATEGORIES = [
  { key: 'motorbike', label: 'Scooter', icon: '🛵', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop' },
  { key: 'city_car', label: 'City Bike', icon: '🏍️', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop' },
  { key: 'tourism', label: 'Touring', icon: '🏕️', image: 'https://images.unsplash.com/photo-1615197864766-a51590ccbd84?q=80&w=800&auto=format&fit=crop' },
];

const CategoryGrid: React.FC<{ categories: typeof CAR_CATEGORIES; counts: Record<string, number>; title: string }> = ({ categories, counts, title }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h3 className="font-bold text-xl text-[#0F172A] mb-4 flex items-center gap-2">
        {title === 'Cars' ? <Car className="w-5 h-5 text-amber-500" /> : <Bike className="w-5 h-5 text-amber-500" />}
        {title}
      </h3>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(cat => (
          <motion.div
            key={cat.key}
            variants={staggerItem}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative rounded-2xl overflow-hidden h-36 cursor-pointer group shadow-sm"
            onClick={() => navigate(`/marketplace?category=${cat.key}`)}
          >
            <img src={cat.image} alt={cat.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg leading-none mb-0.5">{cat.icon}</p>
                  <p className="text-white font-bold text-base">{cat.label}</p>
                </div>
                <span className="text-xs text-white bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                  {counts[cat.key] ?? 0} xe
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const CategoriesSection: React.FC<{ data: CategoryData | null }> = ({ data }) => (
  <section className="py-16 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
        <span className="text-sm font-bold tracking-widest uppercase text-amber-500 mb-2 block">Our Fleet</span>
        <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A]">Browse by Category</h2>
        <p className="text-slate-500 mt-1 text-base">Find the right vehicle for every occasion</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <CategoryGrid title="Cars" categories={CAR_CATEGORIES} counts={data?.cars ?? {}} />
        <CategoryGrid title="Motorbikes" categories={MOTO_CATEGORIES} counts={data?.motorbikes ?? {}} />
      </div>
    </div>
  </section>
);

// =====================================================
// 6. POPULAR DESTINATIONS
// =====================================================
const DestinationsSection: React.FC<{ destinations: Destination[]; loading: boolean }> = ({ destinations, loading }) => {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-amber-500 mb-2 block">Top Destinations</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A]">Where Do You Want to Go?</h2>
          </div>
          <Link to="/marketplace" className="text-base font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition-colors">
            All Cities <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {(loading ? Array(6).fill(null) : destinations).map((dest, i) => (
            <motion.div key={dest?.city ?? i} variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', damping: 18 }}
              className="relative rounded-2xl overflow-hidden h-52 cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
              onClick={() => dest && navigate(`/marketplace?location=${encodeURIComponent(dest.city)}`)}>
              {dest ? (
                <>
                  <img src={dest.imageUrl} alt={dest.city} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-bold text-white text-base">{dest.city}</p>
                    <p className="text-white/75 text-xs mt-0.5 font-medium">{dest.vehicleCount} vehicles</p>
                    <p className="text-amber-300 text-xs font-bold">from {formatCurrency(dest.averagePrice)}/day</p>
                  </div>
                </>
              ) : <Skeleton className="w-full h-full" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// =====================================================
// 7. WHY LUXEWAY
// =====================================================
const WHY_FEATURES = [
  { icon: BadgeCheck, title: 'KYC Verification', desc: 'All owners complete rigorous identity verification before listing.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FileText, title: 'Digital Contracts', desc: 'Legally-binding e-contracts signed in under 2 minutes.', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Direct messaging between renters and owners at any time.', color: 'bg-violet-50 text-violet-600' },
  { icon: Lock, title: 'Secure VNPay', desc: 'Bank-grade encrypted payments via VNPay gateway.', color: 'bg-amber-50 text-amber-600' },
  { icon: Shield, title: 'Insurance Coverage', desc: 'Every rental covered up to ₫500M by our partner insurers.', color: 'bg-rose-50 text-rose-600' },
  { icon: AlertTriangle, title: 'Dispute Resolution', desc: 'Dedicated mediators handle any disputes fairly and quickly.', color: 'bg-orange-50 text-orange-600' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Owners get real-time fleet analytics and revenue insights.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Truck, title: 'Door-to-Door Delivery', desc: 'Select owners offer vehicle delivery to your address.', color: 'bg-teal-50 text-teal-600' },
];

const WhyLuxeWaySection: React.FC = () => (
  <section className="py-20 bg-[#0F172A]">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
        <span className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-3 block">Platform Advantages</span>
        <h2 className="font-bold text-3xl md:text-5xl text-white mb-4">Why Choose LuxeWay</h2>
        <p className="text-slate-300 max-w-xl mx-auto text-base">
          Built for trust. Designed for conversion. Powered by real technology.
        </p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {WHY_FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', damping: 20 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/25 transition-colors duration-300 group"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// =====================================================
// 8. HOW IT WORKS – 4 steps
// =====================================================
const STEPS = [
  { num: '01', icon: Search, title: 'Search Vehicle', desc: 'Browse by location, category, or date. Smart filters surface the best matches instantly.', color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { num: '02', icon: Calendar, title: 'Book Online', desc: 'Pick your dates, add extras, sign the digital contract, and pay securely with VNPay.', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { num: '03', icon: Car, title: 'Receive Vehicle', desc: 'The owner delivers to your door or you pick up from the agreed location.', color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { num: '04', icon: Award, title: 'Complete Journey', desc: 'Return the vehicle, leave a review, and earn LuxeWay loyalty rewards.', color: 'from-violet-500 to-violet-700', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
];

const HowItWorksSection: React.FC = () => (
  <section className="py-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
        <span className="text-sm font-bold tracking-widest uppercase text-amber-500 mb-3 block">Simple & Seamless</span>
        <h2 className="font-bold text-3xl md:text-5xl text-[#0F172A] mb-4">How LuxeWay Works</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-base">From search to keys-in-hand in under 5 minutes.</p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative bg-white rounded-3xl p-7 shadow-sm border border-slate-100 text-center group hover:shadow-lg transition-shadow"
          >
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-black flex items-center justify-center shadow-md`}>
              {step.num}
            </div>
            <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
              <step.icon className={`w-7 h-7 ${step.iconColor}`} />
            </div>
            <h3 className="font-bold text-[#0F172A] text-lg mb-2">{step.title}</h3>
            <p className="text-slate-500 text-base leading-relaxed">{step.desc}</p>
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200" />
            )}
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
        <Link to="/marketplace"
          className="inline-flex items-center gap-2 px-9 py-4.5 rounded-xl font-bold text-base text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg,#0F172A,#1e3a5f)' }}>
          <Zap className="w-4 h-4" /> Start Exploring Now
        </Link>
      </motion.div>
    </div>
  </section>
);

// =====================================================
// 9. INSURANCE & PROTECTION TRUST SECTION
// =====================================================
const InsuranceSection: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Left content */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.span variants={staggerItem} className="text-sm font-bold tracking-widest uppercase text-emerald-500 mb-3 block">
            Your Safety First
          </motion.span>
          <motion.h2 variants={staggerItem} className="font-bold text-3xl md:text-4xl text-[#0F172A] mb-4">
            Insurance & Protection<br />Built Into Every Trip
          </motion.h2>
          <motion.p variants={staggerItem} className="text-slate-500 mb-8 leading-relaxed text-base">
            We've partnered with leading insurers to give every LuxeWay booking comprehensive coverage so you drive with confidence.
          </motion.p>
          <motion.div variants={staggerContainer} className="space-y-4">
            {[
              { icon: Shield, title: 'Up to ₫500M Coverage', desc: 'Comprehensive vehicle protection included with every rental.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: BadgeCheck, title: 'Owner KYC Verification', desc: 'All vehicle owners pass identity verification before listing.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: AlertTriangle, title: 'Fraud Prevention', desc: 'AI-powered monitoring and manual review of every transaction.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Headphones, title: '24/7 Emergency Hotline', desc: 'Call us anytime — a real person will answer in under 2 minutes.', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={staggerItem} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-base">{title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Trust stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { value: '₫500M', label: 'Max Insurance Coverage', sub: 'Per trip' },
            { value: '100%', label: 'Owner Identity Verified', sub: 'Before listing' },
            { value: '<2min', label: 'Emergency Response', sub: 'Average time' },
            { value: '99.2%', label: 'Dispute Resolution Rate', sub: 'Customer satisfaction' },
          ].map(({ value, label, sub }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors"
            >
              <p className="font-black text-2xl text-[#0F172A] mb-1">{value}</p>
              <p className="font-semibold text-slate-700 text-base">{label}</p>
              <p className="text-slate-500 text-sm font-medium">{sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

// =====================================================
// 10. CUSTOMER TESTIMONIALS
// =====================================================
const TestimonialsSection: React.FC<{ data: TestimonialsData | null; loading: boolean }> = ({ data, loading }) => {
  const [idx, setIdx] = useState(0);
  const reviews = data?.reviews ?? [];
  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => setIdx(p => (p + 1) % reviews.length), 4500);
    return () => clearInterval(t);
  }, [reviews.length]);

  return (
    <section className="py-20 bg-[#0F172A] overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-3 block">What Customers Say</span>
          <h2 className="font-bold text-3xl md:text-5xl text-white mb-4">Customer Testimonials</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-white font-bold text-base">{data?.averageRating?.toFixed(1) ?? '4.9'}</span>
            <span className="text-slate-400 text-base font-semibold">from {data?.totalReviews?.toLocaleString() ?? '0'} verified reviews</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 bg-white/5 rounded-2xl" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Quote className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to book and review!</p>
            <Link to="/marketplace" className="mt-4 inline-block text-amber-400 font-bold text-base hover:underline">Browse Vehicles →</Link>
          </div>
        ) : (
          <>
            {/* Desktop grid */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hidden md:grid grid-cols-3 gap-5">
              {reviews.slice(0, 6).map((r, i) => (
                <motion.div key={r.id} variants={staggerItem} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                  <Quote className="w-6 h-6 text-amber-400 mb-3 opacity-70" />
                  <p className="text-white/90 text-base leading-relaxed flex-1 mb-5 line-clamp-4">{r.comment}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                      {r.avatar ? <img src={r.avatar} alt={r.customerName} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">{r.customerName?.[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{r.customerName}</p>
                      <p className="text-slate-400 text-xs truncate font-medium">{r.rentedVehicle}</p>
                    </div>
                    <div className="flex">
                      {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
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
                  className="p-6 rounded-2xl border border-white/10 bg-white/5"
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
                    className={`transition-all rounded-full ${i === idx ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/20'}`} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// =====================================================
// 11. BECOME AN OWNER
// =====================================================
const BecomeOwnerSection: React.FC<{ ownerStats: OwnerStats | null }> = ({ ownerStats }) => {
  const [days, setDays] = useState(15);
  const [pricePerDay, setPricePerDay] = useState(800000);
  const estimatedRevenue = Math.round(days * pricePerDay * 0.8);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden bg-[#0F172A] flex flex-col lg:flex-row">
          {/* Left */}
          <div className="lg:w-1/2 p-10 lg:p-14">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={staggerItem} className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-3 block">
                LuxeWay for Owners
              </motion.span>
              <motion.h2 variants={staggerItem} className="font-bold text-3xl lg:text-4xl text-white mb-4">
                Turn Your Idle Vehicle<br />Into Monthly Income
              </motion.h2>
              <motion.p variants={staggerItem} className="text-slate-400 mb-8 leading-relaxed text-base">
                Join thousands of owners earning consistent income on LuxeWay. We handle verification, contracts, payments, and support — you just provide the vehicle.
              </motion.p>

              {/* Stats */}
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Avg Monthly Revenue', value: ownerStats ? formatCurrency(ownerStats.averageMonthlyRevenue) : '₫15M', icon: TrendingUp },
                  { label: 'Fleet Utilization', value: `${ownerStats?.vehicleUtilization?.toFixed(0) ?? 78}%`, icon: BarChart3 },
                  { label: 'Completed Bookings', value: ownerStats?.completedBookings?.toLocaleString() ?? '0', icon: CheckCircle },
                  { label: 'Owner Avg Rating', value: `${ownerStats?.averageRating?.toFixed(1) ?? 4.8}/5`, icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <motion.div key={label} variants={staggerItem}
                    className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Icon className="w-4.5 h-4.5 text-amber-400 mb-2" />
                    <p className="font-bold text-white text-xl">{value}</p>
                    <p className="text-slate-400 text-sm font-medium">{label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Earnings Calculator */}
              <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-7">
                <p className="text-white font-bold text-base mb-4">Earnings Calculator</p>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-slate-350 text-sm w-32 flex-shrink-0">Days rented / month</label>
                  <input type="range" min={5} max={28} value={days} onChange={e => setDays(+e.target.value)}
                    className="flex-1 accent-amber-400" />
                  <span className="text-white font-bold text-base w-8">{days}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-slate-350 text-sm w-32 flex-shrink-0">Price per day (₫)</label>
                  <input type="range" min={200000} max={2000000} step={50000} value={pricePerDay}
                    onChange={e => setPricePerDay(+e.target.value)}
                    className="flex-1 accent-amber-400" />
                  <span className="text-amber-400 font-bold text-base w-24">{formatCurrency(pricePerDay)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
                  <span className="text-slate-300 text-sm">Estimated monthly income</span>
                  <span className="font-black text-amber-400 text-xl">{formatCurrency(estimatedRevenue)}</span>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Link to="/owner"
                  className="inline-flex items-center gap-2.5 px-8 py-4.5 rounded-xl font-bold text-base text-black transition-all hover:scale-[1.03] active:scale-[0.97]"
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

// =====================================================
// 12. FAQ
// =====================================================
const FAQSection: React.FC<{ faqs: FAQ[]; loading: boolean }> = ({ faqs, loading }) => {
  const [open, setOpen] = useState<number | null>(null);
  const DEFAULT_FAQS: FAQ[] = [
    { id: 1, q: 'How does LuxeWay verify vehicle owners?', a: 'All owners complete a rigorous KYC process: government ID, phone verification, bank account check, and vehicle document review before any listing goes live.' },
    { id: 2, q: 'What insurance is included in every rental?', a: 'All rentals include baseline coverage up to ₫500M per trip via our partner insurers. Additional premium coverage is available at booking.' },
    { id: 3, q: 'Can I cancel my booking?', a: 'Free cancellation is available up to 48 hours before pickup. Cancellations within 48 hours may be subject to a partial fee per the vehicle\'s policy.' },
    { id: 4, q: 'How does door-to-door delivery work?', a: 'Owners who have enabled delivery will bring the vehicle to your address. Delivery fees are shown transparently at checkout and vary by distance.' },
    { id: 5, q: 'How are payments processed and is it secure?', a: 'We use VNPay with bank-grade encryption. Payments are held in escrow and only released to owners after successful pickup confirmation.' },
    { id: 6, q: 'What happens if there is a dispute?', a: 'Our dedicated dispute resolution team reviews photo evidence and trip records. Most disputes are resolved within 24 hours with full fairness to both parties.' },
  ];
  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="text-sm font-bold tracking-wider uppercase text-amber-500 mb-3 block">Got Questions?</span>
          <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A]">Frequently Asked Questions</h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
          {(loading ? Array(5).fill(null) : displayFaqs).map((faq, i) => (
            <motion.div key={faq?.id ?? i} variants={staggerItem}>
              {faq ? (
                <div className={`bg-white rounded-2xl border transition-colors ${open === i ? 'border-amber-200' : 'border-slate-100'}`}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={open === i}
                  >
                    <span className="font-bold text-[#0F172A] text-base pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-500 text-base leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : <Skeleton className="h-14 rounded-2xl" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// =====================================================
// 13. ENTERPRISE FOOTER
// =====================================================
const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const links = {
    Explore: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Top Destinations', href: '/marketplace' },
      { label: 'Compare Vehicles', href: '/compare' },
    ],
    Owners: [
      { label: 'List Your Vehicle', href: '/owner' },
      { label: 'Owner Dashboard', href: '/owner/dashboard' },
      { label: 'Earnings Calculator', href: '/#become-owner' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Trust & Safety', href: '/help' },
      { label: 'Contact Us', href: '/help/contact' },
      { label: 'Insurance Info', href: '/help' },
    ],
    Legal: [
      { label: 'About LuxeWay', href: '/about' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="LuxeWay" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              Vietnam's premier peer-to-peer vehicle rental marketplace. Cars, motorbikes, and more — verified, insured, and delivered.
            </p>
            {/* Newsletter */}
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-3">Stay Updated</p>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-slate-500 outline-none focus:border-amber-400/50 transition-colors" />
              <button className="px-5 py-3 rounded-xl bg-amber-400 text-black text-base font-bold hover:bg-amber-300 transition-colors">Go</button>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href + Icon.name} href={href}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-amber-400/20 transition-colors">
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-slate-300 text-base hover:text-amber-400 transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="py-6 border-t border-white/10 border-b grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: '+84 1800 LuxeWay', sub: 'Mon–Sun 6am–11pm' },
            { icon: Mail, label: 'support@luxeway.vn', sub: 'Average response: <1hr' },
            { icon: MapPin, label: '123 Nguyen Hue, Ho Chi Minh City', sub: 'Headquarters' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">{label}</p>
                <p className="text-slate-450 text-xs font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-450 font-medium">
          <p>© 2026 LuxeWay International. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Vietnam</span>
            <span>·</span>
            <span>USD / VND</span>
            <span>·</span>
            <span>Tiếng Việt / English</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// =====================================================
// ROOT PAGE
// =====================================================
const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [trending, setTrending] = useState<TrendingVehicle[]>([]);
  const [categories, setCategories] = useState<CategoryData | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialsData | null>(null);
  const [ownerStats, setOwnerStats] = useState<OwnerStats | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [loadingPromos, setLoadingPromos] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingDests, setLoadingDests] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  const loadStats = () => {
    setStatsError(null);
    homeService.getStats().then(d => {
      if (d === null) {
        setStatsError('Could not load statistics — backend may be unavailable.');
      } else {
        setStats(d);
      }
    });
    homeService.getOwnerStats().then(d => { if (d) setOwnerStats(d); });
    homeService.getCategories().then(d => { if (d) setCategories(d); });
  };

  useEffect(() => {
    loadStats();
    homeService.getPromotions().then(d => { setPromotions(d ?? []); setLoadingPromos(false); });
    homeService.getTrending().then(d => { setTrending(d ?? []); setLoadingTrending(false); });
    homeService.getDestinations().then(d => { setDestinations(d ?? []); setLoadingDests(false); });
    homeService.getTestimonials().then(d => { setTestimonials(d ?? null); setLoadingTestimonials(false); });
    homeService.getFaqs().then(d => { setFaqs(d ?? []); setLoadingFaqs(false); });
  }, []);


  return (
    <div className="bg-white">
      <HeroSection stats={stats} />
      {/* Stats error banner */}
      {statsError && (
        <div className="bg-rose-50 border-b border-rose-200 py-3 px-6 flex items-center justify-between">
          <p className="text-rose-700 text-sm font-semibold">⚠ {statsError}</p>
          <button
            onClick={loadStats}
            className="text-rose-700 text-sm underline hover:no-underline font-bold"
          >
            Retry
          </button>
        </div>
      )}
      <StatsBar stats={stats} />
      <PromotionSection promotions={promotions} loading={loadingPromos} />
      <TrendingSection vehicles={trending} loading={loadingTrending} />
      <CategoriesSection data={categories} />
      <DestinationsSection destinations={destinations} loading={loadingDests} />
      <WhyLuxeWaySection />
      <HowItWorksSection />
      <InsuranceSection />
      <TestimonialsSection data={testimonials} loading={loadingTestimonials} />
      <BecomeOwnerSection ownerStats={ownerStats} />
      <FAQSection faqs={faqs} loading={loadingFaqs} />
      <Footer />
    </div>
  );
};

export default LandingPage;
