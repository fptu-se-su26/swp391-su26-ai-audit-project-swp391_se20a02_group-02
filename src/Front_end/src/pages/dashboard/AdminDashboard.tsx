import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Car, Calendar, DollarSign, Settings, LogOut,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle, Clock, Shield,
  FileText, BarChart3, Activity, Menu, X, Bell, Search, Filter
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useT } from '@/i18n/translations';
import { formatCurrency, formatDate, getInitials } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';

// ====== ADMIN SIDEBAR ======
const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const t = useT();

  const adminLinks = [
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
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] z-40 flex flex-col lg:relative lg:translate-x-0 pt-20 lg:pt-0"
      >
        {/* Admin Badge */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-gold" />
            ) : (
              <div className="w-11 h-11 rounded-2xl text-sm bg-gradient-to-br from-gold to-yellow-600 text-[#0F172A] font-bold flex items-center justify-center">
                {getInitials(user?.displayName || 'A')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold mt-0.5">
                <Shield className="w-3 h-3" /> ADMIN
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {adminLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.href, link.exact)
                  ? 'bg-gold text-[#0F172A] shadow-lg shadow-gold/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {isActive(link.href, link.exact) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            {t.nav.logout}
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
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users, vehicles, bookings..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
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
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth/login');
    }
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated, user]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
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

// ====== ADMIN OVERVIEW ======
export const AdminOverview: React.FC = () => {
  const t = useT();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeDisputes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats from backend
    const fetchStats = async () => {
      try {
        // TODO: Replace with real API call
        await new Promise(r => setTimeout(r, 1000));
        setStats({
          totalUsers: 1247,
          totalVehicles: 342,
          activeBookings: 89,
          totalRevenue: 2847500,
          pendingApprovals: 12,
          activeDisputes: 3,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', change: '+12% this month' },
    { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'bg-green-50 text-green-600', change: '+8% this month' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: Calendar, color: 'bg-purple-50 text-purple-600', change: 'Currently active' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-yellow-50 text-yellow-600', change: '+15% this month', isString: true },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'bg-orange-50 text-orange-600', change: 'Requires action' },
    { label: 'Active Disputes', value: stats.activeDisputes, icon: AlertCircle, color: 'bg-red-50 text-red-600', change: 'Needs resolution' },
  ];

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-1">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mb-8">System overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {statCards.map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="luxury-card p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
            <p className="text-sm text-slate-600 font-medium mb-2">{stat.label}</p>
            <p className="text-xs text-slate-400">{stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Approve Pending Vehicles', href: '/admin/vehicles?status=pending', icon: Car, count: 8 },
              { label: 'Review User Reports', href: '/admin/users?flagged=true', icon: Users, count: 5 },
              { label: 'Resolve Disputes', href: '/admin/disputes', icon: AlertCircle, count: 3 },
              { label: 'Process Refunds', href: '/admin/payments?type=refund', icon: DollarSign, count: 4 },
            ].map(action => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent bg-blue-50 px-2 py-1 rounded-lg">{action.count}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'API Response Time', value: '124ms', status: 'good', icon: Activity },
              { label: 'Database Status', value: 'Healthy', status: 'good', icon: CheckCircle },
              { label: 'Active Sessions', value: '342', status: 'good', icon: Users },
              { label: 'Error Rate', value: '0.02%', status: 'good', icon: Shield },
            ].map(metric => (
              <div key={metric.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <metric.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{metric.label}</span>
                </div>
                <span className="text-sm font-bold text-success">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="luxury-card p-6">
        <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', type: 'user' },
            { action: 'Vehicle approved', user: 'Tesla Model S - VN-001', time: '15 minutes ago', type: 'vehicle' },
            { action: 'Booking completed', user: 'Booking #BK-12345', time: '1 hour ago', type: 'booking' },
            { action: 'Payment processed', user: '$1,250.00', time: '2 hours ago', type: 'payment' },
            { action: 'Dispute resolved', user: 'Dispute #DS-789', time: '3 hours ago', type: 'dispute' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-500' :
                activity.type === 'vehicle' ? 'bg-green-500' :
                activity.type === 'booking' ? 'bg-purple-500' :
                activity.type === 'payment' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                <p className="text-xs text-slate-500 truncate">{activity.user}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
