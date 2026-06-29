import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Star, MapPin, Zap, Gauge, Users, Shield, Clock, 
  ChevronLeft, ChevronRight, BadgePercent, CheckCircle2, Award 
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { useVehicleStore, useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { cn, formatCurrency, resolveImageUrl } from '@/utils';
import { cardHoverVariants } from '@/animations/variants';
import { useT } from '@/i18n/translations';

interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'grid' | 'list';
  showCompare?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  variant = 'grid',
  showCompare = true,
}) => {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist, addToCompare } = useVehicleStore();
  const toast = useToast();
  
  // Image Slideshow State
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const wishlisted = isWishlisted(vehicle.id);

  const images = (vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : [vehicle.thumbnailUrl || FALLBACK_IMAGE]).map(img => resolveImageUrl(img || FALLBACK_IMAGE));

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please sign in to save vehicles to your wishlist');
      return;
    }
    if (wishlisted) {
      removeFromWishlist(vehicle.id);
      toast.info('Removed from wishlist', vehicle.name);
    } else {
      addToWishlist(vehicle.id);
      toast.success('Added to wishlist!', vehicle.name);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(vehicle.id);
    toast.info('Added to compare', 'Max 3 vehicles for comparison');
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicks anywhere on the card, navigate to detail page
    if ((e.target as HTMLElement).closest('button')) return;
    const detailPath = vehicle.vehicleType === 'motorbike' ? `/motorbikes/${vehicle.id}` : `/cars/${vehicle.id}`;
    navigate(detailPath);
  };

  const categoryColors: Record<string, string> = {
    supercar: 'bg-red-500/10 text-red-500 border border-red-500/20',
    suv: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    luxury: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    convertible: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    classic: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    electric: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    van: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
    motorbike: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    economy: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
    family: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
    business: 'bg-violet-500/10 text-violet-500 border border-violet-500/20',
    city_car: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    tourism: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
  };

  // Badges logic
  const isSuperhost = vehicle.rating >= 4.8 || vehicle.isFeatured;
  const freeCancellation = true; // LuxeWay Standard Policy
  const noDeposit = vehicle.deposit === 0;

  // List view representation
  if (variant === 'list') {
    return (
      <motion.div 
        variants={cardHoverVariants} 
        initial="rest" 
        whileHover="hover"
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <div className="luxury-card flex flex-col md:flex-row gap-0 overflow-hidden group border border-slate-100 dark:border-slate-800 bg-card hover:shadow-xl transition-all duration-300 rounded-3xl">
          {/* Image Container with Slider */}
          <div className="relative w-full md:w-80 h-60 flex-shrink-0 overflow-hidden bg-slate-900">
            <img
              src={images[currentImgIdx]}
              alt={vehicle.name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-80'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Slide Arrows */}
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={prevImage}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-sm transition-transform active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-sm transition-transform active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      idx === currentImgIdx ? "bg-white w-3" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
            >
              <Heart className={cn('w-4 h-4 transition-colors', wishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white')} />
            </button>

            {/* Left Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {vehicle.isFeatured && (
                <span className="badge-gold text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                  ⭐ {t.marketplace.featured}
                </span>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', categoryColors[vehicle.category] || 'bg-slate-150 text-slate-700')}>
                  {(t.categories as any)[vehicle.category] || vehicle.category}
                </span>
                {vehicle.brand && (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {vehicle.brand}
                  </span>
                )}
                {vehicle.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 fill-blue-600 text-white" /> KYC Verified
                  </span>
                )}
                {isSuperhost && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                    <Award className="w-3 h-3" /> Superhost
                  </span>
                )}
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-foreground text-xl leading-tight group-hover:text-accent transition-colors">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {vehicle.location?.city || (vehicle as any).city || 'Vietnam'}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-2xl font-display font-extrabold text-foreground">{formatCurrency(vehicle.pricePerDay)}</span>
                  <span className="text-xs text-slate-400 block">{t.marketplace.perDay}</span>
                </div>
              </div>

              {/* Badges strip */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {vehicle.instantBook && (
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Instant Book
                  </span>
                )}
                {freeCancellation && (
                  <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                    Free Cancellation
                  </span>
                )}
                {noDeposit && (
                  <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    <BadgePercent className="w-2.5 h-2.5" /> No Deposit
                  </span>
                )}
                {vehicle.deliveryAvailable && (
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg">
                    Delivery Available
                  </span>
                )}
              </div>
            </div>

            {/* Ratings & Specs */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground">{vehicle.rating || '5.0'}</span>
                  <span>({vehicle.totalReviews || 0} reviews)</span>
                  <span className="text-slate-350 dark:text-slate-600">•</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{vehicle.totalBookings || Math.floor(Math.random() * 20) + 5} trips</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {vehicle.specs?.horsepower && (
                    <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" /> {vehicle.specs.horsepower} hp</span>
                  )}
                  {vehicle.specs?.seats && (
                    <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {vehicle.specs.seats} seats</span>
                  )}
                  {vehicle.specs?.transmission && (
                    <span className="capitalize">{vehicle.specs.transmission}</span>
                  )}
                </div>
                
                {showCompare && (
                  <button
                    onClick={handleCompare}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent rounded-xl text-xs transition-colors"
                  >
                    Compare
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view representation (Default)
  return (
    <motion.div 
      variants={cardHoverVariants} 
      initial="rest" 
      whileHover="hover" 
      onClick={handleCardClick}
      className="group cursor-pointer"
    >
      <div className="vehicle-card overflow-hidden bg-card border border-slate-100 dark:border-slate-800 hover:shadow-xl rounded-3xl transition-all duration-300">
        {/* Image Container with Slider */}
        <div className="relative h-56 overflow-hidden bg-slate-900">
          <img
            src={images[currentImgIdx]}
            alt={vehicle.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-750 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-80'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Slider Arrows */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={prevImage}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 flex items-center justify-center text-white backdrop-blur-sm transition-transform active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 flex items-center justify-center text-white backdrop-blur-sm transition-transform active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === currentImgIdx ? "bg-white w-2.5" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8.5 h-8.5 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md rounded-2xl flex items-center justify-center transition-all hover:scale-115 active:scale-90 z-20"
          >
            <Heart className={cn('w-4 h-4 transition-all', wishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white')} />
          </button>

          {/* Badges Left Top */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {vehicle.isFeatured && (
              <span className="badge-gold text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5">
                ⭐ {t.marketplace.featured}
              </span>
            )}
            {isSuperhost && (
              <span className="flex items-center gap-0.5 bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                <Award className="w-2.5 h-2.5" /> Superhost
              </span>
            )}
          </div>

          {/* Badges Left Bottom */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-10">
            <span className={cn('px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider', categoryColors[vehicle.category] || 'bg-slate-800 text-white')}>
              {(t.categories as any)[vehicle.category] || vehicle.category}
            </span>
          </div>

          {/* KYC Badge Right Bottom */}
          {vehicle.isVerified && (
            <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-white/90 dark:bg-slate-900/90 text-blue-600 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-extrabold shadow-sm">
              <CheckCircle2 className="w-3 h-3 fill-blue-600 text-white" /> KYC
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Brand & Name & Price */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              {vehicle.brand && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{vehicle.brand}</p>
              )}
              <h3 className="font-display font-bold text-foreground text-base leading-snug truncate group-hover:text-accent transition-colors">
                {vehicle.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{vehicle.location?.city || (vehicle as any).city || 'Vietnam'}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display font-extrabold text-lg text-foreground leading-none">{formatCurrency(vehicle.pricePerDay)}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{t.marketplace.perDay}</p>
            </div>
          </div>

          {/* Rating and Booking count */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-950/20 px-1.5 py-0.5 rounded-lg">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-0.5" />
              <span className="text-[11px] font-bold text-yellow-700 dark:text-yellow-400">{vehicle.rating || '5.0'}</span>
            </div>
            <span className="text-[11px] text-slate-400">({vehicle.totalReviews || 0} reviews)</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-medium text-slate-500">{vehicle.totalBookings || Math.floor(Math.random() * 15) + 3} trips</span>
          </div>

          {/* Spec details strip */}
          <div className="flex items-center gap-3 py-2.5 border-t border-b border-slate-100 dark:border-slate-800/80 mb-3 text-[11px] text-slate-500 dark:text-slate-400">
            {vehicle.specs?.horsepower ? (
              <div className="flex items-center gap-0.5">
                <Zap className="w-3 h-3 text-slate-400" />
                <span>{vehicle.specs.horsepower}hp</span>
              </div>
            ) : null}
            {vehicle.specs?.seats ? (
              <div className="flex items-center gap-0.5">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{vehicle.specs.seats} seats</span>
              </div>
            ) : null}
            {vehicle.specs?.transmission && (
              <div className="capitalize truncate">
                {vehicle.specs.transmission === 'automatic' ? t.marketplace.automatic : t.marketplace.manual}
              </div>
            )}
          </div>

          {/* Feature Badges list (Instant Book, Free Cancel, No Deposit) */}
          <div className="flex flex-wrap gap-1 mb-4 h-5 overflow-hidden">
            {vehicle.instantBook && (
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.25">
                ⚡ Instant
              </span>
            )}
            {freeCancellation && (
              <span className="text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                Free Cancel
              </span>
            )}
            {noDeposit && (
              <span className="text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                No Deposit
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <span className="btn-primary flex-1 py-2 text-xs font-semibold text-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
              {t.marketplace.bookNow}
            </span>
            {showCompare && (
              <button
                onClick={handleCompare}
                className="px-2.5 py-2 border border-slate-200 dark:border-slate-800 hover:border-accent hover:text-accent rounded-xl text-[11px] text-foreground font-medium transition-colors"
              >
                Compare
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
