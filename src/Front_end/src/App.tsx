import React, { useEffect, Suspense, lazy, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { vehicleService } from '@/services/vehicleService';
import { authService } from '@/services/authService';
import { notificationService, reviewService } from '@/services/otherServices';
import { useToast } from '@/components/ui/Toast';
import type { Vehicle, Notification, Review } from '@/types';
import { formatDate } from '@/utils';
import { useT, translateNotification } from '@/i18n/translations';
const FloatingAIConcierge = lazy(() => import('@/components/help/FloatingAIConcierge').then(m => ({ default: m.FloatingAIConcierge })));

// Layouts
import MainLayout from '@/layouts/MainLayout';
import { RewardsDashboard } from '@/components/enterprise/RewardsDashboard';
import { CorporateDashboard } from '@/components/enterprise/CorporateDashboard';


// Pages (Eager loaded - critical path)
import LandingPage from '@/pages/landing/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth/AuthPages';
import OAuth2RedirectHandler from '@/pages/auth/OAuth2RedirectHandler';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import VehicleDetailPage from '@/pages/marketplace/VehicleDetailPage';
import CarsMarketplace from '@/pages/marketplace/CarsMarketplace';
import MotorbikeMarketplace from '@/pages/marketplace/MotorbikeMarketplace';
import CarDetails from '@/pages/marketplace/CarDetails';
import MotorbikeDetails from '@/pages/marketplace/MotorbikeDetails';
import BookingWizardPage from '@/pages/booking/BookingWizardPage';
import BookingCheckoutPage from '@/pages/booking/BookingCheckoutPage';
import VNPayReturnPage from '@/pages/booking/VNPayReturnPage';
import HelpPage from '@/pages/help/HelpPage';
import { OwnerSuccessHub } from '@/pages/help/OwnerSuccessHub';
import { PlatformStatus } from '@/pages/help/PlatformStatus';
import { SupportAnalyticsDash } from '@/pages/admin/SupportAnalyticsDash';

// Lazy loaded pages

const CustomerDashboardLayout = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.CustomerDashboardLayout })));
const CustomerOverview = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.CustomerOverview })));
const MyBookingsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.MyBookingsPage })));
const ProfilePage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.ProfilePage })));
const SecurityPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.SecurityPage })));
const MyDocuments = lazy(() => import('@/pages/dashboard/MyDocuments').then(m => ({ default: m.MyDocuments })));
const PaymentHistoryPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.PaymentHistoryPage })));
const SettingsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.SettingsPage })));
const LuxeWalletPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.LuxeWalletPage })));
const MyReviewsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.MyReviewsPage })));
const OwnerDashboardLayout = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerDashboardLayout })));
const OwnerOverview = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerOverview })));
const VehicleManagePage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleManagePage })));
const VehicleFormPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleFormPage })));
const OwnerCalendarPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerCalendarPage })));
const OwnerBookingsPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerBookingsPage })));
const OwnerRevenuePage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerRevenuePage })));
const BusinessOwnerDashboardLayout = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.BusinessOwnerDashboardLayout })));
const BusinessOverview = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.BusinessOverview })));
const FleetManagementPage = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.FleetManagementPage })));
const EmployeeManagementPage = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.EmployeeManagementPage })));
const DriverManagementPage = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.DriverManagementPage })));
const FleetAnalyticsPage = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.FleetAnalyticsPage })));
const CorporateReportsPage = lazy(() => import('@/pages/dashboard/BusinessOwnerDashboard').then(m => ({ default: m.CorporateReportsPage })));
const MessengerPage = lazy(() => import('@/pages/messages/MessengerPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const CustomerBookingPage = lazy(() => import('@/pages/booking/CustomerBookingPage'));
const OwnerBookingTrackingPage = lazy(() => import('@/pages/booking/OwnerBookingTrackingPage'));

// Static & feature pages
const AboutPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.PrivacyPage })));
const BusinessPage = lazy(() => import('@/pages/static/BusinessPage'));
const ComparePage = lazy(() => import('@/pages/compare/ComparePage'));
const ReviewsPage = lazy(() => import('@/pages/reviews/ReviewsPage').then(m => ({ default: m.ReviewsPage })));

// ====== AI CONCIERGE ERROR BOUNDARY ======
class ConciergeErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.warn('[AI Concierge] Suppressed error:', error.message); }
  render() { return this.state.hasError ? null : this.props.children; }
}

