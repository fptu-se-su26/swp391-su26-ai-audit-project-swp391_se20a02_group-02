import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Users, ChevronLeft, ChevronRight,
  Info, Clock, Check, Loader2, Calendar, AlertCircle, FileText, CheckCircle2,
  Sparkles, ShieldCheck, SlidersHorizontal
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import apiClient from '@/services/api';
import type { Vehicle } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, cn, resolveImageUrl } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import LuxeWayMap from '@/components/map/LuxeWayMap';
import { recommendationService } from '@/services/enterpriseService';
import { Camera, Music, Smartphone, Compass, Eye, Heart, Menu, Trash } from 'lucide-react';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isAuthenticated } = useAuthStore();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<any[]>([]);
  
  // Gallery slider state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Collapsible description state
  const [descExpanded, setDescExpanded] = useState(false);

  // Documents tab selection
  const [selectedDocTab, setSelectedDocTab] = useState<'gplx' | 'passport'>('gplx');

  // Booking options state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(false);
  
  // Validation modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    vehicleService.getVehicleDetail(id)
      .then(data => {
        if (data) {
          setVehicle(data);
          
          // Load recommendations / similar listings
          if (data.vehicleType === 'motorbike') {
            recommendationService.getSimilarMotorbikes(data.id)
              .then(sim => {
                if (sim && sim.length > 0) {
                  setSimilarVehicles(sim);
                } else {
                  // Fallback
                  vehicleService.getMapVehicles({ vehicleType: 'motorbike' })
                    .then(list => setSimilarVehicles(list.filter(v => v.id !== data.id).slice(0, 4)))
                    .catch(() => {});
                }
              })
              .catch(() => {
                vehicleService.getMapVehicles({ vehicleType: 'motorbike' })
                  .then(list => setSimilarVehicles(list.filter(v => v.id !== data.id).slice(0, 4)))
                  .catch(() => {});
              });
          } else {
            recommendationService.getSimilarCars(data.id)
              .then(sim => {
                if (sim && sim.length > 0) {
                  setSimilarVehicles(sim);
                } else {
                  // Fallback
                  vehicleService.getMapVehicles({ vehicleType: 'car' })
                    .then(list => setSimilarVehicles(list.filter(v => v.id !== data.id).slice(0, 4)))
                    .catch(() => {});
                }
              })
              .catch(() => {
                vehicleService.getMapVehicles({ vehicleType: 'car' })
                  .then(list => setSimilarVehicles(list.filter(v => v.id !== data.id).slice(0, 4)))
                  .catch(() => {});
              });
          }
        } else {
          toast.error('Error', isVi ? 'Không tìm thấy thông tin xe.' : 'Vehicle details not found.');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error', isVi ? 'Lỗi tải chi tiết xe từ máy chủ.' : 'Failed to load vehicle details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isVi]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D1A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{isVi ? 'Đang tải thông tin xe...' : 'Loading vehicle details...'}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D1A]">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Không tìm thấy xe' : 'Vehicle Not Found'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Xe này không tồn tại hoặc chưa được duyệt.' : 'This vehicle does not exist or has not been approved.'}</p>
          <button onClick={() => navigate('/marketplace')} className="w-full py-3 bg-[#0B1221] text-white rounded-xl font-bold">
            {isVi ? 'Quay lại Marketplace' : 'Back to Marketplace'}
          </button>
        </div>
      </div>
    );
  }

  // Pre-book criteria validation click handler
  const handleBookClick = async () => {
    if (!isAuthenticated) {
      toast.warning(isVi ? 'Yêu cầu đăng nhập' : 'Authentication Required', isVi ? 'Vui lòng đăng nhập để tiến hành đặt xe.' : 'Please log in to complete your booking.');
      navigate('/auth/login');
      return;
    }

    if (!startDate || !endDate) {
      toast.warning(isVi ? 'Chọn ngày thuê' : 'Dates Required', isVi ? 'Vui lòng chọn ngày nhận xe và ngày trả xe.' : 'Please choose pick-up and return dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        startDate,
        endDate,
        includeInsurance,
        includeDelivery
      };
      
      const res = await apiClient.post<any>('/bookings/validate-pre-book', payload);
      
      if (res.success || res.data?.valid) {
        const params = new URLSearchParams({
          start: startDate,
          end: endDate,
          insurance: includeInsurance ? 'true' : 'false',
          delivery: includeDelivery ? 'true' : 'false',
        });
        navigate(`/booking/${vehicle.id}?${params.toString()}`);
      } else {
        setErrorModalMessage(res.message || (isVi ? 'Xác thực đặt xe thất bại' : 'Validation failed'));
        setShowErrorModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorModalMessage(err.message || err.error || (isVi ? 'Quy trình kiểm tra điều kiện đặt xe không thành công.' : 'Booking validation failed.'));
      setShowErrorModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  // Image list preparation
  const imageList = vehicle.vehicleImages && vehicle.vehicleImages.length > 0 
    ? vehicle.vehicleImages 
    : [vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'];

  const discountPercent = vehicle.discount ? Number(vehicle.discount) : 0;
  const finalPrice = vehicle.finalPrice ? Number(vehicle.finalPrice) : Number(vehicle.pricePerDay);
  const showMap = !!(vehicle.location?.lat && vehicle.location?.lng && Number(vehicle.location.lat) !== 0 && Number(vehicle.location.lng) !== 0);

  const days = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const rawBase = Number(vehicle.pricePerDay) * (days || 1);
  const discountAmt = Math.round(rawBase * (discountPercent / 100));
  const basePriceAfterDiscount = rawBase - discountAmt;
  const insuranceFee = includeInsurance ? Math.round(Number(vehicle.pricePerDay) * 0.15 * (days || 1)) : 0;
  const deliveryFee = includeDelivery ? (Number(vehicle.deliveryFee) || 0) : 0;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.12);
  const taxes = Math.round(basePriceAfterDiscount * 0.08);
  const estimatedTotal = basePriceAfterDiscount + insuranceFee + deliveryFee + serviceFee + taxes;

  const featureIcons: Record<string, React.JSX.Element> = {
    gps: <Compass className="w-4 h-4 text-[#D4AF37]" />,
    wifi: <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />,
    camera: <Camera className="w-4 h-4 text-[#D4AF37]" />,
    bluetooth: <Smartphone className="w-4 h-4 text-[#D4AF37]" />,
    map: <MapPin className="w-4 h-4 text-[#D4AF37]" />,
    safety: <Shield className="w-4 h-4 text-[#D4AF37]" />
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D1A] pt-24 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => setShowFullscreen(true)}
            className="lg:col-span-2 relative h-[320px] sm:h-[460px] bg-black rounded-3xl overflow-hidden shadow-md border border-slate-200/50 dark:border-white/5 cursor-pointer group"
          >
            <img 
              src={resolveImageUrl(imageList[activeImageIdx])} 
              alt={vehicle.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <span className="text-white text-xs font-bold bg-[#0B1221]/80 backdrop-blur px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                {isVi ? 'Xem ảnh chế độ đầy đủ' : 'View full-screen gallery'}
              </span>
            </div>

            {imageList.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-[#0B1221]/75 backdrop-blur text-white text-[10px] font-black px-3.5 py-1.5 rounded-full select-none shadow">
                {activeImageIdx + 1} / {imageList.length}
              </div>
            )}

            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full shadow flex items-center gap-1.5 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Giảm {discountPercent}%
              </div>
            )}
          </div>
          
          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3 h-fit">
            {imageList.slice(0, 6).map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative h-20 sm:h-24 lg:h-[110px] rounded-2xl overflow-hidden border-2 transition-all",
                  activeImageIdx === idx ? "border-[#D4AF37] scale-[0.98] shadow-md shadow-[#D4AF37]/10" : "border-transparent hover:border-slate-350 dark:hover:border-slate-800"
                )}
              >
                <img src={resolveImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                {idx === 5 && imageList.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                    +{imageList.length - 6}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Double Column Info Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Header Card */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm transition-colors">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#0B1221] dark:text-white uppercase tracking-tight mb-2">
                {vehicle.brand} {vehicle.model} <span className="text-slate-400 font-sans font-light">{vehicle.year}</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-black text-slate-850 dark:text-white text-sm">{vehicle.rating?.toFixed(1) || '5.0'}</span>
                  <span className="font-medium text-slate-455">({vehicle.totalReviews || 0} đánh giá)</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div>
                  <span className="font-black text-slate-850 dark:text-white text-sm">{vehicle.totalBookings || 12}</span> {isVi ? 'chuyến đi' : 'trips'}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{vehicle.location?.city || 'Hồ Chí Minh'}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 pt-2 select-none">
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  Miễn thế chấp
                </span>
                {vehicle.deliveryAvailable && (
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20">
                    Giao xe tận nơi
                  </span>
                )}
                {vehicle.instantBook && (
                  <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    Đặt xe nhanh
                  </span>
                )}
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">Hộp số</p>
                <p className="font-extrabold text-slate-800 dark:text-white capitalize text-sm">{vehicle.specs?.transmission || 'Số tự động'}</p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">Số chỗ</p>
                <p className="font-extrabold text-slate-800 dark:text-white text-sm">{vehicle.seatNumber || vehicle.specs?.seats || 5} chỗ</p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">Nhiên liệu</p>
                <p className="font-extrabold text-slate-800 dark:text-white capitalize text-sm">{vehicle.specs?.fuelType || 'Xăng'}</p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">Tiêu hao</p>
                <p className="font-extrabold text-slate-800 dark:text-white text-sm">{vehicle.vehicleType === 'motorbike' ? '2.5L/100km' : '7.0L/100km'}</p>
              </div>
            </div>

            {/* Description Collapsible block */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">Mô tả chi tiết</h3>
              <p className={cn(
                "text-slate-650 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-line",
                !descExpanded && "line-clamp-4"
              )}>
                {vehicle.description || 'Chủ xe chưa cập nhật mô tả chi tiết cho phương tiện này. Tuy nhiên bạn có thể liên hệ trực tiếp để giải đáp các thắc mắc về tình trạng vận hành.'}
              </p>
              
              <button 
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-3 text-xs font-black text-[#D4AF37] hover:underline"
              >
                {descExpanded ? 'Rút gọn ▲' : 'Xem thêm ▼'}
              </button>
            </div>

            {/* Amenities Grid */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">Tính năng tiện ích</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {vehicle.features.map((feature, idx) => {
                    const cleanKey = feature.toLowerCase().trim();
                    let icon = <Check className="w-4 h-4 text-emerald-500" />;
                    for (const [k, v] of Object.entries(featureIcons)) {
                      if (cleanKey.includes(k)) {
                        icon = v;
                        break;
                      }
                    }
                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {icon}
                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Required Rental Documents with tab selectors */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">Giấy tờ thuê xe bắt buộc</h3>
              
              {/* Tab options selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
                <button
                  onClick={() => setSelectedDocTab('gplx')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all",
                    selectedDocTab === 'gplx' ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-400 hover:text-slate-300"
                  )}
                >
                  GPLX & Căn cước định danh
                </button>
                <button
                  onClick={() => setSelectedDocTab('passport')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all",
                    selectedDocTab === 'passport' ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-400 hover:text-slate-300"
                  )}
                >
                  Hộ chiếu (Passport)
                </button>
              </div>

              {selectedDocTab === 'gplx' ? (
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold">Yêu cầu GPLX hạng B1 / B2 trở lên (đối với xe ô tô)</p>
                      <p className="mt-1 font-medium text-[11px] opacity-90">Bản gốc thẻ PET hoặc thông tin tài khoản VNeID định danh mức độ 2 chứa giấy phép lái xe hợp lệ.</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
                    Khách thuê cần mang theo bản gốc giấy phép lái xe để chủ xe đối chiếu khi ký hợp đồng giao nhận xe.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold">Áp dụng cho người nước ngoài hoặc khách du lịch</p>
                      <p className="mt-1 font-medium text-[11px] opacity-90">Hộ chiếu còn hạn trên 6 tháng kèm tài sản thế chấp trị giá 15 triệu VNĐ hoặc đặt cọc tiền mặt tương đương.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collateral Details */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">Tài sản thế chấp</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3.5 items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">💰</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-850 dark:text-white">Không cần đặt cọc thế chấp tài sản</h4>
                  <p className="text-[11px] font-medium text-slate-455 mt-0.5">LuxeWay bảo lãnh hoàn toàn khoản cọc thế chấp. Khách hàng chỉ cần xuất trình giấy tờ hợp lệ.</p>
                </div>
              </div>
            </div>

            {/* Policies and Terms Grid Cancellation Table */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider border-l-4 border-[#D4AF37] pl-3">Điều khoản & Chính sách</h3>
              
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wide">Quy định hủy chuyến</h4>
                
                {/* Cancellation Refund Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900/60 p-3 font-extrabold border-b border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white">
                    <span>Thời điểm hủy chuyến</span>
                    <span>Khách thuê nhận lại</span>
                    <span>Phí dịch vụ LuxeWay</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                    <span>Trước chuyến đi &gt; 7 ngày</span>
                    <span className="text-emerald-500 font-extrabold">Hoàn trả 100%</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                    <span>Từ 1 - 7 ngày trước đi</span>
                    <span className="text-amber-500 font-extrabold">Hoàn trả 90%</span>
                    <span>10% phí thuê xe</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 font-medium text-slate-600 dark:text-slate-400">
                    <span>Trong vòng 24 giờ</span>
                    <span className="text-red-500 font-extrabold">Không hoàn trả</span>
                    <span>100% phí cọc giữ chỗ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">Vị trí đỗ xe</h3>
              
              {showMap ? (
                <div className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <LuxeWayMap 
                    vehicles={[vehicle]} 
                    selectedVehicleId={vehicle.id} 
                    height="100%" 
                    pickupCoords={[Number(vehicle.location?.lat), Number(vehicle.location?.lng)]}
                    disableAutoPan={true}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <MapPin className="w-8 h-8 text-amber-500 mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Vị trí nhận xe</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.location?.address + ", " + vehicle.location?.city}</p>
                </div>
              )}
            </div>

            {/* Host Section */}
            {vehicle.owner && (
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">Thông tin chủ xe</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center font-display font-black text-[#D4AF37] text-2xl overflow-hidden">
                      {vehicle.owner.avatar ? (
                        <img src={resolveImageUrl(vehicle.owner.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        vehicle.owner.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-850 dark:text-white flex items-center gap-2 text-base">
                        {vehicle.owner.displayName}
                        {vehicle.owner.approvalBadge && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            ĐỐI TÁC XÁC MINH
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Thành viên từ 2024
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-center select-none font-bold">
                    <div>
                      <p className="text-xs text-slate-400">Đánh giá</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg flex items-center justify-center gap-0.5 mt-0.5">
                        {vehicle.owner.rating?.toFixed(1) || '5.0'} <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline" />
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-xs text-slate-400">Tỉ lệ phản hồi</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg mt-0.5">{vehicle.owner.responseRate || 100}%</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-xs text-slate-400">Số chuyến</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg mt-0.5">{vehicle.owner.totalTrips || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-xs font-medium text-slate-400">
                  * Tỷ lệ phản hồi trung bình: {vehicle.owner.responseRate || 100}% trong vòng 15 phút.
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-6 transition-colors">
              
              {/* Rental pricing */}
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Đơn giá thuê</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-display font-black text-[#0B1221] dark:text-white">{formatCurrency(finalPrice)}</span>
                  <span className="text-xs text-slate-400 font-bold">/ngày</span>
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold line-through text-slate-400 ml-2">
                      {formatCurrency(Number(vehicle.pricePerDay))}
                    </span>
                  )}
                </div>
              </div>

              {/* Date pickers */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Ngày nhận xe</label>
                  <input 
                    type="date" 
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Ngày trả xe</label>
                  <input 
                    type="date" 
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              {/* Addons toggle */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dịch vụ kèm theo</h4>
                
                {/* Insurance Protection */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-slate-850 dark:text-white">Bảo hiểm chuyến đi</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Hỗ trợ chi trả tổn thất va chạm (+15%)</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Delivery Option */}
                {vehicle.deliveryAvailable && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-850 dark:text-white">Giao xe tận nơi</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Giao nhận xe tận nhà (+{formatCurrency(Number(vehicle.deliveryFee))})
                      </p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Bill Breakdown */}
              {days > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5 font-bold">
                  <div className="flex justify-between text-slate-400">
                    <span>Đơn giá thuê ({days} ngày)</span>
                    <span className="text-slate-800 dark:text-white">{formatCurrency(rawBase)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Ưu đãi giảm giá</span>
                      <span>-{formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  {includeInsurance && (
                    <div className="flex justify-between text-slate-450">
                      <span>Bảo hiểm chuyến đi</span>
                      <span className="text-slate-800 dark:text-white">+{formatCurrency(insuranceFee)}</span>
                    </div>
                  )}
                  {includeDelivery && (
                    <div className="flex justify-between text-slate-450">
                      <span>Phí giao xe</span>
                      <span className="text-slate-800 dark:text-white">+{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-450">
                    <span>Phí dịch vụ LuxeWay (12%)</span>
                    <span className="text-slate-800 dark:text-white">+{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-450">
                    <span>Thuế GTGT (8%)</span>
                    <span className="text-slate-800 dark:text-white">+{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-slate-850 dark:text-white">TỔNG CỘNG TẠM TÍNH</span>
                    <span className="text-[#D4AF37] font-display text-base">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>
              )}

              {/* Book Action Button */}
              <button
                onClick={handleBookClick}
                disabled={bookingLoading}
                className="w-full py-4 bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221] hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 font-display font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ĐANG KIỂM TRA ĐIỀU KIỆN...
                  </>
                ) : (
                  'ĐẶT XE NGAY'
                )}
              </button>

            </div>
          </div>

        </div>

        {/* Similar Vehicles Carousel / Slider */}
        {similarVehicles && similarVehicles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200/60 dark:border-white/5">
            <h3 className="text-lg font-display font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">Xe tương tự đề xuất</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarVehicles.map(v => {
                const thumbnailSrc = v.thumbnail || v.thumbnailUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                
                const displayPrice = v.pricePerDay >= 1000 
                  ? `${(v.pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`
                  : `${v.pricePerDay}`;
                  
                const discountPercent = v.discount || 0;
                
                return (
                  <div 
                    key={v.id}
                    onClick={() => {
                      const typePath = v.vehicleType?.toLowerCase() === 'motorbike' || v.type?.toLowerCase() === 'motorbike' ? 'motorbikes' : 'cars';
                      navigate(`/${typePath}/${v.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white dark:bg-[#131F35] rounded-3xl border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#D4AF37]/35 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <img 
                        src={thumbnailSrc} 
                        alt={v.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 select-none">
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                            Giảm {discountPercent}%
                          </span>
                        )}
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                          Miễn thế chấp
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-850 dark:text-white truncate uppercase tracking-tight">
                          {v.brand} {v.name.replace(new RegExp('^' + v.brand, 'i'), '').trim()}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-450 mt-1 font-bold">
                          <span>Số tự động</span>
                          <span>•</span>
                          <span>{v.type?.toLowerCase() === 'motorbike' || v.vehicleType?.toLowerCase() === 'motorbike' ? '2 chỗ' : '5 chỗ'}</span>
                          <span>•</span>
                          <span>Xăng</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-[#D4AF37] font-bold">★</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{Number(v.rating || 5.0).toFixed(1)}</span>
                          <span className="text-slate-450">({v.totalTrips || v.totalReviews || 12} chuyến)</span>
                        </div>
                        
                        <p className="font-display font-black text-[#0B1221] dark:text-white leading-none">
                          <span className="text-base text-amber-500">{displayPrice}</span>
                          <span className="text-[9px] text-slate-450 font-bold font-sans">/ngày</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN PHOTO VIEWER MODAL */}
      {showFullscreen && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white px-2 py-4">
            <span className="text-xs font-extrabold tracking-wider bg-white/10 px-3 py-1.5 rounded-full select-none">
              Ảnh xe ({activeImageIdx + 1} / {imageList.length})
            </span>
            <button 
              onClick={() => setShowFullscreen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-xs font-black select-none"
            >
              Đóng (Esc)
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <img 
              src={resolveImageUrl(imageList[activeImageIdx])} 
              alt="Fullscreen slide" 
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />
            
            {imageList.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(prev => prev === 0 ? imageList.length - 1 : prev - 1); }}
                  className="absolute left-4 p-3.5 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(prev => prev === imageList.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-4 p-3.5 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom small indicators list */}
          <div className="flex gap-2.5 overflow-x-auto justify-center py-6 select-none scrollbar-none">
            {imageList.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative w-14 h-10 rounded-lg overflow-hidden border transition-all flex-shrink-0",
                  activeImageIdx === idx ? "border-[#D4AF37] scale-110" : "border-white/20 hover:border-white/50"
                )}
              >
                <img src={resolveImageUrl(img)} alt="Thumbnail small" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ERROR / CRITERIA FAILS MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131F35] border border-slate-200 dark:border-slate-805 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-tight">{isVi ? 'Không thể đặt xe' : 'Booking Conditions Unmet'}</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6">{errorModalMessage}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowErrorModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-bold rounded-xl transition-colors text-xs"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              {(errorModalMessage.toLowerCase().includes('verification') || 
                errorModalMessage.toLowerCase().includes('identity') || 
                errorModalMessage.toLowerCase().includes('kyc') ||
                errorModalMessage.toLowerCase().includes('license') ||
                errorModalMessage.toLowerCase().includes('gplx') ||
                errorModalMessage.toLowerCase().includes('driving')
              ) && (
                <button 
                  onClick={() => { setShowErrorModal(false); navigate('/dashboard/documents'); }}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0B1221] font-bold rounded-xl transition-all shadow-sm text-xs animate-pulse"
                >
                  {isVi ? 'Xác thực & Tải GPLX' : 'Verify & Upload License'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleDetailPage;
