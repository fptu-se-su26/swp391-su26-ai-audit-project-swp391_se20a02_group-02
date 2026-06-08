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

// ====== HERO SECTION ======
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    navigate(`/marketplace?${params.toString()}`);
  };

  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2574&auto=format&fit=crop',
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
        <div className="hero-overlay absolute inset-0" />
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
            World's Premier Luxury Vehicle Marketplace
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            custom={1}
            variants={heroTextVariants}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight mb-6"
          >
            Drive the
            <br />
            <span className="text-gradient-gold">Unattainable.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={2}
            variants={heroTextVariants}
            className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Access 10,000+ exclusive supercars, luxury SUVs, and rare masterpieces
            with white-glove delivery to any location worldwide.
          </motion.p>

          {/* Search Card */}
          <motion.div
            custom={3}
            variants={heroTextVariants}
            className="glass rounded-3xl p-2 max-w-4xl w-full mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Location */}
              <div className="sm:col-span-4 relative">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl text-left">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</p>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Dubai, Miami, Monaco..."
                      className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 outline-none bg-transparent"
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="sm:col-span-4 relative">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl text-left">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pick-up & Return</p>
                    <p className="text-sm font-medium text-slate-400">Select dates</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="sm:col-span-4">
                <div className="flex gap-2 h-full">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl">
                    <Car className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</p>
                      <select
                        value={vehicleType}
                        onChange={e => setVehicleType(e.target.value)}
                        className="w-full text-sm font-medium text-[#0F172A] outline-none bg-transparent appearance-none cursor-pointer"
                      >
                        <option value="">All Vehicles</option>
                        <option value="supercar">Supercars</option>
                        <option value="suv">Luxury SUVs</option>
                        <option value="luxury">Ultra Luxury</option>
                        <option value="convertible">Convertibles</option>
                        <option value="classic">Classics</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleSearch}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#0F172A] text-white font-semibold rounded-2xl text-sm whitespace-nowrap"
                    style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.4)' }}
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Tags */}
          <motion.div custom={4} variants={heroTextVariants} className="flex flex-wrap justify-center gap-2 mt-6">
            {['Ferrari', 'Lamborghini', 'Rolls-Royce', 'McLaren', 'Bugatti', 'Porsche'].map(brand => (
              <button
                key={brand}
                onClick={() => navigate(`/marketplace?brand=${brand}`)}
                className="px-3 py-1.5 glass text-white/80 text-xs font-medium rounded-full hover:bg-white/20 transition-colors duration-200"
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
const StatsSection: React.FC = () => {
  const stats = [
    { value: 10000, suffix: '+', label: 'Luxury Vehicles', icon: Car },
    { value: 50, suffix: '+', label: 'Countries', icon: Globe },
    { value: 250000, suffix: '+', label: 'Happy Clients', icon: Users },
    { value: 4.98, suffix: '/5', label: 'Average Rating', icon: Star, decimal: true },
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
const CategoriesSection: React.FC = () => {
  const categories = [
    {
      title: 'Supercars',
      subtitle: 'Unrivaled performance and engineering',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=supercar',
      count: '24 vehicles',
      span: 'md:col-span-8',
      height: 'h-[360px]',
    },
    {
      title: 'Luxury SUVs',
      subtitle: 'Commanding presence & comfort',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1964&auto=format&fit=crop',
      href: '/marketplace?category=suv',
      count: '18 vehicles',
      span: 'md:col-span-4',
      height: 'h-[360px]',
    },
    {
      title: 'Ultra Luxury',
      subtitle: 'The pinnacle of automotive refinement',
      image: 'https://images.unsplash.com/photo-1631269662035-7c05051e51b1?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=luxury',
      count: '15 vehicles',
      span: 'md:col-span-4',
      height: 'h-[300px]',
    },
    {
      title: 'Convertibles',
      subtitle: 'Open-air motoring at its finest',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=convertible',
      count: '12 vehicles',
      span: 'md:col-span-4',
      height: 'h-[300px]',
    },
    {
      title: 'Classic & Vintage',
      subtitle: 'Timeless masterpieces of a bygone era',
      image: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=2070&auto=format&fit=crop',
      href: '/marketplace?category=classic',
      count: '8 vehicles',
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
            <span className="text-label text-gold mb-2 block">The Curated Collection</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A]">
              Browse by Category
            </h2>
          </div>
          <Link to="/marketplace" className="mt-4 sm:mt-0 flex items-center gap-2 text-sm font-semibold text-accent hover:text-blue-700 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
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
                    Explore <ArrowRight className="w-4 h-4" />
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
          <span className="text-label text-gold mb-2 block">Hand-Selected Collection</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
            Featured Masterpieces
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Curated from our global premium fleet, maintained to the absolute highest standards.
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
            Explore All Vehicles <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ====== TOP CITIES SECTION ======
const TopCitiesSection: React.FC = () => {
  const cities = [
    { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop', vehicles: 240, gradient: 'from-amber-500 to-orange-600' },
    { name: 'Miami', country: 'USA', image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=800&auto=format&fit=crop', vehicles: 186, gradient: 'from-blue-500 to-cyan-600' },
    { name: 'Monaco', country: 'Monaco', image: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?q=80&w=800&auto=format&fit=crop', vehicles: 94, gradient: 'from-red-500 to-rose-600' },
    { name: 'Los Angeles', country: 'USA', image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format&fit=crop', vehicles: 320, gradient: 'from-purple-500 to-violet-600' },
    { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop', vehicles: 158, gradient: 'from-slate-500 to-slate-700' },
    { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', vehicles: 127, gradient: 'from-pink-500 to-rose-600' },
  ];

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
            <span className="text-label text-gold mb-2 block">Luxury Hubs</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A]">
              Top Destinations
            </h2>
          </div>
          <Link to="/marketplace" className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-blue-700 transition-colors">
            All Cities <ArrowRight className="w-4 h-4" />
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
                  <p className="text-white/60 text-xs">{city.vehicles} vehicles</p>
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
  const reviews = [
    {
      name: 'Alexander Petrova',
      location: 'Moscow, Russia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      vehicle: 'Lamborghini Huracán EVO',
      rating: 5,
      comment: 'Absolutely breathtaking experience. The car was in perfect condition, the owner was incredibly professional. LuxeWay has set a new standard for luxury rentals worldwide.',
    },
    {
      name: 'Sophia Laurent',
      location: 'Paris, France',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      vehicle: 'Rolls-Royce Ghost',
      rating: 5,
      comment: 'Rented a Ghost for our anniversary and it was magical. The seamless delivery to our hotel, impeccable service, and the car itself left us speechless. Worth every penny.',
    },
    {
      name: 'Marcus Chen',
      location: 'Dubai, UAE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      vehicle: 'Bugatti Chiron',
      rating: 5,
      comment: 'I\'ve rented from Turo, Hertz, and others. LuxeWay is in an entirely different league. The vetting process, insurance options, and overall experience is second to none.',
    },
  ];

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
          <span className="text-label text-gold mb-2 block">Client Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <div className="flex justify-center items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-white text-base font-semibold">4.98 out of 5</span>
            <span className="text-slate-400 text-sm">from 25,000+ reviews</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {reviews.map(review => (
            <motion.div key={review.name} variants={staggerItem}>
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
      </div>
    </section>
  );
};

// ====== BUSINESS SECTION ======
const BusinessSection: React.FC = () => {
  const features = [
    { icon: Shield, title: '$5M Premium Insurance', desc: 'Every rental is covered by our comprehensive insurance policy.' },
    { icon: CheckCircle, title: 'Identity Verification', desc: 'Rigorous KYC process ensures only trusted renters access your vehicle.' },
    { icon: TrendingUp, title: 'Earn More', desc: 'Average owners earn $8,500/month with top earners surpassing $45,000.' },
    { icon: Clock, title: '24/7 Concierge', desc: 'Our dedicated team handles every aspect of the rental process for you.' },
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
                LuxeWay for Owners
              </motion.span>
              <motion.h2 variants={staggerItem} className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">
                Monetize Your Masterpiece
              </motion.h2>
              <motion.p variants={staggerItem} className="text-slate-400 text-base leading-relaxed mb-8">
                Turn your luxury asset into a high-yield investment. Connect with vetted, high-net-worth clients globally while we handle all the complexities.
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
                  List Your Vehicle
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
              <p className="text-xs text-slate-500 mb-1">Monthly Earnings</p>
              <p className="font-display text-2xl font-bold text-[#0F172A]">$12,450</p>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +23% this month
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'How does LuxeWay verify vehicles?', a: 'Every vehicle undergoes a comprehensive 120-point inspection by certified mechanics, including photo verification, document checks, and insurance validation before listing.' },
    { q: 'What insurance is included?', a: 'All rentals include our baseline $1M coverage. Premium plans up to $5M are available. You can also add your own insurance during booking.' },
    { q: 'Can I cancel my booking?', a: 'Yes. Free cancellation is available up to 48 hours before pickup. Late cancellations may incur a fee depending on the vehicle\'s policy.' },
    { q: 'How does delivery work?', a: 'Owners with delivery enabled will bring the vehicle to your specified address. Fees vary by distance and are shown transparently at checkout.' },
    { q: 'Is there a minimum age requirement?', a: 'Renters must be at least 25 years old and hold a valid driving license for at least 3 years. Some exotic vehicles may have higher requirements.' },
    { q: 'How are payments processed?', a: 'We use Stripe and VNPay for secure payments. You can also use our LuxeWay wallet. Payments are only released to owners after successful pickup confirmation.' },
  ];

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
          <span className="text-label text-gold mb-2 block">Got Questions?</span>
          <h2 className="font-display text-4xl font-bold text-[#0F172A]">
            Frequently Asked Questions
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
const Footer: React.FC = () => {
  const links = {
    Explore: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Search', href: '/search' },
      { label: 'Top Destinations', href: '/marketplace' },
      { label: 'Compare Vehicles', href: '/compare' },
    ],
    Host: [
      { label: 'List Your Vehicle', href: '/owner' },
      { label: 'Owner Dashboard', href: '/owner' },
      { label: 'Business Solutions', href: '/business' },
      { label: 'Pricing Guide', href: '/help' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Trust & Safety', href: '/help' },
      { label: 'Contact Us', href: '/help/contact' },
      { label: 'Insurance Info', href: '/help' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Sitemap', href: '#' },
    ],
  };

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container-lux py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-2xl font-bold">
                Luxe<span className="text-accent">Way</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Redefining luxury vehicle experiences globally. Precision, prestige, and performance — delivered to your door.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/50 transition-colors"
              />
              <button className="btn-gold px-4 py-2.5 text-sm rounded-xl">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-white mb-4 text-sm">{section}</h4>
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
          <p className="text-slate-500 text-xs">© 2026 LuxeWay International. All rights reserved.</p>
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
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ====== MAIN LANDING PAGE ======
const LandingPage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedVehiclesSection />
      <TopCitiesSection />
      <ReviewsSection />
      <BusinessSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