// ====== LOADING FALLBACK ======
const PageLoader: React.FC = () => {
  const { theme } = useUIStore();
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full"
        style={{ border: theme === 'dark' ? '3px solid #1E2D45' : '3px solid #E2E8F0', borderTopColor: '#3B82F6' }}
      />
    </div>
  );
};

// ====== PROTECTED ROUTE ======
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'customer' | 'owner' | 'business_owner' | 'admin' }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  if (requiredRole) {
    const roleUpper = user?.role?.toUpperCase();
    const accTypeUpper = user?.accountType?.toUpperCase();
    const userIsBusiness = roleUpper === 'BUSINESS_OWNER' || (roleUpper === 'OWNER' && accTypeUpper === 'BUSINESS');
    
    let authorized = false;
    if (requiredRole === 'admin') {
      // BUG-4/19 FIX: SUPER_ADMIN also gets admin access
      authorized = roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN';
    } else if (requiredRole === 'business_owner') {
      authorized = userIsBusiness;
    } else if (requiredRole === 'owner') {
      authorized = roleUpper === 'OWNER' && !userIsBusiness;
    } else if (requiredRole === 'customer') {
      authorized = roleUpper === 'CUSTOMER';
    }
    
    if (!authorized) {
      return <Navigate to="/403" replace />;
    }
  }
  return <>{children}</>;
};

// ====== FORBIDDEN 403 PAGE ======
const ForbiddenPage: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const getBackRoute = () => {
    if (!user) return '/';
    const roleUpper = user.role?.toUpperCase();
    const accTypeUpper = user.accountType?.toUpperCase();
    // BUG-4 FIX: SUPER_ADMIN routes to /admin
    if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN') return '/admin';
    if (roleUpper === 'BUSINESS_OWNER' || (roleUpper === 'OWNER' && accTypeUpper === 'BUSINESS')) return '/business';
    if (roleUpper === 'OWNER') return '/owner';
    return '/dashboard';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      <div className="text-center max-w-md p-8 rounded-[2rem] glass dark:glass-dark border border-red-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg">
          <span className="text-2xl">🛡️</span>
        </div>
        <h1 className="text-display text-4xl font-extrabold mb-2 text-red-500 tracking-tight">403</h1>
        <h2 className="text-xl font-bold mb-3 tracking-tight">Access Denied</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your credentials do not grant access to this secure node. Please check your privileges or contact the platform administrator.
        </p>
        <button onClick={() => navigate(getBackRoute())} className="btn-primary w-full py-3.5 bg-gradient-to-r from-red-650 to-rose-650 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/15 hover-lift">
          Return to Portal
        </button>
      </div>
    </div>
  );
};

