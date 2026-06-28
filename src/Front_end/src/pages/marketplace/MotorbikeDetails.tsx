import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Star, ShieldCheck, CheckCircle2, Navigation,
  Gauge, Zap, ArrowRight, Loader2, MapPin, Check
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types';
import { useAuthStore, useVehicleStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, cn } from '@/utils';
import { useT } from '@/i18n/translations';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000';

export const MotorbikeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useVehicleStore();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Booking states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    vehicleService.getById(id).then(v => {
      setVehicle(v);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Auto-sliding effect
  useEffect(() => {
    if (!vehicle || vehicle.images.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev === vehicle.images.length - 1 ? 0 : prev + 1));
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [vehicle, isHovered]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy xe máy</h2>
        <button onClick={() => navigate(-1)} className="text-orange-500 underline">Quay lại</button>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [FALLBACK_IMAGE];
  const wishlisted = isWishlisted(vehicle.id);

  const handleNext = () => setCurrentIndex(p => (p === images.length - 1 ? 0 : p + 1));
  const handlePrev = () => setCurrentIndex(p => (p === 0 ? images.length - 1 : p - 1));

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đặt xe');
      navigate('/auth/login');
      return;
    }
    if (!startDate || !endDate) {
      toast.warning('Chọn ngày', 'Vui lòng chọn ngày nhận và trả xe');
      return;
    }
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      navigate(`/booking/${vehicle.id}?start=${startDate}&end=${endDate}`);
    }, 1000);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu xe');
      return;
    }
    if (wishlisted) {
      removeFromWishlist(vehicle.id);
      toast.info('Đã bỏ lưu');
    } else {
      addToWishlist(vehicle.id);
      toast.success('Đã lưu xe!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      
      {/* 1. HERO CAROUSEL */}
      <div 
        className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-black mt-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${vehicle.name} - ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-black/60 pointer-events-none" />

        {/* Carousel Controls */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-300 z-20">
            <button onClick={handlePrev} className="p-3 rounded-full bg-black/50 hover:bg-orange-500 text-white backdrop-blur-md transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={handleNext} className="p-3 rounded-full bg-black/50 hover:bg-orange-500 text-white backdrop-blur-md transition">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentIndex ? "w-8 bg-orange-500" : "w-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>

        {/* Top bar back button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white text-sm font-medium transition-all z-20"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Details */}
          <div className="flex-1 space-y-12">
            
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full border border-orange-500/30">
                  {vehicle.brand}
                </span>
                <span className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  {vehicle.rating?.toFixed(1) || '4.9'} ({vehicle.totalReviews || 12} đánh giá)
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                {vehicle.name}
              </h1>
              <p className="text-xl text-slate-400 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                {vehicle.location?.city || 'Hồ Chí Minh'}
              </p>
            </div>

            {/* Engine & Tech Specs */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                Động cơ & Hiệu suất
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-orange-500/50 transition-colors">
                  <Gauge className="w-8 h-8 text-orange-400 mb-3" />
                  <p className="text-slate-400 text-sm mb-1">Phân khối</p>
                  <p className="text-2xl font-bold text-white">{vehicle.engineCc ? `${vehicle.engineCc} cc` : 'N/A'}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-yellow-500/50 transition-colors">
                  <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                  <p className="text-slate-400 text-sm mb-1">Mã lực</p>
                  <p className="text-2xl font-bold text-white">{vehicle.specs?.horsepower ? `${vehicle.specs.horsepower} HP` : 'N/A'}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-blue-500/50 transition-colors">
                  <Navigation className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="text-slate-400 text-sm mb-1">Vận tốc tối đa</p>
                  <p className="text-2xl font-bold text-white">{vehicle.specs?.topSpeed ? `${vehicle.specs.topSpeed} km/h` : 'N/A'}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-green-500/50 transition-colors">
                  <ShieldCheck className="w-8 h-8 text-green-400 mb-3" />
                  <p className="text-slate-400 text-sm mb-1">Hộp số</p>
                  <p className="text-2xl font-bold text-white capitalize">{vehicle.specs?.transmission === 'automatic' ? 'Tay ga' : 'Số sàn'}</p>
                </div>
              </div>
            </section>

            {/* Advantages / Features */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-orange-500" />
                Ưu điểm nổi bật
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(vehicle.features && vehicle.features.length > 0 ? vehicle.features : [
                  'Thiết kế thể thao mạnh mẽ',
                  'Phanh ABS an toàn 2 kênh',
                  'Đèn LED trước sau siêu sáng',
                  'Màn hình LCD thông minh',
                  'Phuộc nhún cao cấp',
                  'Chìa khóa thông minh Smartkey'
                ]).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <div className="p-1 bg-orange-500/20 rounded-full mt-0.5">
                      <Check className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-slate-300 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Mô tả xe</h2>
              <p className="text-slate-400 leading-relaxed text-lg">
                {vehicle.description || `Mẫu xe ${vehicle.brand} ${vehicle.name} mang đến trải nghiệm lái xe tuyệt vời với thiết kế tiên tiến. Được trang bị động cơ mạnh mẽ và các tính năng hiện đại, đây là lựa chọn hoàn hảo cho những chuyến đi. Tận hưởng sự thoải mái và phong cách với mỗi vòng quay bánh xe.`}
              </p>
            </section>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:w-[420px]">
            <div className="sticky top-28 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-slate-400 text-sm uppercase tracking-wider font-bold">Giá thuê</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-white">{formatCurrency(vehicle.pricePerDay)}</span>
                    <span className="text-slate-500">/ ngày</span>
                  </div>
                </div>
                <button 
                  onClick={handleWishlist}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                  title="Lưu xe"
                >
                  <Star className={cn("w-6 h-6", wishlisted ? "fill-orange-500 text-orange-500" : "text-slate-400")} />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày Nhận Xe</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày Trả Xe</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={bookingLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98]"
              >
                {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Đặt Xe Ngay <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Thanh toán an toàn & Bảo mật
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MotorbikeDetails;
