import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Shield, CreditCard, CheckCircle, ChevronRight,
  ChevronLeft, Car, MapPin, Clock, Tag, Loader2, ArrowRight,
  Zap, Lock, Star, Package, Truck, X, Wallet, Building2,
  AlertTriangle, Info, Sparkles, UserCircle, Heart, Briefcase,
  Check, CloudRain, Smartphone, Camera
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { bookingService, paymentService, paymentMethodService } from '@/services/bookingService';
import type { Vehicle } from '@/types';
import { useAuthStore, useBookingWizardStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, calculateDays } from '@/utils';
import { fadeUp, staggerContainer, staggerItem, scaleIn } from '@/animations/variants';
import { useT } from '@/i18n/translations';

// ====== VND PRICE FORMATTER ======
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  background: isCompleted
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : isActive
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : 'rgba(148,163,184,0.15)',
                  scale: isActive ? 1.15 : 1,
                  boxShadow: isActive
                    ? '0 0 0 6px rgba(99,102,241,0.15)'
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
              </motion.div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < localizedSteps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 relative overflow-hidden rounded-full bg-slate-200/60">
                <motion.div
                  animate={{ scaleX: current > step.id ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full origin-left rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366F1, #10B981)' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ====== PRICE SUMMARY SIDEBAR ======
const PriceSummary: React.FC<{
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  extras: {
    insurance: boolean;
    delivery: boolean;
    addons: string[];
    hasChauffeur?: boolean;
    weddingPackage?: boolean;
    businessPackage?: boolean;
    hasHelmet?: boolean;
    hasRaincoat?: boolean;
    hasPhoneHolder?: boolean;
    hasTouringPackage?: boolean;
  };
  couponDiscount: number;
}> = ({ vehicle, startDate, endDate, extras, couponDiscount }) => {
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const days = startDate && endDate ? calculateDays(startDate, endDate) : 1;
  const base = vehicle.pricePerDay * days;
  const insuranceFee = extras.insurance ? Math.round(vehicle.pricePerDay * 0.15 * days) : 0;
  
  let deliveryFee = 0;
  let customFeesHtml = [];
  let businessDiscount = 0;
  let customFees = 0;

  if (vehicle.vehicleType === 'car') {
    deliveryFee = extras.delivery ? 200000 : 0;
    if (extras.hasChauffeur) {
      const chauffeurFee = 500000 * days;
      customFees += chauffeurFee;
      customFeesHtml.push(
        <div key="chauffeur" className="flex justify-between text-blue-400">
          <span>{isVi ? '👨‍✈️ Tài xế riêng' : '👨‍✈️ Chauffeur Service'}</span>
          <span>+{formatVND(chauffeurFee)}</span>
        </div>
      );
    }
    if (extras.weddingPackage) {
      const weddingFee = 1500000;
      customFees += weddingFee;
      customFeesHtml.push(
        <div key="wedding" className="flex justify-between text-pink-400">
          <span>{isVi ? '🌸 Gói xe hoa cưới' : '🌸 Wedding Package'}</span>
          <span>+{formatVND(weddingFee)}</span>
        </div>
      );
    }
    if (extras.businessPackage) {
      businessDiscount = Math.round(base * 0.1);
    }
  } else if (vehicle.vehicleType === 'motorbike') {
    deliveryFee = 0;
    if (extras.hasHelmet) {
      const fee = 20000 * days;
      customFees += fee;
      customFeesHtml.push(
        <div key="helmet" className="flex justify-between text-blue-400">
          <span>🪖 {isVi ? 'Thuê mũ bảo hiểm' : 'Helmet rental'}</span>
          <span>+{formatVND(fee)}</span>
        </div>
      );
    }
    if (extras.hasRaincoat) {
      const fee = 10000 * days;
      customFees += fee;
      customFeesHtml.push(
        <div key="raincoat" className="flex justify-between text-blue-400">
          <span>🧥 {isVi ? 'Thuê áo mưa' : 'Raincoat rental'}</span>
          <span>+{formatVND(fee)}</span>
        </div>
      );
    }
    if (extras.hasPhoneHolder) {
      const fee = 10000 * days;
      customFees += fee;
      customFeesHtml.push(
        <div key="phoneholder" className="flex justify-between text-blue-400">
          <span>📱 {isVi ? 'Kẹp điện thoại' : 'Phone holder'}</span>
          <span>+{formatVND(fee)}</span>
        </div>
      );
    }
    if (extras.hasTouringPackage) {
      const fee = 100000 * days;
      customFees += fee;
      customFeesHtml.push(
        <div key="touring" className="flex justify-between text-blue-400">
          <span>📦 {isVi ? 'Baga & Thùng touring' : 'Touring Rack / Luggage'}</span>
          <span>+{formatVND(fee)}</span>
        </div>
      );
    }
  }

  const serviceFee = Math.round(base * 0.12);
  const taxes = Math.round(base * 0.08);
  const subtotal = base + insuranceFee + deliveryFee + customFees + serviceFee + taxes - businessDiscount;
  const total = subtotal - couponDiscount;

  return (
    <div className="sticky top-28 space-y-4">
      {/* Vehicle Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
        <div className="relative h-40 overflow-hidden">
          <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0F172A 0%, transparent 60%)' }} />
          {/* Glow */}
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold text-sm">{vehicle.name}</p>
            <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{vehicle.location.city}
            </p>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-xl">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-bold">{vehicle.rating?.toFixed(1) ?? '5.0'}</span>
          </div>
        </div>

        {/* Date strip */}
        {startDate && endDate && (
          <div className="mx-4 -mt-1 mb-4 p-3 rounded-2xl flex gap-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex-1 text-center">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{t.booking.pickUp}</p>
              <p className="text-white font-bold text-xs mt-0.5">{formatDate(startDate, 'short')}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1 text-center">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{t.booking.return}</p>
              <p className="text-white font-bold text-xs mt-0.5">{formatDate(endDate, 'short')}</p>
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="px-4 pb-4 space-y-2 text-sm">
          <div className="flex justify-between text-white/60">
            <span>{formatVND(vehicle.pricePerDay)} × {days} {t.booking.totalDays}{days > 1 && !isVi ? 's' : ''}</span>
            <span className="text-white/90 font-medium">{formatVND(base)}</span>
          </div>
          {extras.insurance && (
            <div className="flex justify-between text-emerald-400">
              <span>{isVi ? '🛡️ Bảo hiểm Premium' : '🛡️ Insurance'}</span>
              <span>+{formatVND(insuranceFee)}</span>
            </div>
          )}
          {vehicle.vehicleType === 'car' && extras.delivery && (
            <div className="flex justify-between text-blue-400">
              <span>{isVi ? '🚗 Giao xe tận sân bay' : '🚗 Airport Delivery'}</span>
              <span>+{formatVND(deliveryFee)}</span>
            </div>
          )}
          {customFeesHtml}
          {businessDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>💼 {isVi ? 'Chiết khấu doanh nghiệp' : 'Corporate Discount'}</span>
              <span>-{formatVND(businessDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white/60">
            <span>{t.booking.serviceFee}</span>
            <span className="text-white/90 font-medium">{formatVND(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>{t.booking.taxes}</span>
            <span className="text-white/90 font-medium">{formatVND(taxes)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>🎉 {isVi ? 'Mã giảm giá' : 'Coupon'}</span>
              <span>−{formatVND(couponDiscount)}</span>
            </div>
          )}
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between font-bold text-base">
            <span className="text-white">{t.booking.total}</span>
            <span style={{ background: 'linear-gradient(135deg, #A78BFA, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatVND(total)}
            </span>
          </div>
          <p className="text-white/30 text-xs text-center">+ {formatVND(vehicle.deposit)} {t.booking.deposit}</p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/30 pb-4">
          <Lock className="w-3 h-3 text-emerald-500" />
          {isVi ? 'Bảo mật SSL 256-bit' : '256-bit SSL Secured'}
        </div>
      </div>
    </div>
  );
};

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
        : 'border-slate-200 hover:border-slate-300'
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
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">{sublabel}</p>
      </div>
    </div>
  </motion.button>
);

// ====== MAIN BOOKING WIZARD ======
const BookingWizardPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();
  const toast = useToast();
  const { user, updateUser } = useAuthStore();
  const wizard = useBookingWizardStore();
  const isVi = t.common.loading.includes('Đang');

  // States for driving license verification form
  const [gplxNumber, setGplxNumber] = useState(user?.licenseNumber || '');
  const [gplxName, setGplxName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  const [gplxClass, setGplxClass] = useState(user?.licenseClass || 'B2');
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false);
  const [frontImageMock, setFrontImageMock] = useState<string | null>(null);
  const [backImageMock, setBackImageMock] = useState<string | null>(null);

  const checkLocalLicenseCompatibility = (selectedClass: string) => {
    if (!vehicle) return true;
    const cls = selectedClass.toUpperCase();
    if (vehicle.vehicleType === 'motorbike') {
      return cls === 'A1' || cls === 'A';
    } else if (vehicle.vehicleType === 'car') {
      return cls.startsWith('B') || 
             cls.startsWith('C') || 
             cls.startsWith('D') || 
             cls.startsWith('E') || 
             cls.startsWith('F');
    }
    return false;
  };

  const isLocalCompatible = checkLocalLicenseCompatibility(gplxClass);

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gplxNumber.trim()) {
      toast.warning(isVi ? 'Nhập số GPLX' : 'Enter License Number', isVi ? 'Vui lòng điền số bằng lái xe của bạn.' : 'Please enter your driving license number.');
      return;
    }
    if (gplxNumber.trim().length !== 12) {
      toast.warning(isVi ? 'Số GPLX không hợp lệ' : 'Invalid License Number', isVi ? 'Số GPLX của Việt Nam phải có độ dài đúng 12 chữ số.' : 'Vietnamese driving license must be exactly 12 digits.');
      return;
    }
    if (!gplxName.trim()) {
      toast.warning(isVi ? 'Nhập họ tên' : 'Enter Full Name', isVi ? 'Vui lòng điền tên chủ bằng lái.' : 'Please enter the license holder name.');
      return;
    }
    if (!isLocalCompatible) {
      toast.error(isVi ? 'Hạng bằng không tương thích' : 'Incompatible License', isVi ? 'Hạng bằng lái này không đủ điều kiện thuê xe.' : 'This license class is not compatible with the vehicle.');
      return;
    }
    
    setIsSubmittingLicense(true);
    try {
      const nameParts = gplxName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await updateUser({
        licenseClass: gplxClass,
        licenseNumber: gplxNumber.trim(),
        firstName,
        lastName
      });
      
      toast.success(isVi ? 'Xác thực thành công' : 'Verification Successful', isVi ? 'Thông tin bằng lái của bạn đã được cập nhật thành công!' : 'Your driving license details have been verified successfully.');
    } catch (err: any) {
      toast.error(isVi ? 'Lỗi xác thực' : 'Verification Error', err.message || (isVi ? 'Không thể cập nhật bằng lái.' : 'Failed to update driving license.'));
    } finally {
      setIsSubmittingLicense(false);
    }
  };

  // Enforce KYC verification & license class matching
  const isKycVerified = user?.role === 'admin' || user?.kycStatus === 'VERIFIED';
  const isDlVerified = user?.role === 'admin' || user?.driverLicenseStatus === 'VERIFIED';
  const licenseClass = (user?.licenseClass || '').toUpperCase();

  const checkLicenseCompatibility = () => {
    if (user?.role === 'admin') return true;
    if (vehicle?.vehicleType === 'motorbike') {
      return licenseClass === 'A1' || licenseClass === 'A';
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
      if (user?.kycStatus === 'PENDING' || user?.kycStatus === 'PENDING_APPROVAL') {
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
      if (user?.driverLicenseStatus === 'PENDING' || user?.driverLicenseStatus === 'PENDING_APPROVAL') {
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
      if (licenseClass !== 'A1' && licenseClass !== 'A') {
        return {
          title: isVi ? 'Hạng bằng lái không tương thích' : 'Incompatible Driving License Class',
          description: isVi 
            ? `Thuê xe máy yêu cầu bằng lái hạng A1 hoặc A. Bằng lái hiện tại của bạn là hạng [${licenseClass || 'Chưa rõ'}].` 
            : `Motorbike rental requires an A1 or A class driving license. Your current license class is [${licenseClass || 'N/A'}].`,
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

  // Page level state
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment state
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

  useEffect(() => {
    if (!vehicleId) return;
    vehicleService.getById(vehicleId).then(v => {
      setVehicle(v);
      setLoading(false);
      wizard.initWizard(vehicleId);
      const start = searchParams.get('start');
      const end = searchParams.get('end');
      if (start && end) wizard.setDates(start, end);
    });
  }, [vehicleId]);

  useEffect(() => {
    if (user && wizard.step === 4) {
      paymentMethodService.getMyCards().then(cards => {
        setSavedCards(cards);
        const defaultCard = cards.find(c => c.isDefault);
        if (defaultCard) {
          setSelectedCardId(defaultCard.id);
          setCardNumber(`•••• •••• •••• ${defaultCard.last4}`);
          setCardName(defaultCard.brand || 'Card');
        } else if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
          setCardNumber(`•••• •••• •••• ${cards[0].last4}`);
          setCardName(cards[0].brand || 'Card');
        } else {
          setShowNewCardForm(true);
        }
      });
    }
  }, [wizard.step, user]);

  const days = wizard.startDate && wizard.endDate ? calculateDays(wizard.startDate, wizard.endDate) : 1;
  const basePrice = vehicle ? vehicle.pricePerDay * days : 0;
  const insuranceFee = (wizard.includeInsurance && vehicle) ? Math.round(vehicle.pricePerDay * 0.15 * days) : 0;
  
  let deliveryFee = 0;
  let customFees = 0;
  let businessDiscount = 0;

  if (vehicle?.vehicleType === 'car') {
    deliveryFee = wizard.includeDelivery ? 200000 : 0;
    if (hasChauffeur) customFees += 500000 * days;
    if (weddingPackage) customFees += 1500000;
    if (businessPackage) businessDiscount = Math.round(basePrice * 0.1);
  } else if (vehicle?.vehicleType === 'motorbike') {
    deliveryFee = 0;
    if (hasHelmet) customFees += 20000 * days;
    if (hasRaincoat) customFees += 10000 * days;
    if (hasPhoneHolder) customFees += 10000 * days;
    if (hasTouringPackage) customFees += 100000 * days;
  }

  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.08);
  const subtotal = basePrice + insuranceFee + deliveryFee + customFees + serviceFee + taxes - businessDiscount;
  const totalCost = subtotal - wizard.discount;

  const canProceed = () => {
    switch (wizard.step) {
      case 1: return !!wizard.startDate && !!wizard.endDate && wizard.startDate < wizard.endDate;
      case 2: return true;
      case 3: return true;
      case 4: {
        if (!vehicle) return false;
        if (!paymentMethod) return false;
        if (paymentMethod === 'wallet') {
          if ((user?.walletBalance || 0) < totalCost) return false;
        }
        return true;
      }
      default: return true;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.warning(
        isVi ? 'Thiếu thông tin' : 'Missing information',
        isVi ? 'Vui lòng hoàn thành tất cả các trường bắt buộc' : 'Please complete all required fields'
      );
      return;
    }

    if (wizard.step === 4) {
      setProcessing(true);
      try {
        // 1. Create booking
        const wizardState = wizard.toWizardState();
        const booking = await bookingService.create(
          wizardState,
          user!.id,
          vehicle?.vehicleType,
          {
            hasChauffeur,
            weddingPackage,
            businessPackage,
            hasHelmet,
            hasRaincoat,
            hasPhoneHolder,
            hasTouringPackage,
            insuranceTier: 'premium'
          }
        );

        // 2. Process payment
        const returnUrl = `${window.location.origin}/payment/${paymentMethod.toLowerCase()}/return`;
        const paymentResult = await paymentService.processPayment(
          booking.id,
          paymentMethod,
          booking.pricing?.total || totalCost,
          returnUrl
        );

        if (paymentResult.success) {
          if (paymentResult.paymentUrl) {
            // Redirect to VNPay gateway
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
        } else {
          toast.error(
            isVi ? 'Thanh toán thất bại' : 'Payment failed',
            paymentResult.errorMessage || (isVi ? 'Vui lòng thử phương thức thanh toán khác.' : 'Please try a different payment method.')
          );
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          (isVi ? 'Đã xảy ra lỗi. Vui lòng thử lại.' : 'Something went wrong. Please try again.');
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
    const result = await paymentService.applyCoupon(couponInput, subtotal);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full"
            style={{ border: '3px solid #E2E8F0', borderTopColor: '#6366F1' }}
          />
          <p className="text-slate-500 text-sm font-medium">{isVi ? 'Đang tải thông tin xe...' : 'Loading vehicle details...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 50%, #F8FAFF 100%)' }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-5 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t.booking.back}
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1"
                style={{ background: 'linear-gradient(135deg, #1E293B 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {isVi ? 'Hoàn Tất Đặt Xe' : 'Complete Your Booking'}
              </h1>
              <p className="text-slate-500 text-sm">
                <span className="font-semibold text-slate-700">{vehicle.name}</span>
                <span className="mx-2 text-slate-300">·</span>
                {vehicle.location.city}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600">
                {isVi ? 'Đặt xe nhanh chóng' : 'Instant Booking'}
              </span>
            </div>
          </div>
        </motion.div>

        <StepIndicator current={wizard.step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* STEP 1 — Dates & Details */}
              {wizard.step === 1 && (
                <motion.div key="step1" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800">{t.booking.selectDates}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.booking.pickUp}</label>
                      <input
                        type="date"
                        value={wizard.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(e.target.value, wizard.endDate)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.booking.return}</label>
                      <input
                        type="date"
                        value={wizard.endDate}
                        min={wizard.startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => wizard.setDates(wizard.startDate, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>

                  {wizard.startDate && wizard.endDate && wizard.startDate < wizard.endDate && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                      style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE' }}>
                      <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="text-sm text-indigo-700">
                        {isVi ? 'Thời gian thuê:' : 'Rental duration:'}{' '}
                        <strong>{days} {t.booking.totalDays}{days > 1 && !isVi ? 's' : ''}</strong>
                        <span className="ml-2 text-indigo-500">· {formatCurrency(vehicle.pricePerDay)} × {days} = {formatCurrency(basePrice)}</span>
                      </span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {isVi ? 'Yêu cầu đặc biệt (tùy chọn)' : 'Special Requests (optional)'}
                    </label>
                    <textarea
                      value={wizard.notes}
                      onChange={e => wizard.setNotes(e.target.value)}
                      rows={3}
                      placeholder={isVi ? 'Nhập yêu cầu đặc biệt hoặc hướng dẫn nhận xe...' : 'Any special requests, pickup instructions, etc.'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                    />
                  </div>

                  {vehicle.rules.length > 0 && (
                    <div className="mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {isVi ? 'Quy định thuê xe' : 'Rental Rules'}
                      </p>
                      <ul className="space-y-1">
                        {vehicle.rules.slice(0, 4).map(rule => (
                          <li key={rule} className="flex items-center gap-2 text-xs text-amber-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                            {rule}
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
                  <motion.div
                    onClick={() => wizard.setInsurance(!wizard.includeInsurance)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                      wizard.includeInsurance ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        wizard.includeInsurance ? 'bg-indigo-500' : 'bg-slate-100'
                      }`}>
                        <Shield className={`w-6 h-6 ${wizard.includeInsurance ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">{isVi ? 'Bảo hiểm Premium' : 'Premium Insurance'}</h3>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{formatVND(Math.round(vehicle.pricePerDay * 0.15))}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {isVi ? 'Bảo vệ toàn diện, không tự thương, chống trộm & hư hỏng' : 'Zero excess, theft & comprehensive damage protection'}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        wizard.includeInsurance ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                      }`}>
                        {wizard.includeInsurance && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </motion.div>

                  {/* Dynamic Render based on Vehicle Type */}
                  {vehicle.vehicleType === 'car' ? (
                    <>
                      {/* Car: Airport Delivery */}
                      {(vehicle.airportDelivery || vehicle.deliveryAvailable) && (
                        <motion.div
                          onClick={() => wizard.setDelivery(!wizard.includeDelivery)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            wizard.includeDelivery ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Giao xe tại sân bay' : 'Airport Delivery'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(200000)}</p>
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
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
                                onClick={e => e.stopPropagation()}
                                onChange={e => wizard.setDelivery(true, e.target.value)}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Car: Chauffeur Service */}
                      {vehicle.hasChauffeur && (
                        <motion.div
                          onClick={() => setHasChauffeur(!hasChauffeur)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasChauffeur ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Thuê tài xế riêng' : 'Chauffeur Service'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(500000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {isVi ? 'Tài xế chuyên nghiệp, lịch sự, thông thạo đường phố' : 'Professional, polite driver who knows the city inside out'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasChauffeur ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}>
                              {hasChauffeur && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Car: Wedding Package */}
                      {vehicle.weddingRental && (
                        <motion.div
                          onClick={() => setWeddingPackage(!weddingPackage)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            weddingPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Gói xe hoa đám cưới' : 'Wedding Package Decor'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(1500000)}</p>
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
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            businessPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Gói thuê doanh nghiệp (VAT)' : 'Business Corporate Package'}</h3>
                                <p className="font-bold text-slate-800">-{isVi ? 'Giảm 10%' : '10% Off'}</p>
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
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasHelmet ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Thuê mũ bảo hiểm' : 'Premium Helmet Rental'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(20000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
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
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasRaincoat ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Thuê áo mưa' : 'Raincoat Included'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(10000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
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
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasPhoneHolder ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Kẹp điện thoại' : 'Phone Holder'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(10000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
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
                          className={`bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-200 shadow-lg shadow-slate-900/5 ${
                            hasTouringPackage ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
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
                                <h3 className="font-bold text-slate-800">{isVi ? 'Gói hành lý touring' : 'Touring Rack & Boxes'}</h3>
                                <p className="font-bold text-slate-800">{formatVND(100000)}<span className="text-xs text-slate-400 font-normal">/{isVi ? 'ngày' : 'day'}</span></p>
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
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5 p-5">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      {t.booking.applyCoupon}
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        placeholder="LUXE20, WELCOME15, VIP25..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono tracking-widest"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                        className="px-5 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 whitespace-nowrap transition-all"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isVi ? 'Áp dụng' : 'Apply')}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                    {wizard.couponCode && wizard.discount > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">{wizard.couponCode}</span> {isVi ? 'đã áp dụng — Tiết kiệm' : 'applied — You save'} {formatCurrency(wizard.discount)}!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Review */}
              {wizard.step === 3 && (
                <motion.div key="step3" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800">
                      {isVi ? 'Xem Lại Đặt Xe' : 'Review Your Booking'}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: isVi ? 'Phương tiện' : 'Vehicle', value: vehicle.name },
                      { label: isVi ? 'Ngày nhận xe' : 'Pick-up', value: formatDate(wizard.startDate, 'long') },
                      { label: isVi ? 'Ngày trả xe' : 'Return', value: formatDate(wizard.endDate, 'long') },
                      { label: isVi ? 'Thời gian thuê' : 'Duration', value: `${days} ${t.booking.totalDays}${days > 1 && !isVi ? 's' : ''}` },
                      { label: isVi ? 'Địa điểm' : 'Location', value: `${vehicle.location.city}, ${vehicle.location.country}` },
                      { label: isVi ? 'Bảo hiểm' : 'Insurance', value: wizard.includeInsurance ? (isVi ? `Premium (${formatCurrency(Math.round(vehicle.pricePerDay * 0.15))}/ngày)` : `Premium (${formatCurrency(Math.round(vehicle.pricePerDay * 0.15))}/day)`) : (isVi ? 'Không có' : 'None') },
                      { label: isVi ? 'Giao xe' : 'Delivery', value: wizard.includeDelivery ? (isVi ? 'Có - Giao tận nơi' : 'Yes - Door to door') : (isVi ? 'Tự nhận xe' : 'Self pickup') },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-500">{item.label}</span>
                        <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 rounded-2xl flex items-start gap-3"
                    style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
                    <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{isVi ? 'Hủy chuyến miễn phí' : 'Free Cancellation'}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {isVi ? 'Hủy miễn phí lên đến 48 giờ trước khi nhận xe.' : 'Cancel for free up to 48 hours before pickup.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Payment */}
              {wizard.step === 4 && (
                <motion.div key="step4" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800">
                      {isVi ? 'Chọn phương thức thanh toán' : 'Payment Method'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <PaymentMethodCard
                      id="momo"
                      label="MoMo"
                      sublabel={isVi ? 'Ví điện tử MoMo' : 'MoMo e-Wallet'}
                      icon={<span className="text-pink-650 font-black">M</span>}
                      selected={paymentMethod === 'momo'}
                      onClick={() => setPaymentMethod('momo')}
                      badge={isVi ? 'Khuyên dùng' : 'Recommended'}
                    />
                    <PaymentMethodCard
                      id="payos"
                      label="PayOS"
                      sublabel={isVi ? 'Chuyển khoản nhanh 24/7' : 'Quick QR Transfer'}
                      icon={<Zap className="w-5 h-5 text-emerald-500" />}
                      selected={paymentMethod === 'payos'}
                      onClick={() => setPaymentMethod('payos')}
                    />
                    <PaymentMethodCard
                      id="vnpay"
                      label="VNPay"
                      sublabel={isVi ? 'Ngân hàng VN, QR Pay' : 'Vietnam Banks, QR Pay'}
                      icon={<span>🏦</span>}
                      selected={paymentMethod === 'vnpay'}
                      onClick={() => setPaymentMethod('vnpay')}
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
                      className="p-5 rounded-2xl mb-4 font-sans"
                      style={{ background: 'linear-gradient(135deg, #FFF0F6, #FFF5F9)', border: '1px solid #FBCFE8' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-5 h-5 rounded bg-pink-500 text-white font-bold flex items-center justify-center text-xs">M</span>
                        <p className="font-bold text-pink-800">{isVi ? 'Thanh toán qua MoMo' : 'Pay with MoMo e-Wallet'}</p>
                      </div>
                      <p className="text-sm text-pink-700">
                        {isVi
                          ? 'Bạn sẽ được chuyển hướng tới cổng thanh toán MoMo để thực hiện giao dịch.'
                          : "You'll be redirected to MoMo's secure payment gateway."}
                      </p>
                    </motion.div>
                  )}

                  {/* PayOS info */}
                  {paymentMethod === 'payos' && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="p-5 rounded-2xl mb-4 font-sans"
                      style={{ background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)', border: '1px solid #A7F3D0' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-emerald-500" />
                        <p className="font-bold text-emerald-800">{isVi ? 'Thanh toán qua PayOS' : 'Pay with PayOS'}</p>
                      </div>
                      <p className="text-sm text-emerald-700">
                        {isVi
                          ? 'Quét mã QR chuyển khoản ngân hàng nhanh 24/7 qua cổng PayOS.'
                          : 'Scan the QR code to complete a quick 24/7 bank transfer via PayOS.'}
                      </p>
                    </motion.div>
                  )}

                  {/* VNPay info */}
                  {paymentMethod === 'vnpay' && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="p-5 rounded-2xl mb-4 font-sans"
                      style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                        <p className="font-bold text-indigo-800">{isVi ? 'Thanh toán qua VNPay' : 'Pay with VNPay Gateway'}</p>
                      </div>
                      <p className="text-sm text-indigo-600 mb-3">
                        {isVi
                          ? 'Bạn sẽ được chuyển hướng tới cổng thanh toán an toàn của VNPay để thực hiện giao dịch.'
                          : "You'll be redirected to VNPay's secure payment gateway."}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['Vietcombank', 'BIDV', 'Techcombank', 'VietinBank', 'MBBank'].map(bank => (
                          <span key={bank} className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-xs font-semibold shadow-sm border border-slate-200">
                            {bank}
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
                                    isSelected ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-100 hover:border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">💳</span>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800 uppercase">
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
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
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
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all uppercase tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{isVi ? 'Số thẻ' : 'Card Number'}</label>
                            <div className="relative">
                              <input
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                placeholder="0000 0000 0000 0000"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-mono pr-12"
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
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                              <input
                                value={cardCVC}
                                onChange={e => setCardCVC(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-mono"
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
                        </div>
                      </div>
                      {(user?.walletBalance || 0) < totalCost ? (
                        <div className="mt-2 p-3 bg-red-50 rounded-xl flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-xs text-red-600 font-semibold">
                            {isVi
                              ? `⚠️ Số dư không đủ. Cần thêm ${formatCurrency(totalCost - (user?.walletBalance || 0))}. Vui lòng nạp tiền trong dashboard.`
                              : `⚠️ Insufficient. Need ${formatCurrency(totalCost - (user?.walletBalance || 0))} more. Please top up in dashboard.`}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 text-emerald-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>{isVi ? 'Số dư đủ để thanh toán' : 'Sufficient balance for this booking'}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    {isVi ? 'Thông tin thanh toán được mã hóa SSL 256-bit' : 'Payments are encrypted with 256-bit SSL'}
                  </div>
                </motion.div>
              )}

              {/* STEP 5 — Success */}
              {wizard.step === 5 && (
                <motion.div key="step5" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-10 text-center overflow-hidden relative">
                  {/* Confetti-like decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-2"
                    style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899, #F59E0B, #10B981)' }} />

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 mt-2"
                    style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' }}
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </motion.div>

                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <h2 className="font-display text-3xl font-bold mb-2"
                      style={{ background: 'linear-gradient(135deg, #1E293B, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {isVi ? 'Đặt Xe Thành Công! 🎉' : 'Booking Confirmed! 🎉'}
                    </h2>
                    <p className="text-slate-500 mb-4">
                      {isVi ? 'Đơn đặt xe của bạn đã được ghi nhận thành công.' : 'Your booking has been successfully placed.'}
                    </p>
                    {bookingId && (
                      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl mb-6">
                        <span className="text-xs text-slate-500">{isVi ? 'Mã Đặt Xe:' : 'Booking ID:'}</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">#{bookingId.slice(-8).toUpperCase()}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8 max-w-sm mx-auto space-y-2.5 text-sm">
                      {[
                        { label: isVi ? 'Xe' : 'Vehicle', value: vehicle.name },
                        { label: t.booking.pickUp, value: formatDate(wizard.startDate, 'short') },
                        { label: t.booking.return, value: formatDate(wizard.endDate, 'short') },
                        { label: isVi ? 'Tổng tiền' : 'Total', value: formatVND(totalCost) },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-bold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 mb-8">
                      {isVi ? 'Email xác nhận đã được gửi. Chủ xe sẽ liên hệ trong vòng 2 giờ.' : 'A confirmation email has been sent. The owner will contact you within 2 hours.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <motion.button
                        onClick={() => { wizard.reset(); navigate('/dashboard/bookings'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 text-white font-bold rounded-2xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                      >
                        {isVi ? 'Xem Đơn Đặt Xe' : 'View My Bookings'}
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => { wizard.reset(); navigate('/marketplace'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-2xl border-2 border-slate-200 text-slate-700 hover:border-indigo-300 transition-colors"
                      >
                        {isVi ? 'Thuê Thêm Xe Khác' : 'Browse More Vehicles'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {wizard.step < 5 && (
              <div className="flex justify-between mt-6">
                <motion.button
                  onClick={() => wizard.step > 1 ? wizard.setStep(wizard.step - 1) : navigate(-1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.booking.back}
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed() || processing}
                  whileHover={{ scale: canProceed() && !processing ? 1.03 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-bold text-sm disabled:opacity-50 shadow-lg transition-all"
                  style={{ background: !canProceed() || processing ? '#94A3B8' : 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {isVi ? 'Đang xử lý...' : 'Processing...'}</>
                  ) : wizard.step === 4 ? (
                    <><Lock className="w-4 h-4" /> {isVi ? 'Thanh toán' : 'Pay'} {formatVND(totalCost)}</>
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
              extras={{
                insurance: wizard.includeInsurance,
                delivery: wizard.includeDelivery,
                addons: wizard.selectedAddons,
                hasChauffeur,
                weddingPackage,
                businessPackage,
                hasHelmet,
                hasRaincoat,
                hasPhoneHolder,
                hasTouringPackage
              }}
              couponDiscount={wizard.discount}
            />
          </div>
        </div>
      </div>
      {isBlocked && blockReason && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end justify-center md:items-center p-0 md:p-4 overflow-y-auto">
          <motion.div 
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="w-full max-w-3xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_-15px_30px_rgba(0,0,0,0.15)] border border-slate-100 p-6 md:p-8 select-none relative pb-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Top Drag Indicator Line */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden" />

            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 flex-shrink-0 shadow-sm animate-pulse">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-800">
                    {blockReason.status === 'incompatible' 
                      ? (isVi ? 'Yêu cầu bằng lái tương thích' : 'Compatible License Required')
                      : (isVi ? 'Cập nhật bằng lái xe (GPLX)' : 'Driving License Required')
                    }
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    blockReason.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : blockReason.status === 'incompatible' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-indigo-100 text-indigo-850'
                  }`}>
                    {blockReason.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {blockReason.status === 'incompatible'
                    ? (isVi 
                        ? `Xe này yêu cầu bằng lái ô tô (hạng B1, B2, C, D...). Bằng lái hiện tại của bạn là hạng [${licenseClass || 'Chưa cập nhật'}]. Vui lòng cập nhật bằng lái phù hợp.`
                        : `This vehicle requires a car driving license (B1, B2, C, D...). Your current license class is [${licenseClass || 'N/A'}]. Please update your license.`)
                    : (isVi 
                        ? 'Để tiếp tục đặt xe, vui lòng cập nhật thông tin giấy phép lái xe hợp lệ của bạn dưới đây.'
                        : 'To proceed with this booking, please update and verify your driving license details below.')
                  }
                </p>
              </div>
            </div>

            {/* Check Details Container */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/50">
                <span className="text-slate-500 font-semibold">{isVi ? '1. Định danh cá nhân (KYC)' : '1. Identity KYC Status'}</span>
                <span className={`font-bold ${user?.kycStatus === 'VERIFIED' ? 'text-emerald-600' : user?.kycStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {user?.kycStatus === 'VERIFIED' ? '✓ VERIFIED' : user?.kycStatus === 'PENDING' ? '⏳ PENDING REVIEW' : '✗ NOT VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/50">
                <span className="text-slate-500 font-semibold">{isVi ? '2. Bằng lái xe (Driver License)' : '2. Driving License Status'}</span>
                <span className={`font-bold ${user?.driverLicenseStatus === 'VERIFIED' ? 'text-emerald-600' : user?.driverLicenseStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {user?.driverLicenseStatus === 'VERIFIED' ? '✓ VERIFIED' : user?.driverLicenseStatus === 'PENDING' ? '⏳ PENDING REVIEW' : '✗ NOT VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">{isVi ? '3. Hạng bằng lái hiện tại' : '3. Current License Class'}</span>
                <span className={`font-bold ${isLicenseCompatible ? 'text-emerald-600' : 'text-red-500'}`}>
                  {user?.licenseClass ? `${user?.licenseClass} (${isLicenseCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'})` : 'None'}
                </span>
              </div>
            </div>

            {/* Form Section */}
            {blockReason.status === 'pending' ? (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3 animate-spin">
                  <Loader2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{isVi ? 'Đang chờ xét duyệt' : 'Under Review'}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {blockReason.description}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-4 px-6 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isVi ? 'Quay lại cửa hàng' : 'Back to Marketplace'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyLicense} className="space-y-5 mb-6">
                <h4 className="text-sm font-black text-slate-700 tracking-wide uppercase">{isVi ? 'Nhập thông tin GPLX của bạn' : 'Enter Driving License Details'}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{isVi ? 'Họ và tên chủ bằng' : 'License Holder Name'}</label>
                      <input
                        type="text"
                        value={gplxName}
                        onChange={(e) => setGplxName(e.target.value.toUpperCase())}
                        placeholder={isVi ? 'VD: GIANG NGUYỄN' : 'e.g. GIANG NGUYEN'}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{isVi ? 'Số GPLX' : 'License Number'}</label>
                      <input
                        type="text"
                        value={gplxNumber}
                        onChange={(e) => setGplxNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder={isVi ? 'Nhập 12 chữ số' : 'Enter 12 digits'}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        maxLength={12}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{isVi ? 'Hạng bằng lái (GPLX)' : 'GPLX Class'}</label>
                      <select
                        value={gplxClass}
                        onChange={(e) => setGplxClass(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="A1">{isVi ? 'Hạng A1 (Xe máy <= 175cc)' : 'Class A1 (Motorcycle <= 175cc)'}</option>
                        <option value="A">{isVi ? 'Hạng A / A2 (Xe máy lớn)' : 'Class A / A2 (Big Motorcycle)'}</option>
                        <option value="B1">{isVi ? 'Hạng B1 (Ô tô số tự động)' : 'Class B1 (Automatic Car)'}</option>
                        <option value="B2">{isVi ? 'Hạng B2 (Ô tô số sàn & số tự động)' : 'Class B2 (Manual & Auto Car)'}</option>
                        <option value="C">{isVi ? 'Hạng C (Xe tải > 3.500kg)' : 'Class C (Trucks)'}</option>
                        <option value="D">{isVi ? 'Hạng D / E / F (Xe khách, tải nặng)' : 'Class D / E / F (Heavy Vehicles)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Photo Uploads */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500">{isVi ? 'Ảnh chụp bằng lái' : 'GPLX Photos'}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front Side */}
                      <div 
                        onClick={() => setFrontImageMock('front_uploaded')}
                        className={`aspect-[1.58] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          frontImageMock 
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-600 font-bold' 
                            : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 hover:border-slate-300 text-slate-400'
                        }`}
                      >
                        {frontImageMock ? (
                          <>
                            <Check className="w-6 h-6 mb-1 text-emerald-500" />
                            <span className="text-[10px]">{isVi ? 'Mặt trước ✓' : 'Front Side ✓'}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-500">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold">{isVi ? 'Mặt trước' : 'Front Side'}</span>
                          </>
                        )}
                      </div>

                      {/* Back Side */}
                      <div 
                        onClick={() => setBackImageMock('back_uploaded')}
                        className={`aspect-[1.58] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          backImageMock 
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-600 font-bold' 
                            : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 hover:border-slate-300 text-slate-400'
                        }`}
                      >
                        {backImageMock ? (
                          <>
                            <Check className="w-6 h-6 mb-1 text-emerald-500" />
                            <span className="text-[10px]">{isVi ? 'Mặt sau ✓' : 'Back Side ✓'}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-500">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold">{isVi ? 'Mặt sau' : 'Back Side'}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      {isVi 
                        ? 'Click vào khung để mô phỏng tải lên hình ảnh bằng lái.' 
                        : 'Click on a frame to simulate driving license image upload.'}
                    </p>
                  </div>
                </div>

                {/* Validation message */}
                {!isLocalCompatible && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs leading-relaxed"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{isVi ? 'Bằng lái xe không hợp lệ để thuê ô tô' : 'Incompatible Driving License'}</p>
                      <p className="mt-1">
                        {isVi 
                          ? `Hạng bằng lái xe máy (A1/A) không được phép lái xe ô tô. Bạn bắt buộc phải cập nhật bằng lái hạng ô tô (B1, B2, C, D...) mới có thể thuê xe này.`
                          : `Motorcycle driving license (A1/A) cannot be used to drive cars. You must possess a B1, B2, C, or D class license to rent this car.`
                        }
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingLicense || !isLocalCompatible}
                    className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSubmittingLicense ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isVi ? 'Đang cập nhật...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {isVi ? 'Xác nhận & Cập nhật' : 'Confirm & Update'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3.5 px-6 border-2 border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isVi ? 'Quay lại cửa hàng' : 'Back to Marketplace'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingWizardPage;
