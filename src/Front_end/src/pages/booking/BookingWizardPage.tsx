import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Shield, CreditCard, CheckCircle, ChevronRight,
  ChevronLeft, Car, MapPin, Clock, Tag, Loader2, ArrowRight,
  Zap, Users, Lock, Star, Package, Truck, X
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { bookingService, paymentService } from '@/services/bookingService';
import type { Vehicle } from '@/types';
import { useAuthStore, useBookingWizardStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, calculateDays } from '@/utils';
import { fadeUp, staggerContainer, staggerItem, scaleIn } from '@/animations/variants';
import { useT } from '@/i18n/translations';

// ====== STEP INDICATOR ======
const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const t = useT();
  const localizedSteps = [
    { id: 1, label: t.booking.selectDates, icon: Calendar },
    { id: 2, label: t.booking.extras, icon: Package },
    { id: 3, label: t.booking.review, icon: CheckCircle },
    { id: 4, label: t.booking.payment, icon: CreditCard },
    { id: 5, label: t.booking.confirm, icon: CheckCircle },
  ];

  return (
    <div className="flex items-center justify-between mb-10">
      {localizedSteps.map((step, i) => {
        const isCompleted = current > step.id;
        const isActive = current === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: isCompleted ? '#22C55E' : isActive ? '#0F172A' : '#E2E8F0',
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
              </motion.div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${isActive ? 'text-[#0F172A]' : isCompleted ? 'text-success' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {i < localizedSteps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <motion.div
                  animate={{ scaleX: current > step.id ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-success origin-left rounded-full"
                  style={{ width: '100%' }}
                />
                <div className="h-full bg-slate-200 rounded-full -mt-0.5" style={{ width: '100%', transform: 'scaleX(1)' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ====== PRICE SUMMARY SIDEBAR ======
const PriceSummary: React.FC<{ vehicle: Vehicle; startDate: string; endDate: string; extras: { insurance: boolean; delivery: boolean; addons: string[] }; couponDiscount: number }> = ({
  vehicle, startDate, endDate, extras, couponDiscount
}) => {
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const days = startDate && endDate ? calculateDays(startDate, endDate) : 1;
  const base = vehicle.pricePerDay * days;
  const insuranceFee = extras.insurance ? days * 45 : 0;
  const deliveryFee = extras.delivery ? vehicle.deliveryFee : 0;
  const serviceFee = Math.round(base * 0.12);
  const taxes = Math.round(base * 0.08);
  const subtotal = base + insuranceFee + deliveryFee + serviceFee + taxes;
  const total = subtotal - couponDiscount;

  return (
    <div className="luxury-card p-5 sticky top-28">
      <div className="relative h-32 rounded-2xl overflow-hidden mb-4">
        <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-semibold text-sm">{vehicle.name}</p>
          <p className="text-white/70 text-xs">{vehicle.location.city}</p>
        </div>
      </div>

      {startDate && endDate && (
        <div className="flex gap-2 mb-4 p-3 bg-slate-50 rounded-2xl text-xs">
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">{t.booking.pickUp}</p>
            <p className="font-semibold text-[#0F172A]">{formatDate(startDate, 'short')}</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">{t.booking.return}</p>
            <p className="font-semibold text-[#0F172A]">{formatDate(endDate, 'short')}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-slate-500">{formatCurrency(vehicle.pricePerDay)} × {days} {t.booking.totalDays}{days > 1 && !isVi ? 's' : ''}</span>
          <span className="font-medium">{formatCurrency(base)}</span>
        </div>
        {extras.insurance && (
          <div className="flex justify-between text-green-600">
            <span>{isVi ? 'Bảo hiểm Premium' : 'Insurance'}</span>
            <span>{formatCurrency(insuranceFee)}</span>
          </div>
        )}
        {extras.delivery && (
          <div className="flex justify-between text-blue-600">
            <span>{isVi ? 'Giao xe tận nơi' : 'Delivery'}</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">{t.booking.serviceFee}</span>
          <span className="font-medium">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{t.booking.taxes}</span>
          <span className="font-medium">{formatCurrency(taxes)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-success">
            <span>{isVi ? 'Mã giảm giá' : 'Coupon Discount'}</span>
            <span>−{formatCurrency(couponDiscount)}</span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-[#0F172A] text-base">
          <span>{t.booking.total}</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-slate-400 text-center">+ {formatCurrency(vehicle.deposit)} {t.booking.deposit}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-center">
        <Lock className="w-3.5 h-3.5 text-success" />
        {isVi ? 'Bảo mật bởi Stripe · SSL 256-bit' : 'Secured by Stripe · 256-bit SSL'}
      </div>
    </div>
  );
};

// ====== MAIN BOOKING WIZARD ======
const BookingWizardPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();
  const wizard = useBookingWizardStore();
  const t = useT();
  const isVi = t.common.loading.includes('Đang');

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('123');

  useEffect(() => {
    if (!vehicleId) return;
    vehicleService.getById(vehicleId).then(v => {
      setVehicle(v);
      setLoading(false);
      wizard.initWizard(vehicleId);

      // Pre-fill dates from URL params
      const start = searchParams.get('start');
      const end = searchParams.get('end');
      if (start && end) wizard.setDates(start, end);
    });
  }, [vehicleId]);

  const canProceed = () => {
    switch (wizard.step) {
      case 1: return !!wizard.startDate && !!wizard.endDate && wizard.startDate < wizard.endDate;
      case 2: return true;
      case 3: return true;
      case 4: {
        if (!vehicle) return false;
        if (!paymentMethod) return false;
        if (paymentMethod === 'wallet') {
          const basePrice = vehicle.pricePerDay * days;
          const insuranceFee = wizard.includeInsurance ? days * 45 : 0;
          const deliveryFee = wizard.includeDelivery ? vehicle.deliveryFee : 0;
          const serviceFee = Math.round(basePrice * 0.12);
          const taxes = Math.round(basePrice * 0.08);
          const subtotal = basePrice + insuranceFee + deliveryFee + serviceFee + taxes;
          const totalCost = subtotal - wizard.discount;
          if ((user?.walletBalance || 0) < totalCost) return false;
        }
        return true;
      }
      default: return true;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.warning(isVi ? 'Thiếu thông tin' : 'Missing information', isVi ? 'Vui lòng hoàn thành tất cả các trường bắt buộc' : 'Please complete all required fields');
      return;
    }

    if (wizard.step === 4) {
      // Process payment + create booking
      setProcessing(true);
      try {
        const wizardState = wizard.toWizardState();
        const booking = await bookingService.create(wizardState, user!.id);
        const returnUrl = window.location.origin + '/payment/vnpay/return';
        const paymentResult = await paymentService.processPayment(booking.id, paymentMethod, booking.pricing.total, returnUrl);

        if (paymentResult.success) {
          if (paymentResult.paymentUrl) {
            // Redirect to VNPay sandbox
            window.location.href = paymentResult.paymentUrl;
          } else {
            setBookingId(booking.id);
            wizard.setStep(5);
          }
        } else {
          toast.error(isVi ? 'Thanh toán thất bại' : 'Payment failed', isVi ? 'Vui lòng thử phương thức thanh toán khác.' : 'Please try a different payment method.');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || (isVi ? 'Đã xảy ra lỗi. Vui lòng thử lại.' : 'Something went wrong. Please try again.');
        toast.error(isVi ? 'Đặt xe thất bại' : 'Booking failed', msg);
      } finally {
        setProcessing(false);
      }
      return;
    }

    wizard.setStep(wizard.step + 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const days = calculateDays(wizard.startDate, wizard.endDate);
    const total = vehicle ? vehicle.pricePerDay * days : 0;
    const result = await paymentService.applyCoupon(couponInput, total);
    setCouponLoading(false);

    if (result.valid) {
      wizard.setCoupon(couponInput, result.discount);
      toast.success(result.message, isVi ? `Bạn tiết kiệm được ${formatCurrency(result.discount)}` : `You saved ${formatCurrency(result.discount)}`);
    } else {
      setCouponError(result.message);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full" style={{ border: '3px solid #E2E8F0', borderTopColor: '#3B82F6' }} />
      </div>
    );
  }

  const days = wizard.startDate && wizard.endDate ? calculateDays(wizard.startDate, wizard.endDate) : 1;
  const basePrice = vehicle.pricePerDay * days;
  const insuranceFee = wizard.includeInsurance ? days * 45 : 0;
  const deliveryFee = wizard.includeDelivery ? vehicle.deliveryFee : 0;
  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.08);
  const subtotal = basePrice + insuranceFee + deliveryFee + serviceFee + taxes;
  const totalCost = subtotal - wizard.discount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0F172A] mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t.booking.back}
          </button>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">{isVi ? 'Hoàn Tất Đặt Xe' : 'Complete Your Booking'}</h1>
          <p className="text-slate-500 mt-1">{vehicle.name} · {vehicle.location.city}</p>
        </motion.div>

        <StepIndicator current={wizard.step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1 — Dates & Details */}
              {wizard.step === 1 && (
                <motion.div key="step1" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">{t.booking.selectDates}</h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{t.booking.pickUp}</label>
                      <input
                        type="date"
                        value={wizard.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(e.target.value, wizard.endDate)}
                        className="lux-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{t.booking.return}</label>
                      <input
                        type="date"
                        value={wizard.endDate}
                        min={wizard.startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(wizard.startDate, e.target.value)}
                        className="lux-input"
                      />
                    </div>
                  </div>

                  {wizard.startDate && wizard.endDate && wizard.startDate < wizard.endDate && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-2xl text-sm text-blue-700 mb-6">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {isVi ? 'Thời gian thuê:' : 'Rental duration:'} <strong>{days} {t.booking.totalDays}{days > 1 && !isVi ? 's' : ''}</strong>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{isVi ? 'Yêu cầu đặc biệt (tùy chọn)' : 'Special Requests (optional)'}</label>
                    <textarea
                      value={wizard.notes}
                      onChange={e => wizard.setNotes(e.target.value)}
                      rows={3}
                      placeholder={isVi ? 'Nhập yêu cầu đặc biệt hoặc hướng dẫn nhận xe...' : 'Any special requests, pickup instructions, etc.'}
                      className="lux-input resize-none"
                    />
                  </div>

                  {/* Vehicle rules reminder */}
                  {vehicle.rules.length > 0 && (
                    <div className="mt-5 p-4 bg-yellow-50 rounded-2xl">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">{isVi ? 'Quy định thuê xe' : 'Rental Rules'}</p>
                      <ul className="space-y-1">
                        {vehicle.rules.slice(0, 4).map(rule => (
                          <li key={rule} className="flex items-center gap-2 text-xs text-yellow-700">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2 — Extras & Add-ons */}
              {wizard.step === 2 && (
                <motion.div key="step2" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                  {/* Insurance */}
                  <div
                    onClick={() => wizard.setInsurance(!wizard.includeInsurance)}
                    className={`luxury-card p-5 cursor-pointer transition-all duration-200 ${wizard.includeInsurance ? 'ring-2 ring-accent bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wizard.includeInsurance ? 'bg-accent' : 'bg-slate-100'}`}>
                        <Shield className={`w-6 h-6 ${wizard.includeInsurance ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[#0F172A]">{isVi ? 'Bảo hiểm Premium' : 'Premium Insurance'}</h3>
                          <div>
                            <p className="font-bold text-[#0F172A]">{formatCurrency(45)}<span className="text-xs text-slate-400 font-normal">/{t.booking.totalDays}</span></p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{isVi ? 'Bảo vệ toàn diện 5 triệu USD, không tự thương, chống trộm & hư hỏng' : '$5M coverage, zero excess, theft & damage protection'}</p>
                        <div className="flex gap-2 mt-2">
                          {isVi ? (
                            ['Bảo vệ 5M USD', 'Không phí phụ', 'Chống trộm', 'Hỗ trợ 24/7'].map(f => (
                              <span key={f} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{f}</span>
                            ))
                          ) : (
                            ['$5M Coverage', 'Zero Excess', 'Theft Protection', '24/7 Assist'].map(f => (
                              <span key={f} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{f}</span>
                            ))
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${wizard.includeInsurance ? 'border-accent bg-accent' : 'border-slate-300'}`}>
                        {wizard.includeInsurance && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  {vehicle.deliveryAvailable && (
                    <div
                      onClick={() => wizard.setDelivery(!wizard.includeDelivery)}
                      className={`luxury-card p-5 cursor-pointer transition-all duration-200 ${wizard.includeDelivery ? 'ring-2 ring-accent bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wizard.includeDelivery ? 'bg-accent' : 'bg-slate-100'}`}>
                          <Truck className={`w-6 h-6 ${wizard.includeDelivery ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-[#0F172A]">{isVi ? 'Giao xe tận nơi' : 'Door-to-Door Delivery'}</h3>
                            <p className="font-bold text-[#0F172A]">{formatCurrency(vehicle.deliveryFee)}</p>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{isVi ? 'Giao xe đến khách sạn, sân bay hoặc địa chỉ yêu cầu' : 'Vehicle delivered to your hotel, airport, or any address'}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${wizard.includeDelivery ? 'border-accent bg-accent' : 'border-slate-300'}`}>
                          {wizard.includeDelivery && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      {wizard.includeDelivery && (
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4 pl-16">
                          <input
                            type="text"
                            placeholder={isVi ? 'Nhập địa chỉ giao xe...' : 'Enter delivery address...'}
                            className="lux-input text-sm"
                            onClick={e => e.stopPropagation()}
                            onChange={e => wizard.setDelivery(true, e.target.value)}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Vehicle Add-ons */}
                  {vehicle.addons.length > 0 && (
                    <div className="luxury-card p-5">
                      <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">{isVi ? 'Các dịch vụ tùy chọn thêm' : 'Optional Add-ons'}</h3>
                      <div className="space-y-3">
                        {vehicle.addons.map(addon => (
                          <div
                            key={addon.id}
                            onClick={() => wizard.toggleAddon(addon.id)}
                            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${wizard.selectedAddons.includes(addon.id) ? 'border-accent bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            <span className="text-xl">{addon.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#0F172A]">{addon.name}</p>
                              <p className="text-xs text-slate-400">{addon.description}</p>
                            </div>
                            <p className="text-sm font-bold text-[#0F172A]">{formatCurrency(addon.pricePerDay)}/{t.booking.totalDays}</p>
                            <div className={`w-5 h-5 rounded-full border-2 ${wizard.selectedAddons.includes(addon.id) ? 'border-accent bg-accent' : 'border-slate-300'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="luxury-card p-5">
                    <h3 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gold" /> {t.booking.applyCoupon}
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        placeholder="LUXE20, WELCOME15, VIP25..."
                        className="lux-input flex-1"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                        className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isVi ? 'Áp dụng' : 'Apply')}
                      </button>
                    </div>
                    {couponError && <p className="text-danger text-xs mt-1.5">{couponError}</p>}
                    {wizard.couponCode && wizard.discount > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-success text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">{wizard.couponCode}</span> {isVi ? 'đã áp dụng — Bạn tiết kiệm được' : 'applied — You save'} {formatCurrency(wizard.discount)}!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Review */}
              {wizard.step === 3 && (
                <motion.div key="step3" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">{isVi ? 'Xem Lại Đặt Xe' : 'Review Your Booking'}</h2>

                  <div className="space-y-4">
                    {[
                      { label: isVi ? 'Phương tiện' : 'Vehicle', value: vehicle.name },
                      { label: isVi ? 'Ngày nhận xe' : 'Pick-up', value: formatDate(wizard.startDate, 'long') },
                      { label: isVi ? 'Ngày trả xe' : 'Return', value: formatDate(wizard.endDate, 'long') },
                      { label: isVi ? 'Thời gian thuê' : 'Duration', value: `${days} ${t.booking.totalDays}${days > 1 && !isVi ? 's' : ''}` },
                      { label: isVi ? 'Địa điểm' : 'Location', value: `${vehicle.location.city}, ${vehicle.location.country}` },
                      { label: isVi ? 'Bảo hiểm' : 'Insurance', value: wizard.includeInsurance ? (isVi ? 'Premium (45$/ngày)' : 'Premium ($45/day)') : (isVi ? 'Không có' : 'None') },
                      { label: isVi ? 'Giao xe' : 'Delivery', value: wizard.includeDelivery ? (isVi ? 'Có - Giao tận nơi' : 'Yes - Door to door') : (isVi ? 'Tự nhận xe' : 'Self pickup') },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-[#0F172A]">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 bg-green-50 rounded-2xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">{isVi ? 'Hủy chuyến miễn phí' : 'Free Cancellation'}</p>
                      <p className="text-xs text-green-600">{isVi ? 'Hủy chuyến miễn phí lên đến 48 giờ trước khi nhận xe.' : 'Cancel for free up to 48 hours before pickup. No questions asked.'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Payment */}
              {wizard.step === 4 && (
                <motion.div key="step4" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">{isVi ? 'Chi Tiết Thanh Toán' : 'Payment Details'}</h2>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { id: 'card', label: isVi ? 'Thẻ Tín Dụng' : 'Credit Card', icon: '💳' },
                      { id: 'stripe', label: 'Stripe', icon: '🔵' },
                      { id: 'vnpay', label: 'VNPay', icon: '🏦' },
                      { id: 'wallet', label: 'LuxeWallet', icon: '💰' },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${paymentMethod === method.id ? 'border-accent bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="text-xl mb-1">{method.icon}</div>
                        <p className="text-xs font-medium text-[#0F172A]">{method.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Card Form */}
                  {(paymentMethod === 'card' || paymentMethod === 'stripe') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{isVi ? 'Số thẻ' : 'Card Number'}</label>
                        <div className="relative">
                          <input
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="lux-input pr-12"
                            maxLength={19}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">💳</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{isVi ? 'Hạn dùng' : 'Expiry'}</label>
                          <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="lux-input" placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CVC</label>
                          <input value={cardCVC} onChange={e => setCardCVC(e.target.value)} className="lux-input" placeholder="•••" maxLength={4} type="password" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'vnpay' && (
                    <div className="p-5 bg-blue-50 rounded-2xl text-center">
                      <p className="text-3xl mb-3">🏦</p>
                      <p className="font-semibold text-[#0F172A] mb-1">{isVi ? 'Thanh toán qua cổng VNPay' : 'Pay with VNPay'}</p>
                      <p className="text-slate-500 text-sm mb-3">{isVi ? 'Bạn sẽ được chuyển hướng tới cổng thanh toán an toàn của VNPay để thực hiện giao dịch.' : 'You will be redirected to VNPay\'s secure payment gateway to complete your transaction.'}</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {['Vietcombank', 'VietinBank', 'BIDV', 'Techcombank', 'MB Bank'].map(bank => (
                          <span key={bank} className="text-xs px-2 py-1 bg-white rounded-lg border border-blue-100 text-slate-600 font-medium">{bank}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="p-4 bg-blue-50 rounded-2xl text-center">
                      <p className="text-3xl mb-2">💰</p>
                      <p className="font-semibold text-[#0F172A]">{isVi ? 'Số Dư Ví LuxeWallet' : 'LuxeWallet Balance'}</p>
                      <p className="text-2xl font-bold text-accent mt-1">{formatCurrency(user?.walletBalance || 0)}</p>
                      <p className="text-xs text-slate-400 mt-1">{isVi ? 'Số dư khả dụng' : 'Available balance'}</p>
                      {(user?.walletBalance || 0) < totalCost && (
                        <p className="text-xs text-red-500 font-semibold mt-2">
                          {isVi ? '⚠️ Số dư tài khoản không đủ. Vui lòng nạp thêm tiền trong bảng điều khiển.' : '⚠️ Insufficient balance. Please top up your wallet in the dashboard.'}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 justify-center">
                    <Lock className="w-3.5 h-3.5" />
                    {isVi ? 'Thông tin thanh toán của bạn được mã hóa an toàn và bảo mật tuyệt đối' : 'Your payment info is encrypted and never stored'}
                  </div>
                </motion.div>
              )}

              {/* STEP 5 — Success */}
              {wizard.step === 5 && (
                <motion.div key="step5" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="luxury-card p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-success" />
                  </motion.div>

                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <h2 className="font-display text-3xl font-bold text-[#0F172A] mb-3">{isVi ? 'Đặt Xe Thành Công! 🎉' : 'Booking Confirmed! 🎉'}</h2>
                    <p className="text-slate-500 mb-2">{isVi ? 'Đơn đặt xe của bạn đã được ghi nhận và xử lý thành công.' : 'Your booking has been successfully placed.'}</p>
                    {bookingId && (
                      <p className="text-sm font-mono bg-slate-100 px-4 py-2 rounded-xl inline-block mb-6">
                        {isVi ? 'Mã Đặt Xe:' : 'Booking ID:'} <strong>#{bookingId.slice(-8).toUpperCase()}</strong>
                      </p>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8 max-w-sm mx-auto space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{isVi ? 'Xe' : 'Vehicle'}</span>
                        <span className="font-medium">{vehicle.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.booking.pickUp}</span>
                        <span className="font-medium">{formatDate(wizard.startDate, 'short')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.booking.return}</span>
                        <span className="font-medium">{formatDate(wizard.endDate, 'short')}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-8">
                      {isVi ? 'Một email xác nhận đã được gửi đến bạn. Chủ xe sẽ liên hệ trong vòng 2 giờ.' : 'A confirmation email has been sent. The owner will contact you within 2 hours.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => { wizard.reset(); navigate('/dashboard/bookings'); }}
                        className="btn-primary px-8 py-3"
                      >
                        {isVi ? 'Xem Đơn Đặt Xe' : 'View My Bookings'} <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { wizard.reset(); navigate('/marketplace'); }}
                        className="btn-outline px-8 py-3"
                      >
                        {isVi ? 'Thuê Thêm Xe Khác' : 'Browse More Vehicles'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {wizard.step < 5 && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => wizard.step > 1 ? wizard.setStep(wizard.step - 1) : navigate(-1)}
                  className="btn-ghost border border-slate-200 px-5 py-3 rounded-2xl"
                >
                  <ChevronLeft className="w-4 h-4" /> {t.booking.back}
                </button>
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed() || processing}
                  whileHover={{ scale: canProceed() && !processing ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {isVi ? 'Đang xử lý...' : 'Processing...'}</>
                  ) : wizard.step === 4 ? (
                    <><Lock className="w-4 h-4" /> {isVi ? 'Thanh toán' : 'Pay'} {formatCurrency(totalCost)}</>
                  ) : (
                    <>{isVi ? 'Tiếp Tục' : 'Continue'} <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Right — Price Summary */}
          <div>
            <PriceSummary
              vehicle={vehicle}
              startDate={wizard.startDate}
              endDate={wizard.endDate}
              extras={{ insurance: wizard.includeInsurance, delivery: wizard.includeDelivery, addons: wizard.selectedAddons }}
              couponDiscount={wizard.discount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWizardPage;
