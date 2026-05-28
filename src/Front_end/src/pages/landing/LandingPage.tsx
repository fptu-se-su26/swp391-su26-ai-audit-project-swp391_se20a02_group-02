import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, ChevronDown, ChevronRight,
  ArrowRight, Star, Shield, Zap, Globe, TrendingUp,
  Play, CheckCircle, Car, Users, Award, Clock,
  Sparkles, Phone, Mail, ChevronUp, Quote
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import type { Vehicle } from '@/types';
import { formatCurrency, formatNumber } from '@/utils';
import { staggerContainer, staggerItem, fadeUp, heroTextVariants } from '@/animations/variants';
import logoImage from '@/image/logo.png';
import { useT } from '@/i18n/translations';

// ====== HERO SECTION ======
const HeroSection: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (vehicleType) params.set('category', vehicleType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/marketplace?${params.toString()}`);
  };

  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2574&auto=format&fit=crop',
  ];

  const [heroImage, setHeroImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImage(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background with Parallax */}
      <motion.div className="absolute inset-0" style={{ y, scale: 1.1 }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={heroImage}
            src={HERO_IMAGES[heroImage]}
            alt="Luxury vehicle"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Gradient overlay - lighter to improve text readability without full black */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.65) 100%)' }} />
      </motion.div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Mouse Parallax Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
        style={{ opacity }}
        animate={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            custom={0}
            variants={heroTextVariants}
            className="inline-flex items-center gap-2 px-4 py-2 glass text-white/90 text-sm font-medium rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            {t.landing.hero.badge}
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            custom={1}
            variants={heroTextVariants}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight mb-6"
          >
            {t.landing.hero.title1}
            <br />
            <span className="text-gradient-gold">{t.landing.hero.title2}</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={2}
            variants={heroTextVariants}
            className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {t.landing.hero.subtitle}
          </motion.p>

          {/* Search Card */}
          <motion.div
            custom={3}
            variants={heroTextVariants}
            className="glass rounded-3xl p-3 max-w-5xl w-full mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {/* Location */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl text-left">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.landing.hero.location}</p>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={t.landing.hero.locationPlaceholder}
                    className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 outline-none bg-transparent"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.landing.hero.pickUp}</p>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-sm font-medium text-[#0F172A] outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.landing.hero.return}</p>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-sm font-medium text-[#0F172A] outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Category + Search */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl">
                  <Car className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.landing.hero.category}</p>
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="w-full text-sm font-medium text-[#0F172A] outline-none bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">{t.categories.all}</option>
                      <option value="motorbike">{t.categories.motorbike}</option>
                      <option value="economy">{t.categories.economy}</option>
                      <option value="family">{t.categories.family}</option>
                      <option value="suv">{t.categories.suv}</option>
                      <option value="city_car">{t.categories.city_car}</option>
                      <option value="business">{t.categories.business}</option>
                      <option value="electric">{t.categories.electric}</option>
                      <option value="tourism">{t.categories.tourism}</option>
                    </select>
                  </div>
                </div>
                <motion.button
                  onClick={handleSearch}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-3.5 bg-[#0F172A] text-white font-semibold rounded-2xl text-sm whitespace-nowrap"
                  style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.4)' }}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.landing.hero.search}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Brand Tags - pass brand to marketplace filter */}
          <motion.div custom={4} variants={heroTextVariants} className="flex flex-wrap justify-center gap-2 mt-6">
            {['Honda', 'Yamaha', 'VinFast', 'Toyota', 'KIA', 'Mazda'].map(brand => (
              <button
                key={brand}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('brand', brand.toLowerCase());
                  navigate(`/marketplace?${params.toString()}`);
                }}
                className="px-3 py-1.5 glass text-white/80 text-xs font-medium rounded-full hover:bg-white/20 transition-colors duration-200 border border-white/20"
              >
                {brand}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity }}
      >
        <p className="text-white/50 text-xs uppercase tracking-widest">Scroll</p>
        <ChevronDown className="w-4 h-4 text-white/50" />
      </motion.div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-1.5">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setHeroImage(i)}
            className={`transition-all duration-300 rounded-full ${heroImage === i ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
};

// ====== STATS SECTION ======
interface StatsSectionProps {
  statsData: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ statsData }) => {
  const t = useT();
  const stats = [
    { value: statsData?.qualityVehicles ?? 0, suffix: (statsData?.qualityVehicles > 0) ? '+' : '', label: t.landing.stats.vehicles, icon: Car },
    { value: statsData?.provinces ?? 0, suffix: '', label: t.landing.stats.provinces, icon: Globe },
    { value: statsData?.happyClients ?? 0, suffix: (statsData?.happyClients > 0) ? '+' : '', label: t.landing.stats.clients, icon: Users },
    { value: statsData?.averageRating ?? 0, suffix: (statsData?.averageRating > 0) ? '/5' : '', label: t.landing.stats.rating, icon: Star, decimal: true },
  ];

  return (
    <section className="py-16 bg-[#0F172A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4 group-hover:bg-accent/20 transition-colors duration-300 mx-auto">
                <stat.icon className="w-6 h-6 text-gold" />
              </div>
              <div className="text-4xl font-display font-bold text-white mb-1">
                {stat.decimal ? stat.value : formatNumber(stat.value)}{stat.suffix}
              </div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ====== CATEGORIES SECTION ======
interface CategoriesSectionProps {
  categoryCounts: Record<string, number> | undefined;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categoryCounts }) => {
  const t = useT();
  const getCategoryCountText = (catName: string) => {
    if (!categoryCounts) return t.common.loading;
    const count = categoryCounts[catName.toLowerCase()];
    const isVi = t.common.loading.includes('Đang');
    if (isVi) {
      return `${count ?? 0} xe`;
    }
    return `${count ?? 0} vehicle${count === 1 ? '' : 's'}`;
  };

  const isVi = t.common.loading.includes('Đang');

  const categories = [
    {
      title: t.categories.economy,
      subtitle: isVi ? 'Đáng tin cậy và tiết kiệm' : 'Reliable and affordable',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=economy',
      count: getCategoryCountText('economy'),
      span: 'md:col-span-8',
      height: 'h-[360px]',
    },
    {
      title: t.categories.family,
      subtitle: isVi ? 'Rộng rãi và thoải mái cho mọi người' : 'Spacious comfort for everyone',
      image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1964&auto=format&fit=crop',
      href: '/marketplace?category=family',
      count: getCategoryCountText('family'),
      span: 'md:col-span-4',
      height: 'h-[360px]',
    },
    {
      title: t.categories.motorbike,
      subtitle: isVi ? 'Hoàn hảo để đi lại trong thành phố' : 'Perfect for city navigation',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=motorbike',
      count: getCategoryCountText('motorbike'),
      span: 'md:col-span-4',
      height: 'h-[300px]',
    },
    {
      title: t.categories.business,
      subtitle: isVi ? 'Chuyên nghiệp và sang trọng' : 'Professional and premium',
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=business',
      count: getCategoryCountText('business'),
      span: 'md:col-span-4',
      height: 'h-[300px]',
    },
    {
      title: t.categories.electric,
      subtitle: isVi ? 'Thân thiện với môi trường và êm ái' : 'Eco-friendly and quiet',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=electric',
      count: getCategoryCountText('electric'),
      span: 'md:col-span-4',
      height: 'h-[300px]',
    },
  ];

  return (
    <section className="section">
      <div className="container-lux">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12"
        >
          <div>
            <span className="text-label text-gold mb-2 block">{isVi ? 'Bộ Sưu Tập Tuyển Chọn' : 'The Curated Collection'}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A]">
              {t.landing.categories.title}
            </h2>
          </div>
          <Link to="/marketplace" className="mt-4 sm:mt-0 flex items-center gap-2 text-sm font-semibold text-accent hover:text-blue-700 transition-colors">
            {t.landing.featured.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              variants={staggerItem}
              className={`${cat.span} ${cat.height} relative rounded-3xl overflow-hidden group cursor-pointer`}
            >
              <Link to={cat.href} className="block w-full h-full">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-3">
                    {cat.count}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-white/70 text-sm">{cat.subtitle}</p>
                  <div className="flex items-center gap-1 text-gold text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isVi ? 'Khám phá' : 'Explore'} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ====== FEATURED VEHICLES SECTION ======
const FeaturedVehiclesSection: React.FC = () => {
  const t = useT();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehicleService.getFeatured().then(v => {
      setVehicles(v.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <section className="section bg-slate-50">
      <div className="container-lux">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-label text-gold mb-2 block">{t.landing.featured.titleLabel}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
            {t.landing.featured.title}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            {t.landing.featured.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={staggerItem}>
                <VehicleCardSkeleton />
              </motion.div>
            ))
            : vehicles.map(vehicle => (
              <motion.div key={vehicle.id} variants={staggerItem}>
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))
          }
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/marketplace" className="btn-outline px-8 py-4 text-base inline-flex items-center gap-2">
            {t.landing.featured.viewAll} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const TopCitiesSection: React.FC = () => {
  const t = useT();
  const [cities, setCities] = useState<any[]>([
    { name: 'Ho Chi Minh', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop', vehicles: 240 },
    { name: 'Ha Noi', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop', vehicles: 186 },
    { name: 'Da Nang', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop', vehicles: 94 },
    { name: 'Nha Trang', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=800&auto=format&fit=crop', vehicles: 120 },
    { name: 'Da Lat', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format&fit=crop', vehicles: 158 },
    { name: 'Hai Phong', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?q=80&w=800&auto=format&fit=crop', vehicles: 127 },
  ]);

  useEffect(() => {
    import('@/services/otherServices').then(({ locationService }) => {
      locationService.getTopCities().then(data => {
        if (data && data.length > 0) {
          const normalize = (name: string) =>
            name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .trim();

          setCities(prevCities =>
            prevCities.map(city => {
              const match = data.find(
                (db: any) => normalize(db.name) === normalize(city.name)
              );
              return {
                ...city,
                vehicles: match ? Number(match.vehicles) : 0,
              };
            })
          );
        } else {
          // If backend returns empty array, set all counts to 0 to be honest with DB
          setCities(prevCities => prevCities.map(c => ({ ...c, vehicles: 0 })));
        }
      }).catch(() => {
        setCities(prevCities => prevCities.map(c => ({ ...c, vehicles: 0 })));
      });
    });
  }, []);

  return (
    <section className="section">
      <div className="container-lux">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <span className="text-label text-gold mb-2 block">{t.landing.destinations.label}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A]">
              {t.landing.destinations.title}
            </h2>
          </div>
          <Link to="/marketplace" className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-blue-700 transition-colors">
            {t.landing.destinations.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {cities.map(city => (
            <motion.div key={city.name} variants={staggerItem}>
              <Link
                to={`/marketplace?location=${city.name}`}
                className="relative rounded-2xl overflow-hidden h-48 block group"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display font-bold text-white text-base leading-tight">{city.name}</p>
                  <p className="text-white/60 text-xs">{city.vehicles} {t.landing.destinations.vehicles}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ====== REVIEWS SECTION ======
const ReviewsSection: React.FC = () => {
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/services/otherServices').then(({ reviewService }) => {
      reviewService.getFeaturedReviews().then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((r: any) => ({
            name: r.reviewer?.displayName || 'Anonymous',
            avatar: r.reviewer?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            vehicle: isVi ? 'Xe Cao Cấp' : 'Luxury Vehicle',
            rating: r.rating || 5,
            comment: r.comment || 'Great experience!'
          }));
          setReviews(formatted);
        } else {
          setReviews([]);
        }
        setLoading(false);
      }).catch(() => {
        setReviews([]);
        setLoading(false);
      });
    });
  }, [isVi]);

  return (
    <section className="section bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold rounded-full blur-3xl" />
      </div>

      <div className="container-lux relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-label text-gold mb-2 block">{t.landing.testimonials.title}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t.landing.testimonials.subtitle}
          </h2>
          <div className="flex justify-center items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-white text-base font-semibold">5.00 {t.landing.testimonials.outOf5}</span>
            <span className="text-slate-400 text-sm">{t.landing.testimonials.verified}</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-dark rounded-3xl p-6 h-48 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 glass-dark rounded-3xl p-8 max-w-md mx-auto">
            <Quote className="w-10 h-10 text-gold mx-auto mb-4 opacity-40" />
            <p className="text-white text-lg font-semibold mb-2">{isVi ? 'Chưa có đánh giá nào' : 'No Reviews Yet'}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t.landing.testimonials.empty}
            </p>
            <Link to="/marketplace" className="btn-gold px-6 py-3 text-sm inline-flex items-center gap-2">
              {t.nav.marketplace}
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {reviews.map((review, idx) => (
              <motion.div key={idx} variants={staggerItem}>
                <div className="glass-dark rounded-3xl p-6 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-gold mb-4 opacity-60" />
                  <p className="text-white/80 text-sm leading-relaxed flex-1 mb-6">{review.comment}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-semibold text-white text-sm">{review.name}</p>
                      <p className="text-slate-400 text-xs">{review.vehicle}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

// ====== BUSINESS SECTION ======
const BusinessSection: React.FC = () => {
  const t = useT();
  const features = [
    { icon: Shield, title: t.landing.owner.f1Title, desc: t.landing.owner.f1Desc },
    { icon: CheckCircle, title: t.landing.owner.f2Title, desc: t.landing.owner.f2Desc },
    { icon: TrendingUp, title: t.landing.owner.f3Title, desc: t.landing.owner.f3Desc },
    { icon: Clock, title: t.landing.owner.f4Title, desc: t.landing.owner.f4Desc },
  ];

  return (
    <section className="section">
      <div className="container-lux">
        <div className="bg-[#0F172A] rounded-[40px] overflow-hidden flex flex-col lg:flex-row">
          {/* Content */}
          <div className="lg:w-1/2 p-10 lg:p-16">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.span variants={staggerItem} className="text-label text-gold mb-3 block">
                {t.landing.owner.label}
              </motion.span>
              <motion.h2 variants={staggerItem} className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">
                {t.landing.owner.title}
              </motion.h2>
              <motion.p variants={staggerItem} className="text-slate-400 text-base leading-relaxed mb-8">
                {t.landing.owner.desc}
              </motion.p>
              <motion.div variants={staggerContainer} className="space-y-4 mb-10">
                {features.map(f => (
                  <motion.div key={f.title} variants={staggerItem} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{f.title}</p>
                      <p className="text-slate-400 text-sm">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={staggerItem}>
                <Link to="/owner" className="btn-gold px-8 py-4 text-base inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t.landing.owner.btn}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Image */}
          <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=2070&auto=format&fit=crop"
              alt="Owner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-transparent to-transparent lg:block hidden" />

            {/* Revenue Card Float */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 right-8 glass rounded-2xl p-4 max-w-[180px]"
            >
              <p className="text-xs text-slate-500 mb-1">{t.landing.owner.earningsLabel}</p>
              <p className="font-display text-2xl font-bold text-[#0F172A]">$12,450</p>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +23% {t.landing.owner.growth}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ====== FAQ SECTION ======
const FAQSection: React.FC = () => {
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqsEn = [
    { q: 'How does LuxeWay verify vehicles?', a: 'Every vehicle undergoes a comprehensive 120-point inspection by certified mechanics, including photo verification, document checks, and insurance validation before listing.' },
    { q: 'What insurance is included?', a: 'All rentals include our baseline $1M coverage. Premium plans up to $5M are available. You can also add your own insurance during booking.' },
    { q: 'Can I cancel my booking?', a: 'Yes. Free cancellation is available up to 48 hours before pickup. Late cancellations may incur a fee depending on the vehicle\'s policy.' },
    { q: 'How does delivery work?', a: 'Owners with delivery enabled will bring the vehicle to your specified address. Fees vary by distance and are shown transparently at checkout.' },
    { q: 'Is there a minimum age requirement?', a: 'Renters must be at least 25 years old and hold a valid driving license for at least 3 years. Some exotic vehicles may have higher requirements.' },
    { q: 'How are payments processed?', a: 'We use Stripe and VNPay for secure payments. You can also use our LuxeWay wallet. Payments are only released to owners after successful pickup confirmation.' },
  ];

  const faqsVi = [
    { q: 'LuxeWay xác minh phương tiện như thế nào?', a: 'Mỗi phương tiện đều trải qua quy trình kiểm tra toàn diện 120 điểm bởi các kỹ thuật viên được chứng nhận, bao gồm xác minh hình ảnh, kiểm tra giấy tờ và hiệu lực bảo hiểm trước khi đăng tải.' },
    { q: 'Những gói bảo hiểm nào được bao gồm?', a: 'Tất cả các chuyến thuê xe đều bao gồm gói bảo hiểm cơ bản trị giá 1 triệu USD. Các gói cao cấp lên đến 5 triệu USD luôn có sẵn để đăng ký thêm khi đặt xe.' },
    { q: 'Tôi có thể hủy đặt xe không?', a: 'Có. Miễn phí hủy đặt xe trước giờ nhận xe 48 tiếng. Việc hủy muộn hơn có thể phát sinh một khoản phí nhỏ tùy thuộc vào chính sách của chủ xe.' },
    { q: 'Dịch vụ giao nhận xe hoạt động như thế nào?', a: 'Những chủ xe có bật dịch vụ giao xe sẽ đưa xe đến địa chỉ bạn yêu cầu. Phí giao xe tùy thuộc vào khoảng cách và được hiển thị minh bạch khi thanh toán.' },
    { q: 'Yêu cầu về độ tuổi tối thiểu là bao nhiêu?', a: 'Khách thuê phải từ 25 tuổi trở lên và có bằng lái xe hợp lệ từ 3 năm trở lên. Một số dòng xe siêu sang hoặc đặc biệt có thể yêu cầu cao hơn.' },
    { q: 'Phương thức thanh toán được xử lý ra sao?', a: 'Chúng tôi sử dụng cổng thanh toán Stripe và VNPay để đảm bảo an toàn tuyệt đối. Bạn cũng có thể dùng ví điện tử LuxeWallet. Tiền thuê xe chỉ được chuyển cho chủ xe sau khi bạn nhận xe thành công.' },
  ];

  const [faqs, setFaqs] = useState<any[]>(faqsEn);

  useEffect(() => {
    import('@/services/otherServices').then(({ faqService }) => {
      faqService.getFAQs().then((data: any) => {
        if (data && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(isVi ? faqsVi : faqsEn);
        }
      }).catch(() => {
        setFaqs(isVi ? faqsVi : faqsEn);
      });
    });
  }, [isVi]);

  return (
    <section className="section">
      <div className="container-lux max-w-3xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-label text-gold mb-2 block">{t.landing.faq.label}</span>
          <h2 className="font-display text-4xl font-bold text-[#0F172A]">
            {t.landing.faq.title}
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={staggerItem}>
              <div
                className={`luxury-card overflow-hidden transition-all duration-300 ${openIndex === i ? 'ring-1 ring-accent/20' : ''}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-semibold text-[#0F172A] text-sm pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ====== FOOTER ======
// ====== FOOTER ======
const Footer: React.FC = () => {
  const t = useT();
  const isVi = t.common.loading.includes('Đang');

  const sections = {
    [t.landing.footer.explore]: [
      { label: t.landing.footer.marketplace, href: '/marketplace' },
      { label: t.landing.footer.search, href: '/marketplace' },
      { label: t.landing.footer.topDestinations, href: '/marketplace' },
      { label: t.landing.footer.compare, href: '/marketplace' },
    ],
    [t.landing.footer.host]: [
      { label: t.landing.footer.listVehicle, href: '/owner' },
      { label: t.landing.footer.ownerDashboard, href: '/owner' },
      { label: t.landing.footer.business, href: '/marketplace' },
      { label: t.landing.footer.pricing, href: '/help' },
    ],
    [t.landing.footer.support]: [
      { label: t.landing.footer.helpCenter, href: '/help' },
      { label: t.landing.footer.trust, href: '/help' },
      { label: t.landing.footer.contactUs, href: '/help/contact' },
      { label: t.landing.footer.insurance, href: '/help' },
    ],
    [t.landing.footer.legal]: [
      { label: t.landing.footer.about, href: '/about' },
      { label: t.landing.footer.terms, href: '/terms' },
      { label: t.landing.footer.privacy, href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container-lux py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 logo-wrapper">
              <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t.landing.footer.desc}
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t.landing.footer.placeholder}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/50 transition-colors"
              />
              <button className="btn-gold px-4 py-2.5 text-sm rounded-xl">
                {t.landing.footer.subscribe}
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName}>
              <h4 className="font-semibold text-white mb-4 text-sm">{sectionName}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-slate-400 text-sm hover:text-white hover:text-gold transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2026 LuxeWay International. {t.landing.footer.rights}</p>
          <div className="flex items-center gap-4">
            {/* Social Links */}
            {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map(social => (
              <a key={social} href="#" className="text-slate-500 hover:text-white text-xs transition-colors">
                {social}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5" />
            <span>USD</span>
            <span>•</span>
            <span>{isVi ? 'Tiếng Việt' : 'English'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ====== HOW IT WORKS SECTION ======
// ====== HOW IT WORKS SECTION ======
const HowItWorksSection: React.FC = () => {
  const t = useT();
  const steps = [
    {
      number: '01',
      icon: Search,
      title: t.landing.howItWorks.step1Title,
      desc: t.landing.howItWorks.step1Desc,
      color: 'from-blue-500 to-blue-700',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      number: '02',
      icon: Calendar,
      title: t.landing.howItWorks.step2Title,
      desc: t.landing.howItWorks.step2Desc,
      color: 'from-gold to-yellow-600',
      bgLight: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      number: '03',
      icon: Car,
      title: t.landing.howItWorks.step3Title,
      desc: t.landing.howItWorks.step3Desc,
      color: 'from-emerald-500 to-emerald-700',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <section className="section bg-slate-50">
      <div className="container-lux">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-label text-gold mb-2 block">{t.landing.howItWorks.label}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
            {t.landing.howItWorks.title}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            {t.landing.howItWorks.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative"
        >
          {/* Connector Lines (desktop only) */}
          <div className="hidden md:flex absolute top-16 left-1/3 right-1/3 items-center justify-between px-4 pointer-events-none" style={{ zIndex: 0 }}>
            {[0, 1].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex-1 h-px border-t-2 border-dashed border-slate-200" />
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center group hover:shadow-luxury transition-all duration-300"
              style={{ zIndex: 1 }}
            >
              {/* Step Number */}
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 ${step.bgLight} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`w-8 h-8 ${step.iconColor}`} />
              </div>

              <h3 className="font-display text-xl font-bold text-[#0F172A] mb-3">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/marketplace" className="btn-primary px-10 py-4 text-base inline-flex items-center gap-2">
            <Zap className="w-5 h-5" /> {t.landing.howItWorks.btn}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const LandingPage: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Try the dedicated statistics endpoint first
        const { statisticService } = await import('@/services/otherServices');
        const data = await statisticService.getLandingPageStats();
        if (data) {
          setStatsData(data);
          return;
        }
      } catch (_) { /* fall through */ }

      // Fallback: compute category counts from the vehicles API directly
      try {
        const CATS = ['economy', 'family', 'motorbike', 'business', 'electric', 'suv', 'city_car', 'tourism'] as const;
        const results = await Promise.all(
          CATS.map(cat => vehicleService.getAll({ category: [cat] }, 1, 1))
        );
        const categoryCounts: Record<string, number> = {};
        CATS.forEach((cat, i) => {
          categoryCounts[cat] = results[i].meta?.total ?? 0;
        });
        // Also get total vehicles
        const totalResult = await vehicleService.getAll({}, 1, 1);
        setStatsData({
          qualityVehicles: totalResult.meta?.total ?? 0,
          provinces: 63,
          happyClients: null,
          averageRating: null,
          categoryCounts,
        });
      } catch (_) {
        // If all APIs are down, show zeros rather than misleading fake numbers
        setStatsData({ categoryCounts: {} });
      }
    };

    loadStats();
  }, []);


  return (
    <div>
      <HeroSection />
      <StatsSection statsData={statsData} />
      <CategoriesSection categoryCounts={statsData?.categoryCounts} />
      <FeaturedVehiclesSection />
      <HowItWorksSection />
      <TopCitiesSection />
      <ReviewsSection />
      <BusinessSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
