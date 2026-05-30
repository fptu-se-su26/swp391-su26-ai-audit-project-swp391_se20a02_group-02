import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore, useUIStore } from '@/store';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { vehicleService } from '@/services/vehicleService';
import { notificationService, reviewService } from '@/services/otherServices';
import type { Vehicle, Notification, Review } from '@/types';
import { formatDate } from '@/utils';
import { useT } from '@/i18n/translations';

// Layouts
import RootLayout from '@/layouts/RootLayout';


// Pages (Eager loaded - critical path)
import LandingPage from '@/pages/landing/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth/AuthPages';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import VehicleDetailPage from '@/pages/marketplace/VehicleDetailPage';
import BookingWizardPage from '@/pages/booking/BookingWizardPage';
import VNPayReturnPage from '@/pages/booking/VNPayReturnPage';
import HelpPage from '@/pages/help/HelpPage';

// Lazy loaded pages

const DashboardLayout = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.DashboardLayout })));
const CustomerOverview = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.CustomerOverview })));
const MyBookingsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.MyBookingsPage })));
const ProfilePage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.ProfilePage })));
const SecurityPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.SecurityPage })));
const DocumentsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.DocumentsPage })));
const PaymentHistoryPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.PaymentHistoryPage })));
const SettingsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.SettingsPage })));
const LuxeWalletPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.LuxeWalletPage })));
const MyReviewsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.MyReviewsPage })));
const OwnerOverview = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerOverview })));
const VehicleManagePage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleManagePage })));
const VehicleFormPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleFormPage })));
const OwnerCalendarPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerCalendarPage })));
const OwnerBookingsPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerBookingsPage })));
const OwnerRevenuePage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerRevenuePage })));
const FleetManagementPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.FleetManagementPage })));
const EmployeeManagementPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.EmployeeManagementPage })));
const MessengerPage = lazy(() => import('@/pages/messages/MessengerPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// Static & feature pages
const AboutPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/static/StaticPages').then(m => ({ default: m.PrivacyPage })));
const BusinessPage = lazy(() => import('@/pages/static/BusinessPage'));
const ComparePage = lazy(() => import('@/pages/compare/ComparePage'));

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
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
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
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.dashboard.noBookings}</h3>
          <p className="text-slate-400 text-sm mb-6">{t.dashboard.noBookingsDesc}</p>
          <a href="/marketplace" className="btn-primary">{t.dashboard.exploreVehicles}</a>
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
                <p className={`text-sm font-semibold ${!n.read ? 'text-accent' : isDark ? 'text-white' : 'text-[#0F172A]'}`}>{n.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
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

// ====== REVIEWS PUBLIC PAGE ======
const ReviewsPage: React.FC = () => {
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  const [reviews, setReviews] = React.useState<Review[]>([]);
  
  React.useEffect(() => {
    reviewService.getAll().then(setReviews);
  }, []);

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className={`font-display text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.marketplace.reviews}</h1>
        <p className="text-slate-500 mb-8">{t.landing.testimonials.subtitle}</p>
        
        <div className={`flex items-center gap-6 mb-8 p-6 rounded-3xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="text-center">
            <p className={`text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{avgRating}</p>
            <div className="flex text-yellow-400 mt-1">
              {[...Array(5)].map((_, i) => <span key={i} className={i < Math.round(Number(avgRating)) ? 'text-yellow-400' : isDark ? 'text-slate-600' : 'text-slate-200'}>★</span>)}
            </div>
          </div>
          <div className={`w-px h-12 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          <div>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{reviews.length}</p>
            <p className="text-sm text-slate-500">{t.landing.testimonials.verified}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(review => {
            return (
              <div key={review.id} className="luxury-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>
                    U
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      User {(review.reviewerId || 'anon').substring(0, 4)}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : isDark ? 'text-slate-700' : 'text-slate-200'}`}>★</span>)}
                      <span className="text-xs text-slate-400 ml-1">{formatDate(review.createdAt, 'short')}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm italic mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>&quot;{review.comment}&quot;</p>
              </div>
            );
          })}
          {reviews.length === 0 && (
            <p className="text-slate-500 col-span-full">{t.landing.testimonials.empty}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ====== OTP PAGE ======
const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [success, setSuccess] = React.useState(false);
  const inputs = React.useRef<HTMLInputElement[]>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleVerify = () => {
    const entered = code.join('');
    if (entered === '123456') {
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 2000);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div className="w-full max-w-md luxury-card p-8 text-center">
        {success ? (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t.auth.welcomeBack}</h2>
            <p className="text-slate-500 mt-2">{t.auth.signInSuccess}</p>
          </div>
        ) : (
          <>
            <h1 className={`font-display text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Enter OTP</h1>
            <p className="text-slate-500 text-sm mb-8">Enter the 6-digit code sent to your email. (Demo: <strong>123456</strong>)</p>
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
            <button onClick={handleVerify} disabled={code.join('').length < 6} className="btn-primary w-full py-3.5 disabled:opacity-50">
              Verify Code
            </button>
            <button onClick={() => navigate('/auth/login')} className="mt-3 text-sm text-slate-400 hover:text-accent transition-colors">
              ← {t.auth.backToLogin}
            </button>
          </>
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
  const { theme } = useUIStore();

  useEffect(() => {
    initAuth();
    // Restore theme on load
    const stored = JSON.parse(localStorage.getItem('luxeway_ui_prefs') || '{}');
    if (stored?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with Navbar */}
          <Route element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="vehicles" element={<MarketplacePage />} />
            <Route path="search" element={<MarketplacePage />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="booking/:vehicleId" element={
              <ProtectedRoute><BookingWizardPage /></ProtectedRoute>
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
            <Route path="compare" element={<ComparePage />} />
            <Route path="business" element={<BusinessPage />} />

            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
          </Route>

          {/* Auth pages */}
          <Route path="auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="otp" element={<OTPPage />} />
          </Route>

          {/* Customer Dashboard */}
          <Route path="dashboard" element={<ProtectedRoute requiredRole="customer"><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<CustomerOverview />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reviews" element={<MyReviewsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="wallet" element={<LuxeWalletPage />} />
            <Route path="payments" element={<PaymentHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Owner Dashboard */}
          <Route path="owner" element={<ProtectedRoute requiredRole="owner"><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<OwnerOverview />} />
            <Route path="vehicles" element={<VehicleManagePage />} />
            <Route path="vehicles/new" element={<VehicleFormPage />} />
            <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
            <Route path="analytics" element={<OwnerRevenuePage />} />
            <Route path="calendar" element={<OwnerCalendarPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="revenue" element={<OwnerRevenuePage />} />
            <Route path="fleet" element={<FleetManagementPage />} />
            <Route path="employees" element={<EmployeeManagementPage />} />
          </Route>

          {/* Admin */}
          <Route path="admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
