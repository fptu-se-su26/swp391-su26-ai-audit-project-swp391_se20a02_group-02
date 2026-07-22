import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Clock, Check, ChevronLeft, Info, AlertTriangle, ShieldCheck, Download, ExternalLink, QrCode } from 'lucide-react';
import { bookingService, paymentService } from '@/services/bookingService';
import { contractService } from '@/services/contractService';
import type { Booking } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, resolveImageUrl } from '@/utils';

const BookingPaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentSetting, setPaymentSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [payosProcessing, setPayosProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes default
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const selectedMethod = searchParams.get('method') === 'bank_transfer' ? 'bank_transfer' : 'payos';

  // Load booking and payment credentials
  useEffect(() => {
    if (!bookingId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [bookingData, settingsData] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getPaymentSettings()
        ]);

        if (bookingData) {
          const status = String(bookingData.status || '').toLowerCase();
          if (status === 'waiting_payment') {
            const contract = await contractService.getByBooking(bookingId);
            if (!contract?.renterSignedAt) {
              toast.warning(
                isVi ? 'Can ky hop dong dien tu' : 'Digital contract required',
                isVi ? 'Vui long ky hop dong truoc khi thanh toan.' : 'Please sign the rental contract before payment.'
              );
              navigate(`/booking/${bookingId}/contract?method=${selectedMethod}`);
              return;
            }
          }

          setBooking(bookingData);

          // Calculate initial countdown based on booking's createdAt time
          const createdTime = new Date(bookingData.createdAt || Date.now()).getTime();
          const endTime = createdTime + 15 * 60 * 1000;
          const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          setCountdown(remainingSeconds);
        } else {
          toast.error(isVi ? 'Không tìm thấy đặt xe' : 'Booking Not Found');
        }

        if (settingsData && settingsData.data) {
          setPaymentSetting(settingsData.data);
        }
      } catch (err: any) {
        console.error('Error loading checkout page data:', err);
        toast.error(isVi ? 'Lỗi kết nối máy chủ' : 'Server Connection Error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId, isVi, selectedMethod]);

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

  const handleConfirmTransfer = async () => {
    if (!booking) return;

    setConfirming(true);
    try {
      const updated = await bookingService.confirmTransfer(booking.id);
      if (updated) {
        toast.success(
          isVi ? 'Đã xác nhận chuyển khoản' : 'Transfer Submitted',
          isVi ? 'Đang chờ Admin duyệt giao dịch của bạn.' : 'Awaiting manual Admin verification.'
        );
        setBooking({ ...booking, ...updated, status: String(updated.status || 'payment_pending').toLowerCase() });
      } else {
        toast.error(isVi ? 'Xác nhận thất bại' : 'Verification Submission Failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        isVi ? 'Lỗi xác nhận' : 'Confirmation Error',
        err.message || (isVi ? 'Có lỗi xảy ra khi xác nhận thanh toán.' : 'Failed to submit payment confirmation.')
      );
    } finally {
      setConfirming(false);
    }
  };

  const handlePayOSCheckout = async () => {
    if (!booking) return;

    setPayosProcessing(true);
    try {
      const amount = booking.pricing?.total || 0;
      if (amount <= 0) {
        toast.error(
          isVi ? 'Số tiền không hợp lệ' : 'Invalid payment amount',
          isVi ? 'Không thể tạo giao dịch PayOS với số tiền bằng 0.' : 'Cannot create a PayOS payment with a zero amount.'
        );
        return;
      }

      const result = await paymentService.processPayment(
        booking.id,
        'payos',
        amount,
        `${window.location.origin}/payment/payos/return`
      );

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      toast.error(
        isVi ? 'Không tạo được thanh toán PayOS' : 'PayOS checkout failed',
        result.errorMessage || (isVi ? 'Vui lòng thử lại hoặc chọn chuyển khoản ngân hàng.' : 'Please try again or use bank transfer.')
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        isVi ? 'Lỗi PayOS' : 'PayOS Error',
        err?.message || (isVi ? 'Không thể khởi tạo cổng PayOS.' : 'Unable to initialize PayOS checkout.')
      );
    } finally {
      setPayosProcessing(false);
    }
  };

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

  const status = String(booking.status || '').toLowerCase();
  const isExpired = countdown <= 0 || status === 'payment_expired';
  const isPendingApproval = status === 'payment_pending';
  const isConfirmed = status === 'confirmed' || status === 'payment_verified' || status === 'owner_approved';

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
                  <span className="font-bold text-foreground">{formatCurrency(booking.pricing?.basePrice || 0, language)}</span>
                </div>
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{isVi ? 'Khuyến mãi' : 'Discount'}</span>
                    <span className="font-bold">-{formatCurrency(booking.pricing.discount, language)}</span>
                  </div>
                )}
                {booking.includeInsurance && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Bảo hiểm chuyến đi' : 'Insurance'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.insuranceFee || 0, language)}</span>
                  </div>
                )}
                {booking.includeDelivery && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Phí giao xe' : 'Delivery Fee'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.deliveryFee || 0, language)}</span>
                  </div>
                )}
                {booking.pricing?.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Phí dịch vụ' : 'Service Fee'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.serviceFee, language)}</span>
                  </div>
                )}
                {booking.pricing?.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>{isVi ? 'Thuế VAT' : 'VAT & Taxes'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.taxes, language)}</span>
                  </div>
                )}
                {booking.pricing?.deposit > 0 && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/55 dark:border-white/5 text-amber-600 dark:text-amber-500">
                    <span>{isVi ? 'Tiền đặt cọc thế chấp' : 'Security Deposit'}</span>
                    <span className="font-bold">{formatCurrency(booking.pricing.deposit, language)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-black pt-3 border-t border-dashed border-border text-foreground">
                  <span>{isVi ? 'TỔNG THANH TOÁN' : 'TOTAL PAYMENT'}</span>
                  <span className="text-blue-500 font-display font-black text-base">{formatCurrency(amountToPay, language)}</span>
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

            {selectedMethod === 'payos' && !isExpired && !isPendingApproval && !isConfirmed && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">PayOS Online Checkout</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isVi ? 'Thanh toán qua cổng PayOS sau khi hợp đồng đã được ký.' : 'Pay through the PayOS gateway after the contract has been signed.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-xs">PayOS</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/10 p-5 text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-bold">
                    {isVi ? 'Sẵn sàng tạo giao dịch PayOS' : 'Ready to create a PayOS payment'}
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    {isVi ? 'Bạn sẽ được chuyển sang trang PayOS để hoàn tất thanh toán, sau đó quay lại LuxeWay để hệ thống xác minh trạng thái.' : 'You will be redirected to PayOS, then returned to LuxeWay for payment verification.'}
                  </p>
                </div>

                <button
                  onClick={handlePayOSCheckout}
                  disabled={payosProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {payosProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isVi ? 'ĐANG TẠO LINK PAYOS...' : 'CREATING PAYOS LINK...'}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      {isVi ? 'THANH TOÁN BẰNG PAYOS' : 'PAY WITH PAYOS'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(`/booking/${booking.id}/payment?method=bank_transfer`)}
                  className="w-full py-3 rounded-2xl border border-border text-xs font-black uppercase tracking-wider text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {isVi ? 'Dùng chuyển khoản ngân hàng thay thế' : 'Use bank transfer instead'}
                </button>
              </div>
            )}

            {/* main bank transfer module */}
            {selectedMethod === 'bank_transfer' && !isExpired && !isPendingApproval && !isConfirmed && (
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
                          <span className="font-black text-sm text-blue-500">{formatCurrency(amountToPay, language)}</span>
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

                {/* Confirm Submission Action */}
                <button
                  onClick={handleConfirmTransfer}
                  disabled={confirming}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isVi ? 'ĐANG GỬI XÁC NHẬN...' : 'SUBMITTING CONFIRMATION...'}
                    </>
                  ) : (
                    <>
                      {isVi ? 'TÔI ĐÃ CHUYỂN KHOẢN' : 'I HAVE TRANSFERRED'}
                    </>
                  )}
                </button>

              </div>
            )}

            {/* Navigation back and details */}
            {(isExpired || isPendingApproval || isConfirmed) && (
              <div className="bg-card border border-border p-6 rounded-3xl shadow-md text-center">
                {isConfirmed && (
                  <button
                    onClick={() => navigate(`/booking/${booking.id}/contract`)}
                    className="btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2 mr-0 sm:mr-3 mb-3 sm:mb-0"
                  >
                    Open Digital Contract
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/dashboard/bookings`)} 
                  className={isConfirmed ? "py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2 border border-border text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors" : "btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2"}
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
