import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Car, MapPin, Shield, CheckCircle, 
  Clock, AlertCircle, Phone, Mail, FileText, Download,
  Navigation, Star, XCircle
} from 'lucide-react';

import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';
import type { Booking } from '@/types';
import { formatCurrency, formatDate, getInitials, cn } from '@/utils';
import Avatar from '@/components/ui/Avatar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { PageLoader } from '@/components/ui/Loader';

// Timeline stages definition
const STAGES = [
  { key: 'waiting_payment', label: 'Payment' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'picking_up', label: 'Pick Up' },
  { key: 'in_progress', label: 'In Rental' },
  { key: 'return_pending', label: 'Return' },
  { key: 'completed', label: 'Completed' }
];

export const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const t = useT();

  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    if (!bookingId) return;
    bookingService.getById(bookingId)
      .then(b => {
        if (b) {
          setBooking(b);
        } else {
          toast.error(isVi ? 'Không tìm thấy đơn hàng' : 'Booking not found', '');
          navigate('/dashboard/bookings');
        }
      })
      .catch(err => {
        console.error(err);
        toast.error(isVi ? 'Lỗi tải đơn hàng' : 'Error loading booking', '');
        navigate('/dashboard/bookings');
      })
      .finally(() => setLoading(false));
  }, [bookingId, navigate, toast, isVi]);

  if (loading) return <PageLoader />;
  if (!booking) return null;

  // Determine current stage index
  const statusLower = booking.status?.toLowerCase() || '';
  let currentIndex = 0;
  
  if (['pending', 'waiting_payment', 'payment_pending'].includes(statusLower)) currentIndex = 0;
  else if (['confirmed', 'payment_verified', 'owner_approved'].includes(statusLower)) currentIndex = 1;
  else if (statusLower === 'picking_up' || statusLower === 'ready_for_pickup') currentIndex = 2;
  else if (['active', 'in_progress', 'in_rental', 'checked_out'].includes(statusLower)) currentIndex = 3;
  else if (['return_pending'].includes(statusLower)) currentIndex = 4;
  else if (['completed', 'return_completed'].includes(statusLower)) currentIndex = 5;
  else if (statusLower.includes('cancel') || statusLower.includes('reject') || statusLower.includes('expire')) currentIndex = -1; // Cancelled

  const isCancelled = currentIndex === -1;

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: t.dashboard.myBookings, href: '/dashboard/bookings' },
    { label: `#${booking.id.slice(-8).toUpperCase()}` }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <Breadcrumbs title={isVi ? 'Chi Tiết Đặt Xe' : 'Booking Details'} items={breadcrumbItems} backHref="/dashboard/bookings" backText={isVi ? 'Quay lại' : 'Back to Bookings'} />

      {/* ── Journey Timeline ── */}
      <div className="bg-white dark:bg-[#131F35] rounded-2xl p-8 border border-slate-200 dark:border-[#1E2D45] shadow-sm">
        <h2 className="text-xl font-bold font-serif mb-8 text-[#0B1221] dark:text-white">
          {isVi ? 'Hành Trình Của Bạn' : 'Your Journey'}
        </h2>
        
        {isCancelled ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
              {isVi ? 'Giao dịch đã bị huỷ' : 'Booking Cancelled'}
            </h3>
            <p className="text-red-600/80 dark:text-red-400/80 mt-1">
              {isVi ? 'Đơn đặt xe này đã bị huỷ bỏ.' : 'This booking has been cancelled.'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-100 dark:bg-slate-800" />
            
            <div className="absolute top-5 left-8 h-[2px] bg-[#D4AF37] transition-all duration-700 ease-out" 
                 style={{ width: `calc(${currentIndex * (100 / (STAGES.length - 1))}% - ${currentIndex === 0 ? 0 : 32}px)` }} />
            
            <div className="flex justify-between relative z-10">
              {STAGES.map((stage, idx) => {
                const isPast = idx < currentIndex;
                const isActive = idx === currentIndex;
                const isFuture = idx > currentIndex;

                return (
                  <div key={stage.key} className="flex flex-col items-center w-24">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-white dark:bg-[#131F35]",
                      isPast ? "border-[#D4AF37] bg-[#D4AF37]/10" : 
                      isActive ? "border-[#D4AF37] ring-4 ring-[#D4AF37]/20 bg-[#D4AF37]" : 
                      "border-slate-200 dark:border-slate-700"
                    )}>
                      {isPast ? (
                        <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      ) : isActive ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-white dark:bg-[#0B1221]"
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>
                    <span className={cn(
                      "mt-3 text-xs font-semibold text-center transition-colors",
                      isPast || isActive ? "text-[#0B1221] dark:text-white" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {isVi ? (
                        stage.key === 'waiting_payment' ? 'Thanh toán' :
                        stage.key === 'confirmed' ? 'Xác nhận' :
                        stage.key === 'picking_up' ? 'Nhận xe' :
                        stage.key === 'in_progress' ? 'Đang thuê' :
                        stage.key === 'return_pending' ? 'Trả xe' : 'Hoàn tất'
                      ) : stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Main Column: Vehicle & Trip Details ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Vehicle Info */}
          <div className="bg-white dark:bg-[#131F35] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1E2D45] shadow-sm flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 h-48 md:h-auto bg-slate-100 dark:bg-slate-800 relative">
              <img 
                src={booking.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80'} 
                alt="Vehicle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-[#131F35]/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
                  {booking.id.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 w-full md:w-3/5 flex flex-col justify-center">
              <div className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-2">
                {booking.vehicle?.brand || 'Luxury'}
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#0B1221] dark:text-white mb-2">
                {booking.vehicle?.brand} {booking.vehicle?.model} {booking.vehicle?.year}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><Car className="w-4 h-4" /> {booking.vehicle?.type || 'Sedan'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {booking.vehicle?.location?.city || 'Hanoi'}</span>
              </div>
              
              <Link 
                to={`/vehicles/${booking.vehicleId}`}
                className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#B5952F] font-bold text-sm transition-colors w-fit"
              >
                {isVi ? 'Xem chi tiết xe' : 'View Vehicle Listing'} <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white dark:bg-[#131F35] rounded-2xl p-8 border border-slate-200 dark:border-[#1E2D45] shadow-sm">
            <h3 className="text-lg font-bold font-serif mb-6 text-[#0B1221] dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              {isVi ? 'Thông Tin Chuyến Đi' : 'Trip Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">{isVi ? 'Nhận xe' : 'Pick Up'}</div>
                <div className="font-bold text-[#0B1221] dark:text-white text-lg">{formatDate(booking.startDate)}</div>
                <div className="text-sm text-slate-500">10:00 AM</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">{isVi ? 'Trả xe' : 'Return'}</div>
                <div className="font-bold text-[#0B1221] dark:text-white text-lg">{formatDate(booking.endDate)}</div>
                <div className="text-sm text-slate-500">10:00 AM</div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">{isVi ? 'Địa điểm giao nhận' : 'Location'}</div>
                <div className="font-semibold text-sm">{booking.vehicle?.location?.address || 'Hanoi, Vietnam'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{isVi ? 'Thời gian thuê' : 'Duration'}</div>
                <div className="font-semibold text-sm">{booking.totalDays} {t.booking.totalDays}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar Column: Host & Payment ── */}
        <div className="space-y-8">
          
          {/* Host Info */}
          <div className="bg-white dark:bg-[#131F35] rounded-2xl p-6 border border-slate-200 dark:border-[#1E2D45] shadow-sm">
            <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-6">
              {isVi ? 'Chủ Xe' : 'Hosted By'}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={booking.owner?.avatar} name={booking.owner?.firstName || 'O'} size="lg" />
              <div>
                <div className="font-bold text-[#0B1221] dark:text-white text-lg">
                  {booking.owner?.firstName} {booking.owner?.lastName}
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-bold text-[#0B1221] dark:text-white">4.9</span>
                  <span>(128 trips)</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Phone className="w-4 h-4" /> {isVi ? 'Gọi' : 'Call'}
              </button>
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Mail className="w-4 h-4" /> {isVi ? 'Nhắn' : 'Message'}
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white dark:bg-[#131F35] rounded-2xl p-6 border border-slate-200 dark:border-[#1E2D45] shadow-sm">
            <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-6">
              {isVi ? 'Thanh Toán' : 'Payment Summary'}
            </div>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {formatCurrency(booking.pricing.pricePerDay)} × {booking.totalDays} {isVi ? 'ngày' : 'days'}
                </span>
                <span className="font-semibold">{formatCurrency(booking.pricing.basePrice)}</span>
              </div>
              {booking.pricing.insuranceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? 'Bảo hiểm' : 'Insurance'}</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.insuranceFee)}</span>
                </div>
              )}
              {booking.pricing.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? 'Phí giao xe' : 'Delivery Fee'}</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.deliveryFee)}</span>
                </div>
              )}
              {booking.pricing.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? 'Phí dịch vụ' : 'Service Fee'}</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.serviceFee)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-[#0B1221] dark:text-white">{isVi ? 'Tổng thanh toán' : 'Total Paid'}</span>
              <span className="text-xl font-bold text-[#D4AF37]">{formatCurrency(booking.pricing.total)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-[#0B1221] dark:text-white mb-1">
                  {isVi ? 'Tiền cọc an toàn' : 'Deposit Secured'}
                </div>
                <div className="text-xs text-slate-500">
                  {formatCurrency(booking.pricing.deposit)} {isVi ? 'tiền cọc sẽ được hoàn lại sau chuyến đi.' : 'refundable deposit will be returned after trip.'}
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Download className="w-4 h-4" /> {isVi ? 'Tải biên lai' : 'Download Receipt'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
