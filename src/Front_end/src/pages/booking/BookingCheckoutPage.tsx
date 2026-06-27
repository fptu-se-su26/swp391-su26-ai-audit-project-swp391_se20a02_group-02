import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Shield, CreditCard, Loader2, ArrowRight, CheckCircle, Tag, MapPin, Sparkles, Star } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import type { Vehicle } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, resolveImageUrl } from '@/utils';

const BookingCheckoutPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  
  // Checkout options initialized from query parameters
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [includeInsurance, setIncludeInsurance] = useState(searchParams.get('insurance') === 'true');
  const [includeDelivery, setIncludeDelivery] = useState(searchParams.get('delivery') === 'true');
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;
    
    setLoading(true);
    vehicleService.getVehicleDetail(vehicleId)
      .then(data => {
        if (data) {
          setVehicle(data);
        } else {
          toast.error('Error', isVi ? 'Không lấy được thông tin xe.' : 'Failed to fetch vehicle details.');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error', isVi ? 'Lỗi kết nối máy chủ.' : 'Failed to connect to backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vehicleId, isVi]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{isVi ? 'Đang chuẩn bị thông tin thanh toán...' : 'Preparing checkout details...'}</p>
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
          <p className="text-slate-500 mb-6">{isVi ? 'Vui lòng chọn xe hợp lệ từ marketplace.' : 'Please select a valid vehicle from the marketplace.'}</p>
          <button onClick={() => navigate('/marketplace')} className="w-full btn-primary py-3 rounded-xl font-bold">
            {isVi ? 'Về Marketplace' : 'Back to Marketplace'}
          </button>
        </div>
      </div>
    );
  }

  // Duration calculations
  const days = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (days === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Ngày thuê không hợp lệ' : 'Invalid Date Range'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Vui lòng chọn ngày nhận và trả xe hợp lệ trước.' : 'Please select valid pick-up and return dates first.'}</p>
          <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="w-full btn-primary py-3 rounded-xl font-bold">
            {isVi ? 'Quay lại chọn ngày' : 'Go back and select dates'}
          </button>
        </div>
      </div>
    );
  }

  // Pricing calculations
  const discountPercent = vehicle.discount ? Number(vehicle.discount) : 0;
  const rawBase = Number(vehicle.pricePerDay) * days;
  const discountAmt = Math.round(rawBase * (discountPercent / 100));
  const basePriceAfterDiscount = rawBase - discountAmt;
  const insuranceFee = includeInsurance ? Math.round(Number(vehicle.pricePerDay) * 0.15 * days) : 0;
  const deliveryFee = includeDelivery ? (Number(vehicle.deliveryFee) || 0) : 0;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.12);
  const taxes = Math.round(basePriceAfterDiscount * 0.08);
  const totalCost = basePriceAfterDiscount + insuranceFee + deliveryFee + serviceFee + taxes;
  const deposit = Number(vehicle.deposit) || 0;

  // Handle final booking submission
  const handleSubmitBooking = async () => {
    if (includeDelivery && !deliveryAddress.trim()) {
      toast.warning(isVi ? 'Địa chỉ giao xe' : 'Delivery Address Required', isVi ? 'Vui lòng nhập địa chỉ nhận xe.' : 'Please enter the delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      // Mock structure matching BookingWizardState for bookingService.create method
      const wizardState: any = {
        vehicleId: vehicle.id,
        step: 3,
        startDate,
        endDate,
        includeInsurance,
        includeDelivery,
        deliveryAddress: includeDelivery ? deliveryAddress : '',
        pickupLocation: vehicle.location?.address || '',
        notes,
        couponCode: '',
        selectedAddons: [],
        paymentMethodId: '',
      };

      const booking = await bookingService.create(
        wizardState,
        user?.id || '',
        vehicle.vehicleType === 'motorbike' ? 'motorbike' : 'car'
      );

      if (booking && booking.id) {
        toast.success(isVi ? 'Đặt xe thành công' : 'Booking Created', isVi ? 'Yêu cầu thuê xe của bạn đã được gửi thành công.' : 'Your booking request has been submitted successfully.');
        navigate('/success');
      } else {
        toast.error(isVi ? 'Đặt xe thất bại' : 'Submission failed', isVi ? 'Không khởi tạo được lịch trình.' : 'Failed to initialize booking.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(isVi ? 'Lỗi tạo lịch trình' : 'Submission Error', err.message || err.error || (isVi ? 'Có lỗi xảy ra khi gửi yêu cầu đặt xe.' : 'An error occurred while creating your booking.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-3xl font-display font-black text-foreground uppercase tracking-tight mb-8">
          {isVi ? 'Thông Tin Đặt Xe' : 'Booking Checkout'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: Checkout Info Fields (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Vehicle Summary Box */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-24 h-16 rounded-2xl overflow-hidden border border-border bg-slate-100 flex-shrink-0">
                <img src={resolveImageUrl(vehicle.thumbnailUrl || vehicle.images?.[0])} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-foreground uppercase">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-xs text-slate-400 capitalize">
                  {vehicle.specs?.transmission} · {vehicle.seatNumber} {isVi ? 'chỗ' : 'seats'} · {vehicle.specs?.fuelType}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-foreground">{vehicle.rating?.toFixed(1)}</span>
                  <span>({vehicle.totalReviews} {isVi ? 'đánh giá' : 'reviews'})</span>
                </div>
              </div>
            </div>

            {/* Selected Booking Info */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-2.5">{isVi ? 'Lịch trình thuê xe' : 'Rental Duration'}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{isVi ? 'NHẬN XE' : 'PICK-UP'}</p>
                  <p className="font-bold text-foreground">{startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{isVi ? 'TRẢ XE' : 'RETURN'}</p>
                  <p className="font-bold text-foreground">{endDate}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500">
                  {isVi ? 'Thời gian thuê:' : 'Total Duration:'} <span className="font-bold text-foreground">{days} {isVi ? 'ngày' : 'days'}</span>
                </p>
              </div>
            </div>

            {/* Delivery address (if selected) */}
            {includeDelivery && (
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {isVi ? 'Địa chỉ giao xe tận nơi' : 'Delivery Address'}
                </h3>
                <input 
                  type="text" 
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isVi ? 'Nhập địa chỉ giao xe chi tiết...' : 'Enter your specific address for delivery...'}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3.5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">{isVi ? 'Ghi chú cho chủ xe (Tùy chọn)' : 'Notes for Host (Optional)'}</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isVi ? 'Lời nhắn, yêu cầu giao xe hoặc lưu ý khi sử dụng xe...' : 'Instructions, pick-up details or notes when driving...'}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3.5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>

          </div>

          {/* RIGHT: Price breakdown & Submit Widget (1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg space-y-5">
              
              <h3 className="text-base font-bold text-foreground pb-2 border-b border-border">{isVi ? 'Chi tiết bảng giá' : 'Price Breakdown'}</h3>
              
              <div className="text-xs space-y-3.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{isVi ? 'Giá thuê xe' : 'Vehicle Rent'}</span>
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
                    <span className="text-slate-400">{isVi ? 'Phí bảo hiểm' : 'Insurance'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(insuranceFee, language)}</span>
                  </div>
                )}
                {includeDelivery && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Phí giao xe' : 'Delivery fee'}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(deliveryFee, language)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{isVi ? 'Phí nền tảng' : 'Service fee'} (12%)</span>
                  <span className="font-bold text-foreground">+{formatCurrency(serviceFee, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isVi ? 'Thuế VAT' : 'Taxes & VAT'} (8%)</span>
                  <span className="font-bold text-foreground">+{formatCurrency(taxes, language)}</span>
                </div>

                {deposit > 0 && (
                  <div className="flex justify-between pt-2 text-amber-600">
                    <span>{isVi ? 'Tiền đặt cọc thế chấp' : 'Security Deposit'}</span>
                    <span className="font-bold">{formatCurrency(deposit, language)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold pt-3 border-t border-dashed border-border">
                  <span className="text-foreground">{isVi ? 'TỔNG CỘNG' : 'TOTAL PRICE'}</span>
                  <span className="text-blue-500 font-display font-black">{formatCurrency(totalCost, language)}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isVi ? 'ĐANG GỬI YÊU CẦU...' : 'SUBMITTING REQUEST...'}
                  </>
                ) : (
                  <>
                    {isVi ? 'XÁC NHẬN ĐẶT XE' : 'CONFIRM & BOOK'}
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-450 leading-normal text-center pt-2">
                {isVi 
                  ? 'Bằng việc nhấp vào đặt xe, bạn đồng ý với Điều khoản Dịch vụ và Chính sách hủy chuyến của LuxeWay.' 
                  : 'By confirming this request, you agree to LuxeWay Terms of Service and Cancellation Policies.'}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingCheckoutPage;
