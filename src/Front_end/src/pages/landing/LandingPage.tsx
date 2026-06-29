import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Car, ChevronDown, ArrowRight, Star,
  Shield, Zap, Globe, TrendingUp, CheckCircle, Users, Clock,
  Sparkles, ChevronLeft, ChevronRight, Quote, FileText,
  MessageCircle, BarChart3, AlertTriangle, Truck, Award,
  Phone, Mail, Instagram, Twitter, Youtube, Facebook,
  Lock, BadgeCheck, Headphones, Bike, Briefcase, Compass, Gauge
} from 'lucide-react';
import { homeService } from '@/services/homeService';
import type {
  HomeStats, Promotion, TrendingVehicle, CategoryData,
  Destination, TestimonialsData, OwnerStats, FAQ
} from '@/services/homeService';
import { formatCurrency } from '@/utils';
import logoImage from '../../image/logo.png';
import { useT } from '@/i18n/translations';
import { useUIStore } from '@/store';

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
const TrustBadges: React.FC = () => {
  const t = useT();
  const badges = [
    { icon: BadgeCheck, label: t.landingPage.trustBadges.kyc },
    { icon: FileText, label: t.landingPage.trustBadges.contracts },
    { icon: Lock, label: t.landingPage.trustBadges.payments },
    { icon: Headphones, label: t.landingPage.trustBadges.support },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-white/90 text-sm font-medium">
          <Icon className="w-4 h-4 text-emerald-400" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// HERO FLOATING METRIC CARDS
// =====================================================
const HeroFloatingCards: React.FC<{ stats: HomeStats | null }> = ({ stats }) => {
  const t = useT();
  const cards = [
    { icon: Star, value: stats?.averageRating?.toFixed(1) ?? '4.9', label: t.landing.stats.rating, color: 'text-[#D4AF37]' },
    { icon: Car, value: stats ? `${(stats.totalVehicles || 0) + 1200}+` : '1,200+', label: t.landing.stats.vehicles, color: 'text-[#D4AF37]' },
    { icon: Shield, value: stats ? `${((stats.totalCustomers || stats.totalBookings || 0) + 15800).toLocaleString()}+` : '15,000+', label: t.landing.stats.clients, color: 'text-[#D4AF37]' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {cards.map(({ icon: Icon, value, label, color }) => (
        <div key={label} className="flex items-center gap-3 px-6 py-3 rounded-md border border-[#D4AF37]/20 bg-[#0B1221]/95 shadow-lg">
          <Icon className={`w-4.5 h-4.5 ${color}`} />
          <span className="text-white text-base font-extrabold">{value}</span>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// 1. HERO SECTION
// =====================================================
const HeroSection: React.FC<{ stats: HomeStats | null }> = ({ stats }) => {
  const navigate = useNavigate();
  const t = useT();
  const language = useUIStore((s: any) => s.language);
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
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2560&auto=format&fit=crop', // Ferrari red
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2560&auto=format&fit=crop', // luxury car interior/exterior
    'https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=2560&auto=format&fit=crop', // luxury car Vietnam road
  ];

  useEffect(() => {
    const timer = setInterval(() => setHeroImage(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (location) p.set('location', location);
    if (vehicleType) p.set('type', vehicleType);
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
            className="inline-flex items-center gap-2.5 px-5 py-2 border border-[#D4AF37]/35 rounded-sm bg-[#0B1221] text-white text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <span className="text-sm">🇻🇳</span>
            <span className="text-white/20">•</span>
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            {t.landing.hero.badge}
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={staggerItem}
            className="font-medium text-white leading-tight tracking-tight mb-5 display-font"
            style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5rem)' }}
          >
            {t.landing.hero.title1}{' '}
            <span className="block text-[#D4AF37] font-semibold mt-2">
              {t.landing.hero.title2}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-sans"
          >
            {t.landing.hero.subtitle}
          </motion.p>

          {/* Search card */}
          <motion.div
            variants={staggerItem}
            className="w-full max-w-5xl mx-auto bg-white rounded-md shadow-lg p-2 border border-slate-100"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 p-1.5">
              {/* Location */}
              <div className="lg:col-span-2 flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50 rounded-md transition-colors">
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t.landing.hero.location}</p>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={t.landing.hero.locationPlaceholder}
                    className="w-full text-sm font-semibold text-slate-800 placeholder:text-slate-350 outline-none bg-transparent"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-l border-slate-100 hover:bg-slate-50 rounded-md transition-colors">
                <Car className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t.landing.hero.category}</p>
                  <div className="relative flex items-center">
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer appearance-none pr-5 truncate"
                    >
                      <option value="">{t.landing.hero.allTypes}</option>
                      <option value="car">🚗 {language === 'vi' ? 'Ô tô' : 'Cars'}</option>
                      <option value="motorbike">🏍️ {language === 'vi' ? 'Xe máy' : 'Motorbikes'}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Pickup */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-l border-slate-100 hover:bg-slate-50 rounded-md transition-colors">
                <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t.landing.hero.pickUp}</p>
                  <input type="date" value={startDate} min={today}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer" />
                </div>
              </div>

              {/* Return */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-l border-slate-100 hover:bg-slate-50 rounded-md transition-colors">
                <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{t.landing.hero.return}</p>
                  <input type="date" value={endDate} min={startDate || today}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer" />
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-bold text-sm text-white bg-[#0B1221] hover:bg-slate-800 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Search className="w-4 h-4" />
                <span>{t.landing.hero.search}</span>
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
        <span className="text-white/50 text-xs tracking-wider uppercase">
          {language === 'vi' ? 'Cuộn' : 'Scroll'}
        </span>
        <ChevronDown className="w-5 h-5 text-white/50" />
      </motion.div>
    </section>
  );
};

// =====================================================
// 2. STATS BAR
// =====================================================
const StatsBar: React.FC<{ stats: HomeStats | null }> = ({ stats }) => {
  const t = useT();
  const statsItems = [
    { icon: Car, value: stats ? (stats.totalVehicles || 0) + 1200 : 1200, suffix: '+', label: t.landing.stats.vehicles },
    { icon: Users, value: stats ? (stats.totalCustomers || 0) + 15800 : 15800, suffix: '+', label: t.landing.stats.clients },
    { icon: Globe, value: stats?.provinces ?? 63, suffix: '', label: t.landing.stats.provinces },
    { icon: Star, value: stats?.averageRating ?? 4.9, suffix: '/5', label: t.landing.stats.rating, decimal: true },
  ];

  return (
    <section className="bg-[#0B1221] py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {statsItems.map(({ icon: Icon, value, suffix, label, decimal }) => (
            <motion.div key={label} variants={staggerItem} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/5 border border-white/10 mb-3 group-hover:border-[#D4AF37]/40 transition-colors">
                <Icon className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="text-4xl font-extrabold text-white font-mono tabular-nums mb-1.5">
                {stats ? (
                  <AnimatedCounter to={value} suffix={suffix} decimal={decimal} />
                ) : (
                  <Skeleton className="h-9 w-24 mx-auto bg-white/10" />
                )}
              </div>
              <p className="text-slate-350 text-xs font-semibold uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// =====================================================
// 3. PROMOTION SECTION
// =====================================================
const PromotionSection: React.FC<{ promotions: Promotion[]; loading: boolean }> = ({ promotions, loading }) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => setActive(p => (p + 1) % promotions.length), 5500);
    return () => clearInterval(timer);
  }, [promotions.length]);

  if (!loading && promotions.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.promo.offers}</span>
            <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{t.landingPage.promo.title}</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-bold text-slate-500 hover:text-[#0B1221] flex items-center gap-1 transition-colors uppercase tracking-wider">
            {t.landingPage.promo.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-md" />)}
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
                  className="relative rounded-md overflow-hidden h-56 cursor-pointer"
                  onClick={() => navigate(promotions[active]?.ctaUrl ?? '/marketplace')}
                >
                  <img src={promotions[active]?.imageUrl} alt={promotions[active]?.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {promotions[active]?.discountPercent > 0 && (
                      <span className="inline-block px-3 py-1 bg-[#D4AF37] text-[#0B1221] text-xs font-black rounded-sm mb-2">
                        {promotions[active].discountPercent}% {t.landingPage.promo.off}
                      </span>
                    )}
                    <h3 className="font-bold text-white text-lg leading-tight">{promotions[active]?.title}</h3>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-3">
                {promotions.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`transition-all rounded-full ${i === active ? 'w-5 h-1.5 bg-[#D4AF37]' : 'w-1.5 h-1.5 bg-slate-300'}`} />
                ))}
              </div>
            </div>

            {/* Desktop: grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`hidden md:grid gap-6 ${
                promotions.length === 2 ? 'grid-cols-2 max-w-5xl mx-auto' : 'grid-cols-3'
              }`}
            >
              {promotions.slice(0, 3).map((promo) => (
                <motion.div
                  key={promo.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-md overflow-hidden h-60 cursor-pointer group shadow-sm border border-slate-100 bg-white"
                  onClick={() => navigate(promo.ctaUrl ?? '/marketplace')}
                >
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover transition-transform duration-750" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    {promo.discountPercent > 0 && (
                      <span className="px-3 py-1.5 bg-[#D4AF37] text-[#0B1221] text-xs font-bold rounded-sm uppercase tracking-wider shadow-sm">
                        {promo.discountPercent}% {t.landingPage.promo.off}
                      </span>
                    )}
                    {promo.badgeText && (
                      <span className="px-3 py-1.5 bg-[#0B1221] text-white text-xs font-bold rounded-sm border border-slate-800 uppercase tracking-wider shadow-sm">
                        {promo.badgeText}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h3 className="font-bold text-white text-lg leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors">{promo.title}</h3>
                    <button className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-extrabold uppercase tracking-wider group-hover:text-white transition-all">
                      <span>{promo.ctaText || t.landingPage.promo.viewAll}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
const TrendingSection: React.FC<{ vehicles: TrendingVehicle[]; loading: boolean }> = ({ vehicles, loading }) => {
  const navigate = useNavigate();
  const t = useT();
  const language = useUIStore((s: any) => s.language);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.trending.popular}</span>
            <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{t.landingPage.trending.title}</h2>
            <p className="text-slate-500 mt-1 text-sm font-sans">{t.landingPage.trending.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center hover:border-[#0B1221] transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center hover:border-[#0B1221] transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </motion.div>

        <div ref={ref} className="flex gap-5 overflow-x-auto pb-6 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-80 h-[410px] rounded-md" />)
            : vehicles.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-80 bg-white border border-slate-100 rounded-md overflow-hidden cursor-pointer group shadow-sm hover:border-[#D4AF37]/35 transition-all duration-300"
                onClick={() => navigate(`/vehicles/${v.id}`)}
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-750" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {v.vehicleType === 'motorbike' ? (
                        <Bike className="w-12 h-12 text-slate-300" />
                      ) : (
                        <Car className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {v.isOwnerVerified && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <BadgeCheck className="w-3.5 h-3.5" /> KYC
                      </span>
                    )}
                    {v.instantBook && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#D4AF37] text-[#0B1221] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <Zap className="w-3.5 h-3.5" /> {language === 'vi' ? 'Đặt Nhanh' : 'Instant'}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#0B1221]/90 rounded-md border border-white/10 shadow-lg">
                    <p className="text-white text-sm font-extrabold flex items-baseline gap-0.5">
                      <span className="text-[#D4AF37] font-mono text-base">{formatCurrency(v.pricePerDay)}</span>
                      <span className="text-white/60 text-[10px] font-medium">/{t.landingPage.destinations.perDay}</span>
                    </p>
                  </div>
                </div>
                <div className="p-5 font-sans">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.brand}</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">
                      {v.vehicleType === 'motorbike' ? (language === 'vi' ? '🏍️ Xe máy' : '🏍️ Motorbike') : (language === 'vi' ? '🚗 Ô tô' : '🚗 Car')}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0B1221] text-base leading-tight mb-2 truncate group-hover:text-[#D4AF37] transition-colors">{v.name}</h3>
                  <p className="text-xs text-slate-550 mb-4 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.city}
                  </p>
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="text-sm font-bold text-slate-700">{Number(v.rating).toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({v.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{v.totalBookings} {t.landingPage.trending.bookings}</span>
                    </div>
                  </div>
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
// LATEST VEHICLES CAROUSEL (Newly Approved)
const LatestSection: React.FC<{ vehicles: TrendingVehicle[]; loading: boolean }> = ({ vehicles, loading }) => {
  const navigate = useNavigate();
  const t = useT();
  const language = useUIStore((s: any) => s.language);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <section className="py-16 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{language === 'vi' ? 'Mới Nhất' : 'New Additions'}</span>
            <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{language === 'vi' ? 'Xe Vừa Được Kiểm Duyệt' : 'Latest Approved Vehicles'}</h2>
            <p className="text-slate-500 mt-1 text-sm font-sans">{language === 'vi' ? 'Khám phá các dòng xe vừa được đưa lên hệ thống và kiểm duyệt chất lượng' : 'Explore the newly verified premium vehicles added to our fleet'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center hover:border-[#0B1221] transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center hover:border-[#0B1221] transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </motion.div>

        <div ref={ref} className="flex gap-5 overflow-x-auto pb-6 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-80 h-[410px] rounded-md" />)
            : (vehicles && vehicles.length > 0 ? (
              vehicles.map((v) => (
                <motion.div
                  key={v.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-80 bg-white border border-slate-100 rounded-md overflow-hidden cursor-pointer group shadow-sm hover:border-[#D4AF37]/35 transition-all duration-300"
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.name} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-750" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {v.vehicleType === 'motorbike' ? (
                          <Bike className="w-12 h-12 text-slate-300" />
                        ) : (
                          <Car className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {v.isOwnerVerified && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          <BadgeCheck className="w-3.5 h-3.5" /> KYC
                        </span>
                      )}
                      {v.instantBook && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#D4AF37] text-[#0B1221] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          <Zap className="w-3.5 h-3.5" /> {language === 'vi' ? 'Đặt Nhanh' : 'Instant'}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#0B1221]/90 rounded-md border border-white/10 shadow-lg">
                      <p className="text-white text-sm font-extrabold flex items-baseline gap-0.5">
                        <span className="text-[#D4AF37] font-mono text-base">{formatCurrency(v.pricePerDay)}</span>
                        <span className="text-white/60 text-[10px] font-medium">/{t.landingPage.destinations.perDay}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-5 font-sans">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.brand}</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">
                        {v.vehicleType === 'motorbike' ? (language === 'vi' ? '🏍️ Xe máy' : '🏍️ Motorbike') : (language === 'vi' ? '🚗 Ô tô' : '🚗 Car')}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0B1221] text-base leading-tight mb-2 truncate group-hover:text-[#D4AF37] transition-colors">{v.name}</h3>
                    <p className="text-xs text-slate-550 mb-4 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.city}
                    </p>
                    <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                        <span className="text-sm font-bold text-slate-700">{Number(v.rating).toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({v.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{v.totalBookings} {t.landingPage.trending.bookings}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-slate-400 font-medium font-sans">
                {language === 'vi' ? 'Không có xe mới nào.' : 'No new vehicles found.'}
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

// =====================================================

// =====================================================
// 5. VEHICLE CATEGORIES
// =====================================================
import * as LucideIcons from 'lucide-react';

const CAR_CATEGORIES = [
  { key: 'economy', label: 'Economy', iconName: 'Car', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop' },
  { key: 'family', label: 'Family', iconName: 'Users', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop' },
  { key: 'suv', label: 'SUV', iconName: 'Sparkles', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop' },
  { key: 'business', label: 'Business', iconName: 'Briefcase', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop' },
  { key: 'electric', label: 'Electric', iconName: 'Zap', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop' },
];
const MOTO_CATEGORIES = [
  { key: 'motorbike', label: 'Scooter', iconName: 'Bike', image: 'https://images.unsplash.com/photo-1508847154043-be12a62861c1?q=80&w=800&auto=format&fit=crop' },
  { key: 'city_car', label: 'City Bike', iconName: 'Gauge', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop' },
  { key: 'tourism', label: 'Touring', iconName: 'Compass', image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=800&auto=format&fit=crop' },
];

const CategoryGrid: React.FC<{ categories: typeof CAR_CATEGORIES; counts: Record<string, number>; title: string }> = ({ categories, counts, title }) => {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div>
      <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
        {title === 'Cars' ? (
          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Car className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bike className="w-5 h-5" />
          </div>
        )}
        <span className="font-display font-semibold tracking-widest">{title === 'Cars' ? t.landingPage.categories.cars : t.landingPage.categories.motorbikes}</span>
      </h3>
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {categories.map(cat => {
          const Icon = (LucideIcons as any)[cat.iconName] || Car;
          return (
            <motion.div
              key={cat.key}
              variants={staggerItem}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-md overflow-hidden h-40 cursor-pointer group shadow-sm transition-all duration-300"
              onClick={() => navigate(`/marketplace?category=${cat.key}`)}
            >
              <img 
                src={cat.image} 
                alt={cat.label} 
                loading="lazy" 
                className="w-full h-full object-cover transition-transform duration-750" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent transition-opacity duration-350 group-hover:from-black/85" />
              
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between z-10 font-sans">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#D4AF37] group-hover:text-[#0B1221] group-hover:border-[#D4AF37] transition-all duration-300">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm tracking-wide group-hover:text-[#D4AF37] transition-colors">
                      {t.categories[cat.key as keyof typeof t.categories] || cat.label}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-white/90 bg-white/10 border border-white/10 px-2.5 py-1 rounded-sm font-bold group-hover:bg-white/20 transition-all">
                  {counts[cat.key] ?? 0} {t.landingPage.categories.xe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

const CategoriesSection: React.FC<{ data: CategoryData | null }> = ({ data }) => {
  const t = useT();

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.categories.fleet}</span>
          <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{t.landingPage.categories.title}</h2>
          <p className="text-slate-550 mt-1 text-sm font-sans">{t.landingPage.categories.desc}</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <CategoryGrid title="Cars" categories={CAR_CATEGORIES} counts={data?.cars ?? {}} />
          <CategoryGrid title="Motorbikes" categories={MOTO_CATEGORIES} counts={data?.motorbikes ?? {}} />
        </div>
      </div>
    </section>
  );
};

// =====================================================
// 6. POPULAR DESTINATIONS
// =====================================================
const CITY_IMAGES: Record<string, string> = {
  'Ho Chi Minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop',
  'Ha Noi': 'https://images.unsplash.com/photo-1509060464153-44667396260f?q=80&w=800&auto=format&fit=crop',
  'Da Nang': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
  'Nha Trang': 'https://images.unsplash.com/photo-1571508601936-6ca847b47ae4?q=80&w=800&auto=format&fit=crop',
  'Da Lat': 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop',
  'Hue': 'https://images.unsplash.com/photo-1571005471113-94993ec92454?q=80&w=800&auto=format&fit=crop',
};

const DestinationsSection: React.FC<{ destinations: Destination[]; loading: boolean }> = ({ destinations, loading }) => {
  const navigate = useNavigate();
  const t = useT();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.destinations.top}</span>
            <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{t.landingPage.destinations.title}</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-bold text-slate-500 hover:text-[#0B1221] flex items-center gap-1 transition-colors uppercase tracking-wider">
            {t.landingPage.destinations.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {(loading ? Array(6).fill(null) : destinations).map((dest, i) => {
            const displayImg = dest ? (CITY_IMAGES[dest.city] || dest.imageUrl) : '';
            return (
              <motion.div key={dest?.city ?? i} variants={staggerItem}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-md overflow-hidden h-52 cursor-pointer group shadow-sm transition-all duration-300"
                onClick={() => dest && navigate(`/marketplace?location=${encodeURIComponent(dest.city)}`)}>
                {dest ? (
                  <>
                    <img src={displayImg} alt={dest.city} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-750" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 font-sans">
                      <p className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">{dest.city}</p>
                      <p className="text-white/70 text-xs mt-0.5 font-medium">{dest.vehicleCount} {t.landingPage.destinations.vehicles}</p>
                      <p className="text-[#D4AF37] text-xs font-bold mt-1">{t.landingPage.destinations.from} {formatCurrency(dest.averagePrice)}/{t.landingPage.destinations.perDay}</p>
                    </div>
                  </>
                ) : <Skeleton className="w-full h-full rounded-md" />}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

// =====================================================
// 7. WHY LUXEWAY
// =====================================================
const WhyLuxeWaySection: React.FC = () => {
  const t = useT();

  const whyFeatures = [
    { icon: BadgeCheck, title: t.landingPage.whyUs.kyc, desc: t.landingPage.whyUs.kycDesc, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FileText, title: t.landingPage.whyUs.contracts, desc: t.landingPage.whyUs.contractsDesc, color: 'bg-blue-50 text-blue-600' },
    { icon: MessageCircle, title: t.landingPage.whyUs.chat, desc: t.landingPage.whyUs.chatDesc, color: 'bg-violet-50 text-violet-600' },
    { icon: Lock, title: t.landingPage.whyUs.vnpay, desc: t.landingPage.whyUs.vnpayDesc, color: 'bg-amber-50 text-amber-600' },
    { icon: Shield, title: t.landingPage.whyUs.insurance, desc: t.landingPage.whyUs.insuranceDesc, color: 'bg-rose-50 text-rose-600' },
    { icon: AlertTriangle, title: t.landingPage.whyUs.dispute, desc: t.landingPage.whyUs.disputeDesc, color: 'bg-orange-50 text-orange-600' },
    { icon: BarChart3, title: t.landingPage.whyUs.analytics, desc: t.landingPage.whyUs.analyticsDesc, color: 'bg-indigo-50 text-indigo-600' },
    { icon: Truck, title: t.landingPage.whyUs.delivery, desc: t.landingPage.whyUs.deliveryDesc, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <section className="py-20 bg-[#0B1221]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-3 block">{t.landingPage.whyUs.advantages}</span>
          <h2 className="font-medium text-3xl md:text-5xl text-white mb-4 display-font">{t.landingPage.whyUs.title}</h2>
          <p className="text-slate-350 max-w-xl mx-auto text-sm font-sans">{t.landingPage.whyUs.desc}</p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans"
        >
          {whyFeatures.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-md border border-white/5 bg-[#131F35] hover:border-[#D4AF37]/35 transition-colors duration-300 group"
            >
              <div className={`w-10 h-10 rounded-md ${color} flex items-center justify-center mb-4 transition-transform`}>
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
};

// =====================================================
// 8. HOW IT WORKS – 4 steps
// =====================================================
const HowItWorksSection: React.FC = () => {
  const t = useT();

  const steps = [
    { num: '01', icon: Search, title: t.landingPage.howItWorks.step1, desc: t.landingPage.howItWorks.step1Desc, color: 'from-[#0B1221] to-[#1E2D45]', bg: 'bg-slate-50', iconColor: 'text-[#0B1221]' },
    { num: '02', icon: Calendar, title: t.landingPage.howItWorks.step2, desc: t.landingPage.howItWorks.step2Desc, color: 'from-[#0B1221] to-[#1E2D45]', bg: 'bg-slate-50', iconColor: 'text-[#0B1221]' },
    { num: '03', icon: Car, title: t.landingPage.howItWorks.step3, desc: t.landingPage.howItWorks.step3Desc, color: 'from-[#0B1221] to-[#1E2D45]', bg: 'bg-slate-50', iconColor: 'text-[#0B1221]' },
    { num: '04', icon: Award, title: t.landingPage.howItWorks.step4, desc: t.landingPage.howItWorks.step4Desc, color: 'from-[#0B1221] to-[#1E2D45]', bg: 'bg-slate-50', iconColor: 'text-[#0B1221]' },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-3 block">{t.landingPage.howItWorks.seamless}</span>
          <h2 className="font-medium text-3xl md:text-5xl text-[#0B1221] mb-4 display-font">{t.landingPage.howItWorks.title}</h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm font-sans">{t.landingPage.howItWorks.desc}</p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-md p-7 shadow-sm border border-slate-100 text-center group hover:border-[#D4AF37]/35 transition-colors duration-300"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0B1221] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center justify-center shadow-sm">
                {step.num}
              </div>
              <div className={`w-14 h-14 ${step.bg} rounded-md flex items-center justify-center mx-auto mb-5 transition-transform`}>
                <step.icon className={`w-6 h-6 ${step.iconColor}`} />
              </div>
              <h3 className="font-bold text-[#0B1221] text-base mb-2">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200" />
              )}
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
          <Link to="/marketplace"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md font-bold text-sm text-white bg-[#0B1221] hover:bg-slate-800 transition-all shadow-sm">
            <Zap className="w-4 h-4" /> {t.landingPage.howItWorks.btn}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// =====================================================
// 9. INSURANCE & PROTECTION TRUST SECTION
// =====================================================
const InsuranceSection: React.FC = () => {
  const t = useT();

  const items = [
    { icon: Shield, title: `${t.landingPage.insurance.stat1Label} (${t.landingPage.insurance.stat1Val})`, desc: t.landingPage.insurance.desc, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BadgeCheck, title: t.landingPage.insurance.kyc, desc: t.landingPage.insurance.kycDesc, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: AlertTriangle, title: t.landingPage.insurance.fraud, desc: t.landingPage.insurance.fraudDesc, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Headphones, title: t.landingPage.insurance.hotline, desc: t.landingPage.insurance.hotlineDesc, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const stats = [
    { value: t.landingPage.insurance.stat1Val, label: t.landingPage.insurance.stat1Label, sub: t.landingPage.insurance.stat1Sub },
    { value: t.landingPage.insurance.stat2Val, label: t.landingPage.insurance.stat2Label, sub: t.landingPage.insurance.stat2Sub },
    { value: t.landingPage.insurance.stat3Val, label: t.landingPage.insurance.stat3Label, sub: t.landingPage.insurance.stat3Sub },
    { value: t.landingPage.insurance.stat4Val, label: t.landingPage.insurance.stat4Label, sub: t.landingPage.insurance.stat4Sub },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left content */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.span variants={staggerItem} className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-3 block">
              {t.landingPage.insurance.safety}
            </motion.span>
            <motion.h2 variants={staggerItem} className="font-medium text-3xl md:text-4xl text-[#0B1221] mb-4 display-font">
              {t.landingPage.insurance.title}
            </motion.h2>
            <motion.p variants={staggerItem} className="text-slate-550 mb-8 leading-relaxed text-sm font-sans">
              {t.landingPage.insurance.desc}
            </motion.p>
            <motion.div variants={staggerContainer} className="space-y-4 font-sans">
              {items.map(({ icon: Icon, title, desc, color, bg }) => (
                <motion.div key={title} variants={staggerItem} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-[#0B1221] text-base">{title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
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
            className="grid grid-cols-2 gap-4 font-sans"
          >
            {stats.map(({ value, label, sub }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className="p-6 bg-slate-50 rounded-md border border-slate-100 hover:border-[#D4AF37]/35 transition-colors"
              >
                <p className="font-bold text-2xl text-[#0B1221] mb-1">{value}</p>
                <p className="font-semibold text-slate-700 text-sm">{label}</p>
                <p className="text-slate-500 text-xs font-medium">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// 10. CUSTOMER TESTIMONIALS
// =====================================================
const TestimonialsSection: React.FC<{ data: TestimonialsData | null; loading: boolean }> = ({ data, loading }) => {
  const [idx, setIdx] = useState(0);
  const t = useT();
  const reviews = data?.reviews ?? [];

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => setIdx(p => (p + 1) % reviews.length), 4500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section className="py-20 bg-[#0B1221] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-3 block">
            {t.landingPage.testimonials.say}
          </span>
          <h2 className="font-medium text-3xl md:text-5xl text-white mb-4 display-font">
            {t.landingPage.testimonials.title}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />)}
            </div>
            <span className="text-white font-bold text-base">{data?.averageRating?.toFixed(1) ?? '4.9'}</span>
            <span className="text-slate-400 text-sm font-semibold font-sans">
              {data?.totalReviews ? `${data.totalReviews.toLocaleString()} ` : ''}{t.landingPage.testimonials.verified}
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 bg-white/5 rounded-md" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-sans">
            <Quote className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
            <p>{t.landingPage.testimonials.empty}</p>
            <Link to="/marketplace" className="mt-4 inline-block text-[#D4AF37] font-bold text-base hover:underline">
              {t.landingPage.testimonials.browse}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop grid */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hidden md:grid grid-cols-3 gap-5 font-sans">
              {reviews.slice(0, 6).map((r) => (
                <motion.div key={r.id} variants={staggerItem} className="p-6 rounded-md border border-white/5 bg-[#131F35] flex flex-col hover:border-[#D4AF37]/25 transition-all">
                  <Quote className="w-6 h-6 text-[#D4AF37] mb-3 opacity-70" />
                  <p className="text-white/90 text-sm leading-relaxed flex-1 mb-5 line-clamp-4">{r.comment}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-md bg-[#0B1221] border border-slate-800 overflow-hidden flex-shrink-0">
                      {r.avatar ? <img src={r.avatar} alt={r.customerName} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">{r.customerName?.[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{r.customerName}</p>
                      <p className="text-slate-400 text-xs truncate font-medium">{r.rentedVehicle}</p>
                    </div>
                    <div className="flex">
                      {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile carousel */}
            <div className="md:hidden font-sans">
              <AnimatePresence mode="wait">
                <motion.div
                  key={reviews[idx]?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 rounded-md border border-white/5 bg-[#131F35]"
                >
                  <Quote className="w-6 h-6 text-[#D4AF37] mb-3 opacity-70" />
                  <p className="text-white/80 text-sm leading-relaxed mb-5">{reviews[idx]?.comment}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[#0B1221] border border-slate-850 overflow-hidden flex-shrink-0">
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
                    className={`transition-all rounded-full ${i === idx ? 'w-5 h-1.5 bg-[#D4AF37]' : 'w-1.5 h-1.5 bg-white/20'}`} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const BecomeOwnerSection: React.FC<{ ownerStats: OwnerStats | null }> = ({ ownerStats }) => {
  const [days, setDays] = useState(15);
  const [pricePerDay, setPricePerDay] = useState(800000);
  const t = useT();
  const estimatedRevenue = Math.round(days * pricePerDay * 0.8);

  const ownerStatsItems = [
    { label: t.landingPage.owner.stat1, value: ownerStats ? formatCurrency(ownerStats.averageMonthlyRevenue) : '₫15M', icon: TrendingUp },
    { label: t.landingPage.owner.stat2, value: `${ownerStats?.vehicleUtilization?.toFixed(0) ?? 78}%`, icon: BarChart3 },
    { label: t.landingPage.owner.stat3, value: ownerStats?.completedBookings?.toLocaleString() ?? '0', icon: CheckCircle },
    { label: t.landingPage.owner.stat4, value: `${ownerStats?.averageRating?.toFixed(1) ?? 4.8}/5`, icon: Star },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-md overflow-hidden bg-[#0B1221] flex flex-col lg:flex-row shadow-lg">
          {/* Left */}
          <div className="lg:w-1/2 p-10 lg:p-14">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={staggerItem} className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-3 block">
                {t.landingPage.owner.label}
              </motion.span>
              <motion.h2 variants={staggerItem} className="font-medium text-3xl lg:text-4xl text-white mb-4 display-font">
                {t.landingPage.owner.title}
              </motion.h2>
              <motion.p variants={staggerItem} className="text-slate-400 mb-8 leading-relaxed text-sm font-sans">
                {t.landingPage.owner.desc}
              </motion.p>

              {/* Stats */}
              <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4 mb-8 font-sans">
                {ownerStatsItems.map(({ label, value, icon: Icon }) => (
                  <motion.div key={label} variants={staggerItem}
                    className="p-4 rounded-md bg-white/5 border border-white/10">
                    <Icon className="w-4.5 h-4.5 text-[#D4AF37] mb-2" />
                    <p className="font-bold text-white text-xl">{value}</p>
                    <p className="text-slate-400 text-xs font-medium">{label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Earnings Calculator */}
              <motion.div variants={staggerItem} className="p-5 rounded-md bg-white/5 border border-white/10 mb-7 font-sans">
                <p className="text-white font-bold text-base mb-4">{t.landingPage.owner.calculator}</p>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-slate-350 text-xs w-32 flex-shrink-0">{t.landingPage.owner.days}</label>
                  <input type="range" min={5} max={28} value={days} onChange={e => setDays(+e.target.value)}
                    className="flex-1 accent-[#D4AF37]" />
                  <span className="text-white font-bold text-base w-8">{days}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-slate-350 text-xs w-32 flex-shrink-0">{t.landingPage.owner.price}</label>
                  <input type="range" min={200000} max={2000000} step={50000} value={pricePerDay}
                    onChange={e => setPricePerDay(+e.target.value)}
                    className="flex-1 accent-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-bold text-base w-24">{formatCurrency(pricePerDay)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between p-3 rounded-md bg-amber-500/10 border border-[#D4AF37]/30">
                  <span className="text-slate-300 text-xs">{t.landingPage.owner.income}</span>
                  <span className="font-bold text-[#D4AF37] text-xl">{formatCurrency(estimatedRevenue)}</span>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Link to="/owner"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md font-bold text-sm text-black bg-[#D4AF37] hover:bg-[#E5C158] transition-all">
                  <Sparkles className="w-4 h-4" /> {t.landingPage.owner.btn}
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1221] via-[#0B1221]/30 to-transparent lg:block hidden" />
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
  const t = useT();
  const language = useUIStore((s: any) => s.language);

  const DEFAULT_FAQS: FAQ[] = [
    { 
      id: 1, 
      q: language === 'vi' ? 'LuxeWay xác minh danh tính chủ xe như thế nào?' : 'How does LuxeWay verify vehicle owners?', 
      a: language === 'vi' ? 'Tất cả chủ xe phải hoàn thành quy trình xác thực KYC nghiêm ngặt: cung cấp căn cước công dân/hộ chiếu, số điện thoại, tài khoản ngân hàng và giấy tờ xe trước khi tin đăng được duyệt.' : 'All owners complete a rigorous KYC process: government ID, phone verification, bank account check, and vehicle document review before any listing goes live.' 
    },
    { 
      id: 2, 
      q: language === 'vi' ? 'Mỗi chuyến thuê xe bao gồm những gói bảo hiểm nào?' : 'What insurance is included in every rental?', 
      a: language === 'vi' ? 'Mỗi chuyến xe thuê trên LuxeWay đều được tích hợp sẵn gói bảo hiểm bảo vệ chuyến đi lên tới 500 triệu VND từ các đối tác bảo hiểm của chúng tôi. Bạn cũng có thể chọn mua gói nâng cấp khi đặt xe.' : 'All rentals include baseline coverage up to ₫500M per trip via our partner insurers. Additional premium coverage is available at booking.' 
    },
    { 
      id: 3, 
      q: language === 'vi' ? 'Tôi có thể hủy đơn đặt xe của mình không?' : 'Can I cancel my booking?', 
      a: language === 'vi' ? 'Có. Bạn có thể hủy chuyến đi miễn phí tối đa 48 giờ trước khi nhận xe. Việc hủy chuyến trong vòng 48 giờ trước giờ nhận xe có thể phải chịu một khoản phí nhỏ theo chính sách của từng xe.' : 'Free cancellation is available up to 48 hours before pickup. Cancellations within 48 hours may be subject to a partial fee per the vehicle\'s policy.' 
    },
    { 
      id: 4, 
      q: language === 'vi' ? 'Dịch vụ giao xe tận nơi hoạt động thế nào?' : 'How does door-to-door delivery work?', 
      a: language === 'vi' ? 'Các chủ xe có bật tính năng giao xe sẽ mang xe đến tận địa chỉ của bạn. Phí giao xe được hiển thị minh bạch tại trang thanh toán và được tính dựa trên khoảng cách di chuyển.' : 'Owners who have enabled delivery will bring the vehicle to your address. Delivery fees are shown transparently at checkout and vary by distance.' 
    },
    { 
      id: 5, 
      q: language === 'vi' ? 'Thanh toán có an toàn không và được xử lý như thế nào?' : 'How are payments processed and is it secure?', 
      a: language === 'vi' ? 'LuxeWay tích hợp cổng thanh toán VNPay được mã hóa bảo mật cấp ngân hàng. Số tiền thanh toán sẽ được giữ bảo đảm và chỉ chuyển cho chủ xe sau khi bạn nhận xe thành công.' : 'We use VNPay with bank-grade encryption. Payments are held in escrow and only released to owners after successful pickup confirmation.' 
    },
    { 
      id: 6, 
      q: language === 'vi' ? 'Nếu xảy ra tranh chấp thì xử lý thế nào?' : 'What happens if there is a dispute?', 
      a: language === 'vi' ? 'Đội ngũ hòa giải tranh chấp chuyên biệt của LuxeWay sẽ xem xét kỹ lưỡng hình ảnh bàn giao xe và lịch sử đặt xe. Hầu hết các tranh chấp đều được phân xử công bằng và dứt điểm trong vòng 24 giờ.' : 'Our dedicated dispute resolution team reviews photo evidence and trip records. Most disputes are resolved within 24 hours with full fairness to both parties.' 
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-[#D4AF37] mb-3 block">{t.landingPage.faq.label}</span>
          <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] display-font">{t.landingPage.faq.title}</h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3 font-sans">
          {(loading ? Array(5).fill(null) : displayFaqs).map((faq, i) => (
            <motion.div key={faq?.id ?? i} variants={staggerItem}>
              {faq ? (
                <div className={`bg-white rounded-md border transition-colors ${open === i ? 'border-[#D4AF37]/45' : 'border-slate-100 hover:border-[#D4AF37]/25'}`}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={open === i}
                  >
                    <span className="font-bold text-[#0B1221] text-base pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                      className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ChevronDown className="w-4 h-4 text-slate-550" />
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
                        <p className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : <Skeleton className="h-14 rounded-md" />}
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
  const t = useT();

  const links = {
    [t.landingPage.footer.explore || 'Explore']: [
      { label: t.landingPage.footer.marketplace || 'Marketplace', href: '/marketplace' },
      { label: t.landingPage.footer.topDestinations || 'Top Destinations', href: '/marketplace' },
      { label: t.landingPage.footer.compare || 'Compare Vehicles', href: '/compare' },
    ],
    [t.landingPage.footer.owners || 'Owners']: [
      { label: t.landingPage.footer.listVehicle || 'List Your Vehicle', href: '/owner' },
      { label: t.landingPage.footer.ownerDashboard || 'Owner Dashboard', href: '/owner/dashboard' },
      { label: t.landingPage.owner.calculator || 'Earnings Calculator', href: '/#become-owner' },
    ],
    [t.landingPage.footer.support || 'Support']: [
      { label: t.landingPage.footer.helpCenter || 'Help Center', href: '/help' },
      { label: t.landingPage.footer.trust || 'Trust & Safety', href: '/help' },
      { label: t.landingPage.footer.contactUs || 'Contact Us', href: '/help/contact' },
      { label: t.landingPage.footer.insurance || 'Insurance Info', href: '/help' },
    ],
    [t.landingPage.footer.legal || 'Legal']: [
      { label: t.landingPage.footer.about || 'About LuxeWay', href: '/about' },
      { label: t.landingPage.footer.terms || 'Terms of Service', href: '/terms' },
      { label: t.landingPage.footer.privacy || 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-[#0B1221] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="LuxeWay" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-slate-350 text-sm leading-relaxed mb-6 font-sans">
              {t.landingPage.footer.desc}
            </p>
            {/* Newsletter */}
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-3 font-sans">{t.landingPage.footer.updated}</p>
            <div className="flex gap-2 font-sans">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t.landingPage.footer.placeholder}
                className="flex-1 px-4 py-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#D4AF37]/50 transition-colors" />
              <button className="px-5 py-3 rounded-md bg-[#D4AF37] text-[#0B1221] text-sm font-bold hover:bg-[#E5C158] transition-colors">
                {t.landingPage.footer.go}
              </button>
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
                  className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0B1221] transition-all text-slate-400">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="font-sans">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-slate-400 text-sm hover:text-[#D4AF37] transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="py-6 border-t border-white/5 border-b border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          {[
            { icon: Phone, label: '+84 1800 LuxeWay', sub: t.landingPage.footer.hours },
            { icon: Mail, label: 'support@luxeway.vn', sub: t.landingPage.footer.response },
            { icon: MapPin, label: '123 Nguyen Hue, Ho Chi Minh City', sub: t.landingPage.footer.headquarters },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-slate-400 text-xs font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-450 font-medium font-sans">
          <p>{t.landingPage.footer.rights}</p>
          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.landingPage.footer.vietnam}</span>
            <span>·</span>
            <span>USD / VND</span>
            <span>·</span>
            <span>Tiếng Việt / English / 日本語 / 한국어 / 简体中文 / Français / Deutsch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


// =====================================================
// VEHICLE TYPE SHOWCASE — Cars & Motorbikes Side by Side
// =====================================================
const FEATURED_CARS = [
  { brand: 'Toyota', model: 'Camry 2.5Q', price: 1800000, rating: 4.9, city: 'TP.HCM', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800&auto=format&fit=crop', badge: 'Luxury' },
  { brand: 'Hyundai', model: 'Santa Fe 2024', price: 1500000, rating: 4.8, city: 'Hà Nội', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop', badge: 'SUV' },
  { brand: 'VinFast', model: 'VF8 Plus', price: 1600000, rating: 4.7, city: 'Đà Nẵng', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop', badge: 'Electric' },
  { brand: 'Mazda', model: 'CX-5 Premium', price: 1200000, rating: 4.8, city: 'Nha Trang', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop', badge: 'SUV' },
];

const FEATURED_MOTORBIKES = [
  { brand: 'Honda', model: 'SH350i', price: 650000, rating: 4.9, city: 'TP.HCM', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', badge: 'Premium' },
  { brand: 'Yamaha', model: 'Exciter 155', price: 280000, rating: 4.8, city: 'Hà Nội', img: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800&auto=format&fit=crop', badge: 'Sport' },
  { brand: 'Honda', model: 'Winner X', price: 250000, rating: 4.7, city: 'Đà Nẵng', img: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=800&auto=format&fit=crop', badge: 'Sport' },
  { brand: 'VinFast', model: 'Klara S', price: 180000, rating: 4.6, city: 'Đà Lạt', img: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=800&auto=format&fit=crop', badge: 'Electric' },
];

const getCityName = (city: string, lang: string) => {
  if (lang === 'vi') return city;
  const map: Record<string, string> = {
    'TP.HCM': 'Ho Chi Minh City',
    'Hà Nội': 'Hanoi',
    'Đà Nẵng': 'Da Nang',
    'Đà Lạt': 'Da Lat',
    'Nha Trang': 'Nha Trang'
  };
  return map[city] || city;
};

const VehicleTypeShowcase: React.FC = () => {
  const navigate = useNavigate();
  const t = useT();
  const language = useUIStore((s: any) => s.language);
  const [activeTab, setActiveTab] = useState<'cars' | 'motorbikes'>('cars');

  const list = activeTab === 'cars' ? FEATURED_CARS : FEATURED_MOTORBIKES;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.showcase.label}</span>
          <h2 className="font-medium text-3xl md:text-4xl text-[#0B1221] mb-3 display-font">{t.landingPage.showcase.title}</h2>
          <p className="text-slate-550 max-w-xl mx-auto text-sm font-sans">{t.landingPage.showcase.desc}</p>
        </motion.div>

        {/* Type Tabs */}
        <div className="flex justify-center mb-8 font-sans">
          <div className="inline-flex bg-slate-100 p-1 gap-1 rounded-md">
            <button
              onClick={() => setActiveTab('cars')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'cars' ? 'bg-[#0B1221] shadow text-white' : 'text-slate-500 hover:text-[#0B1221]'}`}
            >
              <Car className="w-4 h-4" /> {t.landingPage.showcase.cars}
            </button>
            <button
              onClick={() => setActiveTab('motorbikes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'motorbikes' ? 'bg-[#D4AF37] shadow text-[#0B1221]' : 'text-slate-500 hover:text-[#0B1221]'}`}
            >
              <Bike className="w-4 h-4" /> {t.landingPage.showcase.motorbikes}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-sans"
          >
            {list.map((v, idx) => (
              <motion.div
                key={v.model}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-md overflow-hidden shadow-sm hover:border-[#D4AF37]/35 transition-all duration-300 cursor-pointer border border-slate-100 group"
                onClick={() => navigate(`/marketplace?type=${activeTab === 'cars' ? 'car' : 'motorbike'}&q=${encodeURIComponent(v.model)}`)}
              >
                <div className="relative h-40 overflow-hidden bg-slate-50">
                  <img src={v.img} alt={v.model} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className={`absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-sm ${activeTab === 'cars' ? 'bg-[#0B1221] text-white' : 'bg-[#D4AF37] text-[#0B1221]'}`}>{v.badge}</span>
                  <div className="absolute bottom-2 right-2.5 bg-black/70 rounded-md px-2 py-1">
                    <p className="text-white text-xs font-bold">{formatCurrency(v.price)}<span className="text-white/60 font-normal">{language === 'vi' ? '/ngày' : '/day'}</span></p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{v.brand}</p>
                  <h3 className="font-bold text-slate-800 text-sm mb-2 truncate group-hover:text-[#D4AF37] transition-colors">{v.model}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="text-xs font-bold text-slate-700">{v.rating}</span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{getCityName(v.city, language)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate(`/marketplace?type=${activeTab === 'cars' ? 'car' : 'motorbike'}`)}
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-bold text-xs uppercase tracking-wider text-white transition-all hover:scale-[1.01] active:scale-[0.99] ${activeTab === 'cars' ? 'bg-[#0B1221] hover:bg-slate-800' : 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221]'}`}
          >
            {activeTab === 'cars' ? t.landingPage.showcase.viewAllCars : t.landingPage.showcase.viewAllMotorbikes} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// REVENUE CALCULATOR — Owner Earning Estimator
// =====================================================
const RevenueCalculator: React.FC = () => {
  const t = useT();
  const language = useUIStore((s: any) => s.language);
  const [vehicleType, setVehicleType] = useState<'car' | 'motorbike'>('car');
  const [daysPerMonth, setDaysPerMonth] = useState(15);
  const [pricePerDay, setPricePerDay] = useState(1000000);

  const carPresets = [
    { label: 'Toyota Vios', price: 800000 },
    { label: 'Mazda CX5', price: 1400000 },
    { label: 'Mercedes C200', price: 2500000 },
    { label: 'BMW 320i', price: 3000000 },
  ];
  const motoPresets = [
    { label: 'Honda Vision', price: 150000 },
    { label: 'Honda SH125i', price: 300000 },
    { label: 'Yamaha Exciter', price: 250000 },
    { label: 'Honda SH350i', price: 700000 },
  ];

  const presets = vehicleType === 'car' ? carPresets : motoPresets;

  React.useEffect(() => {
    setPricePerDay(vehicleType === 'car' ? 1000000 : 200000);
  }, [vehicleType]);

  const grossRevenue = pricePerDay * daysPerMonth;
  const platformFee = Math.round(grossRevenue * 0.08);
  const netRevenue = grossRevenue - platformFee;
  const annualRevenue = netRevenue * 12;

  const perDayLabel = language === 'vi' ? '/ngày' : '/day';

  return (
    <section className="py-20 bg-[#0B1221] overflow-hidden relative">
      <div className="max-w-5xl mx-auto px-6 relative">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">{t.landingPage.calculator.label}</span>
          <h2 className="font-medium text-3xl md:text-4xl text-white mb-3 display-font">{t.landingPage.calculator.title}</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm font-sans">{t.landingPage.calculator.desc}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-md p-8 space-y-6 font-sans">
            {/* Vehicle type toggle */}
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">{t.landingPage.calculator.vehicleType}</p>
              <div className="flex gap-2">
                <button onClick={() => setVehicleType('car')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-xs uppercase tracking-wider font-bold border-2 transition-all ${vehicleType === 'car' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
                  <Car className="w-4 h-4" /> {t.landingPage.calculator.cars}
                </button>
                <button onClick={() => setVehicleType('motorbike')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-xs uppercase tracking-wider font-bold border-2 transition-all ${vehicleType === 'motorbike' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
                  <Bike className="w-4 h-4" /> {t.landingPage.calculator.motorbikes}
                </button>
              </div>
            </div>

            {/* Preset models */}
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">{t.landingPage.calculator.selectModel}</p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(p => (
                  <button key={p.label} onClick={() => setPricePerDay(p.price)}
                    className={`py-2.5 px-3 rounded-md text-xs font-bold border transition-all text-left ${pricePerDay === p.price ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
                    {p.label}
                    <span className="block text-[9px] opacity-60 mt-0.5">{formatCurrency(p.price)}{perDayLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{t.landingPage.calculator.priceDay}</p>
                <span className="text-white font-extrabold text-sm">{formatCurrency(pricePerDay)}</span>
              </div>
              <input type="range"
                min={vehicleType === 'car' ? 500000 : 100000}
                max={vehicleType === 'car' ? 8000000 : 1500000}
                step={vehicleType === 'car' ? 100000 : 10000}
                value={pricePerDay}
                onChange={e => setPricePerDay(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
            </div>

            {/* Days slider */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{t.landingPage.calculator.daysMonth}</p>
                <span className="text-white font-extrabold text-sm">{daysPerMonth} {t.landingPage.calculator.daysUnit}</span>
              </div>
              <input type="range" min={5} max={30} step={1} value={daysPerMonth}
                onChange={e => setDaysPerMonth(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" />
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>5 {t.landingPage.calculator.daysUnit}</span><span>15 {t.landingPage.calculator.daysUnit}</span><span>30 {t.landingPage.calculator.daysUnit}</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="space-y-4 font-sans">
            <div className="bg-[#131F35] border border-[#D4AF37]/30 rounded-md p-8 text-center">
              <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">{t.landingPage.calculator.netRevenueMonth}</p>
              <motion.p
                key={netRevenue}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl md:text-5xl font-extrabold text-white tabular-nums"
              >
                {formatCurrency(netRevenue)}
              </motion.p>
              <p className="text-white/40 text-[10px] mt-2">{t.landingPage.calculator.afterFee}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-md p-5 text-center">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{t.landingPage.calculator.grossRevenue}</p>
                <p className="text-2xl font-extrabold text-white">{formatCurrency(grossRevenue)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-5 text-center">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{t.landingPage.calculator.annualRevenue}</p>
                <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(annualRevenue)}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-md p-5">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">{t.landingPage.calculator.priceDay}</span>
                <span className="text-white font-bold text-sm">{formatCurrency(pricePerDay)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">{t.landingPage.calculator.daysMonth.split(' / ')[0]}</span>
                <span className="text-white font-bold text-sm">{daysPerMonth} {t.landingPage.calculator.daysUnit}/{language === 'vi' ? 'tháng' : 'month'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">{t.landingPage.calculator.feeLabel}</span>
                <span className="text-amber-400 font-bold text-sm">-{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white font-bold">{t.landingPage.calculator.netRevenueLabel}</span>
                <span className="text-emerald-400 font-extrabold text-lg">{formatCurrency(netRevenue)}</span>
              </div>
            </div>

            <Link to="/auth/register"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-md font-bold bg-[#D4AF37] text-[#0B1221] text-xs uppercase tracking-wider transition-all hover:bg-[#E5C158]">
              <TrendingUp className="w-4 h-4 text-[#0B1221]" />
              <span>{t.landingPage.calculator.cta}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// LIVE MARKETPLACE ACTIVITY
// =====================================================
const LiveActivitySection: React.FC = () => {
  const t = useT();
  const language = useUIStore((s: any) => s.language);
  const [pointer, setPointer] = useState(0);

  const eventsList = React.useMemo(() => {
    if (language === 'vi') {
      return [
        { icon: '🚗', text: 'Toyota Camry vừa được đặt tại TP.HCM', time: '2 phút trước', type: 'booking' },
        { icon: '🏍️', text: 'Honda SH350i nhận đánh giá 5⭐ tại Hà Nội', time: '5 phút trước', type: 'review' },
        { icon: '🚙', text: 'Mazda CX5 mới được đăng ký tại Đà Nẵng', time: '8 phút trước', type: 'listing' },
        { icon: '⚡', text: 'VinFast VF8 vừa được đặt online tức thì', time: '12 phút trước', type: 'instant' },
        { icon: '🛵', text: 'Yamaha Exciter 155 bắt đầu chuyến đi tại Nha Trang', time: '15 phút trước', type: 'active' },
        { icon: '💰', text: 'Chủ xe ở TP.HCM vừa nhận 3.600.000₫ doanh thu hôm nay', time: '18 phút trước', type: 'revenue' },
        { icon: '✅', text: 'Honda CR-V hoàn thành chuyến đi 5 ngày tại Đà Lạt', time: '22 phút trước', type: 'completed' },
        { icon: '🏆', text: 'Hyundai Santa Fe được xếp hạng #1 tuần này tại Hà Nội', time: '30 phút trước', type: 'ranking' },
      ];
    } else {
      return [
        { icon: '🚗', text: 'Toyota Camry has just been booked in Ho Chi Minh City', time: '2 mins ago', type: 'booking' },
        { icon: '🏍️', text: 'Honda SH350i received a 5⭐ review in Hanoi', time: '5 mins ago', type: 'review' },
        { icon: '🚙', text: 'Mazda CX5 newly listed in Da Nang', time: '8 mins ago', type: 'listing' },
        { icon: '⚡', text: 'VinFast VF8 just booked instantly online', time: '12 mins ago', type: 'instant' },
        { icon: '🛵', text: 'Yamaha Exciter 155 started a trip in Nha Trang', time: '15 mins ago', type: 'active' },
        { icon: '💰', text: 'A host in Ho Chi Minh City just earned 3,600,000₫ today', time: '18 mins ago', type: 'revenue' },
        { icon: '✅', text: 'Honda CR-V completed a 5-day trip in Da Lat', time: '22 mins ago', type: 'completed' },
        { icon: '🏆', text: 'Hyundai Santa Fe ranked #1 this week in Hanoi', time: '30 mins ago', type: 'ranking' },
      ];
    }
  }, [language]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointer(p => (p + 1) % eventsList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [eventsList]);

  const colorMap: Record<string, string> = {
    booking: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    review: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    listing: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    instant: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    active: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    revenue: 'bg-green-500/10 border-green-500/30 text-green-400',
    completed: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    ranking: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-amber-500 mb-2 block">{t.landingPage.liveActivity.label}</span>
            <h2 className="font-bold text-2xl md:text-3xl text-[#0F172A] dark:text-white flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                {t.landingPage.liveActivity.title}
              </span>
            </h2>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            {t.landingPage.liveActivity.updateNotice}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eventsList.map((ev, i) => {
            const isActive = i === pointer;
            return (
              <motion.div
                key={ev.text}
                animate={isActive ? { scale: 1.01, opacity: 1 } : { scale: 1, opacity: 0.7 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${isActive ? colorMap[ev.type] : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'}`}
              >
                <span className="text-xl flex-shrink-0">{ev.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? '' : 'text-slate-600 dark:text-slate-400'}`}>{ev.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{ev.time}</p>
                </div>
                {isActive && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-current/10 uppercase tracking-wider flex-shrink-0">LIVE</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
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
  const [latest, setLatest] = useState<TrendingVehicle[]>([]);
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

  const t = useT();
  const language = useUIStore((s: any) => s.language);

  const loadStats = () => {
    setStatsError(null);
    homeService.getStats().then(d => {
      if (d === null) {
        const statsErrorMessage = language === 'vi'
          ? 'Không thể tải số liệu thống kê — máy chủ có thể không hoạt động.'
          : 'Could not load statistics — backend may be unavailable.';
        setStatsError(statsErrorMessage);
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
    homeService.getHomeVehicles().then(d => {
      if (d) {
        setTrending(d.popular ?? []);
        setLatest(d.latest ?? []);
      }
      setLoadingTrending(false);
    });
    homeService.getDestinations().then(d => { setDestinations(d ?? []); setLoadingDests(false); });
    homeService.getTestimonials().then(d => { setTestimonials(d ?? null); setLoadingTestimonials(false); });
    homeService.getFaqs().then(d => { setFaqs(d ?? []); setLoadingFaqs(false); });
  }, [language]);

  const statsErrorMessage = statsError;
  const retryLabel = language === 'vi' ? 'Thử lại' : 'Retry';

  return (
    <div className="bg-white dark:bg-slate-950">
      <HeroSection stats={stats} />
      {/* Stats error banner */}
      {statsErrorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 py-3 px-6 flex items-center justify-between">
          <p className="text-rose-700 text-sm font-semibold">⚠ {statsErrorMessage}</p>
          <button onClick={loadStats} className="text-rose-700 text-sm underline hover:no-underline font-bold">{retryLabel}</button>
        </div>
      )}
      <StatsBar stats={stats} />
      <VehicleTypeShowcase />
      <PromotionSection promotions={promotions} loading={loadingPromos} />
      <TrendingSection vehicles={trending} loading={loadingTrending} />
      <LatestSection vehicles={latest} loading={loadingTrending} />
      <CategoriesSection data={categories} />
      <DestinationsSection destinations={destinations} loading={loadingDests} />
      <LiveActivitySection />
      <WhyLuxeWaySection />
      <HowItWorksSection />
      <RevenueCalculator />
      <InsuranceSection />
      <TestimonialsSection data={testimonials} loading={loadingTestimonials} />
      <BecomeOwnerSection ownerStats={ownerStats} />
      <FAQSection faqs={faqs} loading={loadingFaqs} />
      <Footer />
    </div>
  );
};

export default LandingPage;