// ====== NOT FOUND ======
const NotFoundPage: React.FC = () => {
  const t = useT();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div className="text-center">
        <div className={`text-8xl font-display font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>404</div>
        <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Page not found</h1>
        <p className="text-slate-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a href="/" className="btn-primary">{t.landing.howItWorks.btn}</a>
      </div>
    </div>
  );
};

// ====== WISHLIST PAGE ======
const WishlistPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    vehicleService.getWishlist(user?.id || '').then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.dashboard.wishlist}</h1>
        {!loading && vehicles.length > 0 && (
          <span className="px-3 py-1 bg-accent/10 text-accent font-semibold rounded-full text-sm">
            {vehicles.length} saved
          </span>
        )}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-[2rem] bg-[var(--lw-bg-card)] border border-[var(--lw-border)] shadow-xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
            <Heart className="w-8 h-8 text-[var(--lw-accent)] fill-[var(--lw-accent)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--lw-text-primary)] mb-2">
            Your Wishlist is Empty
          </h3>
          <p className="text-sm text-[var(--lw-text-secondary)] mb-6 max-w-sm">
            Save your favorite luxury vehicles to view them later and easily book them when you are ready.
          </p>
          <Link to="/marketplace" className="btn-primary bg-[var(--lw-accent)] hover:bg-[var(--lw-accent-alt)] text-white shadow-lg shadow-[var(--lw-accent-glow)] font-bold transition-all px-6 py-3 rounded-xl">
            {t.dashboard.exploreVehicles}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="relative group">
              <VehicleCard vehicle={v} />
              <button 
                onClick={() => {
                  if (user?.id) vehicleService.toggleWishlist(v.id, user.id);
                  setVehicles(prev => prev.filter(veh => veh.id !== v.id));
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm backdrop-blur-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ====== NOTIFICATIONS PAGE ======
const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (user) notificationService.getByUser(user.id).then(setNotifications);
  }, [user]);

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.dashboard.notifications}</h1>
        <button onClick={() => notificationService.markAllRead(user?.id || '')} className="text-sm text-accent font-medium">
          Mark all read
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`luxury-card p-4 cursor-pointer ${!n.read ? 'border-l-4 border-l-accent' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${!n.read ? 'text-accent' : isDark ? 'text-white' : 'text-[#0F172A]'}`}>{translateNotification(n.title)}</p>
                <p className="text-sm text-slate-500 mt-0.5">{translateNotification(n.body)}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0 mt-1" />}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-slate-400">{t.dashboard.noNotifications}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ====== OTP PAGE ======
const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useUIStore();
  const t = useT();
  const toast = useToast();
  const isDark = theme === 'dark';
  
  const queryEmail = new URLSearchParams(location.search).get('email') || '';
  const queryToken = new URLSearchParams(location.search).get('token') || '';
  const stateEmail = (location.state as any)?.email || '';
  const email = queryEmail || stateEmail;

  const [step, setStep] = React.useState<'otp' | 'reset'>(queryToken ? 'reset' : 'otp');
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = React.useState(queryToken);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const inputs = React.useRef<HTMLInputElement[]>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    const entered = code.join('');
    setLoading(true);
    try {
      const token = await authService.verifyOTP(email, entered);
      if (token) {
        setResetToken(token);
        setStep('reset');
        toast.success('OTP Verified', 'Please enter your new password.');
      } else {
        toast.error('Invalid OTP', 'The verification code was rejected.');
      }
    } catch (err: any) {
      toast.error('Verification Error', err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Invalid Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const ok = await authService.resetPassword(resetToken, newPassword);
      if (ok) {
        setSuccess(true);
        toast.success('Success', 'Your password has been reset successfully.');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    } catch (err: any) {
      toast.error('Reset Failed', err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div className="w-full max-w-md luxury-card p-8 text-center">
        {success ? (
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.auth.welcomeBack}</h2>
            <p className="text-slate-500 mt-2">{t.auth.signInSuccess}</p>
          </div>
        ) : step === 'otp' ? (
          <>
            <h1 className={`font-display text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Enter OTP</h1>
            <p className="text-slate-500 text-sm mb-4">Enter the 6-digit verification code sent to <strong>{email || 'your email'}</strong></p>
            <div className="flex gap-3 justify-center mb-6">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => { if (el) inputs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={c}
                  onChange={e => handleChange(e.target.value, i)}
                  className="w-12 h-14 text-center text-2xl font-bold lux-input rounded-2xl"
                />
              ))}
            </div>
            <button 
              onClick={handleVerify} 
              disabled={loading || code.join('').length < 6} 
              className="btn-primary w-full py-3.5 disabled:opacity-50 justify-center"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button onClick={() => navigate('/auth/login')} className="mt-3 text-sm text-slate-400 hover:text-accent transition-colors block mx-auto">
              ← {t.auth.backToLogin}
            </button>
          </>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-left">
            <h1 className={`font-display text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Reset Password</h1>
            <p className="text-slate-500 text-sm text-center mb-6">Create a strong new password for your account.</p>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.password}</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New Password (min 8 chars)"
                className="lux-input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="lux-input w-full"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-3.5 disabled:opacity-50 justify-center"
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ====== BOOKING SUCCESS PAGE ======
const BookingSuccessPage: React.FC = () => {
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className={`font-display text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.booking.bookingConfirmed}</h1>
        <p className="text-slate-500 mb-8">{t.booking.insurance}</p>
        <a href="/" className="btn-primary px-8 py-3">{t.landing.howItWorks.btn}</a>
      </div>
    </div>
  );
};

// ====== NOTIFICATIONS PAGE WRAPPER ======
const NotificationsPageWrapper: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen pt-20 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <NotificationsPage />
    </div>
  );
};

