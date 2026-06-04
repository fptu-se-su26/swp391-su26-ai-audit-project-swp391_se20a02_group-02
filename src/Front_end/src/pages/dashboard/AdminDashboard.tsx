import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Car, Calendar, DollarSign, Settings, LogOut,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle, Clock, Shield,
  FileText, BarChart3, Activity, Menu, X, Bell, Search,
  ArrowUpRight, Zap, Globe, Database
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useT } from '@/i18n/translations';
import { formatCurrency, formatDate, getInitials } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { adminService } from '@/services/adminService';
import type { AdminStats } from '@/services/adminService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ====== ADMIN SIDEBAR ======
const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const adminLinks = [
    { href: '/', icon: Globe, label: 'Go to Home', exact: true },
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/vehicles', icon: Car, label: 'Vehicle Management' },
    { href: '/admin/bookings', icon: Calendar, label: 'Booking Management' },
    { href: '/admin/payments', icon: DollarSign, label: 'Payments & Revenue' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/reports', icon: FileText, label: 'Reports' },
    { href: '/admin/disputes', icon: AlertCircle, label: 'Disputes' },
    { href: '/admin/settings', icon: Settings, label: 'System Settings' },
  ];

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
        {/* Ambient glow top */}
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

        {/* User Info */}
        <div className="p-5 border-b relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40" />
            ) : (
              <div className="w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center text-slate-900"
                style={{ background: 'linear-gradient(135deg, #EAB308, #F59E0B)' }}>
                {getInitials(user?.displayName || 'A')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.displayName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-0.5">
                <Shield className="w-3 h-3" /> {user?.role?.toLowerCase() === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 relative z-10">
          {adminLinks.map(link => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                    : undefined,
                  border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #6366F1, #8B5CF6)' }} />
                )}
                <link.icon className={`w-4 h-4 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{link.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
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
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// ====== ADMIN HEADER ======
const AdminHeader: React.FC = () => {
  const { setSidebarOpen, sidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl border-b"
      style={{ background: 'rgba(248,250,252,0.9)', borderColor: 'rgba(226,232,240,0.8)' }}>
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users, vehicles, bookings..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">System Live</span>
          </div>
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

// ====== ADMIN LAYOUT ======
export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const roleUpper = user?.role?.toUpperCase();
    if (!isAuthenticated || (roleUpper !== 'ADMIN' && roleUpper !== 'SUPER_ADMIN')) navigate('/auth/login');
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated, user]);

  const roleUpper = user?.role?.toUpperCase();
  if (!user || (roleUpper !== 'ADMIN' && roleUpper !== 'SUPER_ADMIN')) return null;

  return (
    <div className="min-h-screen pt-20" style={{ background: '#F8FAFC' }}>
      <div className="flex h-[calc(100vh-80px)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <AdminHeader />
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ====== CUSTOM TOOLTIP ======
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl text-xs font-semibold">
        <p className="text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-indigo-600 font-extrabold">Revenue: {formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ====== ADMIN OVERVIEW ======
export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats().then(s => {
      if (s) setStats(s);
      setLoading(false);
    });
  }, []);

  const revenueData = [
    { date: 'Jan', revenue: (stats?.totalRevenue || 5000000) * 0.08, bookings: 12 },
    { date: 'Feb', revenue: (stats?.totalRevenue || 5000000) * 0.12, bookings: 18 },
    { date: 'Mar', revenue: (stats?.totalRevenue || 5000000) * 0.18, bookings: 24 },
    { date: 'Apr', revenue: (stats?.totalRevenue || 5000000) * 0.25, bookings: 31 },
    { date: 'May', revenue: (stats?.totalRevenue || 5000000) * 0.35, bookings: 42 },
    { date: 'Jun', revenue: (stats?.totalRevenue || 5000000) * 0.55, bookings: 58 },
    { date: 'Jul', revenue: (stats?.totalRevenue || 5000000) * 0.72, bookings: 67 },
    { date: 'Aug', revenue: (stats?.totalRevenue || 5000000) * 0.88, bookings: 79 },
    { date: 'Sep', revenue: stats?.totalRevenue || 5000000, bookings: 89 },
  ];

  const statCards = [
    {
      label: 'Total Users',
      value: loading ? '—' : (stats?.totalUsers ?? 0),
      sub: `${stats?.verifiedUsers ?? 0} verified`,
      icon: Users,
      gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      bg: 'rgba(99,102,241,0.08)',
      change: '+12%',
      changeUp: true,
    },
    {
      label: 'Total Vehicles',
      value: loading ? '—' : (stats?.totalVehicles ?? 0),
      sub: `${stats?.availableVehicles ?? 0} available`,
      icon: Car,
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      bg: 'rgba(16,185,129,0.08)',
      change: '+8%',
      changeUp: true,
    },
    {
      label: 'Active Bookings',
      value: loading ? '—' : (stats?.activeBookings ?? 0),
      sub: `${stats?.pendingBookings ?? 0} pending`,
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      bg: 'rgba(245,158,11,0.08)',
      change: 'Live',
      changeUp: true,
    },
    {
      label: 'Total Revenue',
      value: loading ? '—' : formatCurrency(stats?.totalRevenue ?? 0),
      sub: `${stats?.completedBookings ?? 0} completed trips`,
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
      bg: 'rgba(236,72,153,0.08)',
      change: '+15%',
      changeUp: true,
      isString: true,
    },
    {
      label: 'Pending Approvals',
      value: loading ? '—' : (stats?.pendingApprovalVehicles ?? 0),
      sub: 'Vehicles to review',
      icon: Clock,
      gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
      bg: 'rgba(249,115,22,0.08)',
      change: 'Action needed',
      changeUp: false,
    },
    {
      label: 'Total Customers',
      value: loading ? '—' : (stats?.totalCustomers ?? 0),
      sub: `${stats?.totalOwners ?? 0} owners`,
      icon: Globe,
      gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
      bg: 'rgba(6,182,212,0.08)',
      change: 'Growing',
      changeUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"
            style={{ background: 'linear-gradient(135deg, #1E293B 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Platform overview and management control center</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-600">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            LuxeWay Platform
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 cursor-default transition-all duration-300 shadow-sm relative overflow-hidden"
          >
            {/* Background ambient */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 blur-2xl pointer-events-none"
              style={{ background: stat.gradient }} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: stat.gradient }}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  stat.changeUp ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                }`}>
                  {stat.changeUp && <TrendingUp className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className={`text-2xl font-extrabold tracking-tight ${
                stat.isString ? 'text-indigo-600' : 'text-slate-800'
              }`}>{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">Revenue Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Platform earnings over time</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
              <Activity className="w-3.5 h-3.5" /> Live Data
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="adminRevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="url(#adminRevGradient)" strokeWidth={3} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display text-lg font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Approve Pending Vehicles', href: '/admin/vehicles', icon: Car, count: stats?.pendingApprovalVehicles ?? 8, color: 'text-amber-600 bg-amber-50' },
              { label: 'Manage User Accounts', href: '/admin/users', icon: Users, count: stats?.totalUsers ?? 0, color: 'text-blue-600 bg-blue-50' },
              { label: 'Resolve Active Disputes', href: '/admin/disputes', icon: AlertCircle, count: 3, color: 'text-red-600 bg-red-50' },
              { label: 'Review All Bookings', href: '/admin/bookings', icon: Calendar, count: stats?.pendingBookings ?? 0, color: 'text-purple-600 bg-purple-50' },
            ].map(action => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${action.color}`}>{action.count}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="font-display text-lg font-bold text-slate-800">System Health</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'API Response Time', value: '124ms', status: 'good', bar: 88 },
              { label: 'Database Uptime', value: '99.9%', status: 'good', bar: 99 },
              { label: 'Active Sessions', value: stats?.totalUsers ? `${Math.floor(stats.totalUsers * 0.3)}` : '342', status: 'good', bar: 70 },
              { label: 'Error Rate', value: '0.02%', status: 'good', bar: 98 },
            ].map(metric => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                  <span className="text-sm font-bold text-emerald-600">{metric.value}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.bar}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366F1, #10B981)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {[
                { action: 'New user registered', time: '2 min ago', dot: 'bg-blue-500' },
                { action: 'Booking confirmed', time: '15 min ago', dot: 'bg-green-500' },
                { action: 'Payment processed', time: '1 hr ago', dot: 'bg-amber-500' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
                  <span className="text-xs text-slate-600 flex-1">{a.action}</span>
                  <span className="text-[10px] text-slate-400">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
