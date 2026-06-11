import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Heart, Bell, User, Shield, FileText,
  CreditCard, Settings, LogOut, ChevronRight, Car, Star, TrendingUp,
  Package, Clock, CheckCircle, AlertCircle, X, Menu, Eye, EyeOff, Users, Wallet,
  Loader2, Globe, Gift, Building2, Trash2
} from 'lucide-react';

import { useAuthStore, useUIStore } from '@/store';
import { bookingService, paymentService } from '@/services/bookingService';
import { notificationService, reviewService } from '@/services/otherServices';
import apiClient from '@/services/api';
import type { Booking, Notification } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getInitials } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useT, translateNotification } from '@/i18n/translations';

// ====== CUSTOMER SIDEBAR ======
const CustomerSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const language = useUIStore((s: any) => s.language) || 'en';
  const t = useT();

  const customerLinks = [
    { href: '/', icon: Globe, label: t.marketplace.home, exact: true },
    { href: '/dashboard', icon: LayoutDashboard, label: t.dashboard.overview, exact: true },
    { href: '/dashboard/bookings', icon: Calendar, label: t.dashboard.myBookings },
    { href: '/dashboard/wallet', icon: Wallet, label: t.wallet.title },
    { href: '/dashboard/payments', icon: CreditCard, label: t.dashboard.payments },
    { href: '/dashboard/documents', icon: FileText, label: t.dashboard.documents },
    { href: '/dashboard/reviews', icon: Star, label: t.dashboard.myReviews },
    {
      href: '/dashboard/rewards',
      icon: Gift,
      label: language === 'vi' ? 'Đổi Thưởng' :
             language === 'ja' ? 'ロイヤルティ特典' :
             language === 'ko' ? '로열티 리워드' :
             language === 'zh' ? '会员积分奖励' :
             language === 'fr' ? 'Récompenses' :
             language === 'de' ? 'Treueprämien' :
             language === 'es' ? 'Premios' :
             'Loyalty Rewards'
    },
    {
      href: '/dashboard/corporate',
      icon: Building2,
      label: language === 'vi' ? 'Cổng Doanh Nghiệp' :
             language === 'ja' ? '企業ポータル' :
             language === 'ko' ? '기업 포탈' :
             language === 'zh' ? '企业门户' :
             language === 'fr' ? 'Portail Entreprise' :
             language === 'de' ? 'Unternehmensportal' :
             language === 'es' ? 'Portal Corporativo' :
             'Corporate Portal'
    },
    { href: '/messages', icon: Bell, label: t.nav.messages },
    { href: '/dashboard/notifications', icon: Heart, label: t.dashboard.notifications },
    { href: '/dashboard/profile', icon: User, label: t.dashboard.profile },
    { href: '/dashboard/settings', icon: Settings, label: t.dashboard.settings },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C';
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col lg:relative lg:translate-x-0 pt-20 lg:pt-0"
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #111827 60%, #0d1527 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

        {/* User Info */}
        <div className="p-5 border-b relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover"
                style={{ boxShadow: '0 0 0 2px rgba(99,102,241,0.40)' }} />
            ) : (
              <div className="w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center text-slate-900 bg-gradient-to-br from-indigo-500 to-violet-600">
                {getInitials(user?.displayName || '')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.displayName}</p>
              <p className="text-xs truncate text-slate-400" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider mt-0.5 text-indigo-400">✨ CUSTOMER</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 relative z-10">
          {customerLinks.map(link => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
                style={{
                  color: active ? '#fff' : 'rgba(148,163,184,1)',
                  background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))' : undefined,
                  border: active ? '1px solid rgba(99,102,241,0.30)' : '1px solid transparent',
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-br from-indigo-500 to-violet-600" />
                )}
                <link.icon className="w-4 h-4 transition-colors flex-shrink-0"
                  style={{ color: active ? '#818CF8' : 'rgba(100,116,139,1)' }} />
                <span className="truncate">{link.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => { logout(); navigate('/auth/login'); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            {t.dashboard.signOut}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// ====== CUSTOMER DASHBOARD LAYOUT ======
export const CustomerDashboardLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated]);

  if (!user) return null;

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 pt-20 transition-colors duration-300 relative overflow-hidden"
      style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #070B14 0%, #0B1221 50%, #070B14 100%)' : 'linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 50%, #F8FAFF 100%)' }}>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />

      <div className="flex h-[calc(100vh-80px)] relative z-10">
        <CustomerSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ====== CUSTOMER OVERVIEW ======
export const CustomerOverview: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();
  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      bookingService.getByUser(user.id),
      notificationService.getByUser(user.id),
    ]).then(([b, n]) => {
      setBookings(b);
      setNotifications(n.slice(0, 5));
      setLoading(false);
    });
  }, [user]);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.pricing.total, 0),
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: t.dashboard.totalBookings, value: stats.total, icon: Calendar, color: '#6366F1', glow: 'rgba(99,102,241,0.3)', sub: t.dashboard.totalBookingsChange },
    { label: t.dashboard.activeRentals, value: stats.active, icon: Car, color: '#10B981', glow: 'rgba(16,185,129,0.3)', sub: t.dashboard.activeRentalsDesc },
    { label: t.dashboard.completedTrips, value: stats.completed, icon: CheckCircle, color: '#F59E0B', glow: 'rgba(245,158,11,0.3)', sub: t.dashboard.completedTripsDesc },
    { label: t.dashboard.totalSpent, value: formatCurrency(stats.spent), icon: CreditCard, color: '#EC4899', glow: 'rgba(236,72,153,0.3)', sub: t.dashboard.totalSpentDesc, isStr: true },
  ];

  const statusStyle: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
    confirmed: { bg: 'rgba(99,102,241,0.15)', text: '#818CF8' },
    active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
    completed: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  };

  return (
    <div className="space-y-5">
      {/* ---- TOP ROW: Hero + Stats ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Hero Featured Vehicle Card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[260px] shadow-2xl"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80"
            alt="Featured luxury car"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.55) 55%, rgba(7,11,20,0.20) 100%)' }} />

          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>✨ Recommended For You</span>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white">Available</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                  📍 Ho Chi Minh City, Vietnam
                </p>
                <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">Ferrari F8 Tributo</h2>
                <p className="text-xl font-extrabold mt-1" style={{ color: '#EAB308' }}>
                  {formatCurrency(8500000)}
                  <span className="text-sm font-semibold ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/day</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to="/marketplace"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}
                >
                  Book Now
                </Link>
                <div className="flex items-center gap-1 justify-center">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-white">5.0</span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>(128)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          className="lg:col-span-2 grid grid-cols-2 gap-3"
        >
          {statCards.map(stat => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              whileHover={{ y: -3, boxShadow: `0 15px 35px ${stat.glow}` }}
              className="rounded-2xl p-4 cursor-default transition-all duration-300 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="absolute top-0 right-0 w-14 h-14 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 blur-xl pointer-events-none"
                style={{ background: stat.color }} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}33` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p className="text-xl font-extrabold text-white tracking-tight leading-none">
                  {loading ? '—' : stat.value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{stat.label}</p>
                <p className="text-[10px] mt-1 font-medium" style={{ color: 'rgba(148,163,184,0.5)' }}>{stat.sub}</p>
              </div>
            </motion.div>
          ))}

          {/* Quick links card */}
          <motion.div
            variants={staggerItem}
            className="col-span-2 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(148,163,184,0.5)' }}>Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Explore Cars', href: '/marketplace', color: '#6366F1' },
                { label: 'Explore Motorbikes', href: '/motorbikes', color: '#8B5CF6' },
                { label: 'My Bookings', href: '/dashboard/bookings', color: '#F59E0B' },
                { label: 'My Profile', href: '/dashboard/profile', color: '#10B981' },
              ].map(q => (
                <Link key={q.label} to={q.href}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: `${q.color}18`, color: q.color, border: `1px solid ${q.color}30` }}
                >
                  {q.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ---- BOTTOM ROW: Recent Bookings + Notifications ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-2 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">{t.dashboard.recentBookings}</h3>
            <Link to="/dashboard/bookings" className="text-xs font-bold" style={{ color: '#818CF8' }}>{t.dashboard.viewAll} →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(148,163,184,0.3)' }} />
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(148,163,184,0.5)' }}>{t.dashboard.noBookings}</p>
              <Link to="/marketplace"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                {t.dashboard.exploreVehicles}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(booking => {
                const st = statusStyle[booking.status] || statusStyle['pending'];
                return (
                  <motion.div
                    key={booking.id}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Car className="w-5 h-5" style={{ color: 'rgba(148,163,184,0.6)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg block mb-1"
                        style={{ background: st.bg, color: st.text }}>{booking.status}</span>
                      <p className="text-xs font-bold text-white">{formatCurrency(booking.pricing.total)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-3xl p-5 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">{t.dashboard.notifications}</h3>
            <Link to="/dashboard/notifications" className="text-xs font-bold" style={{ color: '#818CF8' }}>{t.dashboard.viewAll}</Link>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 max-h-[340px] pr-1 sidebar-scroll">
            {notifications.length === 0 ? (
              <div className="text-center py-12 my-auto">
                <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(148,163,184,0.2)' }} />
                <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.4)' }}>{t.dashboard.noNotifications}</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id}
                  className="p-3.5 rounded-2xl transition-all duration-200"
                  style={{
                    background: !notif.read ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${!notif.read ? 'rgba(99,102,241,0.20)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  {!notif.read && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">New</span>
                    </div>
                  )}
                  <p className="font-bold text-xs text-white">{translateNotification(notif.title)}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'rgba(148,163,184,0.7)' }}>{translateNotification(notif.body)}</p>
                  <p className="text-[9px] mt-2" style={{ color: 'rgba(148,163,184,0.4)' }}>{formatDate(notif.createdAt, 'relative')}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ====== MY BOOKINGS PAGE ======
export const MyBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (!user) return;
    bookingService.getByUser(user.id).then(b => {
      setBookings(b);
      setLoading(false);
    });
  }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleCancel = async (bookingId: string) => {
    const updated = await bookingService.cancel(bookingId, 'Cancelled by user');
    if (updated) {
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      toast.success(t.dashboard.bookingCancelled, t.dashboard.bookingCancelledDesc);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">{t.dashboard.myBookings}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">{t.dashboard.myBookingsDesc}</p>
        </div>

        {/* Sleek Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-300 ${filter === status
                  ? 'border-accent bg-blue-500/10 text-accent shadow-sm'
                  : 'border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-slate-500/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${bookings.length})`}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-16 rounded-[2rem]">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{t.dashboard.noBookingsStatus}</h3>
          <p className="text-slate-400 text-xs font-medium mb-5">{t.dashboard.noBookingsDesc}</p>
          <Link to="/marketplace" className="btn-gold text-xs font-bold px-6 py-3 rounded-xl">{t.dashboard.exploreVehicles}</Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filtered.map(booking => (
            <motion.div key={booking.id} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] hover-lift hover-glow transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-500/10 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-200/20 dark:border-white/5">
                    <Car className="w-7 h-7 text-slate-400 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3.5 mb-1.5 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                      <span className={`badge text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-3">
                      📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.totalDays} {t.booking.totalDays}
                    </p>

                    {/* Small stats badges */}
                    <div className="flex items-center gap-5 flex-wrap">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.dashboard.bookingAmount}</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(booking.pricing.total)}</p>
                      </div>
                      <div className="h-6 w-px bg-slate-200/50 dark:bg-white/10" />
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.dashboard.refundableDeposit}</span>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{formatCurrency(booking.pricing.deposit)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex flex-row sm:flex-col gap-2 mt-4 sm:mt-0 flex-wrap justify-end">
                  <Link to={`/vehicles/${booking.vehicleId}`} className="btn-ghost text-xs px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-500/5 transition-all text-slate-600 dark:text-slate-300 font-bold">
                    {t.dashboard.viewVehicle}
                  </Link>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-xs font-bold px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl border border-red-200/50 dark:border-red-500/20 transition-all"
                    >
                      {t.dashboard.cancelBooking}
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.reviewId && (
                    <button className="btn-gold text-xs font-bold px-4 py-2.5 rounded-xl">
                      {t.dashboard.leaveReview}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}`
        </motion.div>
      )}
    </div>
  );
};

// ====== PROFILE PAGE ======
export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
  const t = useT();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateUser({
      firstName: form.firstName,
      lastName: form.lastName,
      displayName: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      bio: form.bio,
      location: form.location,
    });
    setSaving(false);
    toast.success(t.dashboard.profileUpdated, t.dashboard.profileUpdatedDesc);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">
        {t.dashboard.myProfile}
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center shadow-sm flex flex-col items-center">
          <div className="relative inline-block mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover mx-auto ring-4 ring-gold/20" />
            ) : (
              <div className="avatar w-24 h-24 rounded-3xl text-2xl mx-auto font-bold bg-gradient-to-br from-gold to-yellow-500 text-slate-900">{getInitials(user?.displayName || '')}</div>
            )}
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center text-xs shadow-md shadow-blue-500/30">✏️</button>
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white mt-2">{user?.displayName}</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-0.5">{user?.email}</p>

          <div className="mt-5 space-y-3 w-full border-t border-slate-200/40 dark:border-white/10 pt-4">
            {user?.verified && (
              <div className="flex items-center gap-2 justify-center text-xs font-bold text-green-600 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-200/20">
                <Shield className="w-4 h-4" /> {t.dashboard.identityVerified}
              </div>
            )}
            <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-500/5 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {(user?.rating ?? 0) > 0 ? t.dashboard.ratingCount.replace('{count}', String(user?.rating)) : t.dashboard.noRatingYet}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{t.dashboard.memberSince} {user?.joinedAt ? formatDate(user.joinedAt, 'short') : 'N/A'}</p>
          </div>
          {(user?.badges?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {user?.badges?.map(badge => (
                <span key={badge} className="badge-blue text-[10px] font-bold uppercase tracking-wider">{badge.replace('_', ' ')}</span>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 glass border border-slate-200/50 dark:border-white/5 p-6 md:p-8 rounded-[2rem] shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-5 border-b border-slate-200/30 dark:border-white/5 pb-3">{t.dashboard.personalInfo}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.firstName}</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="lux-input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.lastName}</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="lux-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.phone}</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="lux-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.location}</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" className="lux-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.bio}</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="lux-input resize-none"
                placeholder={t.dashboard.bioPlaceholder}
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary py-3 px-6 disabled:opacity-70"
              >
                {saving ? t.dashboard.saving : t.common.save}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ====== SECURITY PAGE ======
export const SecurityPage: React.FC = () => {
  const toast = useToast();
  const t = useT();
  const [currentPw, setCurrentPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [twoFA, setTwoFA] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error(t.auth.passwordMismatch, ''); return; }
    if (newPw.length < 8) { toast.error(t.auth.weakPassword, ''); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success(t.dashboard.passwordSuccess, t.dashboard.passwordSuccessDesc);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">
        {t.dashboard.securitySettings}
      </motion.h1>
      <div className="space-y-6">
        {/* Change Password */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-200/30 dark:border-white/5 pb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{t.dashboard.changePassword}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">{t.dashboard.changePasswordDesc}</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.currentPassword}</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="lux-input pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.newPassword}</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="lux-input pr-12" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.dashboard.confirmNewPassword}</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={`lux-input ${confirmPw && newPw !== confirmPw ? 'border-danger' : ''}`} placeholder="Repeat new password" required />
              {confirmPw && newPw !== confirmPw && <p className="text-danger text-xs mt-1">{t.auth.passwordMismatch}</p>}
            </div>
            <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary py-3 px-6 disabled:opacity-70 mt-2">
              {saving ? t.dashboard.saving : t.dashboard.updatePasswordBtn}
            </motion.button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t.dashboard.twoFactorAuth}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-0.5">{t.dashboard.twoFactorAuthDesc}</p>
              </div>
            </div>
            <button
              onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? '2FA Disabled' : '2FA Enabled', twoFA ? 'Two-factor auth disabled.' : '2FA is now active.'); }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${twoFA ? 'bg-success' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${twoFA ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {[
              { device: 'Chrome · Windows 11', location: 'Ho Chi Minh City, VN', time: 'Now', current: true },
              { device: 'Safari · iPhone 15', location: 'Ho Chi Minh City, VN', time: '2 hours ago', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${session.current ? 'bg-success shadow-lg shadow-green-500/40 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{session.device}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{session.location} · {session.time}</p>
                  </div>
                </div>
                {session.current ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-500/10 border border-green-200/10 px-2.5 py-1 rounded-lg">{t.dashboard.currentSession}</span>
                ) : (
                  <button className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-200/30 transition-colors" onClick={() => toast.success(t.dashboard.sessionRevoked)}>{t.dashboard.revokeBtn}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== DOCUMENTS PAGE ======
export const DocumentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const t = useT();
  
  const [backendDocs, setBackendDocs] = React.useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = React.useState(true);
  const [uploading, setUploading] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = React.useState<Record<string, string>>({});
  const localPreviewsRef = React.useRef<Record<string, string>>({});
  const [deletingDocId, setDeletingDocId] = React.useState<string | null>(null);
  const [deletedDrivingLicense, setDeletedDrivingLicense] = React.useState(false);

  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';
  const resolveDocumentUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${apiBaseUrl}${url}`;
  };

  const isPdfDocument = (url?: string) => Boolean(url && !url.startsWith('blob:') && url.toLowerCase().endsWith('.pdf'));

  const fetchDocuments = React.useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiClient.get<any[]>('/users/documents');
      setBackendDocs(data || []);
      if ((data || []).some(doc => doc.documentType === 'DRIVING_LICENSE')) {
        setDeletedDrivingLicense(false);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  React.useEffect(() => {
    localPreviewsRef.current = localPreviews;
  }, [localPreviews]);

  React.useEffect(() => () => {
    Object.values(localPreviewsRef.current).forEach(url => URL.revokeObjectURL(url));
  }, []);

  const getDocInfo = (docId: string) => {
    let matched: any = null;
    if (docId === 'license') {
      matched = backendDocs.find(d => d.documentType === 'DRIVING_LICENSE');
    } else if (docId === 'id_card') {
      matched = backendDocs.find(d => d.documentType === 'PASSPORT' || d.documentType === 'NATIONAL_ID');
    } else if (docId === 'selfie') {
      matched = backendDocs.find(d => d.documentType === 'SELFIE');
    } else if (docId === 'insurance') {
      matched = backendDocs.find(d => d.documentType === 'INSURANCE');
    }

    if (matched) {
      return {
        id: matched.id,
        status: matched.status.toLowerCase(),
        reason: matched.rejectionReason,
        url: localPreviews[docId] || matched.url,
        savedUrl: matched.url,
        licenseClass: matched.licenseClass,
        licenseNumber: matched.licenseNumber,
        licenseFullName: matched.licenseFullName,
        licenseDateOfBirth: matched.licenseDateOfBirth,
        licenseResidence: matched.licenseResidence,
        licenseNationality: matched.licenseNationality,
        isLocalPreview: Boolean(localPreviews[docId])
      };
    }

    if (localPreviews[docId]) {
      return {
        id: undefined,
        status: 'pending',
        reason: undefined,
        url: localPreviews[docId],
        savedUrl: undefined,
        licenseClass: undefined,
        licenseNumber: undefined,
        licenseFullName: undefined,
        licenseDateOfBirth: undefined,
        licenseResidence: undefined,
        licenseNationality: undefined,
        isLocalPreview: true
      };
    }

    // Fallback using user attributes
    if (docId === 'license' && user?.drivingLicenseVerified && !deletedDrivingLicense) {
      return {
        id: undefined,
        status: 'verified',
        reason: undefined,
        url: undefined,
        savedUrl: undefined,
        licenseClass: user?.licenseClass,
        licenseNumber: user?.licenseNumber,
        licenseFullName: undefined,
        licenseDateOfBirth: undefined,
        licenseResidence: undefined,
        licenseNationality: undefined,
        isLocalPreview: false
      };
    }
    if (docId === 'id_card' && user?.kycVerified) {
      return { id: undefined, status: 'verified', reason: undefined, url: undefined, savedUrl: undefined, isLocalPreview: false };
    }

    return {
      id: undefined,
      status: 'not_uploaded',
      reason: undefined,
      url: undefined,
      savedUrl: undefined,
      licenseClass: undefined,
      licenseNumber: undefined,
      licenseFullName: undefined,
      licenseDateOfBirth: undefined,
      licenseResidence: undefined,
      licenseNationality: undefined,
      isLocalPreview: false
    };
  };

  const triggerFileInput = (docId: string) => {
    setSelectedDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocId) return;

    let documentType = 'DRIVING_LICENSE';
    if (selectedDocId === 'id_card') documentType = 'PASSPORT';
    else if (selectedDocId === 'selfie') documentType = 'SELFIE';
    else if (selectedDocId === 'insurance') documentType = 'INSURANCE';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    if (selectedDocId !== 'license') {
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviews(prev => {
        if (prev[selectedDocId]) URL.revokeObjectURL(prev[selectedDocId]);
        return { ...prev, [selectedDocId]: previewUrl };
      });
    }
    setUploading(selectedDocId);
    try {
      await apiClient.post<any>('/users/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (selectedDocId === 'license') {
        setDeletedDrivingLicense(false);
      }
      toast.success('Document uploaded!', 'Our team will review it within 24 hours.');
      await fetchDocuments();
      setLocalPreviews(prev => {
        const current = prev[selectedDocId];
        if (current) URL.revokeObjectURL(current);
        const next = { ...prev };
        delete next[selectedDocId];
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setLocalPreviews(prev => {
        const current = prev[selectedDocId];
        if (current) URL.revokeObjectURL(current);
        const next = { ...prev };
        delete next[selectedDocId];
        return next;
      });
      toast.error('Upload failed', err.response?.data?.error || err.message || 'Failed to upload document.');
    } finally {
      setUploading(null);
      setSelectedDocId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDrivingLicense = async (documentId?: string) => {
    if (!documentId) {
      toast.error('Cannot delete document', 'No saved driving license document was found.');
      return;
    }

    const previousDocs = backendDocs;
    setDeletingDocId(documentId);
    setBackendDocs(prev => prev.filter(doc => doc.id !== documentId));
    setDeletedDrivingLicense(true);
    setLocalPreviews(prev => {
      const current = prev.license;
      if (current) URL.revokeObjectURL(current);
      const next = { ...prev };
      delete next.license;
      return next;
    });

    try {
      await apiClient.delete(`/users/documents/${documentId}`);
      toast.success('Driving license deleted', 'You can upload a new driving license anytime.');
    } catch (err: any) {
      console.error(err);
      setBackendDocs(previousDocs);
      setDeletedDrivingLicense(false);
      toast.error('Delete failed', err.message || 'Failed to delete driving license.');
    } finally {
      setDeletingDocId(null);
    }
  };

  const docs = [
    { id: 'license', title: t.dashboard.docLicenseTitle, desc: t.dashboard.docLicenseDesc, icon: '🪪', required: true },
    { id: 'id_card', title: t.dashboard.docIdTitle, desc: t.dashboard.docIdDesc, icon: '🛂', required: true },
    { id: 'selfie', title: t.dashboard.docSelfieTitle, desc: t.dashboard.docSelfieDesc, icon: '🤳', required: true },
    { id: 'insurance', title: t.dashboard.docInsuranceTitle, desc: t.dashboard.docInsuranceDesc, icon: '📋', required: false },
  ];

  const statusBadge = (status: string, reason?: string) => {
    if (status === 'verified') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200/20 text-green-600 bg-green-500/10">{t.dashboard.verifiedDoc}</span>;
    if (status === 'pending') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200/20 text-yellow-600 bg-yellow-500/10">{t.dashboard.underReviewDoc}</span>;
    if (status === 'rejected') {
      return (
        <span 
          title={reason || 'Rejected'} 
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200/20 text-red-600 bg-red-500/10 cursor-help"
        >
          ❌ Rejected {reason ? `: ${reason}` : ''}
        </span>
      );
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200/30 text-slate-500 bg-slate-500/5">{t.dashboard.notUploadedDoc}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,application/pdf"
      />

      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white mb-1">{t.dashboard.myDocuments}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{t.dashboard.myDocumentsDesc}</p>
      </motion.div>

      <div className={`p-4 rounded-[1.5rem] flex items-center gap-3 border ${user?.verified
          ? 'bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-300'
          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-800 dark:text-yellow-300'
        }`}>
        {user?.verified ? (
          <><Shield className="w-6 h-6 text-success flex-shrink-0" /><div><p className="font-bold text-sm">{t.dashboard.identityVerified}</p><p className="text-xs opacity-80 mt-0.5">{t.common.success}</p></div></>
        ) : (
          <><AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" /><div><p className="font-bold text-sm">{t.dashboard.verificationRequired}</p><p className="text-xs opacity-80 mt-0.5">{t.dashboard.verificationRequiredDesc}</p></div></>
        )}
      </div>

      {loadingDocs ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {docs.map(doc => {
            const docInfo = getDocInfo(doc.id);
            return (
              <motion.div key={doc.id} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{doc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">{doc.title}</h3>
                      {doc.required && <span className="text-[9px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">{t.dashboard.requiredDoc}</span>}
                      {statusBadge(docInfo.status, docInfo.reason)}
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-3">{doc.desc}</p>
                    {docInfo.status !== 'verified' && docInfo.status !== 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={() => triggerFileInput(doc.id)}
                        disabled={uploading === doc.id}
                        className="btn-ghost border border-slate-200 dark:border-white/10 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 font-bold"
                      >
                        {uploading === doc.id ? (<><Clock className="w-3.5 h-3.5 animate-spin" /> {t.dashboard.uploading}</>) : (<><FileText className="w-3.5 h-3.5" /> {t.dashboard.uploadFile}</>)}
                      </motion.button>
                    )}
                    <div className="flex flex-col gap-3 mt-2">
                      {doc.id !== 'license' && docInfo.url && (
                        <>
                          {!docInfo.isLocalPreview && (
                            <a
                              href={resolveDocumentUrl(docInfo.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" /> {t.dashboard.viewVehicle || 'View Document'}
                            </a>
                          )}
                          
                          <div className="mt-1 relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 max-w-sm shadow-sm bg-slate-500/5 max-h-56">
                            {!isPdfDocument(docInfo.url) ? (
                              <img 
                                src={resolveDocumentUrl(docInfo.url)}
                                alt={doc.title} 
                                className="w-full h-auto object-cover max-h-56 rounded-2xl transition-all duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="p-4 flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{docInfo.url.split('/').pop()}</p>
                                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">PDF Document</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {doc.id === 'license' && docInfo.id && (
                        <motion.button
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => handleDeleteDrivingLicense(docInfo.id)}
                          disabled={deletingDocId === docInfo.id || uploading === doc.id}
                          className="w-fit border border-red-200/40 bg-red-500/5 text-red-600 dark:text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 font-bold hover:bg-red-500/10 transition-colors"
                        >
                          {deletingDocId === docInfo.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
                          ) : (
                            <><Trash2 className="w-3.5 h-3.5" /> Delete driving license</>
                          )}
                        </motion.button>
                      )}
                    </div>
                    {doc.id === 'license' && docInfo.status === 'verified' && (
                      <div className="mt-3 p-3 bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/5 rounded-2xl max-w-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tên trên bằng lái</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">{docInfo.licenseFullName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Ngày sinh</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">{docInfo.licenseDateOfBirth || 'N/A'}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Nơi cư trú</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">{docInfo.licenseResidence || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Quốc tịch</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">{docInfo.licenseNationality || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Hạng bằng lái (Class)</span>
                            <p className="text-sm font-extrabold text-amber-500 dark:text-gold mt-0.5">{docInfo.licenseClass || user?.licenseClass || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Số bằng lái (No.)</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{docInfo.licenseNumber || user?.licenseNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

// ====== PAYMENT HISTORY PAGE ======
export const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [paymentData, setPaymentData] = React.useState<any[]>([]);
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const isJa = t.common.loading.includes('読み込み');

  React.useEffect(() => {
    if (!user) return;
    bookingService.getByUser(user.id).then(bookings => {
      // Create mock payment history from bookings
      const payments = bookings.map(b => ({
        id: `pay-${b.id}`,
        bookingId: b.id,
        method: 'card',
        amount: b.pricing.total,
        status: b.status === 'cancelled' ? 'refunded' : 'succeeded',
        createdAt: b.createdAt || new Date().toISOString()
      }));
      setPaymentData(payments);
      setLoading(false);
    });
  }, [user]);

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const response = await apiClient.post<any>(`/invoices/generate/${bookingId}`, {});
      const invoice = response?.data;
      const invoiceId = invoice?.id;
      if (invoiceId) {
        const token = localStorage.getItem('luxeway_access_token');
        const fileRes = await fetch(`http://localhost:8080/api/v1/invoices/download/${invoiceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const blob = await fileRes.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `invoice-${invoice.invoiceNumber || invoiceId}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to download invoice', error);
    }
  };

  const statusStyle = (status: string) => {
    if (status === 'succeeded') return 'text-green-700 bg-green-500/10 border-green-200/20';
    if (status === 'refunded') return 'text-blue-700 bg-blue-500/10 border-blue-200/20';
    if (status === 'pending') return 'text-yellow-700 bg-yellow-500/10 border-yellow-200/20';
    return 'text-red-700 bg-red-500/10 border-red-200/20';
  };

  const methodIcon = (m: string) => ({ card: '💳', vnpay: '🏦', stripe: '🔵', wallet: '💰' }[m] || '💳');

  const totalPaid = paymentData.filter((p: any) => p.status === 'succeeded').reduce((s: number, p: any) => s + p.amount, 0);
  const totalRefunded = paymentData.filter((p: any) => p.status === 'refunded').reduce((s: number, p: any) => s + p.amount, 0);

  const getHeaders = () => {
    if (isVi) return ['Mã Giao Dịch', 'Đơn Đặt Xe', 'Phương Thức', 'Ngày', 'Số Tiền', 'Trạng Thái', 'Hóa Đơn'];
    if (isJa) return ['取引ID', '予約', '支払い方法', '日付', '金額', 'ステータス', '請求書'];
    return ['Transaction ID', 'Booking', 'Method', 'Date', 'Amount', 'Status', 'Invoice'];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">{t.dashboard.payments}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">{t.dashboard.paymentHistoryDesc}</p>
        </div>
      </motion.div>

      {!loading && paymentData.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t.dashboard.totalPaid, value: formatCurrency(totalPaid), color: 'text-slate-800 dark:text-white' },
            { label: t.dashboard.totalRefunded, value: formatCurrency(totalRefunded), color: 'text-blue-600 dark:text-blue-400' },
            { label: t.dashboard.transactionsCount, value: paymentData.length.toString(), color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="glass border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl text-center">
              <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : paymentData.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-16 rounded-[2rem]">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{t.dashboard.noPayments}</h3>
          <p className="text-slate-400 text-xs font-medium">{t.dashboard.noPaymentsDesc}</p>
        </div>
      ) : (
        <div className="glass border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-500/5 border-b border-slate-200/30 dark:border-white/5">
                <tr>
                  {getHeaders().map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20 dark:divide-white/5">
                {paymentData.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-bold font-mono text-slate-800 dark:text-slate-100">#{p.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-semibold">#{p.bookingId.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{methodIcon(p.method)} <span className="text-xs text-slate-500 capitalize">{p.method}</span></td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500 font-bold">{formatDate(p.createdAt, 'short')}</td>
                    <td className="px-4 py-3.5 text-sm font-extrabold text-slate-800 dark:text-white">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusStyle(p.status)}`}>{p.status}</span></td>
                    <td className="px-4 py-3.5">
                      <button 
                        onClick={() => handleDownloadInvoice(p.bookingId)}
                        className="text-xs text-accent hover:underline font-bold"
                      >
                        {t.dashboard.invoiceBtn}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ====== SETTINGS PAGE ======
export const SettingsPage: React.FC = () => {
  const toast = useToast();
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const isJa = t.common.loading.includes('読み込み');
  const { theme, language, setLanguage, currency, setCurrency } = useUIStore();
  const [prefs, setPrefs] = React.useState({
    emailBooking: true, emailMarketing: false, emailReview: true, pushNotif: true,
    language: language, currency: currency,
  });

  const handleSave = () => {
    setLanguage(prefs.language as any);
    setCurrency(prefs.currency);
    toast.success(t.dashboard.settingsSaved, t.dashboard.settingsSavedDesc);
  };

  const Toggle: React.FC<{ value: boolean; onChange: () => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p>
        {desc && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{desc}</p>}
      </div>
      <button onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ml-4 ${value ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-800'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">{t.dashboard.settings}</motion.h1>
      <div className="space-y-6">
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-1">{t.dashboard.emailNotifications}</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-4 border-b border-slate-200/30 dark:border-white/5 pb-2">{t.dashboard.emailNotificationsDesc}</p>
          <div className="divide-y divide-slate-200/20 dark:divide-white/5">
            <Toggle value={prefs.emailBooking} onChange={() => setPrefs(p => ({ ...p, emailBooking: !p.emailBooking }))} label={t.dashboard.bookingUpdates} desc={t.dashboard.bookingUpdatesDesc} />
            <Toggle value={prefs.emailReview} onChange={() => setPrefs(p => ({ ...p, emailReview: !p.emailReview }))} label={t.dashboard.reviewRequests} desc={t.dashboard.reviewRequestsDesc} />
            <Toggle value={prefs.emailMarketing} onChange={() => setPrefs(p => ({ ...p, emailMarketing: !p.emailMarketing }))} label={t.dashboard.promoOffers} desc={t.dashboard.promoOffersDesc} />
          </div>
        </div>

        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-1">{t.dashboard.pushNotifications}</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-4 border-b border-slate-200/30 dark:border-white/5 pb-2">{t.dashboard.pushNotificationsDesc}</p>
          <div className="divide-y divide-slate-200/20 dark:divide-white/5">
            <Toggle value={prefs.pushNotif} onChange={() => setPrefs(p => ({ ...p, pushNotif: !p.pushNotif }))} label={t.dashboard.inAppNotifications} desc={t.dashboard.inAppNotificationsDesc} />
          </div>
        </div>

        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-4">{t.dashboard.displayPreferences}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{isVi ? 'Ngôn Ngữ' : isJa ? '言語' : 'Language'}</label>
              <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value as any }))} className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100">
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{isVi ? 'Tiền Tệ' : isJa ? '通貨' : 'Currency'}</label>
              <select value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))} className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100">
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSave} className="btn-primary py-3 px-8 font-bold">
          {t.dashboard.saveSettingsBtn}
        </motion.button>
      </div>
    </div>
  );
};

// ====== MY REVIEWS PAGE ======
export const MyReviewsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const t = useT();

  React.useEffect(() => {
    if (!user) return;
    reviewService.getByUser(user.id).then(userReviews => {
      setReviews(userReviews);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white">{t.dashboard.myReviews}</motion.h1>
      {loading ? <TableSkeleton rows={4} /> : reviews.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-16 rounded-[2rem]">
          <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{t.dashboard.noReviewsYet}</h3>
          <p className="text-slate-400 text-xs font-medium mb-5">{t.dashboard.noReviewsYetDesc}</p>
          <a href="/marketplace" className="btn-gold text-xs font-bold px-6 py-3 rounded-xl">{t.dashboard.exploreVehicles}</a>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {reviews.map((r: any) => (
            <motion.div key={r.id} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] hover-lift hover-glow shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(r.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{r.rating}/5</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">· {formatDate(r.createdAt, 'short')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-3 font-medium">"{r.comment}"</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.dashboard.vehicleId}: <span className="font-mono text-slate-800 dark:text-slate-200">#{r.vehicleId.slice(-6).toUpperCase()}</span></p>
              {r.ownerResponse && (
                <div className="mt-4 p-3.5 bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t.dashboard.ownerReplied}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">"{r.ownerResponse}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// ====== LUXEWALLET PAGE ======
export const LuxeWalletPage: React.FC = () => {
  const t = useT();
  const { user, refreshUser } = useAuthStore();
  const toast = useToast();
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('100000');
  const [method, setMethod] = useState<'card' | 'stripe' | 'vnpay'>('card');
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const txs = await paymentService.getByUser(user.id);
      setTransactions(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    refreshUser();
  }, [user?.id]);

  const handlePresetSelect = (amt: number) => {
    setTopUpAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    setCustomAmount(numeric);
    setTopUpAmount(Number(numeric) || 0);
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount < 10000) {
      toast.warning(t.wallet.invalidAmount, t.wallet.invalidAmountDesc);
      return;
    }
    setProcessing(true);
    try {
      const returnUrl = window.location.origin + '/payment/vnpay/return';
      const result = await paymentService.topUpWallet(topUpAmount, method, returnUrl);
      if (result.success) {
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          toast.success(t.wallet.topUpSuccess, t.wallet.topUpSuccessDesc.replace('{amount}', formatCurrency(topUpAmount)));
          setCustomAmount('100000');
          setTopUpAmount(100000);
          await refreshUser();
          await fetchTransactions();
        }
      } else {
        toast.error(t.wallet.topUpFailed, t.wallet.topUpFailedDesc);
      }
    } catch (err: any) {
      toast.error(t.common.error, err.message || t.wallet.topUpFailedDesc);
    } finally {
      setProcessing(false);
    }
  };

  const balance = user?.walletBalance || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-3.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t.wallet.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1">{t.wallet.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Card & Top Up Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card & Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Deluxe Wallet Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 text-white shadow-xl min-h-[190px] flex flex-col justify-between border border-white/10 hover-glow">
              {/* Shiny overlay effects */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">LuxeWallet</p>
                  <p className="text-[10px] text-gold font-bold uppercase tracking-wider mt-0.5">{t.wallet.premiumBalance}</p>
                </div>
                <div className="text-2xl font-extrabold text-slate-300 tracking-wider">LW</div>
              </div>

              <div className="my-2">
                <p className="text-xs text-slate-400 font-semibold">{t.wallet.availableBalance}</p>
                <h3 className="text-3xl font-display font-extrabold mt-1 tracking-tight text-white">{formatCurrency(balance)}</h3>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/10 pt-3">
                <span className="font-bold truncate max-w-[150px]">{user?.displayName}</span>
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider">ACTIVE</span>
              </div>
            </div>

            {/* Quick stats / info card */}
            <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t.wallet.whyTitle}</h4>
                <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 text-sm">✓</span> {t.wallet.whyBenefit1}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 text-sm">✓</span> {t.wallet.whyBenefit2}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 text-sm">✓</span> {t.wallet.whyBenefit3}
                  </li>
                </ul>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200/40 dark:border-white/10 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <span>{t.wallet.verificationStatus}</span>
                <span className="text-success font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> {t.wallet.secureWallet}
                </span>
              </div>
            </div>
          </div>

          {/* Top Up Wallet Form */}
          <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              💰 {t.wallet.topUpTitle}
            </h3>

            <form onSubmit={handleTopUpSubmit} className="space-y-6">
              {/* Preset buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  {t.wallet.quickSelect}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-2.5 px-1 text-xs rounded-xl border-2 font-bold transition-all duration-300 text-center ${topUpAmount === amt
                          ? 'border-accent bg-blue-500/10 text-accent font-extrabold shadow-sm'
                          : 'border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                    >
                      {formatCurrency(amt).replace('₫', '').trim()} ₫
                    </button>
                  ))}
                </div>
              </div>

              {/* Input for custom amount */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.wallet.enterAmount}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={e => handleCustomAmountChange(e.target.value)}
                    className="lux-input text-lg font-bold pr-12 text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5"
                    placeholder={t.wallet.enterAmountPlaceholder}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">VND</span>
                </div>
                {topUpAmount > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 italic font-medium">
                    {t.wallet.formattedAmount}: <strong className="text-slate-600 dark:text-slate-300 font-bold">{formatCurrency(topUpAmount)}</strong>
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  {t.wallet.selectMethod}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'card', label: 'Credit Card', desc: 'Simulated 100% success', icon: '💳' },
                    { id: 'stripe', label: 'Stripe', desc: 'Simulated 100% success', icon: '🔵' },
                    { id: 'vnpay', label: 'VNPay Sandbox', desc: 'Real VNPay Gateway Redirect', icon: '🏦' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`p-4 rounded-[1.5rem] border-2 text-left transition-all duration-300 ${method === m.id
                          ? 'border-accent bg-blue-500/10'
                          : 'border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-500/5'
                        }`}
                    >
                      <div className="text-2xl mb-1.5">{m.icon}</div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{m.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Top-up */}
              <motion.button
                type="submit"
                disabled={processing || topUpAmount < 10000}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full py-4 font-bold disabled:opacity-50 mt-4 rounded-2xl flex items-center justify-center text-sm"
              >
                {processing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t.wallet.processing}</>
                ) : (
                  <>{t.wallet.numpadTopUp.replace('{amount}', formatCurrency(topUpAmount))}</>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/30 dark:border-white/5">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{t.wallet.transactions}</h3>
            <button onClick={fetchTransactions} className="text-xs text-accent hover:underline font-bold">
              {t.wallet.refresh}
            </button>
          </div>

          {txLoading ? (
            <div className="space-y-4 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200/20 skeleton animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200/20 rounded w-2/3 skeleton animate-pulse" />
                    <div className="h-2 bg-slate-200/20 rounded w-1/3 skeleton animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">📜</span>
              <p className="text-slate-400 text-xs font-semibold">{t.wallet.noTransactions}</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-200/20 dark:divide-white/5 overflow-y-auto max-h-[420px] pr-1">
              {transactions.map((tx, idx) => {
                const isTopUp = tx.bookingId === null || tx.description?.toLowerCase().includes('top up') || tx.transactionId?.startsWith('TOPUP');
                const isSuccess = tx.status === 'succeeded';
                const isFailed = tx.status === 'failed';

                return (
                  <div key={tx.id || idx} className="flex items-start gap-3 pt-4 first:pt-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${isFailed
                        ? 'bg-red-500/10 text-danger'
                        : isTopUp
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-blue-500/10 text-accent'
                      }`}>
                      {isFailed ? '✕' : isTopUp ? '↓' : '↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {tx.description || (isTopUp ? t.wallet.walletTopUp : t.wallet.bookingPayment)}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {tx.createdAt ? formatDate(tx.createdAt, 'short') : ''} · <span className="uppercase">{tx.method}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-extrabold ${isFailed
                          ? 'text-slate-400 line-through'
                          : isTopUp
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}>
                        {isTopUp ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded border mt-1 inline-block ${isSuccess
                          ? 'bg-green-500/10 text-green-600 border-green-200/20'
                          : isFailed
                            ? 'bg-red-500/10 text-red-600 border-red-200/20'
                            : 'bg-yellow-500/10 text-yellow-600 border-yellow-200/20'
                        }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
