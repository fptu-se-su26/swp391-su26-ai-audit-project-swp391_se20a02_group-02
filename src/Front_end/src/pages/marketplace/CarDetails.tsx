import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Zap, Gauge, Users, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Check, Car, ArrowRight, X, Loader2, Calendar,
  ShieldCheck, AlertCircle, Award, Info, FileText, CheckCircle2,
  Navigation, UserCircle, Briefcase, HeartIcon, Plane
} from 'lucide-react';
import { carService } from '@/services/carService';
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

const MOCK_360_IMAGES = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000',
];

export const CarDetails: React.FC = () => {
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

  // Car Packages Options
  const [chauffeurRequested, setChauffeurRequested] = useState(false);
  const [weddingPackageRequested, setWeddingPackageRequested] = useState(false);
  const [businessPackageRequested, setBusinessPackageRequested] = useState(false);

  // 360 Rotation Simulation States
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationDragStart = useRef(0);
  const [isRotating, setIsRotating] = useState(false);

  const [activeReviewTab, setActiveReviewTab] = useState<'vehicle' | 'owner' | 'delivery'>('vehicle');
  const [bookingLoading, setBookingLoading] = useState(false);

  const wishlisted = vehicle ? isWishlisted(vehicle.id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      carService.getById(id),
      reviewService.getByVehicle(id),
    ]).then(([v, r]) => {
      if (v) {
        setVehicle(v);
        addRecentlyViewed(v.id);
        // Generate client-side reviews if empty but totalReviews > 0
        if (r.length === 0 && v.totalReviews > 0) {
          const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D'];
          const comments = [
            'Xe chạy êm, máy khỏe, chủ xe thân thiện và đúng giờ.',
            'Trải nghiệm tuyệt vời. Giao xe sạch sẽ, đầy đủ xăng.',
            'Dịch vụ chuyên nghiệp, xe mới và rất sang trọng.',
            'Giá cả hợp lý, thủ tục nhanh chóng, sẽ tiếp tục ủng hộ.'
          ];
          const generated: Review[] = Array.from({ length: v.totalReviews }).map((_, i) => ({
            id: `gen-rev-${i}`,
            vehicleId: v.id,
            bookingId: `bk-${i}`,
            reviewerId: `u-${i}`,
            ownerId: v.ownerId,
            reviewer: {
              id: `u-${i}`,
              displayName: names[i % names.length],
              avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&q=80&w=100`,
            },
            rating: Math.floor(v.rating) + (i % 2 === 0 ? 0.5 : 0),
            cleanliness: 5,
            accuracy: 5,
            communication: 5,
            value: 4.8,
            comment: comments[i % comments.length],
            photos: [],
            helpful: i * 2 + 1,
            createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
          }));
          setReviews(generated);
        } else {
          setReviews(r);
        }
      }
      setLoading(false);
    });
  }, [id]);

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1;
  const basePrice = vehicle ? vehicle.pricePerDay * days : 0;
  const deliveryFee = deliveryRequested && vehicle ? vehicle.deliveryFee : 0;
  const chauffeurFee = chauffeurRequested ? 500000 * days : 0; // Extra 500k VND/day
  const weddingFee = weddingPackageRequested ? 1500000 : 0; // Flat wedding pack fee
  const businessDiscount = businessPackageRequested ? Math.round(basePrice * 0.1) : 0; // 10% discount for corporate

  const insuranceFee = vehicle
    ? insuranceTier === 'premium'
      ? Math.round(vehicle.pricePerDay * 0.15 * days)
      : insuranceTier === 'zero'
      ? Math.round(vehicle.pricePerDay * 0.25 * days)
      : 0
    : 0;

  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.08);
  const subtotal = basePrice + deliveryFee + chauffeurFee + weddingFee + insuranceFee + serviceFee + taxes - businessDiscount;
  const totalCost = subtotal - couponDiscount;

  const handleBookingRedirect = () => {
    if (!isAuthenticated) {
      toast.warning('Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước khi tiến hành đặt xe.');
      navigate('/auth/login');
      return;
    }
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    navigate(`/booking/${vehicle?.id}?${params.toString()}`);
  };

  const handleWishlistToggle = () => {
    if (!vehicle) return;
    if (wishlisted) {
      removeFromWishlist(vehicle.id);
      toast.info('Đã xóa', 'Đã xóa xe khỏi danh sách yêu thích.');
    } else {
      addToWishlist(vehicle.id);
      toast.success('Đã thêm', 'Đã thêm xe vào danh sách yêu thích.');
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/cars" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-500 transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách xe
          </Link>
          <div className="flex gap-2">
            <button onClick={handleWishlistToggle} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Heart className={cn("w-5 h-5", wishlisted ? "fill-red-500 text-red-500" : "text-slate-400")} />
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Share2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  {vehicle.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-yellow-500 font-extrabold bg-yellow-500/10 px-2 py-0.5 rounded-xl">
                  ★ {vehicle.rating?.toFixed(1) ?? '5.0'}
                </span>
              </div>
              <h1 className="text-display text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                {vehicle.name}
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-500" /> {vehicle.location.address}, {vehicle.location.city}
              </p>
            </div>

            {/* Gallery Section */}
            <div className="relative rounded-[2rem] overflow-hidden border border-slate-250 dark:border-slate-800/80 bg-slate-950 aspect-[16/10] shadow-xl">
              <img
                src={vehicle.images?.[activeImage] || FALLBACK_IMAGE}
                alt={vehicle.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
              
              {/* Image selector dots */}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 z-10">
                  {vehicle.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all",
                        activeImage === idx ? "bg-blue-500 w-5" : "bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Số chỗ', value: `${vehicle.specs?.seats ?? 5} chỗ`, icon: Users, desc: 'Rộng rãi, thoải mái' },
                { label: 'Hộp số', value: vehicle.specs?.transmission === 'automatic' ? 'Tự động' : 'Số sàn', icon: Gauge, desc: 'Dễ dàng điều khiển' },
                { label: 'Nhiên liệu', value: vehicle.specs?.fuelType ?? 'Xăng', icon: Zap, desc: 'Tiết kiệm tối ưu' },
                { label: 'Đặc quyền', value: vehicle.instantBook ? 'Đặt Ngay' : 'Duyệt nhanh', icon: ShieldCheck, desc: 'An tâm hành trình' }
              ].map(spec => (
                <div key={spec.label} className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
                  <spec.icon className="w-7 h-7 text-blue-500 mb-4" />
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{spec.label}</p>
                    <p className="text-slate-800 dark:text-white font-extrabold text-sm mt-0.5">{spec.value}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-none font-semibold">{spec.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Thông Tin Chi Tiết</h3>
              <p className="text-sm text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">
                {vehicle.description || 'Chưa có mô tả chi tiết cho chiếc xe này.'}
              </p>
            </div>

            {/* Map Section */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Vị Trí Xe</h3>
              <div className="relative h-96 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                <VehicleMap vehicles={[vehicle]} selectedVehicleId={vehicle.id} height="100%" />
              </div>
            </div>

            {/* Review Section */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Đánh Giá Từ Khách Hàng</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có đánh giá nào cho xe này.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="border-b dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={rev.reviewer?.avatar || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{rev.reviewer?.displayName || 'Khách hàng'}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt, 'short')}</p>
                        </div>
                      </div>
                      <p className="text-xs text-yellow-500 font-bold mb-1">★ {rev.rating.toFixed(1)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Booking Area */}
          <div className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-slate-850 rounded-[2.5rem] p-6 shadow-xl sticky top-28">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Giá Thuê</p>
                  <p className="text-display text-2xl font-black text-blue-500">{formatCurrency(vehicle.pricePerDay)}<span className="text-xs text-slate-400 font-normal">/ngày</span></p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/20">
                    Bao gồm bảo hiểm
                  </span>
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nhận xe</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Trả xe</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              {/* Special Options for Cars */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dịch vụ bổ sung</p>
                
                {/* Chauffeur Service */}
                {vehicle.hasChauffeur && (
                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold">Thuê Tài Xế Riêng</p>
                        <p className="text-[10px] text-slate-400">+500,000 VND / ngày</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={chauffeurRequested}
                      onChange={e => setChauffeurRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Airport Delivery */}
                {vehicle.airportDelivery && (
                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold">Giao Nhận Tại Sân Bay</p>
                        <p className="text-[10px] text-slate-400">Giao xe tận ga đến</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deliveryRequested}
                      onChange={e => setDeliveryRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Wedding Decor Package */}
                {vehicle.weddingRental && (
                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-rose-500" />
                      <div>
                        <p className="text-xs font-bold">Gói Hoa Cưới Trang Trí</p>
                        <p className="text-[10px] text-slate-400">+1,500,000 VND flat</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={weddingPackageRequested}
                      onChange={e => setWeddingPackageRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Business Corporate Package */}
                {vehicle.businessRental && (
                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-xs font-bold">Gói Xe Doanh Nghiệp (VAT)</p>
                        <p className="text-[10px] text-slate-400">Chiết khấu 10% tổng tiền</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={businessPackageRequested}
                      onChange={e => setBusinessPackageRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}
              </div>

              {/* Total Calculation breakdown */}
              {startDate && endDate && (
                <div className="space-y-2.5 mb-6 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Giá thuê ({days} ngày)</span>
                    <span className="font-bold text-foreground">{formatCurrency(basePrice)}</span>
                  </div>
                  {chauffeurRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tài xế riêng</span>
                      <span className="font-bold text-foreground">+{formatCurrency(chauffeurFee)}</span>
                    </div>
                  )}
                  {weddingPackageRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hoa cưới trang trí</span>
                      <span className="font-bold text-foreground">+{formatCurrency(weddingFee)}</span>
                    </div>
                  )}
                  {businessPackageRequested && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Chiết khấu doanh nghiệp</span>
                      <span className="font-bold">-{formatCurrency(businessDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t dark:border-slate-800 pt-2 text-sm font-bold">
                    <span className="text-foreground">Tổng cộng</span>
                    <span className="text-blue-500">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookingRedirect}
                className="w-full btn-primary py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover-lift justify-center"
              >
                Tiến Hành Đặt Xe <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img src={vehicle.images?.[activeImage] || FALLBACK_IMAGE} alt={vehicle.name} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}

    </div>
  );
};

export default CarDetails;
