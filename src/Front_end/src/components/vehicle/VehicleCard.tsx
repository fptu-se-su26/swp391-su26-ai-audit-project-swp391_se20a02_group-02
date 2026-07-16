import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Zap, Gauge, Users, Shield, Clock } from 'lucide-react';
import type { Vehicle } from '@/types';
import { useVehicleStore, useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { cn, formatCurrency, resolveImageUrl, sanitizeLocation } from '@/utils';
import { cardHoverVariants } from '@/animations/variants';

interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'grid' | 'list';
  showCompare?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  variant = 'grid',
  showCompare = true,
}) => {
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist, addToCompare } = useVehicleStore();
  const toast = useToast();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const wishlisted = isWishlisted(vehicle.id);

<<<<<<< HEAD
=======
  const images = (vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : [vehicle.thumbnailUrl || FALLBACK_IMAGE]).map(img => resolveImageUrl(img || FALLBACK_IMAGE));

>>>>>>> origin/main
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
      toast.success('Added to wishlist', vehicle.name);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(vehicle.id);
    toast.info('Added to compare', 'Max 3 vehicles for comparison');
  };

  const categoryColors: Record<string, string> = {
    supercar: 'bg-red-50 text-red-600',
    suv: 'bg-blue-50 text-blue-600',
    luxury: 'bg-purple-50 text-purple-600',
    convertible: 'bg-orange-50 text-orange-600',
    classic: 'bg-amber-50 text-amber-600',
    electric: 'bg-green-50 text-green-600',
    van: 'bg-slate-50 text-slate-600',
  };

  if (variant === 'list') {
    return (
<<<<<<< HEAD
      <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Link to={`/vehicles/${vehicle.id}`} className="block">
          <div className="luxury-card flex gap-0 overflow-hidden">
            {/* Image */}
            <div className="relative w-64 flex-shrink-0 overflow-hidden">
              {!imageLoaded && <div className="absolute inset-0 skeleton" />}
              <img
                src={vehicle.thumbnailUrl}
                alt={vehicle.name}
                className={cn('w-full h-full object-cover transition-transform duration-500 group-hover:scale-105', imageLoaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setImageLoaded(true)}
              />
              <button
                onClick={handleWishlist}
                className="absolute top-3 right-3 w-8 h-8 glass rounded-xl flex items-center justify-center transition-transform duration-200 hover:scale-110"
              >
                <Heart className={cn('w-4 h-4 transition-colors', wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
              </button>
=======
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
>>>>>>> origin/main
            </div>

<<<<<<< HEAD
            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={cn('badge text-xs mb-2', categoryColors[vehicle.category] || 'badge-slate')}>
                      {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}
                    </span>
                    <h3 className="font-semibold text-[#0F172A] text-lg">{vehicle.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {vehicle.location.city}, {vehicle.location.country}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#0F172A]">{formatCurrency(vehicle.pricePerDay)}</p>
                    <p className="text-xs text-slate-500">/ day</p>
=======
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
                    {sanitizeLocation(vehicle.location?.city || (vehicle as any).city || 'Vietnam')}
>>>>>>> origin/main
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{vehicle.rating}</span>
                  <span className="text-xs text-slate-400">({vehicle.totalReviews})</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Zap className="w-3.5 h-3.5" /> {vehicle.specs.horsepower} HP
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Gauge className="w-3.5 h-3.5" /> {vehicle.specs.topSpeed} km/h
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" /> {vehicle.specs.seats} seats
                  </div>
                </div>
                <span className="btn-primary text-xs px-4 py-2">Book Now</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
<<<<<<< HEAD
    <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover" className="group">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <div className="vehicle-card">
          {/* Image Container */}
          <div className="relative h-52 overflow-hidden bg-slate-100">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={vehicle.thumbnailUrl}
              alt={vehicle.name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {vehicle.isFeatured && (
                <span className="badge-gold text-[10px]">
                  ⭐ Featured
                </span>
              )}
              {vehicle.instantBook && (
                <span className="flex items-center gap-1 bg-success text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                  <Clock className="w-2.5 h-2.5" /> Instant Book
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 w-9 h-9 glass rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <Heart className={cn('w-4 h-4 transition-all duration-200', wishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white')} />
            </button>

            {/* Category Badge */}
            <div className="absolute bottom-3 left-3">
              <span className={cn('badge text-[10px]', categoryColors[vehicle.category] || 'badge-slate')}>
                {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}
              </span>
            </div>

            {/* Verified Badge */}
            {vehicle.isVerified && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Shield className="w-3 h-3 text-blue-600 fill-blue-600" />
                <span className="text-[10px] font-bold text-blue-600">Verified</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title & Price */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-semibold text-[#0F172A] text-base leading-tight truncate">{vehicle.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{vehicle.location.city}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-[#0F172A] leading-none">{formatCurrency(vehicle.pricePerDay)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">per day</p>
=======
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
                <span className="truncate">{sanitizeLocation(vehicle.location?.city || (vehicle as any).city || 'Vietnam')}</span>
>>>>>>> origin/main
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn('w-3.5 h-3.5', star <= Math.round(vehicle.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200')}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#0F172A]">{vehicle.rating}</span>
              <span className="text-xs text-slate-400">({vehicle.totalReviews})</span>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-3 py-3 border-t border-slate-100 mb-4">
              <div className="flex items-center gap-1 text-xs text-slate-500 flex-1">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>{vehicle.specs.horsepower}hp</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 flex-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span>{vehicle.specs.topSpeed}km/h</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 flex-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{vehicle.specs.seats} seats</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <span className="btn-primary flex-1 py-2.5 text-sm text-center">
                Book Now
              </span>
              {showCompare && (
                <button
                  onClick={handleCompare}
                  className="btn-ghost px-3 py-2.5 border border-slate-200 rounded-2xl text-xs"
                >
                  Compare
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VehicleCard;
