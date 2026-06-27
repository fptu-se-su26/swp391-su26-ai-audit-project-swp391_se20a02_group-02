import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Users, ChevronLeft, ChevronRight,
  Info, Clock, Check, Loader2, Calendar, AlertCircle, FileText, CheckCircle2,
  Sparkles, ShieldCheck
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import apiClient from '@/services/api';
import type { Vehicle } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, cn, resolveImageUrl } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import LuxeWayMap from '@/components/map/LuxeWayMap';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isAuthenticated } = useAuthStore();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  
  // Gallery slider state
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{isVi ? 'Đang tải thông tin xe...' : 'Loading vehicle details...'}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Không tìm thấy xe' : 'Vehicle Not Found'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Xe này không tồn tại hoặc chưa được duyệt.' : 'This vehicle does not exist or has not been approved.'}</p>
          <button onClick={() => navigate('/marketplace')} className="w-full btn-primary py-3 rounded-xl font-bold">
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

  // Image list preparation (Primary first, then gallery)
  const imageList = vehicle.vehicleImages && vehicle.vehicleImages.length > 0 
    ? vehicle.vehicleImages 
    : [vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'];

  const discountPercent = vehicle.discount ? Number(vehicle.discount) : 0;
  const finalPrice = vehicle.finalPrice ? Number(vehicle.finalPrice) : Number(vehicle.pricePerDay);
  const showMap = !!(vehicle.location?.lat && vehicle.location?.lng && Number(vehicle.location.lat) !== 0 && Number(vehicle.location.lng) !== 0);

  // Rental duration calculation
  const days = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Invoice pricing estimation
  const rawBase = Number(vehicle.pricePerDay) * (days || 1);
  const discountAmt = Math.round(rawBase * (discountPercent / 100));
  const basePriceAfterDiscount = rawBase - discountAmt;
  const insuranceFee = includeInsurance ? Math.round(Number(vehicle.pricePerDay) * 0.15 * (days || 1)) : 0;
  const deliveryFee = includeDelivery ? (Number(vehicle.deliveryFee) || 0) : 0;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.12);
  const taxes = Math.round(basePriceAfterDiscount * 0.08);
  const estimatedTotal = basePriceAfterDiscount + insuranceFee + deliveryFee + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* IMAGE GALLERY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 relative h-[300px] sm:h-[450px] bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <img 
              src={resolveImageUrl(imageList[activeImageIdx])} 
              alt={vehicle.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            
            {imageList.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIdx(prev => prev === 0 ? imageList.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-800 dark:text-white shadow hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setActiveImageIdx(prev => prev === imageList.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-800 dark:text-white shadow hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow flex items-center gap-1 uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                -{discountPercent}% {isVi ? 'GIẢM GIÁ' : 'PROMO'}
              </div>
            )}
          </div>
          
          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3 h-fit">
            {imageList.slice(0, 8).map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative h-20 sm:h-24 lg:h-[106px] rounded-2xl overflow-hidden border-2 transition-all",
                  activeImageIdx === idx ? "border-blue-500 scale-[0.98] shadow-md shadow-blue-500/10" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <img src={resolveImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS & STICKY BOOKING WIDGET */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Vehicle Information */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header info */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground uppercase tracking-tight mb-2">
                {vehicle.brand} {vehicle.model} <span className="text-slate-400 font-medium">{vehicle.year}</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-foreground">{vehicle.rating?.toFixed(1)}</span>
                  <span>({vehicle.totalReviews} {isVi ? 'đánh giá' : 'reviews'})</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div>
                  <span className="font-bold text-foreground">{vehicle.totalBookings}</span> {isVi ? 'chuyến đi' : 'trips'}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{vehicle.location?.city}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2.5">
                {discountPercent > 0 && (
                  <span className="text-xs font-extrabold bg-red-500/10 text-red-500 dark:text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20">
                    {isVi ? 'Ưu đãi đặc biệt' : 'Promo discount'}
                  </span>
                )}
                {(!vehicle.deposit || Number(vehicle.deposit) === 0) && (
                  <span className="text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    {isVi ? 'Không cần cọc' : 'No deposit'}
                  </span>
                )}
                {vehicle.deliveryAvailable && (
                  <span className="text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20">
                    {isVi ? 'Giao xe tận nơi' : 'Delivery available'}
                  </span>
                )}
                {vehicle.instantBook && (
                  <span className="text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    {isVi ? 'Đặt xe nhanh' : 'Instant Book'}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{isVi ? 'HỘP SỐ' : 'TRANSMISSION'}</p>
                <p className="font-extrabold text-foreground capitalize">{vehicle.specs?.transmission || 'Tự động'}</p>
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{isVi ? 'SỐ CHỖ' : 'SEAT CAPACITY'}</p>
                <p className="font-extrabold text-foreground">{vehicle.seatNumber || vehicle.specs?.seats || 5} {isVi ? 'chỗ' : 'seats'}</p>
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{isVi ? 'NHIÊN LIỆU' : 'FUEL TYPE'}</p>
                <p className="font-extrabold text-foreground capitalize">{vehicle.specs?.fuelType || 'Xăng'}</p>
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{isVi ? 'TIÊU THỤ' : 'CONSUMPTION'}</p>
                <p className="font-extrabold text-foreground">{vehicle.vehicleType === 'motorbike' ? '2.5L/100km' : '6.5L/100km'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">{isVi ? 'Mô tả chi tiết' : 'Description'}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {vehicle.description || (isVi ? 'Không có mô tả chi tiết.' : 'No detailed description available.')}
              </p>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6">{isVi ? 'Tính năng & Tiện ích' : 'Features & Amenities'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {vehicle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">✓</div>
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Documents */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {isVi ? 'Giấy tờ thuê xe bắt buộc' : 'Required Rental Documents'}
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                <p className="font-bold text-foreground mb-2">{vehicle.requiredDocuments}</p>
                <p className="text-xs text-slate-550">
                  {isVi 
                    ? '* Khách thuê phải xuất trình giấy tờ gốc cho chủ xe khi nhận xe để đối chiếu. LuxeWay sẽ không lưu trữ bản gốc của bạn.'
                    : '* Renters must present original documents to the owner at pickup. LuxeWay does not keep physical records.'}
                </p>
              </div>
            </div>

            {/* Owner Section */}
            {vehicle.owner && (
              <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6">{isVi ? 'Thông tin chủ xe' : 'Owner Credibility'}</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center font-display font-black text-blue-500 text-2xl overflow-hidden">
                      {vehicle.owner.avatar ? (
                        <img src={resolveImageUrl(vehicle.owner.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        vehicle.owner.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2 text-base">
                        {vehicle.owner.displayName}
                        {vehicle.owner.approvalBadge && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {isVi ? 'ĐỐI TÁC XÁC MINH' : 'VERIFIED HOST'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {isVi ? 'Thành viên từ 2024' : 'LuxeWay Partner since 2024'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-xs text-slate-400">{isVi ? 'Đánh giá' : 'Rating'}</p>
                      <p className="font-extrabold text-foreground text-lg flex items-center justify-center gap-0.5 mt-0.5">
                        {vehicle.owner.rating?.toFixed(1)} <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline" />
                      </p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <p className="text-xs text-slate-400">{isVi ? 'Phản hồi' : 'Response rate'}</p>
                      <p className="font-extrabold text-foreground text-lg mt-0.5">{vehicle.owner.responseRate}%</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <p className="text-xs text-slate-400">{isVi ? 'Số chuyến' : 'Trips'}</p>
                      <p className="font-extrabold text-foreground text-lg mt-0.5">{vehicle.owner.totalTrips || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-xs text-slate-500">
                  {isVi 
                    ? `* Tỷ lệ phản hồi trung bình: ${vehicle.owner.responseRate}% trong vòng ${vehicle.owner.responseTime} phút.`
                    : `* Average response rate: ${vehicle.owner.responseRate}% within ${vehicle.owner.responseTime} minutes.`}
                </div>
              </div>
            )}

            {/* Policies & Rules */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">{isVi ? 'Chính sách & Quy định' : 'Policies & Cancellation Rules'}</h3>
              
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">{isVi ? 'Chính sách hủy chuyến' : 'Cancellation Policy'}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{vehicle.cancellationPolicy}</p>
              </div>
              
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">{isVi ? 'Chính sách đặt cọc thế chấp' : 'Deposit Policy'}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{vehicle.depositPolicy}</p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">{isVi ? 'Quy định riêng của chủ xe' : 'Rental Rules'}</h4>
                <p className="text-xs text-slate-505 leading-relaxed">{vehicle.rentalRules}</p>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">{isVi ? 'Bản đồ vị trí xe' : 'Location Map'}</h3>
              
              {showMap ? (
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-sm border border-border">
                  <LuxeWayMap 
                    vehicles={[vehicle]} 
                    selectedVehicleId={vehicle.id} 
                    height="100%" 
                    pickupCoords={[Number(vehicle.location?.lat), Number(vehicle.location?.lng)]}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <MapPin className="w-8 h-8 text-amber-500 mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">{isVi ? 'Vị trí nhận xe' : 'Vehicle Location'}</h4>
                  <p className="text-xs text-slate-555 dark:text-slate-400">{vehicle.location?.address + ", " + vehicle.location?.city}</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Booking Checkout Widget (Sticky) */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Pricing title */}
              <div>
                <p className="text-slate-400 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{isVi ? 'ĐƠN GIÁ THUÊ' : 'RENTAL PRICE'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display font-black text-foreground">{formatCurrency(finalPrice, language)}</span>
                  <span className="text-xs text-slate-400">/{isVi ? 'ngày' : 'day'}</span>
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold line-through text-slate-400">
                      {formatCurrency(Number(vehicle.pricePerDay), language)}
                    </span>
                  )}
                </div>
              </div>

              {/* Date pickers */}
              <div className="space-y-3.5 pt-3 border-t border-border">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">{isVi ? 'Ngày nhận xe' : 'Pick-up Date'}</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">{isVi ? 'Ngày trả xe' : 'Return Date'}</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Extras Switch toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{isVi ? 'Dịch vụ thêm' : 'Addons / Extras'}</h4>
                
                {/* Insurance toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{isVi ? 'Bảo hiểm chuyến đi' : 'Trip Protection'}</p>
                    <p className="text-[10px] text-slate-400">{isVi ? 'Bảo hiểm vật chất nâng cao (+15%)' : 'Premium accident insurance (+15%)'}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 border-border focus:ring-blue-500"
                  />
                </div>

                {/* Delivery toggle */}
                {vehicle.deliveryAvailable && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{isVi ? 'Giao xe tận nơi' : 'Delivery services'}</p>
                      <p className="text-[10px] text-slate-400">
                        {isVi ? `Giao xe nội thành (+${formatCurrency(Number(vehicle.deliveryFee), language)})` : `Doorstep delivery (+${formatCurrency(Number(vehicle.deliveryFee), language)})`}
                      </p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 border-border focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Price Breakdown Preview */}
              {days > 0 && (
                <div className="pt-4 border-t border-border text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Đơn giá thuê' : 'Base Price'} ({days} {isVi ? 'ngày' : 'days'})</span>
                    <span className="font-bold text-foreground">{formatCurrency(rawBase, language)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>{isVi ? 'Ưu đãi giảm giá' : 'Special promo discount'}</span>
                      <span className="font-bold">-{formatCurrency(discountAmt, language)}</span>
                    </div>
                  )}
                  {includeInsurance && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isVi ? 'Bảo hiểm chuyến đi' : 'Insurance fee'}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(insuranceFee, language)}</span>
                    </div>
                  )}
                  {includeDelivery && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isVi ? 'Phí giao nhận' : 'Delivery fee'}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(deliveryFee, language)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Phí nền tảng' : 'Service fee'} (12%)</span>
                    <span className="font-bold text-foreground">+{formatCurrency(serviceFee, language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Thuế & VAT' : 'Taxes & VAT'} (8%)</span>
                    <span className="font-bold text-foreground">+{formatCurrency(taxes, language)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-border">
                    <span className="text-foreground">{isVi ? 'TỔNG TẠM TÍNH' : 'ESTIMATED TOTAL'}</span>
                    <span className="text-blue-500 font-display font-black">{formatCurrency(estimatedTotal, language)}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookClick}
                disabled={bookingLoading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isVi ? 'ĐANG KIỂM TRA ĐIỀU KIỆN...' : 'VALIDATING ELIGIBILITY...'}
                  </>
                ) : (
                  <>
                    {isVi ? 'ĐẶT XE NGAY' : 'BOOK EXPERIENCE'}
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* ERROR / CRITERIA FAILS MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-foreground">{isVi ? 'Không thể đặt xe' : 'Booking Conditions Unmet'}</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{errorModalMessage}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowErrorModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-bold rounded-xl transition-colors"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              {(errorModalMessage.includes('verification') || errorModalMessage.toLowerCase().includes('identity') || errorModalMessage.toLowerCase().includes('kyc')) && (
                <button 
                  onClick={() => navigate('/dashboard/profile')}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                >
                  {isVi ? 'Xác thực ngay' : 'Verify Identity'}
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
