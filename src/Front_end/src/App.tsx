import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { initializeDatabase } from '@/mock/db';
import { useAuthStore, useUIStore } from '@/store';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { vehicleService } from '@/services/vehicleService';
import { notificationService } from '@/services/otherServices';
import type { Vehicle, Notification } from '@/types';

// Layouts
import RootLayout from '@/layouts/RootLayout';

// Pages (Eager loaded - critical path)
import LandingPage from '@/pages/landing/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth/AuthPages';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import VehicleDetailPage from '@/pages/marketplace/VehicleDetailPage';
import BookingWizardPage from '@/pages/booking/BookingWizardPage';
import HelpPage from '@/pages/help/HelpPage';

// Lazy loaded pages
const DashboardLayout = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.DashboardLayout })));
const CustomerOverview = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.CustomerOverview })));
const MyBookingsPage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.MyBookingsPage })));
const ProfilePage = lazy(() => import('@/pages/dashboard/CustomerDashboard').then(m => ({ default: m.ProfilePage })));
const OwnerOverview = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerOverview })));
const VehicleManagePage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleManagePage })));
const VehicleFormPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.VehicleFormPage })));
const OwnerCalendarPage = lazy(() => import('@/pages/dashboard/OwnerDashboard').then(m => ({ default: m.OwnerCalendarPage })));
const MessengerPage = lazy(() => import('@/pages/messages/MessengerPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// ====== LOADING FALLBACK ======
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-10 h-10 rounded-full"
      style={{ border: '3px solid #E2E8F0', borderTopColor: '#3B82F6' }}
    />
  </div>
);

// ====== PROTECTED ROUTE ======
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ====== NOT FOUND ======
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
    <div className="text-center">
      <div className="text-8xl font-display font-bold text-[#0F172A] mb-4">404</div>
      <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">Page not found</h1>
      <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  </div>
);

// ====== WISHLIST PAGE ======
const WishlistPage: React.FC = () => {
  const { user } = useAuthStore();
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
      <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-6">My Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="font-semibold text-[#0F172A] mb-2">No saved vehicles</h3>
          <p className="text-slate-400 text-sm mb-6">Browse and heart vehicles you love</p>
          <a href="/marketplace" className="btn-primary">Browse Marketplace</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}
    </div>
  );
};

// ====== NOTIFICATIONS PAGE ======
const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
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
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Notifications</h1>
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
                <p className={`text-sm font-semibold ${!n.read ? 'text-accent' : 'text-[#0F172A]'}`}>{n.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0 mt-1" />}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-slate-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ====== REVIEWS PUBLIC PAGE ======
const ReviewsPage: React.FC = () => {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  React.useEffect(() => { vehicleService.getAll({}, 1, 12).then(r => setVehicles(r.data)); }, []);
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-4xl font-bold text-[#0F172A] dark:text-white mb-2">Customer Reviews</h1>
        <p className="text-slate-500 mb-8">What our community says about LuxeWay</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="luxury-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <img src={v.thumbnailUrl} alt={v.name} className="w-12 h-12 rounded-2xl object-cover" />
                <div>
                  <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{v.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <span key={i} className={`text-xs ${i < Math.round(v.rating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>)}
                    <span className="text-xs text-slate-400 ml-1">{v.rating}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{v.name} was an incredible experience. Highly recommend!"</p>
              <p className="text-xs text-slate-400 mt-2">— Verified Renter</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== OTP PAGE ======
const OTPPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-slate-900">
      <div className="w-full max-w-md luxury-card p-8 text-center">
        {success ? (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">Verified!</h2>
            <p className="text-slate-500 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white mb-2">Enter OTP</h1>
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
              ← Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ====== MAIN APP ======
const App: React.FC = () => {
  const { initAuth } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    initializeDatabase();
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
            <Route path="search" element={<MarketplacePage />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="booking/:vehicleId" element={
              <ProtectedRoute><BookingWizardPage /></ProtectedRoute>
            } />
            <Route path="messages" element={
              <ProtectedRoute><MessengerPage /></ProtectedRoute>
            } />
            <Route path="notifications" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-20">
                  <NotificationsPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="help" element={<HelpPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
          </Route>

          {/* Auth pages */}
          <Route path="auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="otp" element={<OTPPage />} />
          </Route>

          {/* Customer Dashboard */}
          <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<CustomerOverview />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reviews" element={<NotificationsPage />} />
          </Route>

          {/* Owner Dashboard */}
          <Route path="owner" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<OwnerOverview />} />
            <Route path="vehicles" element={<VehicleManagePage />} />
            <Route path="vehicles/new" element={<VehicleFormPage />} />
            <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
            <Route path="analytics" element={<OwnerOverview />} />
            <Route path="calendar" element={<OwnerCalendarPage />} />
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
