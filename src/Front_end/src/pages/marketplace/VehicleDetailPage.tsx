import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Zap, Gauge, Users, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Check, Car, ArrowRight, X, Loader2, Calendar,
  ShieldCheck, AlertCircle, Eye, HelpCircle, Gift, Award, Info, FileText, CheckCircle2,
  Navigation, Mail, Phone, Flame, Lock, InfoIcon
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { reviewService } from '@/services/otherServices';
import type { Vehicle, Review } from '@/types';
import { useVehicleStore, useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getRatingLabel, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { useT } from '@/i18n/translations';
import { VehicleMap } from '@/components/map/VehicleMap';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';

// Mock list of interior/exterior sequence photos for 360 viewer simulation
const MOCK_360_IMAGES = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000', // front angle
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000', // side angle
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000', // rear angle
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000', // interior dash
];

const VehicleDetailPage: React.FC = () => {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist, addRecentlyViewed } = useVehicleStore();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageTab, setActiveImageTab] = useState<'all' | 'exterior' | 'interior' | '360' | 'video'>('all');
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Date and Calculation States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [insuranceTier, setInsuranceTier] = useState<'basic' | 'premium' | 'zero'>('premium');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // 360 Rotation Simulation States
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationDragStart = useRef(0);
  const [isRotating, setIsRotating] = useState(false);

  // Review & Specs segmented tabs
  const [activeReviewTab, setActiveReviewTab] = useState<'vehicle' | 'owner' | 'delivery'>('vehicle');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([]);

  // Exit intent state
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [exitIntentOpen, setExitIntentOpen] = useState(false);
  const [simulatedViewers, setSimulatedViewers] = useState(5);

  const wishlisted = vehicle ? isWishlisted(vehicle.id) : false;

  // Viewers Count simulation
  useEffect(() => {
    setSimulatedViewers(Math.floor(Math.random() * 6) + 3);
    const interval = setInterval(() => {
      setSimulatedViewers(Math.floor(Math.random() * 6) + 3);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Exit intent detection logic (Cursor leaving top of window)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20 && !exitIntentTriggered) {
        setExitIntentTriggered(true);
        setExitIntentOpen(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentTriggered]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      vehicleService.getById(id),
      reviewService.getByVehicle(id),
    ]).then(([v, r]) => {
      setVehicle(v);
      setReviews(r);
      setLoading(false);
      if (v) {
        addRecentlyViewed(v.id);
        vehicleService.getAll({ category: [v.category] }).then(res => {
          setRelatedVehicles(res.data.filter(rv => rv.id !== id).slice(0, 3));
        });
      }
    });
  }, [id]);

  // Generate mock reviews if none returned from API to prevent empty state on seeded catalog
  const displayReviews = React.useMemo<Review[]>(() => {
    if (!vehicle) return [];
    if (reviews.length > 0) return reviews;
    
    // Generate 3 mock reviews if the vehicle has reviews but none seeded in DB
    if ((vehicle.totalReviews || 0) > 0) {
      return [
        {
          id: 'mock-rev-1',
          vehicleId: vehicle.id,
          bookingId: 'mock-bk-1',
          reviewerId: 'u1',
          ownerId: vehicle.ownerId || 'owner-1',
          reviewer: {
            id: 'u1',
            displayName: 'Nguyễn Văn Hải',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          },
          rating: 5,
          cleanliness: 5,
          accuracy: 5,
          communication: 5,
          value: 5,
          comment: `Xe ${vehicle.name} chạy rất đầm và êm. Chủ xe giao nhận đúng giờ, nhiệt tình hướng dẫn sử dụng. Sẽ tiếp tục ủng hộ lần sau!`,
          photos: [],
          ownerResponse: undefined,
          helpful: 0,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-rev-2',
          vehicleId: vehicle.id,
          bookingId: 'mock-bk-2',
          reviewerId: 'u2',
          ownerId: vehicle.ownerId || 'owner-1',
          reviewer: {
            id: 'u2',
            displayName: 'Lê Minh Thư',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
          },
          rating: 4,
          cleanliness: 4,
          accuracy: 5,
          communication: 4,
          value: 5,
          comment: 'Xe sạch sẽ, đầy đủ giấy tờ, vận hành tốt. Thích nhất là được hỗ trợ giao xe tận khách sạn rất nhanh chóng.',
          photos: [],
          ownerResponse: undefined,
          helpful: 0,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-rev-3',
          vehicleId: vehicle.id,
          bookingId: 'mock-bk-3',
          reviewerId: 'u3',
          ownerId: vehicle.ownerId || 'owner-1',
          reviewer: {
            id: 'u3',
            displayName: 'Phạm Quốc Bảo',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'
          },
          rating: 5,
          cleanliness: 5,
          accuracy: 5,
          communication: 5,
          value: 4,
          comment: 'Chất lượng xe tuyệt vời, rất đáng đồng tiền bát gạo. Anh chủ xe thân thiện lịch sự.',
          photos: [],
          ownerResponse: undefined,
          helpful: 0,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
    return [];
  }, [reviews, vehicle]);

  const vehicleReviewsCount = displayReviews.filter(r => r.rating >= 4).length;
  const ownerReviewsCount = displayReviews.filter(r => r.communication >= 4).length;
  const deliveryReviewsCount = displayReviews.filter(r => r.accuracy >= 4).length;

  const filteredReviews = React.useMemo(() => {
    return displayReviews.filter(r => {
      if (activeReviewTab === 'vehicle') return r.rating >= 4;
      if (activeReviewTab === 'owner') return r.communication >= 4;
      if (activeReviewTab === 'delivery') return r.accuracy >= 4;
      return true;
    });
  }, [displayReviews, activeReviewTab]);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please sign in to save to wishlist');
      return;
    }
    if (wishlisted) {
      removeFromWishlist(vehicle!.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(vehicle!.id);
      toast.success('Added to wishlist!', vehicle!.name);
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'LUXELUXE') {
      setCouponApplied(true);
      setCouponDiscount(0.10); // 10% off
      toast.success('Coupon Applied!', '10% discount has been calculated.');
    } else {
      toast.error('Invalid Coupon', 'Please try entering LUXELUXE');
    }
  };

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please create an account to book');
      navigate('/auth/login');
      return;
    }
    if (!startDate || !endDate) {
      toast.warning('Select dates', 'Please choose your pick-up and return dates');
      return;
    }
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      navigate(`/booking/${vehicle!.id}?start=${startDate}&end=${endDate}&insurance=${insuranceTier}&delivery=${deliveryRequested ? 'true' : 'false'}&coupon=${couponApplied ? couponCode : ''}`);
    }, 1000);
  };

  // 360 simulation drag handlers
  const handleRotationMouseDown = (e: React.MouseEvent) => {
    setIsRotating(true);
    rotationDragStart.current = e.clientX;
  };

  const handleRotationMouseMove = (e: React.MouseEvent) => {
    if (!isRotating) return;
    const deltaX = e.clientX - rotationDragStart.current;
    if (Math.abs(deltaX) > 15) {
      const direction = deltaX > 0 ? -1 : 1;
      setRotationIndex((prev) => (prev + direction + MOCK_360_IMAGES.length) % MOCK_360_IMAGES.length);
      rotationDragStart.current = e.clientX;
    }
  };

  const handleRotationMouseUp = () => {
    setIsRotating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-[500px] rounded-3xl" />
              <div className="skeleton h-8 w-64" />
              <div className="skeleton h-4 w-48" />
            </div>
            <div className="skeleton h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t.marketplace.vehicleNotFound}</h2>
          <Link to="/marketplace" className="btn-primary mt-4">{t.marketplace.backToMarketplace}</Link>
        </div>
      </div>
    );
  }

  // Dynamic Pricing Calculation
  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;

  // Pricing rules simulation: weekend multipliers or holiday overrides
  const basePricePerDay = vehicle.pricePerDay;
  const weekendMultiplier = 1.15; // 15% increase for weekend bookings

  // Calculate average daily rate accounting for weekend dates
  let totalBasePrice = 0;
  if (startDate && endDate) {
    let curr = new Date(startDate);
    const endLimit = new Date(endDate);
    while (curr < endLimit) {
      const day = curr.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday or Saturday
      totalBasePrice += basePricePerDay * (isWeekend ? weekendMultiplier : 1);
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    totalBasePrice = basePricePerDay;
  }

  const deliveryFee = deliveryRequested ? vehicle.deliveryFee || 200000 : 0;
  const platformFee = Math.round(totalBasePrice * 0.12); // LuxeWay platform fee 12%
  const insuranceCost = insuranceTier === 'zero' ? 350000 * totalDays : insuranceTier === 'premium' ? 200000 * totalDays : 80000 * totalDays;
  const taxCost = Math.round((totalBasePrice + platformFee + insuranceCost) * 0.08); // VAT 8%

  const discountCost = couponApplied ? Math.round(totalBasePrice * couponDiscount) : 0;
  const finalTotalAmount = totalBasePrice + deliveryFee + platformFee + insuranceCost + taxCost - discountCost;

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnailUrl || FALLBACK_IMAGE];

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 relative">

      {/* Dynamic Urgency / Viewers bar */}
      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border-b border-red-500/20 py-2.5 text-center px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>Recently Booked 4 times in this area this week.</span>
          <span className="hidden md:inline text-slate-400 font-normal">|</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {simulatedViewers} other travelers are viewing this car
          </span>
        </div>
      </div>

      {/* Breadcrumb path */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Link to="/" className="hover:text-foreground">{t.marketplace.home}</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/marketplace" className="hover:text-foreground">{t.marketplace.title}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-semibold truncate">{vehicle.name}</span>
            </div>
            {vehicle.deposit === 0 && (
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                ⚡ No Deposit Needed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title details bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-accent/10 text-accent font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {(t.categories as any)[vehicle.category] || vehicle.category}
              </span>
              {vehicle.isVerified && (
                <span className="flex items-center gap-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 fill-blue-600 text-white" /> KYC Verified
                </span>
              )}
              {vehicle.instantBook && (
                <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Instant Book
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              {vehicle.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1 font-bold text-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{vehicle.rating || '5.0'}</span>
                <span className="text-slate-400 font-normal">({vehicle.totalReviews || 0} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 font-semibold">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{vehicle.location?.city || 'Hồ Chí Minh'}, {vehicle.location?.country || 'Vietnam'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 text-sm font-bold ${wishlisted
                  ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-red-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
              <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
            <button className="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery tabs selectors & workspace */}
        <div className="mb-8">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-4 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'exterior', label: 'Exterior' },
              { id: 'interior', label: 'Interior' },
              { id: '360', label: '360° Rotator' },
              { id: 'video', label: 'Walkaround Video' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveImageTab(tab.id as any);
                  setActiveImage(0);
                }}
                className={`py-2 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeImageTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeImageTab === '360' ? (
            /* 360 Rotator Simulator */
            <div
              onMouseDown={handleRotationMouseDown}
              onMouseMove={handleRotationMouseMove}
              onMouseUp={handleRotationMouseUp}
              onMouseLeave={handleRotationMouseUp}
              className="relative h-[400px] md:h-[520px] bg-slate-950 rounded-3xl overflow-hidden flex items-center justify-center cursor-ew-resize select-none border border-slate-800"
            >
              <img
                src={MOCK_360_IMAGES[rotationIndex]}
                alt="360 view angle"
                className="max-h-full object-contain pointer-events-none"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 border border-slate-700/60 text-white backdrop-blur text-xs font-bold px-4 py-2 rounded-xl text-center pointer-events-none flex items-center gap-2">
                <span>Drag horizontally to rotate vehicle 360°</span>
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </div>
            </div>
          ) : activeImageTab === 'video' ? (
            /* Simulated Walkaround Video player */
            <div className="relative h-[400px] md:h-[520px] bg-slate-950 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={images[0]}
                alt="Walkaround background"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 text-center">
                <button
                  onClick={() => toast.info("Simulated Video Play", "Walkaround video streaming will stream directly here in production.")}
                  className="w-18 h-18 rounded-full bg-accent hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95"
                >
                  <ArrowRight className="w-8 h-8 rotate-90" />
                </button>
                <p className="mt-4 font-bold text-white text-lg">Click to stream High-Definition Walkaround Review</p>
                <p className="text-slate-400 text-xs mt-1">Duration: 1m 24s · Dolby Audio</p>
              </div>
            </div>
          ) : (
            /* Grid photos gallery */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] md:h-[520px]">
              <div
                onClick={() => setLightboxOpen(true)}
                className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden cursor-pointer group bg-slate-900"
              >
                <img
                  src={images[0]}
                  alt="Vehicle exterior"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveImage(idx + 1);
                    setLightboxOpen(true);
                  }}
                  className="hidden md:block relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-900"
                >
                  <img
                    src={img}
                    alt="Gallery item"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
              {images.length > 5 && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-6 right-6 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 backdrop-blur shadow"
                >
                  Show all {images.length} photos
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content details & calculations split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT AREA: Vehicle Specification Specs & Features */}
          <div className="lg:col-span-2 space-y-6">

            {/* Specs Highlights grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Zap, label: 'Horsepower', value: `${vehicle.specs?.horsepower || 300} HP` },
                { icon: Gauge, label: 'Transmission', value: vehicle.specs?.transmission || 'Automatic', capitalize: true },
                { icon: Car, label: 'Fuel consumption', value: vehicle.category === 'electric' ? '18 kWh/100km' : '7.8 L/100km' },
                { icon: Users, label: 'Capacity', value: `${vehicle.specs?.seats || 5} Seats` },
              ].map((spec, i) => (
                <div key={i} className="luxury-card p-4 rounded-2xl bg-card border border-slate-150 dark:border-slate-800 text-center">
                  <spec.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className={cn("font-display font-extrabold text-foreground text-base leading-tight", spec.capitalize ? "capitalize" : "")}>{spec.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{t.marketplace.aboutVehicle}</h3>
              <p className="text-slate-655 dark:text-slate-350 leading-relaxed text-sm">{vehicle.description || 'Experience ultimate comfort and status. Serviced in authorized dealer centers only, and stored in a secured underground garage. Fully sanitized before delivery.'}</p>

              {/* Detailed Specs list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-sm">
                {[
                  { label: 'Color', value: vehicle.specs?.color || 'Midnight Obsidian' },
                  { label: 'Doors', value: `${vehicle.specs?.doors || 4} Doors` },
                  { label: 'Fuel Type', value: vehicle.specs?.fuelType ? vehicle.specs.fuelType.charAt(0).toUpperCase() + vehicle.specs.fuelType.slice(1) : 'Electric' },
                  { label: 'Safety Rating', value: '⭐⭐⭐⭐⭐ (ANCAP 5-Star)' },
                  { label: 'Vehicle Condition', value: 'Excellent (Serviced <1000km ago)' },
                  { label: 'License Plate', value: vehicle.specs?.licensePlate || '51K-XXXXX' }
                ].map(s => (
                  <div key={s.label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-450">{s.label}</span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features & Amenities Checklist */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{t.marketplace.amenities}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {[
                  'GPS Navigation', 'Bluetooth Sync', 'Apple CarPlay', 'Android Auto',
                  'Reverse Camera', 'Dash Camera', 'Sunroof', 'Child Seat', 'ETC Auto-pay'
                ].map(feature => {
                  const hasFeature = vehicle.features?.includes(feature) || Math.random() > 0.3;
                  return (
                    <div key={feature} className={cn("flex items-center gap-2 text-sm", hasFeature ? "text-foreground font-semibold" : "text-slate-400 opacity-60 line-through")}>
                      <Check className={cn("w-4 h-4 flex-shrink-0", hasFeature ? "text-emerald-500 font-extrabold" : "text-slate-300")} />
                      <span>{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insurance Packages Tiers */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-850 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{t.marketplace.insuranceTitle}</h3>
              <p className="text-xs text-slate-500 mb-4">Choose a coverage package to safeguard your journey. Standard liability limits apply.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'basic', name: 'Basic Protection', cost: '80,000/day', deduct: 'VND 10,000,000', coverage: 'VND 50,000,000 Limit' },
                  { id: 'premium', name: 'Premium Shield', cost: '200,000/day', deduct: 'VND 2,000,000', coverage: 'VND 200,000,000 Limit' },
                  { id: 'zero', name: 'Zero Deductible', cost: '350,000/day', deduct: 'VND 0 (No liability)', coverage: 'VND 500,000,000 Limit' },
                ].map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => setInsuranceTier(pkg.id as any)}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between",
                      insuranceTier === pkg.id
                        ? "border-accent bg-accent/5 dark:bg-accent/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-350"
                    )}
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <Shield className={cn("w-4 h-4", insuranceTier === pkg.id ? "text-accent fill-accent/20" : "text-slate-400")} />
                        {pkg.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Deductible: <span className="font-bold text-foreground">{pkg.deduct}</span></p>
                      <p className="text-xs text-slate-500">Coverage: {pkg.coverage}</p>
                    </div>
                    <p className="mt-4 text-xs font-bold text-accent">{pkg.cost}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Requirements */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Rental Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-655 dark:text-slate-400">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Driving Experience</p>
                      <p className="text-xs text-slate-500">Minimum 2 years holding an active driving license.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Age Requirement</p>
                      <p className="text-xs text-slate-500">Driver must be 21+ years old.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Documents Needed</p>
                      <p className="text-xs text-slate-500">Valid ID/Passport and Driver License.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Deposit Policy</p>
                      <p className="text-xs text-slate-500">
                        {vehicle.deposit > 0 ? `VND ${formatCurrency(vehicle.deposit)} required.` : "No cash deposit needed for verified accounts."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Calendar Grid */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Availability Calendar
                </h3>
                <span className="text-xs text-slate-400 font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded uppercase">
                  Weekend markup (+15%)
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="font-bold text-slate-400 py-1 uppercase tracking-wider text-[10px]">{day}</div>
                ))}
                {/* Mock Calendar dates for July 2026 */}
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-3" />
                ))}
                {Array.from({ length: 30 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const isBooked = [5, 6, 12, 13, 20].includes(dayNum);
                  const isPending = [14, 15].includes(dayNum);
                  const isWeekend = [4, 5, 11, 12, 18, 19, 25, 26].includes(dayNum);

                  return (
                    <div
                      key={dayNum}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center justify-between h-14 relative transition-colors",
                        isBooked
                          ? "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-350 line-through cursor-not-allowed"
                          : isPending
                            ? "bg-amber-500/10 border-amber-300/40 text-amber-600"
                            : isWeekend
                              ? "bg-amber-500/5 border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500"
                              : "bg-card border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850"
                      )}
                    >
                      <span className="font-bold">{dayNum}</span>
                      <span className="text-[8px] text-slate-400 font-bold leading-none">
                        {isBooked ? 'Booked' : isPending ? 'Pending' : 'VND ' + (isWeekend ? '2.1m' : '1.8m')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup & Maps section */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Pickup & Delivery Map</h3>
              <div className="flex flex-col sm:flex-row gap-4 mb-4 text-xs font-bold">
                {['Self Pickup (Free)', 'Airport Delivery', 'Hotel Delivery', 'Home Delivery'].map(type => (
                  <div key={type} className="flex items-center gap-1.5 text-slate-655 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {type}
                  </div>
                ))}
              </div>

              {/* Interactive Leaflet Map with Overlay */}
              <div className="relative h-96 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl group">
                <VehicleMap 
                  vehicles={[vehicle]} 
                  selectedVehicleId={vehicle.id}
                  height="100%"
                />
                
                {/* Location Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl z-20 transition-all duration-300">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">PICKUP LOCATION</span>
                  <h4 className="font-extrabold text-foreground text-sm mt-1">{vehicle.location?.address || 'District 1'}</h4>
                  <p className="text-slate-500 text-xs mt-1">{vehicle.location?.city || 'Ho Chi Minh City'}, {vehicle.location?.country || 'Vietnam'}</p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vehicle.location?.address || ''} ${vehicle.location?.city || ''} ${vehicle.location?.country || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full btn-accent py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-101"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Owner Trust section */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Owner Credibility</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Pic */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-display font-bold text-slate-500 text-3xl">
                    {(vehicle.owner?.displayName || 'Trần Tuấn').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-accent border-2 border-white rounded-xl p-1 text-white" title="Super Host">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-display font-extrabold text-foreground text-lg leading-none">{vehicle.owner?.displayName || 'Trần Tuấn'}</h4>
                    <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      Identity Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 mt-1">Superhost · Joined July 2023 · 87 completed trips</p>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
                    <div>
                      <p className="font-extrabold text-foreground text-sm">99%</p>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Response Rate</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-sm">&lt; 15m</p>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Avg Response</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-sm">4.95 ⭐</p>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Host Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Reviews System */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Reviews & Feedback <span className="text-slate-400 font-sans text-base font-normal">({vehicle.totalReviews || 12})</span>
                </h3>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-display font-extrabold text-foreground">{vehicle.rating || '5.0'}</span>
                  <div className="text-left">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Highly rated</p>
                  </div>
                </div>
              </div>

              {/* TABS FOR REVIEWS */}
              <div className="flex bg-slate-50 dark:bg-slate-900 rounded-xl p-1 gap-1 mb-4">
                {[
                  { id: 'vehicle', label: `Vehicle Quality (${vehicleReviewsCount})` },
                  { id: 'owner', label: `Owner Service (${ownerReviewsCount})` },
                  { id: 'delivery', label: `Delivery punctuality (${deliveryReviewsCount})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReviewTab(tab.id as any)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                      activeReviewTab === tab.id
                        ? "bg-white dark:bg-slate-800 shadow text-foreground"
                        : "text-slate-450 hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Review list */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    No reviews yet. Be the first to share your experience!
                  </div>
                ) : (
                  filteredReviews.map(review => (
                    <div key={review.id} className="pb-4 border-b border-slate-50 dark:border-slate-850 last:border-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-105 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {(review.reviewer?.displayName || 'UR').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{review.reviewer?.displayName || 'Verified Renter'}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200")} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(review.createdAt, 'short')}</span>
                      </div>
                      <p className="text-sm text-slate-655 dark:text-slate-300 leading-relaxed">{review.comment}</p>

                      {/* Review Photos Slider */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {review.photos.map((ph, idx) => (
                            <img
                              key={idx}
                              src={ph}
                              alt="Review attachment"
                              className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                            />
                          ))}
                        </div>
                      )}

                      {review.ownerResponse && (
                        <div className="mt-3 pl-3 border-l-2 border-accent bg-slate-50 dark:bg-slate-900/60 p-3 rounded-r-2xl text-xs text-slate-655 dark:text-slate-400">
                          <span className="font-bold text-foreground block mb-0.5">Response from Trần Tuấn (Owner):</span>
                          {review.ownerResponse}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT AREA: Sticky booking sidebar widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">

              <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xl">
                {/* Price block */}
                <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
                  <div>
                    <span className="text-3xl font-display font-extrabold text-foreground">{formatCurrency(vehicle.pricePerDay)}</span>
                    <span className="text-slate-450 text-xs font-semibold"> / day</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                      ⭐ {vehicle.rating || '5.0'}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Excellent Choice</p>
                  </div>
                </div>

                {/* Date Picker Form */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-4 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
                    <div className="p-3">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-405 dark:text-slate-550 mb-1">Pick-up</label>
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setStartDate(e.target.value)}
                        className="text-xs font-bold text-foreground outline-none w-full bg-transparent border-0 p-0"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-405 dark:text-slate-550 mb-1">Return</label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => setEndDate(e.target.value)}
                        className="text-xs font-bold text-foreground outline-none w-full bg-transparent border-0 p-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                {vehicle.deliveryAvailable && (
                  <div className="mb-4 p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Requested Delivery</p>
                          <p className="text-[10px] text-slate-500">Delivered directly to your door</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={deliveryRequested}
                        onChange={(e) => setDeliveryRequested(e.target.checked)}
                        className="rounded text-accent accent-accent w-4 h-4"
                      />
                    </label>
                    {deliveryRequested && (
                      <input
                        type="text"
                        placeholder="Enter delivery address..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full mt-2.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-card text-foreground"
                      />
                    )}
                  </div>
                )}

                {/* Real-time Pricing details calculation */}
                <div className="space-y-2 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Price ({totalDays} days)</span>
                    <span className="font-bold text-foreground">{formatCurrency(totalBasePrice)}</span>
                  </div>
                  {deliveryRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Service Charge</span>
                      <span className="font-bold text-foreground">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">LuxeWay Platform Fee (12%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Insurance Protection</span>
                    <span className="font-bold text-foreground">{formatCurrency(insuranceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Government taxes (8%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(taxCost)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Promo Coupon Discount (-10%)</span>
                      <span>-{formatCurrency(discountCost)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between font-extrabold text-foreground text-sm">
                    <span>Total Amount</span>
                    <span>{formatCurrency(finalTotalAmount)}</span>
                  </div>

                  {vehicle.deposit > 0 && (
                    <p className="text-[10px] text-slate-400 text-center border-t border-slate-200/50 dark:border-slate-800/50 pt-2 mt-2">
                      🔒 Refundable Security Deposit: <span className="font-bold text-foreground">{formatCurrency(vehicle.deposit)}</span>
                    </p>
                  )}
                </div>

                {/* Coupon discount panel */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent text-foreground uppercase"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Instant Book trigger Button */}
                <button
                  onClick={handleBookNow}
                  disabled={bookingLoading}
                  className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform active:scale-98"
                >
                  {bookingLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{vehicle.instantBook ? 'Instant Book' : 'Request to Book'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">🔒 Secure checkout powered by Stripe & VNPay</p>
              </div>

              {/* Safety Badges trust block */}
              <div className="luxury-card p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Free cancellation up to 48 hours before pickup</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>100% damage cover options available at checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom recommendations/similar fleet */}
        <div className="mt-16 pt-8 border-t border-slate-150 dark:border-slate-800">
          <h3 className="font-display text-2xl font-extrabold text-foreground mb-6">Similar Vehicles You May Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVehicles.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            ) : (
              relatedVehicles.map(rv => (
                <div key={rv.id} className="transition-all hover:scale-101 duration-300">
                  <div className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden p-4">
                    <img
                      src={rv.images?.[0] || rv.thumbnailUrl || FALLBACK_IMAGE}
                      alt={rv.name}
                      className="w-full h-40 object-cover rounded-2xl bg-slate-800"
                    />
                    <div className="mt-3 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground text-sm truncate">{rv.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rv.location?.city}</p>
                      </div>
                      <span className="font-extrabold text-foreground text-sm">{formatCurrency(rv.pricePerDay)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-foreground text-xs">{rv.rating || '5.0'}</span>
                      </div>
                      <Link
                        to={`/vehicles/${rv.id}`}
                        className="text-[10px] font-bold text-accent hover:underline"
                      >
                        View Vehicle &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lightbox photo viewer */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-4"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-white hover:bg-white/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <img src={images[activeImage]} alt={vehicle.name} className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? 'bg-white w-6' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-slate-100 dark:border-slate-800 p-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-xl font-extrabold text-foreground">{formatCurrency(vehicle.pricePerDay)}</span>
          <span className="text-slate-400 text-[10px]"> / day</span>
          <div className="flex items-center gap-0.5 text-xs text-yellow-400 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-foreground font-bold">{vehicle.rating || '5.0'}</span>
          </div>
        </div>
        <button
          onClick={handleBookNow}
          className="btn-primary py-3 px-6 text-xs font-bold rounded-xl"
        >
          Book Now
        </button>
      </div>

      {/* Exit Intent Discount Modal */}
      <AnimatePresence>
        {exitIntentOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setExitIntentOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-slate-150 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <button
                onClick={() => setExitIntentOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8" />
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Wait! Don't Miss Out</h3>
              <p className="text-sm text-slate-655 dark:text-slate-400 mb-6">
                Complete your booking for <span className="font-bold">{vehicle.name}</span> today and save an extra 10% on your entire trip!
              </p>

              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-accent/40 p-4 rounded-2xl mb-6">
                <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">Your Exclusive Promo Code</p>
                <p className="text-3xl font-display font-extrabold text-accent uppercase tracking-widest">LUXELUXE</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setExitIntentOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  No, thanks
                </button>
                <button
                  onClick={() => {
                    setCouponCode('LUXELUXE');
                    setCouponApplied(true);
                    setCouponDiscount(0.10);
                    setExitIntentOpen(false);
                    toast.success('Promo Code Applied!', '10% off has been configured in checkout details.');
                  }}
                  className="flex-1 py-3 bg-accent hover:bg-blue-600 text-white rounded-2xl text-xs font-bold shadow"
                >
                  Apply Coupon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDetailPage;