// ====== MAIN APP ======
const App: React.FC = () => {
  const { initAuth } = useAuthStore();
  const { theme, language } = useUIStore();

  useEffect(() => {
    initAuth();
    // Restore theme on load
    const stored = JSON.parse(localStorage.getItem('luxeway_ui_prefs') || '{}');
    if (stored?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync language and document direction (LTR/RTL)
  useEffect(() => {
    const isRtl = ['ar', 'he'].includes(language);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Sync theme changes to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<LandingPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="vehicles" element={<MarketplacePage />} />
            <Route path="search" element={<MarketplacePage />} />
            <Route path="map" element={<MarketplacePage forceMapOpen={true} />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="cars" element={<CarsMarketplace />} />
            <Route path="motorbikes" element={<MotorbikeMarketplace />} />
            <Route path="cars/:id" element={<VehicleDetailPage />} />
            <Route path="motorbikes/:id" element={<VehicleDetailPage />} />
            <Route path="booking/:vehicleId" element={
              <ProtectedRoute><BookingCheckoutPage /></ProtectedRoute>
            } />
            <Route path="payment/:bookingId" element={
              <ProtectedRoute><BookingWizardPage /></ProtectedRoute>
            } />
            <Route path="payment/vnpay/return" element={
              <ProtectedRoute><VNPayReturnPage /></ProtectedRoute>
            } />
            <Route path="success" element={<BookingSuccessPage />} />
            <Route path="bookings/:bookingId" element={
              <ProtectedRoute><Navigate to="/dashboard/bookings" replace /></ProtectedRoute>
            } />
            <Route path="owner/bookings/:bookingId" element={
              <ProtectedRoute><Navigate to="/owner/bookings" replace /></ProtectedRoute>
            } />
            <Route path="messages" element={
              <ProtectedRoute><MessengerPage /></ProtectedRoute>
            } />
            <Route path="notifications" element={
              <ProtectedRoute>
                <NotificationsPageWrapper />
              </ProtectedRoute>
            } />
            <Route path="help" element={<HelpPage />} />
            <Route path="help/status" element={<PlatformStatus />} />
            <Route path="help/owner-success" element={
              <ProtectedRoute><OwnerSuccessHub /></ProtectedRoute>
            } />
            <Route path="admin/support-analytics" element={
              <ProtectedRoute requiredRole="admin"><SupportAnalyticsDash /></ProtectedRoute>
            } />
            <Route path="compare" element={<ComparePage />} />
            <Route path="business" element={<BusinessPage />} />

            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />

            {/* Customer Dashboard */}
            <Route path="dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboardLayout /></ProtectedRoute>}>
              <Route index element={<CustomerOverview />} />
              <Route path="bookings" element={<MyBookingsPage />} />
              <Route path="bookings/:bookingId/tracking" element={<CustomerBookingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reviews" element={<MyReviewsPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="documents" element={<MyDocuments />} />
              <Route path="wallet" element={<LuxeWalletPage />} />
              <Route path="payments" element={<PaymentHistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="rewards" element={<RewardsDashboard />} />
              <Route path="corporate" element={<CorporateDashboard />} />
            </Route>

            {/* Owner Dashboard */}
            <Route path="owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboardLayout /></ProtectedRoute>}>
              <Route index element={<OwnerOverview />} />
              <Route path="vehicles" element={<VehicleManagePage />} />
              <Route path="vehicles/new" element={<VehicleFormPage />} />
              <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
              <Route path="analytics" element={<OwnerRevenuePage />} />
              <Route path="calendar" element={<OwnerCalendarPage />} />
              <Route path="bookings" element={<OwnerBookingsPage />} />
              <Route path="bookings/:bookingId/tracking" element={<OwnerBookingTrackingPage />} />
              <Route path="revenue" element={<OwnerRevenuePage />} />
              <Route path="fleet" element={<FleetManagementPage />} />
              <Route path="employees" element={<EmployeeManagementPage />} />
            </Route>

            {/* Business Owner Dashboard */}
            <Route path="business" element={<ProtectedRoute requiredRole="business_owner"><BusinessOwnerDashboardLayout /></ProtectedRoute>}>
              <Route index element={<BusinessOverview />} />
              <Route path="fleet" element={<FleetManagementPage />} />
              <Route path="employees" element={<EmployeeManagementPage />} />
              <Route path="drivers" element={<DriverManagementPage />} />
              <Route path="analytics" element={<FleetAnalyticsPage />} />
              <Route path="reports" element={<CorporateReportsPage />} />
            </Route>

            {/* Admin */}
            <Route path="admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          </Route>

          {/* Auth pages (separate - no navbar) */}
          <Route path="auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="otp" element={<OTPPage />} />
          </Route>

          <Route path="oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Forbidden 403 */}
          <Route path="403" element={<ForbiddenPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ConciergeErrorBoundary>
          <Suspense fallback={null}>
            <FloatingAIConcierge />
          </Suspense>
        </ConciergeErrorBoundary>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
