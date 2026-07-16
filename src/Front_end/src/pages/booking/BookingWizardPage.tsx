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

const STEPS = [
  { id: 1, label: 'Dates', icon: Calendar },
  { id: 2, label: 'Extras', icon: Package },
  { id: 3, label: 'Review', icon: CheckCircle },
  { id: 4, label: 'Payment', icon: CreditCard },
  { id: 5, label: 'Confirm', icon: CheckCircle },
];

// ====== STEP INDICATOR ======
const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-between mb-10">
    {STEPS.map((step, i) => {
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
          {i < STEPS.length - 1 && (
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

// ====== PRICE SUMMARY SIDEBAR ======
const PriceSummary: React.FC<{ vehicle: Vehicle; startDate: string; endDate: string; extras: { insurance: boolean; delivery: boolean; addons: string[] }; couponDiscount: number }> = ({
  vehicle, startDate, endDate, extras, couponDiscount
}) => {
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
            <p className="text-slate-400 mb-0.5">Pick-up</p>
            <p className="font-semibold text-[#0F172A]">{formatDate(startDate, 'short')}</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">Return</p>
            <p className="font-semibold text-[#0F172A]">{formatDate(endDate, 'short')}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-slate-500">{formatCurrency(vehicle.pricePerDay)} × {days} days</span>
          <span className="font-medium">{formatCurrency(base)}</span>
        </div>
        {extras.insurance && (
          <div className="flex justify-between text-green-600">
            <span>Insurance</span>
            <span>{formatCurrency(insuranceFee)}</span>
          </div>
        )}
        {extras.delivery && (
          <div className="flex justify-between text-blue-600">
            <span>Delivery</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Service fee</span>
          <span className="font-medium">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Taxes</span>
          <span className="font-medium">{formatCurrency(taxes)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-success">
            <span>Coupon Discount</span>
            <span>−{formatCurrency(couponDiscount)}</span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-[#0F172A] text-base">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-slate-400 text-center">+ {formatCurrency(vehicle.deposit)} security deposit (refundable)</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-center">
        <Lock className="w-3.5 h-3.5 text-success" />
        Secured by Stripe · 256-bit SSL
      </div>
    </div>
  );
};

<<<<<<< HEAD
=======
// ====== PAYMENT METHOD CARD ======
const PaymentMethodCard: React.FC<{
  id: string; label: string; sublabel: string; icon: React.ReactNode;
  selected: boolean; onClick: () => void; badge?: string;
}> = ({ id, label, sublabel, icon, selected, onClick, badge }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
      selected
        ? 'border-indigo-500 bg-indigo-50/40'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
    }`}
  >
    {badge && (
      <span className="absolute -top-2 right-4 px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[8px] font-bold uppercase tracking-wider">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">{sublabel}</p>
      </div>
    </div>
  </motion.button>
);

>>>>>>> origin/main
// ====== MAIN BOOKING WIZARD ======
const BookingWizardPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { user } = useAuthStore();
  const toast = useToast();
=======
  const t = useT();
  const toast = useToast();
  const { user, initAuth } = useAuthStore();
>>>>>>> origin/main
  const wizard = useBookingWizardStore();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Payment state
<<<<<<< HEAD
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('123');
=======
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Saved cards state
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Extra options for car bookings
  const [hasChauffeur, setHasChauffeur] = useState(false);
  const [weddingPackage, setWeddingPackage] = useState(false);
  const [businessPackage, setBusinessPackage] = useState(false);

  // Extra options for motorbike bookings
  const [hasHelmet, setHasHelmet] = useState(false);
  const [hasRaincoat, setHasRaincoat] = useState(false);
  const [hasPhoneHolder, setHasPhoneHolder] = useState(false);
  const [hasTouringPackage, setHasTouringPackage] = useState(false);
>>>>>>> origin/main

  // Enforce KYC verification & license class matching
  const isKycVerified = user?.role === 'admin' || user?.kycStatus === 'VERIFIED';
  const isDlVerified = user?.role === 'admin' || user?.driverLicenseStatus === 'VERIFIED';
  const licenseClass = (user?.licenseClass || '').toUpperCase();

  const checkLicenseCompatibility = () => {
    if (user?.role === 'admin') return true;
    if (vehicle?.vehicleType === 'motorbike') {
      return licenseClass.startsWith('A');
    } else if (vehicle?.vehicleType === 'car') {
      return licenseClass.startsWith('B') || 
             licenseClass.startsWith('C') || 
             licenseClass.startsWith('D') || 
             licenseClass.startsWith('E') || 
             licenseClass.startsWith('F');
    }
    return false;
  };

  const isLicenseCompatible = checkLicenseCompatibility();
  const isBlocked = user ? (!isKycVerified || !isDlVerified || !isLicenseCompatible) : false;

  const getBlockingReason = () => {
    if (user?.role === 'admin') return null;
    if (user?.kycStatus !== 'VERIFIED') {
      if (user?.kycStatus === 'PENDING') {
        return {
          title: isVi ? 'Hồ sơ KYC đang chờ duyệt' : 'KYC Verification Pending',
          description: isVi 
            ? 'Tài liệu định danh của bạn đã được tải lên và đang được ban quản trị xét duyệt. Vui lòng quay lại sau khi quá trình xác thực hoàn tất.' 
            : 'Your identity documents have been uploaded and are currently under review by our admin team. Please check back once verification is completed.',
          badge: isVi ? 'Đang duyệt' : 'Under Review',
          status: 'pending'
        };
      }
      return {
        title: isVi ? 'Yêu cầu xác thực tài khoản (KYC)' : 'Identity Verification Required',
        description: isVi 
          ? 'Để đảm bảo an toàn và tuân thủ quy định pháp luật Việt Nam, bạn cần hoàn thành xác thực Căn cước công dân (CCCD) và ảnh chân dung trước khi thuê xe.' 
          : 'To ensure safety and compliance with Vietnamese regulations, you must verify your Citizen ID (CCCD) and Selfie before renting a vehicle.',
        badge: isVi ? 'Chưa xác thực' : 'Not Verified',
        status: 'unverified'
      };
    }
    if (user?.driverLicenseStatus !== 'VERIFIED') {
      if (user?.driverLicenseStatus === 'PENDING') {
        return {
          title: isVi ? 'Bằng lái xe đang chờ duyệt' : 'Driving License Review Pending',
          description: isVi 
            ? 'Bằng lái xe của bạn đang được ban quản trị kiểm tra thông tin đối chiếu OCR. Quá trình này thường mất dưới 10 phút.' 
            : 'Your driving license details are under administrative review. This usually takes less than 10 minutes.',
          badge: isVi ? 'Đang duyệt' : 'Under Review',
          status: 'pending'
        };
      }
      return {
        title: isVi ? 'Yêu cầu xác thực bằng lái xe' : 'Driving License Verification Required',
        description: isVi 
          ? 'Vui lòng cung cấp bằng lái xe hợp lệ để hệ thống đối chiếu lớp bằng lái tương ứng trước khi tiến hành thanh toán đặt xe.' 
          : 'Please provide a valid driving license so our system can cross-reference the class compatibility before checkout.',
        badge: isVi ? 'Chưa xác thực' : 'Not Verified',
        status: 'unverified'
      };
    }
    
    if (vehicle?.vehicleType === 'motorbike') {
      if (!licenseClass.startsWith('A')) {
        return {
          title: isVi ? 'Hạng bằng lái không tương thích' : 'Incompatible Driving License Class',
          description: isVi 
            ? `Thuê xe máy yêu cầu bằng lái hạng A (A1/A2). Bằng lái hiện tại của bạn là hạng [${licenseClass || 'Chưa rõ'}].` 
            : `Motorbike rental requires an A (A1/A2) class driving license. Your current license class is [${licenseClass || 'N/A'}].`,
          badge: isVi ? 'Không tương thích' : 'Incompatible',
          status: 'incompatible'
        };
      }
    } else if (vehicle?.vehicleType === 'car') {
      const isCarLicense = licenseClass.startsWith('B') || 
                           licenseClass.startsWith('C') || 
                           licenseClass.startsWith('D') || 
                           licenseClass.startsWith('E') || 
                           licenseClass.startsWith('F');
      if (!isCarLicense) {
        return {
          title: isVi ? 'Hạng bằng lái không tương thích' : 'Incompatible Driving License Class',
          description: isVi 
            ? `Thuê xe ô tô yêu cầu bằng lái hạng B, C, D, E hoặc F. Bằng lái hiện tại của bạn là hạng [${licenseClass || 'Chưa rõ'}].` 
            : `Car rental requires a B, C, D, E, or F class driving license. Your current license class is [${licenseClass || 'N/A'}].`,
          badge: isVi ? 'Không tương thích' : 'Incompatible',
          status: 'incompatible'
        };
      }
    }
    return null;
  };

  const blockReason = isBlocked ? getBlockingReason() : null;

  // Refresh user profile details when entering booking to avoid stale cached/session values
  useEffect(() => {
    if (user) {
      initAuth();
    }
  }, []);

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
      case 4: return !!paymentMethod;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.warning('Missing information', 'Please complete all required fields');
      return;
    }

    if (wizard.step === 4) {
      // Process payment + create booking
      setProcessing(true);
      try {
        const wizardState = wizard.toWizardState();
        const booking = await bookingService.create(wizardState, user!.id);
        const { success } = await paymentService.processPayment(booking.id, paymentMethod, booking.pricing.total);

<<<<<<< HEAD
        if (success) {
          setBookingId(booking.id);
          wizard.setStep(5);
=======
        // 2. Process payment
        const returnUrl = `${window.location.origin}/payment/${paymentMethod === 'payos' ? 'payos' : 'momo'}/return`;
        const paymentResult = await paymentService.processPayment(
          booking.id,
          paymentMethod,
          booking.pricing?.total || totalCost,
          returnUrl
        );

        if (paymentResult.success) {
          if (paymentResult.paymentUrl) {
            // Redirect to MoMo payment gateway
            window.location.href = paymentResult.paymentUrl;
          } else {
            // Save card details if enabled
            if (saveCard && cardNumber && cardName && (paymentMethod === 'card' || paymentMethod === 'stripe')) {
              const last4 = cardNumber.replace(/\s+/g, '').slice(-4);
              paymentMethodService.addCard({
                type: 'card',
                provider: 'Stripe',
                brand: cardName.toUpperCase() || 'Visa',
                last4: last4,
                expiryMonth: 12,
                expiryYear: 30,
                isDefault: savedCards.length === 0,
                stripePaymentMethodId: 'pm_mock_' + Math.random().toString(36).substring(2, 10)
              }).catch(err => console.error('Failed to save credit card:', err));
            }
            // Direct payment success (wallet/card)
            setBookingId(booking.id);
            wizard.setStep(5);
          }
>>>>>>> origin/main
        } else {
          toast.error('Payment failed', 'Please try a different payment method.');
        }
      } catch (err) {
        toast.error('Booking failed', 'Something went wrong. Please try again.');
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
      toast.success(result.message, `You saved ${formatCurrency(result.discount)}`);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0F172A] mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Complete Your Booking</h1>
          <p className="text-slate-500 mt-1">{vehicle.name} · {vehicle.location.city}</p>
        </motion.div>

        <StepIndicator current={wizard.step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1 — Dates & Details */}
              {wizard.step === 1 && (
<<<<<<< HEAD
                <motion.div key="step1" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">Select Your Dates</h2>
=======
                <motion.div key="step1" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200">{t.booking.selectDates}</h2>
                  </div>
>>>>>>> origin/main

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Pick-up Date</label>
                      <input
                        type="date"
                        value={wizard.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(e.target.value, wizard.endDate)}
<<<<<<< HEAD
                        className="lux-input"
=======
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
>>>>>>> origin/main
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Return Date</label>
                      <input
                        type="date"
                        value={wizard.endDate}
                        min={wizard.startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(wizard.startDate, e.target.value)}
<<<<<<< HEAD
                        className="lux-input"
=======
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
>>>>>>> origin/main
                      />
                    </div>
                  </div>

                  {wizard.startDate && wizard.endDate && wizard.startDate < wizard.endDate && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-2xl text-sm text-blue-700 mb-6">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      Rental duration: <strong>{days} day{days > 1 ? 's' : ''}</strong>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Special Requests (optional)</label>
                    <textarea
                      value={wizard.notes}
                      onChange={e => wizard.setNotes(e.target.value)}
                      rows={3}
<<<<<<< HEAD
                      placeholder="Any special requests, pickup instructions, etc."
                      className="lux-input resize-none"
=======
                      placeholder={isVi ? 'Nhập yêu cầu đặc biệt hoặc hướng dẫn nhận xe...' : 'Any special requests, pickup instructions, etc.'}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
>>>>>>> origin/main
                    />
                  </div>

                  {/* Vehicle rules reminder */}
                  {vehicle.rules.length > 0 && (
                    <div className="mt-5 p-4 bg-yellow-50 rounded-2xl">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">Rental Rules</p>
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
<<<<<<< HEAD
                    className={`luxury-card p-5 cursor-pointer transition-all duration-200 ${wizard.includeInsurance ? 'ring-2 ring-accent bg-blue-50/50' : ''}`}
=======
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                      wizard.includeInsurance ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
>>>>>>> origin/main
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wizard.includeInsurance ? 'bg-accent' : 'bg-slate-100'}`}>
                        <Shield className={`w-6 h-6 ${wizard.includeInsurance ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
<<<<<<< HEAD
                          <h3 className="font-semibold text-[#0F172A]">Premium Insurance</h3>
                          <div>
                            <p className="font-bold text-[#0F172A]">{formatCurrency(45)}<span className="text-xs text-slate-400 font-normal">/day</span></p>
=======
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Bảo hiểm Premium' : 'Premium Insurance'}</h3>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(Math.round(vehicle.pricePerDay * 0.15))}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
>>>>>>> origin/main
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">$5M coverage, zero excess, theft & damage protection</p>
                        <div className="flex gap-2 mt-2">
                          {['$5M Coverage', 'Zero Excess', 'Theft Protection', '24/7 Assist'].map(f => (
                            <span key={f} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${wizard.includeInsurance ? 'border-accent bg-accent' : 'border-slate-300'}`}>
                        {wizard.includeInsurance && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
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
                            <h3 className="font-semibold text-[#0F172A]">Door-to-Door Delivery</h3>
                            <p className="font-bold text-[#0F172A]">{formatCurrency(vehicle.deliveryFee)}</p>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">Vehicle delivered to your hotel, airport, or any address</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${wizard.includeDelivery ? 'border-accent bg-accent' : 'border-slate-300'}`}>
                          {wizard.includeDelivery && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      {wizard.includeDelivery && (
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4 pl-16">
                          <input
                            type="text"
                            placeholder="Enter delivery address..."
                            className="lux-input text-sm"
                            onClick={e => e.stopPropagation()}
                            onChange={e => wizard.setDelivery(true, e.target.value)}
                          />
=======
                  {/* Dynamic Render based on Vehicle Type */}
                  {vehicle.vehicleType === 'car' ? (
                    <>
                      {/* Car: Airport Delivery */}
                      {(vehicle.airportDelivery || vehicle.deliveryAvailable) && (
                        <motion.div
                          onClick={() => wizard.setDelivery(!wizard.includeDelivery)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            wizard.includeDelivery ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              wizard.includeDelivery ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Truck className={`w-6 h-6 ${wizard.includeDelivery ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Giao xe tại sân bay' : 'Airport Delivery'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(200000)}</p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Nhận và trả xe ngay tại ga đến sân bay' : 'Pick up and return vehicle directly at the airport terminal'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              wizard.includeDelivery ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {wizard.includeDelivery && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          {wizard.includeDelivery && (
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4 pl-16">
                              <input
                                type="text"
                                placeholder={isVi ? 'Nhập mã chuyến bay hoặc địa chỉ chi tiết...' : 'Enter flight number or details...'}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
                                onClick={e => e.stopPropagation()}
                                onChange={e => wizard.setDelivery(true, e.target.value)}
                              />
                            </motion.div>
                          )}
>>>>>>> origin/main
                        </motion.div>
                      )}
                    </div>
                  )}

<<<<<<< HEAD
                  {/* Vehicle Add-ons */}
                  {vehicle.addons.length > 0 && (
                    <div className="luxury-card p-5">
                      <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Optional Add-ons</h3>
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
=======
                      {/* Car: Chauffeur Service */}
                      {vehicle.hasChauffeur && (
                        <motion.div
                          onClick={() => setHasChauffeur(!hasChauffeur)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasChauffeur ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              hasChauffeur ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <UserCircle className={`w-6 h-6 ${hasChauffeur ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Thuê tài xế riêng' : 'Chauffeur Service'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(500000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Tài xế chuyên nghiệp, lịch sự, thông thạo đường phố' : 'Professional, polite driver who knows the city inside out'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasChauffeur ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasChauffeur && <CheckCircle className="w-4 h-4 text-white" />}
>>>>>>> origin/main
                            </div>
                            <p className="text-sm font-bold text-[#0F172A]">{formatCurrency(addon.pricePerDay)}/day</p>
                            <div className={`w-5 h-5 rounded-full border-2 ${wizard.selectedAddons.includes(addon.id) ? 'border-accent bg-accent' : 'border-slate-300'}`} />
                          </div>
<<<<<<< HEAD
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="luxury-card p-5">
                    <h3 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gold" /> Apply Coupon Code
=======
                        </motion.div>
                      )}

                      {/* Car: Wedding Package */}
                      {vehicle.weddingRental && (
                        <motion.div
                          onClick={() => setWeddingPackage(!weddingPackage)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            weddingPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              weddingPackage ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Heart className={`w-6 h-6 ${weddingPackage ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Gói xe hoa đám cưới' : 'Wedding Package Decor'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(1500000)}</p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Trang trí hoa cưới sang trọng theo yêu cầu' : 'Elegant floral wedding decoration styled to your preference'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              weddingPackage ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {weddingPackage && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Car: Business Package */}
                      {vehicle.businessRental && (
                        <motion.div
                          onClick={() => setBusinessPackage(!businessPackage)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            businessPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              businessPackage ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Briefcase className={`w-6 h-6 ${businessPackage ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Gói thuê doanh nghiệp (VAT)' : 'Business Corporate Package'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">-{isVi ? 'Giảm 10%' : '10% Off'}</p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Hỗ trợ xuất hóa đơn đỏ VAT đầy đủ, thủ tục nhanh' : 'Full VAT corporate tax invoice support and expedited processing'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              businessPackage ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {businessPackage && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Motorbike: Helmet rental */}
                      {vehicle.hasHelmet && (
                        <motion.div
                          onClick={() => setHasHelmet(!hasHelmet)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasHelmet ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              hasHelmet ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Check className={`w-6 h-6 ${hasHelmet ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Thuê mũ bảo hiểm' : 'Premium Helmet Rental'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(20000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Mũ bảo hiểm đạt chuẩn chất lượng an toàn cao' : 'High quality safety certified helmet for maximum protection'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasHelmet ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasHelmet && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Motorbike: Raincoat */}
                      {vehicle.hasRaincoat && (
                        <motion.div
                          onClick={() => setHasRaincoat(!hasRaincoat)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasRaincoat ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              hasRaincoat ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <CloudRain className={`w-6 h-6 ${hasRaincoat ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Thuê áo mưa' : 'Raincoat Included'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(10000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Áo mưa tiện lợi, chống thấm nước tốt' : 'Convenient, waterproof raincoat for rainy days'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasRaincoat ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasRaincoat && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Motorbike: Phone Holder */}
                      {vehicle.hasPhoneHolder && (
                        <motion.div
                          onClick={() => setHasPhoneHolder(!hasPhoneHolder)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasPhoneHolder ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              hasPhoneHolder ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Smartphone className={`w-6 h-6 ${hasPhoneHolder ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Kẹp điện thoại' : 'Phone Holder'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(10000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Kẹp điện thoại chắc chắn gắn ghi-đông để định vị' : 'Sturdy handlebar-mounted phone holder for navigation'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasPhoneHolder ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasPhoneHolder && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Motorbike: Touring Package */}
                      {vehicle.hasTouringPackage && (
                        <motion.div
                          onClick={() => setHasTouringPackage(!hasTouringPackage)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasTouringPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              hasTouringPackage ? 'bg-indigo-500' : 'bg-slate-100'
                            }`}>
                              <Package className={`w-6 h-6 ${hasTouringPackage ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{isVi ? 'Gói hành lý touring' : 'Touring Rack & Boxes'}</h3>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{formatVND(100000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Baga sau và thùng đựng đồ Givi tiện lợi đi phượt' : 'Heavy-duty rear luggage rack and side boxes for road trips'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasTouringPackage ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasTouringPackage && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Coupon */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/5 p-5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      {t.booking.applyCoupon}
>>>>>>> origin/main
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        placeholder="LUXE20, WELCOME15, VIP25..."
<<<<<<< HEAD
                        className="lux-input flex-1"
=======
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono tracking-widest"
>>>>>>> origin/main
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                        className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-danger text-xs mt-1.5">{couponError}</p>}
                    {wizard.couponCode && wizard.discount > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-success text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">{wizard.couponCode}</span> applied — You save {formatCurrency(wizard.discount)}!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Review */}
              {wizard.step === 3 && (
<<<<<<< HEAD
                <motion.div key="step3" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">Review Your Booking</h2>
=======
                <motion.div key="step3" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200">
                      {isVi ? 'Xem Lại Đặt Xe' : 'Review Your Booking'}
                    </h2>
                  </div>
>>>>>>> origin/main

                  <div className="space-y-4">
                    {[
                      { label: 'Vehicle', value: vehicle.name },
                      { label: 'Pick-up', value: formatDate(wizard.startDate, 'long') },
                      { label: 'Return', value: formatDate(wizard.endDate, 'long') },
                      { label: 'Duration', value: `${days} day${days > 1 ? 's' : ''}` },
                      { label: 'Location', value: `${vehicle.location.city}, ${vehicle.location.country}` },
                      { label: 'Insurance', value: wizard.includeInsurance ? 'Premium ($45/day)' : 'None' },
                      { label: 'Delivery', value: wizard.includeDelivery ? 'Yes - Door to door' : 'Self pickup' },
                    ].map(item => (
<<<<<<< HEAD
                      <div key={item.label} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-[#0F172A]">{item.value}</span>
=======
                      <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-sm text-slate-500">{item.label}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
>>>>>>> origin/main
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 bg-green-50 rounded-2xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Free Cancellation</p>
                      <p className="text-xs text-green-600">Cancel for free up to 48 hours before pickup. No questions asked.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Payment */}
              {wizard.step === 4 && (
<<<<<<< HEAD
                <motion.div key="step4" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="luxury-card p-6">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] mb-5">Payment Details</h2>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { id: 'card', label: 'Credit Card', icon: '💳' },
                      { id: 'stripe', label: 'Stripe', icon: '🔵' },
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
                        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Card Number</label>
                        <div className="relative">
                          <input
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="lux-input pr-12"
                            maxLength={19}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">💳</span>
=======
                <motion.div key="step4" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200">
                      {isVi ? 'Chọn phương thức thanh toán' : 'Payment Method'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <PaymentMethodCard
                      id="momo"
                      label="MoMo"
                      sublabel={isVi ? 'Ví điện tử MoMo' : 'MoMo e-Wallet'}
                      icon={<span>💜</span>}
                      selected={paymentMethod === 'momo'}
                      onClick={() => setPaymentMethod('momo')}
                      badge={isVi ? 'Phổ biến' : 'Popular'}
                    />
                    <PaymentMethodCard
                      id="payos"
                      label="PayOS"
                      sublabel={isVi ? 'Thanh toán QR/ngân hàng thực' : 'Real QR/bank payment'}
                      icon={<Building2 className="w-5 h-5 text-sky-600" />}
                      selected={paymentMethod === 'payos'}
                      onClick={() => setPaymentMethod('payos')}
                      badge={isVi ? 'Thực' : 'Live'}
                    />
                    <PaymentMethodCard
                      id="wallet"
                      label={isVi ? 'LuxeWallet' : 'LuxeWallet'}
                      sublabel={`${isVi ? 'Số dư:' : 'Balance:'} ${formatCurrency(user?.walletBalance || 0)}`}
                      icon={<Wallet className="w-5 h-5" />}
                      selected={paymentMethod === 'wallet'}
                      onClick={() => setPaymentMethod('wallet')}
                    />
                    <PaymentMethodCard
                      id="card"
                      label={isVi ? 'Thẻ tín dụng / ghi nợ' : 'Credit / Debit Card'}
                      sublabel="Visa, Mastercard, JCB"
                      icon={<CreditCard className="w-5 h-5" />}
                      selected={paymentMethod === 'card'}
                      onClick={() => setPaymentMethod('card')}
                    />
                    <PaymentMethodCard
                      id="stripe"
                      label="Stripe"
                      sublabel={isVi ? 'Thanh toán quốc tế' : 'International payments'}
                      icon={<Zap className="w-5 h-5 text-indigo-500" />}
                      selected={paymentMethod === 'stripe'}
                      onClick={() => setPaymentMethod('stripe')}
                    />
                  </div>

                  {/* MoMo info */}
                  {paymentMethod === 'momo' && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="p-5 rounded-2xl mb-4"
                      style={{ background: 'linear-gradient(135deg, #FFF0F6, #FCE4F0)', border: '1px solid #F9A8D4' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">💜</span>
                        <p className="font-bold" style={{ color: '#BE185D' }}>
                          {isVi ? 'Thanh toán qua MoMo' : 'Pay with MoMo e-Wallet'}
                        </p>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#9D174D' }}>
                        {isVi
                          ? 'Bạn sẽ được chuyển hướng tới ứng dụng MoMo để hoàn tất thanh toán an toàn.'
                          : "You'll be redirected to MoMo's secure payment page to complete your transaction."}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['QR Code', 'ATM', isVi ? 'Thẻ tín dụng' : 'Credit Card', isVi ? 'Liên kết ngân hàng' : 'Bank Link'].map(m => (
                          <span key={m} className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-semibold shadow-sm" style={{ color: '#BE185D', border: '1px solid #F9A8D4' }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {paymentMethod === 'payos' && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="p-5 rounded-2xl mb-4"
                      style={{ background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)', border: '1px solid #7DD3FC' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="w-6 h-6 text-sky-700" />
                        <p className="font-bold text-sky-800">
                          {isVi ? 'Thanh toán qua PayOS' : 'Pay with PayOS'}
                        </p>
                      </div>
                      <p className="text-sm mb-3 text-sky-900">
                        {isVi
                          ? 'Bạn sẽ được chuyển hướng tới cổng PayOS thật để thanh toán bằng mã QR hoặc ngân hàng.'
                          : "You'll be redirected to the live PayOS checkout for QR or bank payment."}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['VietQR', 'Bank Transfer', isVi ? 'Môi trường thực' : 'Live Gateway'].map(m => (
                          <span key={m} className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-semibold shadow-sm text-sky-800 border border-sky-200">
                            {m}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {(paymentMethod === 'card' || paymentMethod === 'stripe') && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4 mb-4">
                      {savedCards.length > 0 && !showNewCardForm ? (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {isVi ? 'Thẻ đã lưu của bạn' : 'Your Saved Payment Cards'}
                          </p>
                          <div className="space-y-2">
                            {savedCards.map(card => {
                              const isSelected = selectedCardId === card.id;
                              return (
                                <div
                                  key={card.id}
                                  onClick={() => {
                                    setSelectedCardId(card.id);
                                    setCardNumber(`•••• •••• •••• ${card.last4}`);
                                    setCardName(card.brand || 'Card');
                                  }}
                                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                    isSelected ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">💳</span>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
                                        {card.brand || 'Credit Card'} ···· {card.last4}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                        {isVi ? 'Hạn dùng: 12/2030' : 'Expires: 12/2030'} {card.isDefault && `· [${isVi ? 'Mặc định' : 'Default'}]`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCardForm(true);
                              setCardNumber('');
                              setCardName('');
                              setSelectedCardId('');
                            }}
                            className="text-xs text-indigo-600 hover:underline font-bold"
                          >
                            + {isVi ? 'Thêm thẻ mới' : 'Add new credit card'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedCards.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewCardForm(false);
                                if (savedCards.length > 0) {
                                  setSelectedCardId(savedCards[0].id);
                                  setCardNumber(`•••• •••• •••• ${savedCards[0].last4}`);
                                  setCardName(savedCards[0].brand || 'Card');
                                }
                              }}
                              className="text-xs text-indigo-600 hover:underline font-bold mb-2 block"
                            >
                              ← {isVi ? 'Sử dụng thẻ đã lưu' : 'Use saved payment card'}
                            </button>
                          )}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              {isVi ? 'Tên chủ thẻ' : 'Cardholder Name'}
                            </label>
                            <input
                              value={cardName}
                              onChange={e => setCardName(e.target.value)}
                              placeholder={isVi ? 'NGUYEN VAN A' : 'JOHN DOE'}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all uppercase tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{isVi ? 'Số thẻ' : 'Card Number'}</label>
                            <div className="relative">
                              <input
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                placeholder="0000 0000 0000 0000"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-mono pr-12"
                                maxLength={19}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">💳</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{isVi ? 'Hạn dùng' : 'Expiry'}</label>
                              <input
                                value={cardExpiry}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, '');
                                  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                  setCardExpiry(v);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                              <input
                                value={cardCVC}
                                onChange={e => setCardCVC(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono"
                                placeholder="•••"
                                maxLength={4}
                                type="password"
                              />
                            </div>
                          </div>
                          
                          {/* Save card checkbox */}
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              id="save_card"
                              checked={saveCard}
                              onChange={e => setSaveCard(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="save_card" className="text-xs text-slate-500 dark:text-slate-400 font-semibold cursor-pointer">
                              {isVi ? 'Lưu thẻ này để thanh toán cho lần sau' : 'Save card for future payments'}
                            </label>
                          </div>

                          <div className="p-3 bg-blue-50 rounded-xl flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <p className="text-xs text-blue-600">
                              {isVi ? 'Môi trường demo – nhập bất kỳ số thẻ nào để test.' : 'Demo environment – enter any card number to test.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Wallet info */}
                  {paymentMethod === 'wallet' && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-2xl mb-4"
                      style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-emerald-600" />
                          <p className="font-bold text-emerald-800">LuxeWallet</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">{formatCurrency(user?.walletBalance || 0)}</p>
                          <p className="text-xs text-emerald-500">{isVi ? 'Số dư khả dụng' : 'Available balance'}</p>
>>>>>>> origin/main
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Expiry</label>
                          <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="lux-input" placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CVC</label>
                          <input value={cardCVC} onChange={e => setCardCVC(e.target.value)} className="lux-input" placeholder="•••" maxLength={4} type="password" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="p-4 bg-blue-50 rounded-2xl text-center">
                      <p className="text-3xl mb-2">💰</p>
                      <p className="font-semibold text-[#0F172A]">LuxeWallet Balance</p>
                      <p className="text-2xl font-bold text-accent mt-1">$12,500.00</p>
                      <p className="text-xs text-slate-400 mt-1">Available balance</p>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 justify-center">
                    <Lock className="w-3.5 h-3.5" />
                    Your payment info is encrypted and never stored
                  </div>
                </motion.div>
              )}

              {/* STEP 5 — Success */}
              {wizard.step === 5 && (
                <motion.div key="step5" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
<<<<<<< HEAD
                  className="luxury-card p-10 text-center">
=======
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-900/5 p-10 text-center overflow-hidden relative">
                  {/* Confetti-like decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-2"
                    style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899, #F59E0B, #10B981)' }} />

>>>>>>> origin/main
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-success" />
                  </motion.div>

                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <h2 className="font-display text-3xl font-bold text-[#0F172A] mb-3">Booking Confirmed! 🎉</h2>
                    <p className="text-slate-500 mb-2">Your booking has been successfully placed.</p>
                    {bookingId && (
<<<<<<< HEAD
                      <p className="text-sm font-mono bg-slate-100 px-4 py-2 rounded-xl inline-block mb-6">
                        Booking ID: <strong>#{bookingId.slice(-8).toUpperCase()}</strong>
                      </p>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8 max-w-sm mx-auto space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle</span>
                        <span className="font-medium">{vehicle.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pick-up</span>
                        <span className="font-medium">{formatDate(wizard.startDate, 'short')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Return</span>
                        <span className="font-medium">{formatDate(wizard.endDate, 'short')}</span>
                      </div>
=======
                      <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl mb-6">
                        <span className="text-xs text-slate-500">{isVi ? 'Mã Đặt Xe:' : 'Booking ID:'}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">#{bookingId.slice(-8).toUpperCase()}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 text-left mb-8 max-w-sm mx-auto space-y-2.5 text-sm">
                      {[
                        { label: isVi ? 'Xe' : 'Vehicle', value: vehicle.name },
                        { label: t.booking.pickUp, value: formatDate(wizard.startDate, 'short') },
                        { label: t.booking.return, value: formatDate(wizard.endDate, 'short') },
                        { label: isVi ? 'Tổng tiền' : 'Total', value: formatVND(totalCost) },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                        </div>
                      ))}
>>>>>>> origin/main
                    </div>

                    <p className="text-xs text-slate-400 mb-8">
                      A confirmation email has been sent. The owner will contact you within 2 hours.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => { wizard.reset(); navigate('/dashboard/bookings'); }}
                        className="btn-primary px-8 py-3"
                      >
                        View My Bookings <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { wizard.reset(); navigate('/marketplace'); }}
<<<<<<< HEAD
                        className="btn-outline px-8 py-3"
=======
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 hover:border-indigo-300 transition-colors"
>>>>>>> origin/main
                      >
                        Browse More Vehicles
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
<<<<<<< HEAD
                  className="btn-ghost border border-slate-200 px-5 py-3 rounded-2xl"
=======
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
>>>>>>> origin/main
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed() || processing}
                  whileHover={{ scale: canProceed() && !processing ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : wizard.step === 4 ? (
                    <><Lock className="w-4 h-4" /> Pay {formatCurrency(vehicle.pricePerDay * days + (wizard.includeInsurance ? days * 45 : 0))}</>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
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
      {isBlocked && blockReason && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end justify-center">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-15px_30px_rgba(0,0,0,0.15)] border-t border-slate-100 dark:border-slate-800 p-8 select-none relative pb-10"
          >
            {/* Top Drag Indicator Line */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-sm animate-pulse">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{blockReason.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    blockReason.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : blockReason.status === 'incompatible' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-slate-100 text-slate-800 dark:text-slate-200'
                  }`}>
                    {blockReason.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {blockReason.description}
                </p>
              </div>
            </div>

            {/* Check Details Container */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-250/60 mb-6 space-y-4">
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200 dark:border-slate-700/50 pb-3">
                <span className="text-slate-500 font-semibold">{isVi ? '1. Định danh cá nhân (KYC)' : '1. Identity KYC Status'}</span>
                <span className={`font-bold ${user?.kycStatus === 'VERIFIED' ? 'text-emerald-600' : user?.kycStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {user?.kycStatus === 'VERIFIED' ? '✓ VERIFIED' : user?.kycStatus === 'PENDING' ? '⏳ PENDING REVIEW' : '✗ NOT VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200 dark:border-slate-700/50 pb-3">
                <span className="text-slate-500 font-semibold">{isVi ? '2. Bằng lái xe (Driver License)' : '2. Driving License Status'}</span>
                <span className={`font-bold ${user?.driverLicenseStatus === 'VERIFIED' ? 'text-emerald-600' : user?.driverLicenseStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {user?.driverLicenseStatus === 'VERIFIED' ? '✓ VERIFIED' : user?.driverLicenseStatus === 'PENDING' ? '⏳ PENDING REVIEW' : '✗ NOT VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-500 font-semibold">{isVi ? '3. Hạng bằng lái / Loại xe' : '3. License Compatibility'}</span>
                <span className={`font-bold ${isLicenseCompatible ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isLicenseCompatible 
                    ? `✓ COMPATIBLE (${user?.licenseClass || 'N/A'} for ${vehicle.vehicleType?.toUpperCase()})` 
                    : `✗ INCOMPATIBLE (${user?.licenseClass || 'None'} for ${vehicle.vehicleType?.toUpperCase()})`
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {blockReason.status !== 'pending' && (
                <button
                  onClick={() => navigate('/dashboard/documents')}
                  className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {isVi ? 'Xác thực tài liệu ngay' : 'Verify My Documents'}
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 px-6 border-2 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isVi ? 'Quay lại cửa hàng' : 'Back to Marketplace'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingWizardPage;
