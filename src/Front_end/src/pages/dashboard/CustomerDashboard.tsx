import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Heart, Bell, User, Shield, FileText,
  CreditCard, Settings, LogOut, ChevronRight, Car, Star, TrendingUp,
  Package, Clock, CheckCircle, AlertCircle, X, Menu, Eye, EyeOff
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { bookingService } from '@/services/bookingService';
import { notificationService, reviewService } from '@/services/otherServices';
import type { Booking, Notification } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getInitials } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

// ====== DASHBOARD SIDEBAR ======
const DashboardSidebar: React.FC<{ role: string }> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const customerLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
    { href: '/dashboard/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
    { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Payment History' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const ownerLinks = [
    { href: '/owner', icon: LayoutDashboard, label: 'Overview', exact: true },
    { href: '/owner/vehicles', icon: Car, label: 'My Vehicles' },
    { href: '/owner/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/owner/calendar', icon: Clock, label: 'Calendar' },
    { href: '/owner/revenue', icon: TrendingUp, label: 'Revenue' },
    { href: '/owner/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const links = (role === 'owner') ? ownerLinks : customerLinks;

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
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col lg:relative lg:translate-x-0 pt-20 lg:pt-0"
      >
        {/* User Info */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-11 h-11 rounded-2xl object-cover" />
            ) : (
              <div className="avatar w-11 h-11 rounded-2xl text-sm">{getInitials(user?.displayName || 'U')}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0F172A] text-sm truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={`sidebar-link ${isActive(link.href, link.exact) ? 'active' : ''}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {isActive(link.href, link.exact) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// ====== DASHBOARD LAYOUT ======
export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      <div className="flex h-[calc(100vh-80px)]">
        <DashboardSidebar role={user.role} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
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

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-1">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-500 mb-8">Here's what's happening with your rentals.</p>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'bg-blue-50 text-blue-600', change: '+2 this month' },
            { label: 'Active Rentals', value: stats.active, icon: Car, color: 'bg-green-50 text-green-600', change: 'Currently active' },
            { label: 'Completed Trips', value: stats.completed, icon: CheckCircle, color: 'bg-purple-50 text-purple-600', change: 'Lifetime total' },
            { label: 'Total Spent', value: formatCurrency(stats.spent), icon: CreditCard, color: 'bg-yellow-50 text-yellow-600', change: 'Lifetime total', isString: true },
          ].map(stat => (
            <motion.div key={stat.label} variants={staggerItem} className="stat-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 luxury-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-[#0F172A]">Recent Bookings</h3>
            <Link to="/dashboard/bookings" className="text-sm text-accent hover:text-blue-700 font-medium">View All →</Link>
          </div>
          {loading ? <TableSkeleton rows={3} /> : bookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No bookings yet</p>
              <Link to="/marketplace" className="btn-primary mt-4 text-sm">Explore Vehicles</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <Car className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{booking.vehicleId}</p>
                    <p className="text-xs text-slate-400">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge text-[10px] ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-xs font-bold text-[#0F172A] mt-1">{formatCurrency(booking.pricing.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-[#0F172A]">Notifications</h3>
            <Link to="/dashboard/notifications" className="text-xs text-accent font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No new notifications</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-3 rounded-2xl text-sm ${!notif.read ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  <p className={`font-semibold text-xs ${!notif.read ? 'text-accent' : 'text-[#0F172A]'}`}>{notif.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{formatDate(notif.createdAt, 'relative')}</p>
                </div>
              ))
            )}
          </div>
        </div>
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
      toast.success('Booking cancelled', 'Your refund will be processed in 3-5 days');
    }
  };

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-4">My Bookings</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border-2 transition-all ${
                filter === status ? 'border-accent bg-blue-50 text-accent' : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-[#0F172A] mb-1">No {filter !== 'all' ? filter : ''} bookings</h3>
          <p className="text-slate-400 text-sm">Start exploring our luxury fleet</p>
          <Link to="/marketplace" className="btn-primary mt-4 text-sm">Browse Vehicles</Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filtered.map(booking => (
            <motion.div key={booking.id} variants={staggerItem} className="luxury-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-7 h-7 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-[#0F172A] text-sm">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                    <span className={`badge text-[10px] border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.totalDays} days
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400">Total</span>
                      <p className="text-sm font-bold text-[#0F172A]">{formatCurrency(booking.pricing.total)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Deposit</span>
                      <p className="text-sm font-medium text-[#0F172A]">{formatCurrency(booking.pricing.deposit)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Link to={`/booking/${booking.vehicleId}/status?bookingId=${booking.id}`} className="btn-ghost text-xs px-3 py-2 border border-slate-200 rounded-xl">
                  View Details
                </Link>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="text-xs px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === 'completed' && !booking.reviewId && (
                  <button className="btn-gold text-xs px-3 py-2">
                    Leave Review
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// ====== PROFILE PAGE ======
export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
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
    toast.success('Profile updated!', 'Your changes have been saved.');
  };

  return (
    <div>
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2xl font-bold text-[#0F172A] mb-6">
        My Profile
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="luxury-card p-6 text-center">
          <div className="relative inline-block mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover mx-auto" />
            ) : (
              <div className="avatar w-24 h-24 rounded-3xl text-2xl mx-auto">{getInitials(user?.displayName || '')}</div>
            )}
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center text-xs">✏️</button>
          </div>
          <h3 className="font-display text-xl font-bold text-[#0F172A]">{user?.displayName}</h3>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="mt-4 space-y-2">
            {user?.verified && (
              <div className="flex items-center gap-2 justify-center text-sm text-green-600">
                <Shield className="w-4 h-4" /> Identity Verified
              </div>
            )}
            <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {(user?.rating ?? 0) > 0 ? `${user?.rating} Rating` : 'No ratings yet'}
            </div>
            <p className="text-xs text-slate-400">Member since {user?.joinedAt ? formatDate(user.joinedAt, 'short') : 'N/A'}</p>
          </div>
          {(user?.badges?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {user?.badges?.map(badge => (
                <span key={badge} className="badge-blue text-[10px]">{badge.replace('_', ' ')}</span>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-5">Personal Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">First Name</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Last Name</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="lux-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="lux-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" className="lux-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="lux-input resize-none"
                placeholder="Tell others about yourself..."
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
                {saving ? 'Saving...' : 'Save Changes'}
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
  const [currentPw, setCurrentPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [twoFA, setTwoFA] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('Passwords do not match', 'Please confirm correctly.'); return; }
    if (newPw.length < 8) { toast.error('Password too short', 'Min 8 characters required.'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success('Password changed!', 'Your password has been updated successfully.');
  };

  return (
    <div>
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2xl font-bold text-[#0F172A] mb-6">
        Security Settings
      </motion.h1>
      <div className="space-y-6">
        {/* Change Password */}
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#0F172A]">Change Password</h3>
              <p className="text-slate-400 text-sm">Update your password regularly to stay secure</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="lux-input pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="lux-input pr-12" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={`lux-input ${confirmPw && newPw !== confirmPw ? 'border-danger' : ''}`} placeholder="Repeat new password" required />
              {confirmPw && newPw !== confirmPw && <p className="text-danger text-xs mt-1">Passwords do not match</p>}
            </div>
            <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary py-3 px-6 disabled:opacity-70">
              {saving ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">Two-Factor Authentication</h3>
                <p className="text-slate-400 text-sm">Add an extra layer of security via OTP email</p>
              </div>
            </div>
            <button
              onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? '2FA Disabled' : '2FA Enabled', twoFA ? 'Two-factor auth disabled.' : '2FA is now active.'); }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${twoFA ? 'bg-success' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${twoFA ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {[
              { device: 'Chrome · Windows 11', location: 'Ho Chi Minh City, VN', time: 'Now', current: true },
              { device: 'Safari · iPhone 15', location: 'Ho Chi Minh City, VN', time: '2 hours ago', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-success' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{session.device}</p>
                    <p className="text-xs text-slate-400">{session.location} · {session.time}</p>
                  </div>
                </div>
                {session.current ? (
                  <span className="text-xs font-semibold text-success bg-green-50 px-2 py-1 rounded-lg">Current</span>
                ) : (
                  <button className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors" onClick={() => toast.success('Session revoked')}>Revoke</button>
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
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = React.useState<string[]>([]);

  const docs = [
    { id: 'license', title: "Driver's License", desc: "Government-issued driver's license (front & back)", icon: '🪪', required: true, status: user?.verified ? 'verified' : 'pending' },
    { id: 'id_card', title: 'National ID / Passport', desc: 'Government-issued ID for KYC verification', icon: '🛂', required: true, status: 'not_uploaded' },
    { id: 'selfie', title: 'Selfie with ID', desc: 'A clear photo of you holding your ID document', icon: '🤳', required: true, status: 'not_uploaded' },
    { id: 'insurance', title: 'Personal Insurance Certificate', desc: 'Optional – additional personal coverage document', icon: '📋', required: false, status: 'not_uploaded' },
  ];

  const handleUpload = async (docId: string) => {
    setUploading(docId);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(null);
    setUploadedDocs(prev => [...prev, docId]);
    toast.success('Document uploaded!', 'Our team will review it within 24 hours.');
  };

  const getDocStatus = (doc: typeof docs[0]) => {
    if (uploadedDocs.includes(doc.id)) return 'pending';
    return doc.status;
  };

  const statusBadge = (status: string) => {
    if (status === 'verified') return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-200 text-green-700 bg-green-50">✓ Verified</span>;
    if (status === 'pending') return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-200 text-yellow-700 bg-yellow-50">⏳ Under Review</span>;
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50">Not Uploaded</span>;
  };

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-1">My Documents</h1>
        <p className="text-slate-500 text-sm">Upload required documents for KYC identity verification</p>
      </motion.div>

      <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 ${user?.verified ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'}`}>
        {user?.verified ? (
          <><Shield className="w-6 h-6 text-success flex-shrink-0" /><div><p className="font-semibold text-green-800 text-sm">Identity Verified</p><p className="text-green-600 text-xs">You can rent any vehicle on the platform.</p></div></>
        ) : (
          <><AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" /><div><p className="font-semibold text-yellow-800 text-sm">Verification Required</p><p className="text-yellow-600 text-xs">Upload your documents. Verification takes up to 24 hours.</p></div></>
        )}
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {docs.map(doc => (
          <motion.div key={doc.id} variants={staggerItem} className="luxury-card p-5">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{doc.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-[#0F172A] text-sm">{doc.title}</h3>
                  {doc.required && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md font-medium">Required</span>}
                  {statusBadge(getDocStatus(doc))}
                </div>
                <p className="text-slate-400 text-xs mb-3">{doc.desc}</p>
                {getDocStatus(doc) !== 'verified' && (
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => handleUpload(doc.id)}
                    disabled={uploading === doc.id || uploadedDocs.includes(doc.id)}
                    className="btn-ghost border border-slate-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-60"
                  >
                    {uploading === doc.id ? (<><Clock className="w-3.5 h-3.5 animate-spin" /> Uploading...</>) : (<><FileText className="w-3.5 h-3.5" /> Upload File</>)}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// ====== PAYMENT HISTORY PAGE ======
export const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [paymentData, setPaymentData] = React.useState<any[]>([]);

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

  const statusStyle = (status: string) => {
    if (status === 'succeeded') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'refunded') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (status === 'pending') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const methodIcon = (m: string) => ({ card: '💳', vnpay: '🏦', stripe: '🔵', wallet: '💰' }[m] || '💳');

  const totalPaid = paymentData.filter((p: any) => p.status === 'succeeded').reduce((s: number, p: any) => s + p.amount, 0);
  const totalRefunded = paymentData.filter((p: any) => p.status === 'refunded').reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Payment History</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your transactions and invoices</p>
        </div>
      </motion.div>

      {!loading && paymentData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Paid', value: formatCurrency(totalPaid), color: 'text-[#0F172A]' },
            { label: 'Total Refunded', value: formatCurrency(totalRefunded), color: 'text-blue-600' },
            { label: 'Transactions', value: paymentData.length.toString(), color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="luxury-card p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : paymentData.length === 0 ? (
        <div className="text-center py-20">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-[#0F172A] mb-1">No payments yet</h3>
          <p className="text-slate-400 text-sm">Your transaction history will appear here after your first booking.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Transaction ID', 'Booking', 'Method', 'Date', 'Amount', 'Status', 'Invoice'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentData.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[#0F172A]">#{p.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">#{p.bookingId.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm">{methodIcon(p.method)} <span className="text-xs text-slate-500 capitalize">{p.method}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(p.createdAt, 'short')}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#0F172A]">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle(p.status)}`}>{p.status}</span></td>
                    <td className="px-4 py-3"><button className="text-xs text-accent hover:underline font-medium">📄 PDF</button></td>
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
  const { theme } = useUIStore();
  const [prefs, setPrefs] = React.useState({
    emailBooking: true, emailMarketing: false, emailReview: true, pushNotif: true,
    language: 'en', currency: 'USD',
  });

  const Toggle: React.FC<{ value: boolean; onChange: () => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-sm font-medium text-[#0F172A]">{label}</p>{desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}</div>
      <button onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ml-4 ${value ? 'bg-accent' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div>
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2xl font-bold text-[#0F172A] mb-6">Settings</motion.h1>
      <div className="space-y-6">
        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-1">Email Notifications</h3>
          <p className="text-slate-400 text-sm mb-4">Choose which emails you'd like to receive</p>
          <div className="divide-y divide-slate-100">
            <Toggle value={prefs.emailBooking} onChange={() => setPrefs(p => ({ ...p, emailBooking: !p.emailBooking }))} label="Booking updates" desc="Confirmation, reminders, and status changes" />
            <Toggle value={prefs.emailReview} onChange={() => setPrefs(p => ({ ...p, emailReview: !p.emailReview }))} label="Review requests" desc="Get notified when you can leave a review" />
            <Toggle value={prefs.emailMarketing} onChange={() => setPrefs(p => ({ ...p, emailMarketing: !p.emailMarketing }))} label="Promotions & offers" desc="Exclusive deals and platform news" />
          </div>
        </div>
        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-1">Push Notifications</h3>
          <p className="text-slate-400 text-sm mb-4">Control in-app notifications</p>
          <div className="divide-y divide-slate-100">
            <Toggle value={prefs.pushNotif} onChange={() => setPrefs(p => ({ ...p, pushNotif: !p.pushNotif }))} label="In-app notifications" desc="Messages, bookings, and system alerts" />
          </div>
        </div>
        <div className="luxury-card p-6">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Display Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Language</label>
              <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))} className="lux-input bg-white">
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Currency</label>
              <select value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))} className="lux-input bg-white">
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => toast.success('Settings saved!', 'Your preferences have been updated.')} className="btn-primary py-3 px-8">
          Save Settings
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

  React.useEffect(() => {
    if (!user) return;
    reviewService.getByUser(user.id).then(userReviews => {
      setReviews(userReviews);
      setLoading(false);
    });
  }, [user]);

  return (
    <div>
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2xl font-bold text-[#0F172A] mb-6">My Reviews</motion.h1>
      {loading ? <TableSkeleton rows={4} /> : reviews.length === 0 ? (
        <div className="text-center py-20">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-[#0F172A] mb-1">No reviews yet</h3>
          <p className="text-slate-400 text-sm mb-6">Complete a trip to leave your first review!</p>
          <a href="/marketplace" className="btn-primary">Browse Vehicles</a>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {reviews.map((r: any) => (
            <motion.div key={r.id} variants={staggerItem} className="luxury-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(r.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#0F172A]">{r.rating}/5</span>
                <span className="text-xs text-slate-400">· {formatDate(r.createdAt, 'short')}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic mb-2">"{r.comment}"</p>
              <p className="text-xs text-slate-400">Vehicle: <span className="font-medium text-[#0F172A]">{r.vehicleId}</span></p>
              {r.ownerResponse && (
                <div className="mt-3 p-3 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-semibold text-[#0F172A] mb-1">Owner replied:</p>
                  <p className="text-xs text-slate-500 italic">"{r.ownerResponse}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
