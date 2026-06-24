import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Zap, Gauge, Users, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Check, Car, ArrowRight, X, Loader2, Calendar
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { reviewService } from '@/services/otherServices';
import type { Vehicle, Review } from '@/types';
import { useVehicleStore, useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getRatingLabel } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist, addRecentlyViewed } = useVehicleStore();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([]);

  const wishlisted = vehicle ? isWishlisted(vehicle.id) : false;

  useEffect(() => {
    if (!id) return;
    Promise.all([
      vehicleService.getById(id),
      reviewService.getByVehicle(id),
    ]).then(([v, r]) => {
      setVehicle(v);
      setReviews(r.slice(0, 6));
      setLoading(false);
      if (v) {
        addRecentlyViewed(v.id);
        vehicleService.getAll({ category: [v.category] }).then(res => {
          setRelatedVehicles(res.data.filter(rv => rv.id !== id).slice(0, 3));
        });
      }
    });
  }, [id]);

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
    navigate(`/booking/${vehicle!.id}?start=${startDate}&end=${endDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Vehicle Not Found</h2>
          <Link to="/marketplace" className="btn-primary mt-4">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;
  const basePrice = vehicle.pricePerDay * totalDays;
  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.08);
  const total = basePrice + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-[#0F172A]">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/marketplace" className="hover:text-[#0F172A]">Marketplace</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0F172A] font-medium truncate">{vehicle.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div
                className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={vehicle.images[activeImage]}
                    alt={vehicle.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + vehicle.images.length) % vehicle.images.length); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % vehicle.images.length); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Photo count */}
                <div className="absolute bottom-4 right-4 glass px-3 py-1.5 rounded-xl text-white text-xs font-medium">
                  {activeImage + 1} / {vehicle.images.length} photos
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {vehicle.isFeatured && <span className="badge-gold">⭐ Featured</span>}
                  {vehicle.isVerified && <span className="flex items-center gap-1 bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><Shield className="w-3 h-3" /> Verified</span>}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {vehicle.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-accent' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${vehicle.category === 'supercar' ? 'badge-red' : vehicle.category === 'electric' ? 'badge-green' : 'badge-blue'}`}>
                      {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}
                    </span>
                    {vehicle.instantBook && (
                      <span className="flex items-center gap-1 badge badge-green">
                        <Clock className="w-3 h-3" /> Instant Book
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A]">{vehicle.name}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-[#0F172A]">{vehicle.rating}</span>
                      <span>({vehicle.totalReviews} reviews)</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {vehicle.location.city}, {vehicle.location.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleWishlist}
                    className={`p-2.5 rounded-2xl border-2 transition-all ${wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:border-red-200'}`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-2xl border-2 border-slate-200 text-slate-400 hover:border-slate-300 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Zap, label: 'Horsepower', value: `${vehicle.specs.horsepower} HP` },
                { icon: Gauge, label: 'Top Speed', value: `${vehicle.specs.topSpeed} km/h` },
                { icon: Car, label: '0-100 km/h', value: `${vehicle.specs.acceleration}s` },
                { icon: Users, label: 'Seats', value: `${vehicle.specs.seats} Seats` },
              ].map(spec => (
                <div key={spec.label} className="luxury-card p-4 text-center">
                  <spec.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="font-bold text-[#0F172A] text-base">{spec.value}</p>
                  <p className="text-xs text-slate-500">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="luxury-card p-6">
              <h3 className="font-display text-xl font-bold text-[#0F172A] mb-3">About This Vehicle</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{vehicle.description}</p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 pt-6 border-t border-slate-100">
                {[
                  { label: 'Transmission', value: vehicle.specs.transmission === 'automatic' ? 'Automatic' : 'Manual' },
                  { label: 'Fuel Type', value: vehicle.specs.fuelType.charAt(0).toUpperCase() + vehicle.specs.fuelType.slice(1) },
                  { label: 'Color', value: vehicle.specs.color },
                  { label: 'Doors', value: `${vehicle.specs.doors} Doors` },
                  { label: 'Engine', value: vehicle.specs.engineSize || 'Electric' },
                  { label: 'Year', value: vehicle.year.toString() },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-medium text-[#0F172A]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="luxury-card p-6">
              <h3 className="font-display text-xl font-bold text-[#0F172A] mb-4">Features & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vehicle.features.map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            {vehicle.rules.length > 0 && (
              <div className="luxury-card p-6">
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-4">Rental Rules</h3>
                <div className="space-y-2">
                  {vehicle.rules.map(rule => (
                    <div key={rule} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            <div className="luxury-card p-6">
              <h3 className="font-display text-xl font-bold text-[#0F172A] mb-4">Insurance & Protection</h3>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl">
                <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">{vehicle.insurance.provider}</p>
                  <p className="text-slate-500 text-sm">{vehicle.insurance.coverage}</p>
                  {vehicle.insurance.included && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold mt-1">
                      <Check className="w-3 h-3" /> Included in rental price
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="luxury-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-[#0F172A]">
                  Reviews <span className="text-slate-400 font-sans text-base font-normal">({vehicle.totalReviews})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-[#0F172A]">{vehicle.rating}</span>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(vehicle.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{getRatingLabel(vehicle.rating)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="avatar w-9 h-9 rounded-xl text-xs flex-shrink-0">{review.reviewerId.slice(0, 2).toUpperCase()}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-[#0F172A]">Verified Renter</p>
                            <span className="text-xs text-slate-400">{formatDate(review.createdAt, 'short')}</span>
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      {review.ownerResponse && (
                        <div className="mt-3 pl-3 border-l-2 border-accent/30 text-sm text-slate-500 italic">
                          <span className="font-semibold text-[#0F172A] not-italic">Owner: </span>
                          {review.ownerResponse}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="luxury-card p-6">
                {/* Price */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <span className="text-3xl font-bold text-[#0F172A]">{formatCurrency(vehicle.pricePerDay)}</span>
                    <span className="text-slate-500 text-sm"> / day</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{vehicle.rating}</span>
                    </div>
                    <p className="text-xs text-slate-400">{getRatingLabel(vehicle.rating)}</p>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden mb-4">
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="p-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pick-up</label>
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setStartDate(e.target.value)}
                        className="text-sm font-medium text-[#0F172A] outline-none w-full bg-transparent"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Return</label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => setEndDate(e.target.value)}
                        className="text-sm font-medium text-[#0F172A] outline-none w-full bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                {startDate && endDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 mb-4 p-4 bg-slate-50 rounded-2xl text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-500">{formatCurrency(vehicle.pricePerDay)} × {totalDays} days</span>
                      <span className="font-medium">{formatCurrency(basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service fee (12%)</span>
                      <span className="font-medium">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxes & fees</span>
                      <span className="font-medium">{formatCurrency(taxes)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#0F172A]">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      + {formatCurrency(vehicle.deposit)} security deposit (refundable)
                    </p>
                  </motion.div>
                )}

                {/* Book Button */}
                <motion.button
                  onClick={handleBookNow}
                  disabled={bookingLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full py-4 text-base mb-3"
                >
                  {bookingLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Book Experience <ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>

                <p className="text-center text-xs text-slate-400 mb-4">You won't be charged yet</p>

                {/* Trust Signals */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  {[
                    { icon: Shield, text: 'Free cancellation up to 48h before' },
                    { icon: Check, text: 'Insurance included' },
                    { icon: Clock, text: `Responds in ${vehicle.instantBook ? '< 1 hour' : '< 12 hours'}` },
                  ].map(t => (
                    <div key={t.text} className="flex items-center gap-2 text-xs text-slate-500">
                      <t.icon className="w-4 h-4 text-success" />
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Owner */}
              <div className="luxury-card p-5 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar w-12 h-12 rounded-2xl text-sm">OW</div>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A]">James Whitmore</p>
                    <p className="text-xs text-slate-400">Superhost · 87 reviews</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">4.9</span>
                  </div>
                </div>
                <Link
                  to={isAuthenticated ? `/messages` : '/auth/login'}
                  className="btn-outline w-full py-2.5 text-sm justify-center"
                >
                  Contact Owner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-white hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
            <img src={vehicle.images[activeImage]} alt={vehicle.name} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
            {vehicle.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {vehicle.images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? 'bg-white w-6' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDetailPage;
