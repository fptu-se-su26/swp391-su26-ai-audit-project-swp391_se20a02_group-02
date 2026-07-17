import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Clock, Check, ChevronLeft, Info, AlertTriangle, ShieldCheck, Download, ExternalLink, QrCode } from 'lucide-react';
import { bookingService, paymentService } from '@/services/bookingService';
import type { Booking } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, resolveImageUrl } from '@/utils';

const BookingPaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentSetting, setPaymentSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes default
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isExpired = countdown <= 0 || booking?.status === 'payment_expired';
  const isPendingApproval = booking?.status === 'payment_pending';
  const isConfirmed = booking?.status === 'confirmed' || booking?.status === 'payment_verified' || booking?.status === 'owner_approved';

  // Load booking and payment credentials
  useEffect(() => {
    if (!bookingId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        let bookingData = null;
        try {
          bookingData = await bookingService.getById(bookingId);
        } catch (err) {
          console.error('Error fetching booking detail:', err);
        }

        if (bookingData) {
          // If booking is already confirmed, redirect to success page immediately
          const isConf = bookingData.status === 'confirmed' || 
                         bookingData.status === 'payment_verified' || 
                         bookingData.status === 'owner_approved';
          if (isConf) {
            navigate('/success');
            return;
          }

          setBooking(bookingData);

          // Calculate initial countdown based on booking's createdAt time
          const createdTime = new Date(bookingData.createdAt || Date.now()).getTime();
          const endTime = createdTime + 15 * 60 * 1000;
          const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          setCountdown(remainingSeconds);

          // Auto-confirm transfer (transition to pending approval) on load
          if (bookingData.status === 'waiting_payment') {
            try {
              const updated = await bookingService.confirmTransfer(bookingData.id);
              if (updated) {
                setBooking(updated);
              }
            } catch (err) {
              console.error('Error auto-confirming transfer:', err);
            }
          }
        } else {
          toast.error(isVi ? 'Không tìm thấy đặt xe' : 'Booking Not Found');
        }

        try {
          const settingsData = await paymentService.getPaymentSettings();
          if (settingsData && settingsData.data) {
            setPaymentSetting(settingsData.data);
          }
        } catch (err) {
          console.error('Error loading payment settings:', err);
        }
      } catch (err: any) {
        console.error('Error loading checkout page data:', err);
        toast.error(isVi ? 'Lỗi kết nối máy chủ' : 'Server Connection Error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId, isVi, navigate]);

  // Live timer countdown logic
  useEffect(() => {
    if (loading || !booking || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Refresh booking status to check if expired
          bookingService.getById(bookingId!).then(b => {
            if (b) setBooking(b);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, booking, countdown, bookingId]);

  // Formatter for countdown mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(isVi ? 'Đã sao chép' : 'Copied', isVi ? `Sao chép ${fieldName} thành công` : `${fieldName} copied`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Poll booking status when it's not confirmed or expired
  useEffect(() => {
    if (!bookingId || loading || !booking || isConfirmed || isExpired) return;

    const interval = setInterval(async () => {
      try {
        const updatedBooking = await bookingService.getById(bookingId);
        if (updatedBooking) {
          if (updatedBooking.status !== booking.status) {
            setBooking(updatedBooking);
            
            const isNowConfirmed = updatedBooking.status === 'confirmed' || 
                                   updatedBooking.status === 'payment_verified' || 
                                   updatedBooking.status === 'owner_approved';
            if (isNowConfirmed) {
              clearInterval(interval);
              toast.success(
                isVi ? 'Thanh toán thành công!' : 'Payment successful!',
                isVi ? 'Đơn đặt xe của bạn đã được xác nhận.' : 'Your booking has been confirmed.'
              );
              navigate('/success');
            }
          }
        }
      } catch (err) {
        console.error('Error polling booking status:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [bookingId, loading, booking, isConfirmed, isExpired, isVi, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">{isVi ? 'Đang tải cổng thanh toán...' : 'Initializing payment gateway...'}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Không tìm thấy đặt xe' : 'Booking Not Found'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Vui lòng truy cập lại từ danh sách đặt xe.' : 'Please access this page from your booking list.'}</p>
          <button onClick={() => navigate('/dashboard/bookings')} className="w-full btn-primary py-3 rounded-xl font-bold">
            {isVi ? 'Về lịch trình của tôi' : 'My Bookings'}
          </button>
        </div>
      </div>
    );
  }

  // Generate VietQR dynamic image URL
  const bankName = paymentSetting?.bankName || 'MB';
  const accountNumber = paymentSetting?.accountNumber || '0377096245';
  const ownerName = paymentSetting?.ownerName || 'NGUYEN VAN DANG';
  const transferMemo = booking.bookingCode || 'LXW-CODE';
  const amountToPay = booking.pricing?.total || 0;

  const vietQrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.png?amount=${amountToPay}&addInfo=${transferMemo}&accountName=${encodeURIComponent(ownerName)}`;

  // Status computed variables are declared at the top of the component

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Navigation header */}
        <button 
          onClick={() => navigate('/dashboard/bookings')} 
          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-foreground transition-colors mb-6 uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          {isVi ? 'Quay lại danh sách' : 'Back to Bookings'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: Summary & Checkout Details (1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-lg space-y-5">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-3 uppercase tracking-tight">
                {isVi ? 'Tóm tắt đơn đặt xe' : 'Booking Summary'}
              </h3>

              {/* Vehicle card */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden border border-border bg-slate-100 flex-shrink-0">
                  <img src={resolveImageUrl(booking.vehicle?.thumbnailUrl)} alt={booking.vehicle?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground uppercase">{booking.vehicle?.brand} {booking.vehicle?.name}</h4>
                  <p className="text-[10px] text-slate-400 capitalize">{booking.vehicle?.category}</p>
                </div>
              </div>

              {/* Booking metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{isVi ? 'NHẬN XE' : 'PICK-UP'}</p>
                  <p className="font-bold text-foreground">{booking.startDate?.toString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{isVi ? 'TRẢ XE' : 'RETURN'}</p>
                  <p className="font-bold text-foreground">{booking.endDate?.toString()}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-white/5 flex justify-between">
                  <span className="text-slate-400">{isVi ? 'Mã đặt xe:' : 'Booking Code:'}</span>
                  <span className="font-black text-amber-500">{booking.bookingCode}</span>
                </div>
              </div>

              {/* Price Breakdown Details */}
              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{isVi ? 'Giá thuê xe' : 'Rental Rate'}</span>
                  <span className="font-bold text-foreground">{formatCurrency(booking.pricing?.basePrice || 0)}</span>
                </div>
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{isVi ? 'Khuyến mãi' : 'Discount'}</span>
                    <span className="font-bold">-{formatCurrency(booking.pricing.discount)}</span>
                  </div>
                )}
                {booking.includeInsurance && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Bảo hiểm chuyến đi' : 'Insurance'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.insuranceFee || 0)}</span>
                  </div>
                )}
                {booking.includeDelivery && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Phí giao xe' : 'Delivery Fee'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.deliveryFee || 0)}</span>
                  </div>
                )}
                {booking.pricing?.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Phí dịch vụ' : 'Service Fee'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.serviceFee)}</span>
                  </div>
                )}
                {booking.pricing?.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Thuế VAT' : 'VAT & Taxes'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.taxes)}</span>
                  </div>
                )}
                {booking.pricing?.deposit > 0 && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/55 dark:border-white/5 text-amber-600 dark:text-amber-500">
                    <span>{isVi ? 'Tiền đặt cọc thế chấp' : 'Security Deposit'}</span>
                    <span className="font-bold">{formatCurrency(booking.pricing.deposit)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-black pt-3 border-t border-dashed border-border text-foreground">
                  <span>{isVi ? 'TỔNG THANH TOÁN' : 'TOTAL PAYMENT'}</span>
                  <span className="text-blue-500 font-display font-black text-base">{formatCurrency(amountToPay)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: Dynamic VietQR and Action (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Warning Banner */}
            {isExpired && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-3xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">{isVi ? 'Đơn đặt xe đã hết hạn' : 'Booking Payment Expired'}</h4>
                  <p className="text-xs text-red-400 mt-1">
                    {isVi 
                      ? 'Lịch trình này đã vượt quá thời gian thanh toán 15 phút. Xe đã được giải phóng để người khác thuê. Vui lòng tạo đơn đặt xe mới.' 
                      : 'This booking has exceeded the 15-minute payment window. The vehicle availability has been released. Please create a new booking request.'}
                  </p>
                </div>
              </div>
            )}

            {isPendingApproval && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-5 rounded-3xl flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">{isVi ? 'Đang chờ duyệt thanh toán' : 'Payment Awaiting Verification'}</h4>
                  <p className="text-xs text-amber-500/80 mt-1">
                    {isVi 
                      ? 'Hệ thống đã ghi nhận yêu cầu của bạn. Quá trình kiểm tra ngân hàng thường mất 5 - 10 phút. Bạn có thể rời trang này, chúng tôi sẽ thông báo qua email khi hoàn tất.' 
                      : 'We have received your payment confirmation. Manual verification typically takes 5 - 10 minutes. You will receive an email confirmation once completed.'}
                  </p>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-5 rounded-3xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">{isVi ? 'Đặt xe đã xác nhận thành công!' : 'Booking Confirmed!'}</h4>
                  <p className="text-xs text-green-400 mt-1">
                    {isVi 
                      ? 'Thanh toán của bạn đã được xác nhận. Chuyến đi của bạn đã sẵn sàng. Bạn có thể tải hóa đơn PDF trong phần chi tiết lịch trình.' 
                      : 'Your payment is verified and booking is officially confirmed. You can now download the PDF receipt inside your dashboard.'}
                  </p>
                </div>
              </div>
            )}

            {/* main bank transfer module */}
            {!isExpired && !isConfirmed && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                
                {/* Timer Countdown Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{isVi ? 'Thanh Toán Chuyển Khoản' : 'Bank Transfer Checkout'}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{isVi ? 'Quét mã VietQR hoặc chuyển khoản thủ công' : 'Scan VietQR or transfer manually'}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-mono font-bold text-sm">{formatTime(countdown)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* VietQR Display */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-white p-4 rounded-3xl border border-border shadow-sm max-w-[240px] w-full aspect-square flex items-center justify-center relative group">
                      <img src={vietQrUrl} alt="VietQR Pay Code" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5" /> VietQR Auto
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center max-w-[200px] leading-relaxed">
                      {isVi ? 'Quét QR bằng ứng dụng ngân hàng (Mobile Banking) để điền tự động' : 'Scan with banking app for auto-fill details'}
                    </span>
                  </div>

                  {/* Manual Account Details */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                      
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{isVi ? 'Tên ngân hàng' : 'Bank Name'}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground uppercase">{bankName}</span>
                          <button onClick={() => handleCopyToClipboard(bankName, isVi ? 'Tên ngân hàng' : 'Bank Name')} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === (isVi ? 'Tên ngân hàng' : 'Bank Name') ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{isVi ? 'Số tài khoản' : 'Account Number'}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground">{accountNumber}</span>
                          <button onClick={() => handleCopyToClipboard(accountNumber, isVi ? 'Số tài khoản' : 'Account Number')} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === (isVi ? 'Số tài khoản' : 'Account Number') ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{isVi ? 'Chủ tài khoản' : 'Account Holder'}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground uppercase">{ownerName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{isVi ? 'Số tiền' : 'Amount'}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-blue-500">{formatCurrency(amountToPay)}</span>
                          <button onClick={() => handleCopyToClipboard(amountToPay.toString(), isVi ? 'Số tiền' : 'Amount')} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === (isVi ? 'Số tiền' : 'Amount') ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                          {isVi ? 'Nội dung chuyển khoản (Bắt buộc ghi đúng)' : 'Transfer Message (Must be exact)'}
                        </span>
                        <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                          <span className="font-mono font-black text-amber-500 text-sm tracking-wider">{transferMemo}</span>
                          <button onClick={() => handleCopyToClipboard(transferMemo, isVi ? 'Nội dung chuyển khoản' : 'Transfer Message')} className="text-amber-500 hover:text-amber-600 transition-colors p-1">
                            {copiedField === (isVi ? 'Nội dung chuyển khoản' : 'Transfer Message') ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Important Advisory */}
                <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-blue-600 dark:text-blue-400 leading-normal">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    {isVi 
                      ? 'Lưu ý: Quý khách phải điền CHÍNH XÁC nội dung chuyển khoản ở trên để hệ thống tự động nhận diện giao dịch. Giao dịch sai nội dung có thể mất nhiều thời gian để đối soát thủ công.' 
                      : 'Attention: You MUST supply the EXACT transfer message above. Incorrect message will delay verification as it requires manual host reconciliation.'}
                  </p>
                </div>

                {/* Automatic checking status indicator */}
                <div className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3">
                  <div className="w-4.5 h-4.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                    {isVi ? 'HỆ THỐNG ĐANG TỰ ĐỘNG KIỂM TRA TRẠNG THÁI THANH TOÁN...' : 'AUTOMATICALLY CHECKING PAYMENT STATUS...'}
                  </span>
                </div>

              </div>
            )}

            {/* Navigation back and details */}
            {(isExpired || isPendingApproval || isConfirmed) && (
              <div className="bg-card border border-border p-6 rounded-3xl shadow-md text-center">
                <button 
                  onClick={() => navigate(`/dashboard/bookings`)} 
                  className="btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2"
                >
                  {isVi ? 'Quản lý lịch trình thuê xe' : 'Go to My Bookings'}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingPaymentPage;
