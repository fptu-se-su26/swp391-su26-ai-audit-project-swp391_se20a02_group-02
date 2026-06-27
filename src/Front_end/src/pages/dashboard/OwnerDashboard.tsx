import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';
import { OwnerAnalyticsDashboard } from '@/components/enterprise/OwnerAnalyticsDashboard';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';

import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle, LogOut, Globe, Menu,
  MapPin, Star, Activity, ArrowUpRight, Play
} from 'lucide-react';

import { useAuthStore, useUIStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import apiClient from '@/services/api';
import type { Vehicle, Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor, convertCurrency, cn } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// Custom glassmorphic tooltip for charts (styled as a premium white card with shadow)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xl text-xs font-semibold text-slate-800">
        <p className="text-slate-555 font-bold mb-1">{label}</p>
        <p className="text-slate-800 font-extrabold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Revenue: <span className="text-amber-600">{formatCurrency(payload[0].value)}</span>
        </p>
        {payload[0].payload.bookings !== undefined && (
          <p className="text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Bookings: {payload[0].payload.bookings}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ====== OWNER OVERVIEW ======
export const OwnerOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { currency } = useUIStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();
  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      vehicleService.getByOwner(user.id),
      bookingService.getByOwner(user.id),
    ]).then(([v, b]) => {
      setVehicles(v);
      setBookings(b);
      setLoading(false);
    });
  }, [user]);

  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'available').length,
    totalBookings: bookings.length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.pricing.total, 0),
    pending: bookings.filter(b => b.status === 'pending').length,
    rating: user?.rating || 0,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const revenueData = [
    { month: 'Jan', revenue: Math.max(stats.revenue * 0.08, 1000000) },
    { month: 'Feb', revenue: Math.max(stats.revenue * 0.14, 1500000) },
    { month: 'Mar', revenue: Math.max(stats.revenue * 0.22, 2000000) },
    { month: 'Apr', revenue: Math.max(stats.revenue * 0.30, 2800000) },
    { month: 'May', revenue: Math.max(stats.revenue * 0.45, 3500000) },
    { month: 'Jun', revenue: Math.max(stats.revenue * 0.60, 4200000) },
    { month: 'Jul', revenue: Math.max(stats.revenue * 0.78, 5000000) },
    { month: 'Aug', revenue: Math.max(stats.revenue * 0.90, 6000000) },
    { month: 'Sep', revenue: Math.max(stats.revenue, 7000000) },
  ];

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: '#10B981', glow: 'rgba(16,185,129,0.3)', sub: '+18% this month', isStr: true },
    { label: 'Active Vehicles', value: `${stats.activeVehicles}/${stats.totalVehicles}`, icon: Car, color: '#F59E0B', glow: 'rgba(245,158,11,0.3)', sub: 'Fleet status' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: '#6366F1', glow: 'rgba(99,102,241,0.3)', sub: `${stats.pending} pending` },
    { label: 'My Rating', value: `${stats.rating || '5.0'}/5`, icon: CheckCircle, color: '#EC4899', glow: 'rgba(236,72,153,0.3)', sub: `${user?.totalReviews || 0} reviews` },
  ];

  const goalPct = 72;
  const featuredVehicle = vehicles[0];
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const tasks = [
    { label: 'Approve pending booking requests', done: false, count: stats.pending, color: '#F59E0B', href: '/owner/bookings' },
    { label: 'Add photos to your listings', done: false, count: 2, color: '#6366F1', href: '/owner/vehicles' },
    { label: 'Update vehicle availability calendar', done: false, count: 0, color: '#EC4899', href: '/owner/calendar' },
    { label: 'Respond to customer reviews', done: true, count: 0, color: '#10B981', href: '/owner/revenue' },
    { label: 'Complete earnings dashboard', done: true, count: 0, color: '#10B981', href: '/owner/revenue' },
  ];

  return (
    <div className="space-y-5">
      {/* ---- TOP ROW: Hero Card + Stat Cards ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Hero / Featured Vehicle Card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-3 relative rounded-2xl overflow-hidden min-h-[260px] shadow-xl"
        >
          <img
            src={featuredVehicle?.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80'}
            alt={featuredVehicle?.name || 'Featured Vehicle'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(7,11,20,0.90) 0%, rgba(7,11,20,0.55) 55%, rgba(7,11,20,0.20) 100%)' }} />

          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.9)', color: '#000' }}>
              🏆 Your Top Vehicle
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white">Live</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3 h-3" /> {featuredVehicle?.location?.city || 'Ho Chi Minh City'}, Vietnam
                </p>
                <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
                  {featuredVehicle?.name || 'Ferrari F8 Tributo'}
                </h2>
                <p className="text-xl font-extrabold mt-1 text-amber-400">
                  {formatCurrency(featuredVehicle?.pricePerDay || 8500000)}
                  <span className="text-sm font-semibold ml-1 text-white/50">/day</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to="/owner/vehicles/new"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-550 hover:bg-amber-600 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Add Vehicle
                </Link>
                {featuredVehicle && (
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{featuredVehicle.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards + Goal */}
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          className="lg:col-span-2 grid grid-cols-2 gap-3"
        >
          {statCards.map(stat => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              className="lw-stat-card cursor-default group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" style={{ color: stat.color }} />
              </div>
              <div className="stat-icon" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-sub flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-2.5 h-2.5" /> {stat.sub}
              </p>
            </motion.div>
          ))}

          {/* Goal ring */}
          <motion.div
            variants={staggerItem}
            className="lw-stat-card col-span-2 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="stat-label">Monthly Goal</p>
                <p className="font-bold text-sm text-[var(--lw-text-primary)] mt-0.5">Revenue Target</p>
              </div>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="5" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#ownerGoalGrad)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 20 * goalPct / 100} ${2 * Math.PI * 20 * (1 - goalPct / 100)}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="ownerGoalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-[var(--lw-text-primary)]">{goalPct}%</span>
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ---- MIDDLE ROW: Recent Vehicles + Revenue Chart ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Vehicles */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">Recent Vehicles</h3>
            <Link to="/owner/vehicles" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              ([{
                name: 'Honda Vision 2022', city: 'Ho Chi Minh City', price: 130000, status: 'available',
                img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&q=80'
              }, {
                name: 'Honda Vision 2023 - Premium', city: 'Ho Chi Minh City', price: 150000, status: 'available',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80'
              }, {
                name: 'Honda Vision 2021', city: 'Ho Chi Minh City', price: 120000, status: 'available',
                img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80'
              }] as any[]).map((v, i) => (
                <motion.div key={i} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                <img src={v.thumbnailUrl || v.img} alt={v.name} className="w-16 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{v.name}</p>
                  <p className="text-[11px] font-medium flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3 h-3" />{v.location?.city || v.city}
                  </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: v.status === 'available' ? '#059669' : '#6366F1' }}>
                      {v.status === 'available' ? 'For Rent' : 'Rented'}
                    </span>
                    <p className="text-xs font-bold text-[var(--lw-text-primary)] mt-1">{formatCurrency(v.price)}</p>
                  </div>
                </motion.div>
              ))
            ) : vehicles.slice(0, 3).map(v => (
              <motion.div key={v.id} whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 bg-[var(--lw-bg-secondary)] hover:bg-[var(--lw-bg-card-hover)]">
                <img src={v.thumbnailUrl} alt={v.name} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--lw-text-primary)] truncate">{v.name}</p>
                  <p className="text-[11px] flex items-center gap-1 mt-0.5 text-[var(--lw-text-muted)]">
                    <MapPin className="w-2.5 h-2.5" />{v.location?.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: v.status === 'available' ? '#059669' : '#6366F1' }}>
                    {v.status === 'available' ? 'For Rent' : 'Rented'}
                  </span>
                  <p className="text-xs font-bold text-[var(--lw-text-primary)] mt-1">{formatCurrency(v.pricePerDay)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">{t.ownerDashboard.revenueChartTitle}</h3>
              <p className="text-[11px] mt-0.5 text-[var(--lw-text-muted)]">Your earnings this year</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t.ownerDashboard.liveAnalytics}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217,119,6,0.06)', radius: 8 }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} cursor="pointer" activeBar={{ fillOpacity: 0.8 }}>
                {revenueData.map((_, index) => (
                  <Cell key={index}
                    fill={index === revenueData.length - 1 ? 'url(#ownerBarGrad)' : 'rgba(217,119,6,0.25)'} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="ownerBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ---- BOTTOM ROW: Pending Bookings + Tasks ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Bookings */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">{t.ownerDashboard.pendingRequests}</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200">
              {stats.pending} pending
            </span>
          </div>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'pending').slice(0, 4).map(booking => (
              <div key={booking.id}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 hover:shadow-md">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-800/40 border border-amber-200 dark:border-amber-700/50">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs font-medium mt-1 text-slate-500 dark:text-slate-400">
                    📅 {formatDate(booking.startDate)} · {formatCurrency(booking.pricing.total)}
                  </p>
                </div>
                <button
                  onClick={() => bookingService.updateStatus(booking.id, 'confirmed')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                >
                  Approve
                </button>
              </div>
            ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-[var(--lw-text-muted)]">No pending requests</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Panel */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Tasks</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              {tasks.filter(t => !t.done).length} pending
            </span>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task, i) => (
              <Link key={i} to={task.href}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 group hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                style={{
                  opacity: task.done ? 0.6 : 1,
                }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {task.done
                    ? <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                </div>
                <span className="text-sm flex-1 font-medium text-slate-700 dark:text-slate-300"
                  style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
                <div className="flex items-center gap-2">
                  {!task.done && task.count > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: `${task.color}18`, color: task.color, border: `1px solid ${task.color}30` }}>
                      {task.count}
                    </span>
                  )}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--lw-border)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">
                {tasks.filter(t => t.done).length} of {tasks.length} completed
              </span>
              <span className="text-[10px] font-bold text-amber-600">
                {Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tasks.filter(t => t.done).length / tasks.length * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ====== VEHICLE MANAGEMENT ======
export const VehicleManagePage: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const t = useT();
  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    if (!user) return;
    vehicleService.getByOwner(user.id).then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (window.confirm(isVi ? `Xác nhận xóa xe ${vehicleName}?` : `Delete ${vehicleName}?`)) {
      await vehicleService.delete(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success(isVi ? 'Đã xóa phương tiện thành công' : 'Vehicle deleted');
    }
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.myVehicles }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title={t.ownerDashboard.myVehicles} items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> {t.ownerDashboard.addVehicle}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-3xl animate-pulse" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-20 rounded-[2.5rem] shadow-sm">
          <Car className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg">{t.ownerDashboard.noVehiclesYet}</h3>
          <p className="text-slate-400 text-sm font-medium mb-6">{isVi ? 'Bắt đầu kiếm thu nhập bằng cách đăng ký chiếc xe cao cấp đầu tiên của bạn ngay.' : 'Start earning by listing your first luxury vehicle today.'}</p>
          <Link to="/owner/vehicles/new" className="btn-gold px-6 py-3.5 rounded-xl text-xs font-extrabold font-display hover-lift">{t.ownerDashboard.addFirstVehicle}</Link>
        </div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-sm"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Approval Note</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-sm">
              {vehicles.map(vehicle => {
                const statusLower = (vehicle.approvalStatus || vehicle.status || '').toLowerCase();
                const displayStatus = statusLower === 'approved' ? 'AVAILABLE' : statusLower.toUpperCase();
                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <img 
                        src={vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80'} 
                        alt={vehicle.name} 
                        className="w-16 h-12 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-800"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {vehicle.name}
                    </td>
                    <td className="p-4 font-semibold text-xs text-slate-500 uppercase">
                      {vehicle.vehicleType || 'CAR'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(vehicle.pricePerDay)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                        displayStatus === 'AVAILABLE' || displayStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        displayStatus === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        displayStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {displayStatus === 'REJECTED' && vehicle.approvalNote ? (
                        <span className="text-rose-600 font-medium">{vehicle.approvalNote}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/vehicles/${vehicle.id}`} title={isVi ? 'Xem Tin Đăng' : 'View Listing'} className="p-2 border border-slate-200 dark:border-white/10 hover:border-gold hover:text-gold text-slate-500 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/owner/vehicles/${vehicle.id}/edit`} title={t.common.edit} className="p-2 border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-500 text-slate-500 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {(!vehicle.approvalStatus || vehicle.approvalStatus === 'draft' || vehicle.approvalStatus === 'rejected' || vehicle.approvalStatus === 'pending_approval') && (
                          <button
                            onClick={() => handleDelete(vehicle.id, vehicle.name)}
                            title={t.common.delete}
                            className="p-2 border border-red-500/20 hover:border-red-500 hover:text-red-500 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};


// ====== VEHICLE FORM PAGE ======
export const VehicleFormPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currency } = useUIStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const isJa = t.common.loading.includes('読み込み');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '', brand: '', category: 'supercar', year: new Date().getFullYear(),
    pricePerDay: Math.round(convertCurrency(5000000, 'VND', currency)), description: '', seats: 2, doors: 2,
    transmission: 'Automatic', fuelType: 'Gasoline',
    features: 'Bluetooth, Navigation, Backup Camera',
    address: '', city: '', state: '', zip: '', country: 'US',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    lat: 10.762,
    lng: 106.660,
  });

  const getCurrencySymbol = (code: string) => {
    return {
      USD: '$',
      VND: '₫',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: '$',
      AUD: '$',
      SGD: '$',
      KRW: '₩'
    }[code.toUpperCase()] || '$';
  };

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    vehicleService.getById(id).then(vehicle => {
      if (vehicle) {
        setForm({
          name: vehicle.name || '',
          brand: vehicle.brand || '',
          category: vehicle.category || 'supercar',
          year: vehicle.year || new Date().getFullYear(),
          pricePerDay: Math.round(convertCurrency(vehicle.pricePerDay || 5000000, 'VND', currency)),
          description: vehicle.description || '',
          seats: vehicle.specs?.seats || 2,
          doors: vehicle.specs?.doors || 2,
          transmission: vehicle.specs?.transmission || 'Automatic',
          fuelType: vehicle.specs?.fuelType || 'Gasoline',
          features: vehicle.features ? vehicle.features.join(', ') : 'Bluetooth, Navigation, Backup Camera',
          address: vehicle.location?.address || '',
          city: vehicle.location?.city || '',
          state: (vehicle.location as any)?.state || '',
          zip: (vehicle.location as any)?.zip || '',
          country: vehicle.location?.country || 'US',
          thumbnailUrl: vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
          lat: vehicle.location?.lat !== undefined ? vehicle.location.lat : ((vehicle as any).latitude || 10.762),
          lng: vehicle.location?.lng !== undefined ? vehicle.location.lng : ((vehicle as any).longitude || 106.660),
        });
        setImages(vehicle.images || (vehicle.thumbnailUrl ? [vehicle.thumbnailUrl] : []));
      } else {
        toast.error(isVi ? 'Không tìm thấy phương tiện.' : 'Vehicle not found.');
        navigate('/owner/vehicles');
      }
      setFetching(false);
    }).catch(err => {
      console.error(err);
      toast.error(isVi ? 'Lỗi khi tải thông tin xe.' : 'Error loading vehicle data.');
      setFetching(false);
    });
  }, [id]);

  const update = (k: string, v: string | number) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) {
      setErrors(errs => {
        const next = { ...errs };
        delete next[k];
        return next;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.name.trim()) newErrors.name = isVi ? 'Tên xe không được để trống' : 'Vehicle name is required';
      if (!form.brand.trim()) newErrors.brand = isVi ? 'Thương hiệu không được để trống' : 'Brand is required';
      if (!form.year) newErrors.year = isVi ? 'Năm sản xuất không được để trống' : 'Year is required';
      else if (form.year < 1950 || form.year > new Date().getFullYear() + 1) {
        newErrors.year = isVi ? 'Năm sản xuất không hợp lệ' : 'Invalid manufacturing year';
      }
      if (!form.description.trim()) newErrors.description = isVi ? 'Mô tả không được để trống' : 'Description is required';
    } else if (currentStep === 2) {
      if (images.length === 0 && !form.thumbnailUrl) {
        newErrors.images = isVi ? 'Vui lòng tải lên ít nhất một hình ảnh' : 'At least one image is required';
      }
    } else if (currentStep === 3) {
      if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
        newErrors.pricePerDay = isVi ? 'Giá thuê phải lớn hơn 0' : 'Daily rate must be greater than 0';
      }
      if (!form.city.trim()) newErrors.city = isVi ? 'Thành phố không được để trống' : 'City is required';
      if (!form.state.trim()) newErrors.state = isVi ? 'Tỉnh/Bang không được để trống' : 'State/Province is required';
      if (form.lat === undefined || isNaN(Number(form.lat))) newErrors.lat = isVi ? 'Vĩ độ không được để trống' : 'Latitude is required';
      if (form.lng === undefined || isNaN(Number(form.lng))) newErrors.lng = isVi ? 'Kinh độ không được để trống' : 'Longitude is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) {
      toast.error(isVi ? 'Vui lòng kiểm tra lại thông tin nhập vào' : 'Please check your inputs');
      return;
    }
    if (step < 3) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    const currentThumbnail = images.length > 0 ? images[0] : form.thumbnailUrl;

    const vehicleData: Omit<Vehicle, 'id'> = {
      ownerId: user?.id || '',
      name: form.name,
      brand: form.brand,
      category: form.category as any,
      year: Number(form.year),
      pricePerDay: Math.round(convertCurrency(Number(form.pricePerDay), currency, 'VND')),
      description: form.description,
      status: 'available',
      rating: 5.0,
      thumbnailUrl: currentThumbnail,
      images: images.length > 0 ? images : [currentThumbnail],
      rules: ['No smoking', 'No pets'],
      insurance: { included: true, provider: 'LuxeWay Shield', coverage: 'Premium' },
      availability: { blockedDates: [], minRentalDays: 1, maxRentalDays: 30, advanceBookingDays: 1 },
      specs: {
        seats: Number(form.seats),
        doors: Number(form.doors),
        transmission: form.transmission as any,
        fuelType: form.fuelType as any,
        horsepower: 500,
        topSpeed: 320,
        acceleration: 3.5,
        color: 'Black',
        licensePlate: 'LUXEWAY'
      },
      features: form.features.split(',').map(s => s.trim()).filter(Boolean),
      location: {
        address: form.address,
        city: form.city,
        country: form.country,
        lat: Number(form.lat) || 10.762,
        lng: Number(form.lng) || 106.660,
        timezone: 'Asia/Ho_Chi_Minh'
      },
      model: 'Custom',
      deposit: parseFloat(form.pricePerDay.toString()) * 0.1 || 500000,
      totalReviews: 0,
      totalBookings: 0,
      isVerified: false,
      isFeatured: false,
      wishlistedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addons: [],
      instantBook: false,
      deliveryAvailable: false,
      deliveryFee: 0
    };

    try {
      if (id) {
        await vehicleService.update(id, vehicleData);
        toast.success(
          isVi ? 'Cập Nhật Xe Thành Công!' : 'Vehicle Updated Successfully!',
          isVi ? 'Thông tin xe của bạn đã được lưu lại.' : 'Your vehicle details have been saved.'
        );
      } else {
        await vehicleService.create(user?.id || '', vehicleData);
        toast.success(
          isVi ? 'Đăng Ký Xe Thành Công!' : 'Vehicle Listed Successfully!',
          isVi ? 'Xe của bạn hiện đã hiển thị trên marketplace.' : 'Your vehicle is now live on the marketplace.'
        );
      }
      navigate('/owner/vehicles');
    } catch (error: any) {
      const errMsg = error?.message || '';
      toast.error(
        isVi ? 'Không thể lưu thông tin xe.' : 'Failed to save vehicle listing.',
        errMsg ? errMsg : undefined
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stepsInfo = [
    { num: 1, label: isVi ? 'Hồ Sơ Xe' : isJa ? '車両プロフィール' : 'Vehicle Profile' },
    { num: 2, label: isVi ? 'Thông Số & Tải Lên' : isJa ? 'スペック・アップロード' : 'Specs & Upload' },
    { num: 3, label: isVi ? 'Giá Cả & Địa Điểm' : isJa ? '料金・所在地' : 'Rates & Location' }
  ];

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.myVehicles, href: '/owner/vehicles' },
    { label: id ? (isVi ? 'Chỉnh sửa' : 'Edit') : (isVi ? 'Thêm mới' : 'Add New') }
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Breadcrumbs 
        title={id ? (isVi ? 'Chỉnh Sửa Phương Tiện' : 'Edit Your Vehicle') : (isVi ? 'Đăng Xe Cao Cấp Mới' : 'List a Luxury Vehicle')} 
        items={breadcrumbItems} 
        backHref="/owner/vehicles" 
        backText={isVi ? 'Quay lại danh sách' : 'Back to list'} 
      />

      {/* Modern Capsule Step Indicators with labels */}
      <div className="mb-8">
        <div className="flex gap-3 mb-3.5">
          {stepsInfo.map(s => (
            <div key={s.num} className={`h-2 flex-1 rounded-full transition-all duration-500 ${s.num <= step ? 'bg-gold shadow-sm shadow-[#EAB308]/25' : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          {stepsInfo.map(s => (
            <span key={s.num} className={s.num === step ? 'text-gold' : ''}>{s.label}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass border border-slate-200/50 dark:border-white/5 p-6 md:p-8 rounded-[2rem] shadow-md">
        {step === 1 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Thông Tin Cơ Bản' : isJa ? '基本情報' : 'Basic Information'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Tên Xe *' : isJa ? '車両名 *' : 'Vehicle Name *'}</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Ferrari F8 Tributo" className={`lw-input-interactive ${errors.name ? 'error' : ''}`} />
                {errors.name && <p className="lw-form-error-text">{errors.name}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Thương Hiệu *' : isJa ? 'ブランド *' : 'Brand *'}</label>
                <input value={form.brand} onChange={e => update('brand', e.target.value)} required placeholder="e.g. Ferrari" className={`lw-input-interactive ${errors.brand ? 'error' : ''}`} />
                {errors.brand && <p className="lw-form-error-text">{errors.brand}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Phân Khúc *' : isJa ? 'カテゴリー *' : 'Category *'}</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option value="supercar">Supercar</option>
                  <option value="suv">Luxury SUV</option>
                  <option value="convertible">Convertible</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="electric">Electric</option>
                  <option value="classic">Classic</option>
                </select>
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Năm Sản Xuất *' : isJa ? '製造年 *' : 'Year *'}</label>
                <input type="number" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max={new Date().getFullYear() + 1} className={`lw-input-interactive ${errors.year ? 'error' : ''}`} />
                {errors.year && <p className="lw-form-error-text">{errors.year}</p>}
              </div>
              <div className="md:col-span-2 lw-form-group">
                <label className="lw-form-label">{isVi ? 'Mô Tả Chi Tiết *' : isJa ? '詳細説明 *' : 'Description *'}</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} required rows={4} className={`lw-input-interactive resize-none ${errors.description ? 'error' : ''}`} placeholder={isVi ? 'Mô tả chi tiết về tình trạng xe, cảm giác lái và các trang bị độc đáo...' : 'Describe your vehicle\'s condition, drive feeling, and unique amenities...'} />
                {errors.description && <p className="lw-form-error-text">{errors.description}</p>}
              </div>
            </div>
          </motion.div>
        )}
 
        {step === 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Thông Số & Tiện Nghi' : isJa ? 'スペック・装備' : 'Specs & Features'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Số Chỗ' : isJa ? '座席数' : 'Seats'}</label>
                <input type="number" value={form.seats} onChange={e => update('seats', e.target.value)} min="1" className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Số Cửa' : isJa ? 'ドア数' : 'Doors'}</label>
                <input type="number" value={form.doors} onChange={e => update('doors', e.target.value)} min="2" className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Hộp Số' : isJa ? 'ギア' : 'Transmission'}</label>
                <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option>Automatic</option><option>Manual</option><option>Dual-Clutch</option>
                </select>
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Nhiên Liệu' : isJa ? '燃料' : 'Fuel Type'}</label>
                <select value={form.fuelType} onChange={e => update('fuelType', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option>Gasoline</option><option>Electric</option><option>Hybrid</option><option>Diesel</option>
                </select>
              </div>
            </div>
            <div className="lw-form-group">
              <label className="lw-form-label">{isVi ? 'Tiện Nghi (Ngăn Cách Bởi Dấu Phẩy)' : isJa ? '装備（カンマ区切り）' : 'Features (comma separated)'}</label>
              <input value={form.features} onChange={e => update('features', e.target.value)} className="lw-input-interactive" placeholder="Bluetooth, Apple CarPlay, Heated Seats..." />
            </div>
            <div className="mt-4">
              <label className="lw-form-label mb-3">{isVi ? 'Hình Ảnh Xe' : isJa ? '車両画像' : 'Vehicle Image'}</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-gold rounded-3xl p-7 text-center transition-colors cursor-pointer relative bg-slate-500/5 hover:bg-slate-500/10 group animate-fade-in">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const token = localStorage.getItem('luxeway_access_token');
                      const res = await fetch('http://localhost:8080/upload/vehicle-image', {
                        method: 'POST',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: formData,
                      });
                      const data = await res.json();
                      const url = data.imageUrl || data.url;
                      if (url) {
                        setImages([url]);
                        update('thumbnailUrl', url);
                      }
                    } catch (err) {
                      console.error('Upload failed:', err);
                    }
                    e.target.value = '';
                  }}
                />
                {images.length > 0 ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-md">
                    <img src={images[0]} alt="Preview" className="w-full h-56 object-cover rounded-2xl mb-2.5" />
                    <p className="text-xs text-emerald-500 font-extrabold flex items-center justify-center gap-1.5">✓ {isVi ? 'Tải ảnh lên thành công' : 'Image Loaded Successfully'}</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/80 rounded-2.5xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-200/10">
                      <span className="text-2xl">📷</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{isVi ? 'Nhấp hoặc kéo thả để tải lên ảnh xe' : 'Click or drag to upload vehicle image'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">JPG, PNG, WEBP · Max 5MB</p>
                  </div>
                )}
              </div>
              {errors.images && <p className="lw-form-error-text mt-2">{errors.images}</p>}
            </div>
          </motion.div>
        )}
 
        {step === 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Giá Cả & Địa Điểm' : isJa ? '料金・所在地' : 'Pricing & Location'}</h3>
            <div className="lw-form-group">
              <label className="lw-form-label">{isVi ? `Giá Thuê Hàng Ngày (${currency}) *` : isJa ? `一日あたりの料金（${currency}） *` : `Daily Rate (${currency}) *`}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">{getCurrencySymbol(currency)}</span>
                <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} required min="1" className={`lw-input-interactive pl-9 ${errors.pricePerDay ? 'error' : ''}`} />
              </div>
              {errors.pricePerDay && <p className="lw-form-error-text">{errors.pricePerDay}</p>}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 font-medium">{isVi ? `Trung bình trên LuxeWay: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} dựa trên phân khúc siêu xe.` : `LuxeWay average: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} based on supercars.`}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 lw-form-group">
                <label className="lw-form-label">{isVi ? 'Địa Chỉ Cụ Thể' : isJa ? '所在地（住所）' : 'Street Address'}</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Thành Phố *' : isJa ? '市区町村 *' : 'City *'}</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} required className={`lw-input-interactive ${errors.city ? 'error' : ''}`} />
                {errors.city && <p className="lw-form-error-text">{errors.city}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Tỉnh/Bang *' : isJa ? '都道府県 *' : 'State/Province *'}</label>
                <input value={form.state} onChange={e => update('state', e.target.value)} required className={`lw-input-interactive ${errors.state ? 'error' : ''}`} />
                {errors.state && <p className="lw-form-error-text">{errors.state}</p>}
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="lw-form-group">
                  <label className="lw-form-label">Latitude *</label>
                  <input type="number" step="any" value={form.lat} onChange={e => update('lat', parseFloat(e.target.value) || 0)} required className={`lw-input-interactive font-mono ${errors.lat ? 'error' : ''}`} />
                  {errors.lat && <p className="lw-form-error-text">{errors.lat}</p>}
                </div>
                <div className="lw-form-group">
                  <label className="lw-form-label">Longitude *</label>
                  <input type="number" step="any" value={form.lng} onChange={e => update('lng', parseFloat(e.target.value) || 0)} required className={`lw-input-interactive font-mono ${errors.lng ? 'error' : ''}`} />
                  {errors.lng && <p className="lw-form-error-text">{errors.lng}</p>}
                </div>
              </div>
 
              <div className="md:col-span-2 space-y-2.5">
                <label className="lw-form-label">
                  {isVi ? 'Vị Trí Trên Bản Đồ (Click để chọn tọa độ mới)' : 'Location on Map (Click to select new coordinates)'}
                </label>
                <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-10">
                  <LocationPickerMap lat={form.lat || 10.762} lng={form.lng || 106.660} onChange={(lat, lng) => {
                    setForm(f => ({ ...f, lat, lng }));
                  }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200/10 dark:border-white/5">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }} className="btn-ghost border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl font-extrabold text-slate-600 dark:text-slate-300 hover:text-[#EAB308] transition-colors">
              {isVi ? 'Quay Lại' : isJa ? '戻る' : 'Back'}
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5 text-sm font-extrabold rounded-xl shadow-lg hover-lift">
            {loading ? (isVi ? 'Đang Đăng Xe...' : 'Publishing listing...') : step === 3 ? (isVi ? 'Đăng Xe Lên Hệ Thống' : isJa ? '車両を掲載する' : 'Publish Listing') : (isVi ? 'Tiếp Theo' : isJa ? '次へ' : 'Next Step')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ====== OWNER CALENDAR PAGE ======
export const OwnerCalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const t = useT();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      vehicleService.getByOwner(user.id),
      bookingService.getByOwner(user.id),
    ]).then(([v, b]) => {
      setVehicles(v);
      setBookings(b);
      setLoading(false);
    });
  }, [user]);

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (selectedVehicle !== 'all' && b.vehicleId !== selectedVehicle) return false;
      const start = b.startDate.slice(0, 10);
      const end = b.endDate.slice(0, 10);
      return dateStr >= start && dateStr <= end && b.status !== 'cancelled';
    });
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.calendar }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title="Fleet Calendar" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <div className="flex items-center gap-3">
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="lux-input py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white font-extrabold min-w-[220px] rounded-xl focus:border-gold/50"
          >
            <option value="all">All Fleet Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="glass border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] shadow-md overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/25 dark:border-white/5 flex items-center justify-between bg-slate-500/5">
          <h2 className="font-display text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 hover:bg-slate-500/10 transition-all font-extrabold text-slate-600 dark:text-slate-300 text-sm hover:text-gold hover-lift">
              ←
            </button>
            <button onClick={nextMonth} className="p-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 hover:bg-slate-500/10 transition-all font-extrabold text-slate-600 dark:text-slate-300 text-sm hover:text-gold hover-lift">
              →
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-200/25 dark:border-white/5 bg-slate-500/3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-3.5 text-center text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {paddingDays.map(i => <div key={`pad-${i}`} className="h-24 rounded-2xl bg-slate-500/3 border border-slate-200/5 dark:border-white/3 opacity-30" />)}
            
            {days.map(day => {
              const dayBookings = getBookingsForDay(day);
              const isToday = day === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear();
              
              return (
                <div 
                  key={day} 
                  className={`h-24 rounded-2xl border p-2 flex flex-col transition-all duration-300 relative group ${
                    isToday 
                      ? 'border-[#EAB308] bg-yellow-500/10 ring-2 ring-[#EAB308]/20 shadow-md shadow-[#EAB308]/15' 
                      : 'border-slate-200/30 dark:border-white/5 hover:border-gold/30 bg-slate-500/5 hover:bg-slate-500/8'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isToday ? 'text-gold' : 'text-slate-600 dark:text-slate-300'}`}>{day}</span>
                  
                  <div className="mt-1 flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {dayBookings.map((b, i) => (
                      <div key={b.id} className="text-[9px] leading-tight px-2 py-1 rounded-lg bg-gold/15 text-gold border border-gold/25 font-bold truncate shadow-sm hover:scale-102 transition-transform duration-300 cursor-pointer" title={`Booking #${b.id.slice(-4)}`}>
                        {vehicles.find(v => v.id === b.vehicleId)?.name || 'Booked'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== OWNER BOOKINGS PAGE ======
export const OwnerBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const toast = useToast();
  const t = useT();

  React.useEffect(() => {
    if (!user) return;
    bookingService.getByOwner(user.id).then(b => {
      setBookings(b);
      setLoading(false);
    });
  }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleApprove = async (bookingId: string) => {
    await bookingService.updateStatus(bookingId, 'confirmed');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    toast.success('Booking approved!', 'The renter has been notified.');
  };

  const handleReject = async (bookingId: string) => {
    await bookingService.updateStatus(bookingId, 'cancelled');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    toast.success('Booking rejected', 'The renter has been notified.');
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: 'Bookings' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs title="Booking Requests" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" />

      {/* Filter Tabs - Premium Capsule Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-none">
        {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 hover-lift ${
              filter === status 
                ? 'border-gold bg-yellow-500/10 text-gold shadow-sm shadow-gold/20' 
                : 'border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-slate-500/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${bookings.length})`}
            {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-2 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full inline-flex items-center justify-center font-extrabold shadow-sm animate-pulse">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-[2rem] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-20 rounded-[2.5rem] shadow-sm">
          <Calendar className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-lg">No {filter !== 'all' ? filter : ''} bookings</h3>
          <p className="text-slate-400 text-xs font-semibold">Bookings for your vehicles will appear here</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {filtered.map(booking => {
            const isPending = booking.status === 'pending';
            return (
              <motion.div key={booking.id} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 p-5.5 rounded-[2rem] hover-lift hover-glow shadow-sm transition-all duration-300 relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-500/5 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-200/20 dark:border-white/10 shadow-sm">
                      <Calendar className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <p className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                        <span className={`badge text-[9px] font-extrabold uppercase tracking-widest border-2 px-2.5 py-0.5 rounded-lg ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · <span className="text-gold font-extrabold">{booking.totalDays} days</span></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1">Renter: <span className="font-bold text-slate-700 dark:text-slate-200">{booking.renterId.slice(0, 12) + '...'}</span></p>
                      <p className="text-base font-extrabold text-emerald-500 dark:text-emerald-400 mt-2.5">{formatCurrency(booking.pricing.total)}</p>
                    </div>
                  </div>
                  {isPending ? (
                    <div className="flex gap-2.5 flex-shrink-0 justify-end mt-2 sm:mt-0">
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleApprove(booking.id)}
                        className="flex items-center gap-1.5 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/10 transition-all hover-lift"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Request
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleReject(booking.id)}
                        className="flex items-center gap-1.5 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 rounded-xl text-xs font-extrabold transition-all hover-lift"
                      >
                        Reject
                      </motion.button>
                    </div>
                  ) : (booking.status === 'confirmed' || booking.status === 'active') ? (
                    <div className="flex gap-2.5 flex-shrink-0 justify-end mt-2 sm:mt-0">
                      <Link
                        to={`/owner/bookings/${booking.id}/tracking`}
                        className="flex items-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/15 transition-all hover-lift"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Simulate & Track
                      </Link>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export const OwnerRevenuePage: React.FC = () => {
  const t = useT();
  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.revenue }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs title={t.ownerDashboard.revenue} items={breadcrumbItems} backHref="/owner" backText="Back to Overview" />
      <OwnerAnalyticsDashboard />
    </div>
  );
};

// ====== FLEET MANAGEMENT PAGE (SRS REQ-FLEET-001) ======
export const FleetManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const t = useT();

  useEffect(() => {
    if (!user) return;
    vehicleService.getByOwner(user.id).then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, [user]);

  const filtered = selectedStatus === 'all' ? vehicles : vehicles.filter(v => v.status === selectedStatus);

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  const utilizationRate = stats.total > 0 ? Math.round((stats.rented / stats.total) * 100) : 0;

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: 'Fleet Management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title="Fleet Management" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> Add to Fleet
        </Link>
      </div>

      {/* Fleet Stats Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Fleet', value: stats.total, icon: Car, color: 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20', sub: 'All vehicles' },
          { label: 'Available', value: stats.available, icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20', sub: 'Ready to rent' },
          { label: 'Currently Rented', value: stats.rented, icon: Users, color: 'bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20', sub: `${utilizationRate}% utilization` },
          { label: 'In Maintenance', value: stats.maintenance, icon: Shield, color: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20', sub: 'Under service' },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="stat-card glass hover-lift hover-glow border border-slate-200/50 dark:border-white/5 p-5.5 rounded-3xl relative overflow-hidden shadow-sm">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4.5 ${stat.color} shadow-sm`}>
              <stat.icon className="w-5.5 h-5.5" />
            </div>
            <p className="text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2.5">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Utilization Bar */}
      <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-800 dark:text-white">Fleet Utilization Rate</p>
          <span className="text-sm font-extrabold text-gold">{utilizationRate}%</span>
        </div>
        <div className="h-3.5 bg-slate-200/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationRate}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-gold to-[#EAB308] rounded-full shadow-sm shadow-[#EAB308]/20"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-3">{stats.rented} of {stats.total} vehicles currently generating revenue</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-none">
        {['all', 'available', 'rented', 'maintenance', 'unavailable'].map(s => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 hover-lift ${
              selectedStatus === s 
                ? 'border-gold bg-yellow-500/10 text-gold shadow-sm shadow-gold/20' 
                : 'border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-slate-500/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            {s === 'all' && ` (${vehicles.length})`}
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      {loading ? (
        <div className="space-y-3.5">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-16 rounded-[2rem] shadow-sm">
          <Car className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
          <p className="text-slate-400 text-sm font-semibold">No vehicles with status: {selectedStatus}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="glass border border-slate-200/50 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-500/5 border-b border-slate-200/25 dark:border-white/5">
                <tr>
                  {['Vehicle', 'Status', 'Price/Day', 'Rating', 'Location', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-4 text-left text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10 dark:divide-white/5">
                {filtered.map(vehicle => (
                  <motion.tr key={vehicle.id} variants={staggerItem} className="hover:bg-slate-500/3 transition-colors">
                    <td className="py-4 px-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-14 h-10 object-cover rounded-xl flex-shrink-0 border border-slate-200/25 shadow-sm" />
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">{vehicle.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{vehicle.brand} · {vehicle.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge text-[9px] font-extrabold uppercase tracking-widest border-2 px-2.5 py-0.5 rounded-lg ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-extrabold text-slate-850 dark:text-white">{formatCurrency(vehicle.pricePerDay)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-350">
                        <span className="text-amber-500">⭐</span>
                        <span>{vehicle.rating?.toFixed(1) ?? '5.0'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-semibold">{vehicle.location?.city ?? '—'}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/vehicles/${vehicle.id}`} className="p-2 rounded-xl hover:bg-slate-500/5 text-slate-400 hover:text-gold transition-colors border border-transparent hover:border-slate-200/20 shadow-sm" title="View Listing">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/owner/vehicles/${vehicle.id}/edit`} className="p-2 rounded-xl hover:bg-slate-500/5 text-slate-400 hover:text-blue-500 transition-colors border border-transparent hover:border-slate-200/20 shadow-sm" title="Edit Vehicle">
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ====== EMPLOYEE MANAGEMENT PAGE (SRS REQ-FLEET-003) ======
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  assignedVehicles?: any[];
}

export const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', role: 'driver' });
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    apiClient.get<any>('/employees')
      .then(res => {
        setEmployees(res.data || res.content || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone) return;
    try {
      const res = await apiClient.post<any>('/employees', {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        role: newEmployee.role.toUpperCase(),
        status: 'ACTIVE'
      });
      const emp = res.data;
      if (emp) {
        setEmployees(prev => [emp, ...prev]);
        setNewEmployee({ name: '', email: '', phone: '', role: 'driver' });
        setShowAddForm(false);
        toast.success('Employee added', `${emp.name} has been added to your team.`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Failed to add employee');
    }
  };

  const toggleStatus = async (emp: Employee) => {
    const newStatus = emp.status.toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiClient.put<any>(`/employees/${emp.id}`, {
        ...emp,
        status: newStatus
      });
      const updated = res.data;
      if (updated) {
        setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e));
        toast.success('Status updated', `${emp.name} is now ${newStatus.toLowerCase()}.`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Failed to update employee status');
    }
  };

  const getRoleColor = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'driver') return 'bg-blue-500/10 text-blue-500 border-blue-200/20';
    if (r === 'manager') return 'bg-purple-500/10 text-purple-550 border-purple-200/20';
    return 'bg-slate-500/5 text-slate-500 border-slate-200/20';
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: 'Team Management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title="Team & Operations" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <button onClick={() => setShowAddForm(true)} className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Staff', value: employees.length, color: 'text-blue-500' },
          { label: 'Active Roster', value: employees.filter(e => e.status.toUpperCase() === 'ACTIVE').length, color: 'text-emerald-500' },
          { label: 'Drivers', value: employees.filter(e => e.role.toLowerCase() === 'driver').length, color: 'text-purple-500' },
        ].map(s => (
          <motion.div key={s.label} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 p-4.5 rounded-[1.5rem] text-center shadow-sm hover-lift">
            <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Employee Form */}
      {showAddForm && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass border border-slate-200/50 dark:border-white/5 p-6 mb-6 rounded-[2rem] shadow-md animate-fade-in">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200/10 dark:border-white/5 pb-2.5">Add New Employee</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                value={newEmployee.name}
                onChange={e => setNewEmployee(p => ({ ...p, name: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-850 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold/50"
                placeholder="Nguyen Van A"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email *</label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={e => setNewEmployee(p => ({ ...p, email: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-850 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold/50"
                placeholder="employee@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone *</label>
              <input
                value={newEmployee.phone}
                onChange={e => setNewEmployee(p => ({ ...p, phone: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-850 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold/50"
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role</label>
              <select
                value={newEmployee.role}
                onChange={e => setNewEmployee(p => ({ ...p, role: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-850 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold/50"
              >
                <option value="driver">Driver</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={addEmployee} className="btn-primary text-xs font-extrabold px-6 py-3 rounded-xl shadow-md hover-lift">Add Employee</button>
            <button onClick={() => setShowAddForm(false)} className="btn-ghost border border-slate-200 dark:border-white/10 text-xs font-extrabold px-6 py-3 rounded-xl text-slate-655 dark:text-slate-350 hover:text-gold">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Employee Table */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="glass border border-slate-200/50 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-500/5 border-b border-slate-200/25 dark:border-white/5">
              <tr>
                {['Employee', 'Role', 'Assigned Vehicles', 'Joined Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-4 text-left text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest first:pl-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-semibold">Loading team roster...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-xs font-semibold">No registered team members found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <motion.tr key={emp.id} variants={staggerItem} className="hover:bg-slate-500/3 transition-colors">
                    <td className="py-4 px-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-slate-900 text-sm font-extrabold flex-shrink-0 border-2 border-white/10 shadow-sm">
                          {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">{emp.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{emp.email} · {emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge text-[9px] font-extrabold uppercase tracking-widest border-2 px-2.5 py-0.5 rounded-lg ${getRoleColor(emp.role)}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        <Car className="w-4 h-4 text-slate-450" />
                        <span>{emp.assignedVehicles?.length || 0} vehicles</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {formatDate(emp.createdAt || new Date().toISOString(), 'short')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge text-[9px] font-extrabold uppercase tracking-widest border-2 px-2.5 py-0.5 rounded-lg ${
                        emp.status.toUpperCase() === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-slate-500/5 text-slate-450 border-slate-200/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(emp)}
                        className="text-[10px] font-extrabold px-3 py-2 rounded-lg border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:border-gold hover:text-gold hover:bg-yellow-500/5 transition-all shadow-sm"
                      >
                        {emp.status.toUpperCase() === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export const OwnerDashboardLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, sidebarOpen, setSidebarOpen } = useUIStore();
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated]);

  const links = [
    { href: '/', icon: Globe, label: t.marketplace.home, exact: true },
    { href: '/owner', icon: LayoutDashboard, label: t.ownerDashboard.overview, exact: true },
    { href: '/owner/vehicles', icon: Car, label: t.ownerDashboard.myVehicles },
    { href: '/owner/calendar', icon: Clock, label: t.ownerDashboard.calendar },
    { href: '/owner/bookings', icon: Calendar, label: t.ownerDashboard.bookings },
    { href: '/owner/revenue', icon: TrendingUp, label: t.ownerDashboard.revenue },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'O';
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  if (!user) return null;

  return (
    <div
      className="theme-owner min-h-screen relative font-sans bg-[var(--lw-bg-primary)] text-[var(--lw-text-primary)] transition-colors duration-300"
    >
      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            {/* Sliding navigation drawer - mobile */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lw-sidebar fixed left-0 top-0 h-full z-50 flex lg:hidden shadow-2xl"
            >
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                {/* Branding */}
                <div className="lw-sidebar-logo">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="lw-sidebar-logo-text text-[var(--lw-text-primary)]">LuxeWay</h2>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Host Center</span>
                  </div>
                </div>

                <div className="lw-sidebar-role-badge bg-amber-500/10 text-amber-600 border border-amber-500/20 m-0 mx-5 my-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Verified Host
                </div>

                {/* Links */}
                <div className="lw-sidebar-nav space-y-0.5">
                  {links.map(link => {
                    const active = isActive(link.href, link.exact);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative lw-sidebar-nav-item",
                          active && "active"
                        )}
                      >
                        <link.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom user card */}
              <div className="lw-sidebar-footer">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)]">
                  <Avatar src={user.avatar} name={user.displayName} size="md" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-[var(--lw-text-primary)]">{user.displayName}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); setSidebarOpen(false); navigate('/auth/login'); }}
                    className="p-2 text-[var(--lw-text-muted)] hover:text-red-500 transition-colors"
                    title={t.nav.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main dashboard flex layout */}
      <div className="lw-flex-layout pt-16">
        
        {/* ============ SIDEBAR ============ */}
        <aside className="lw-sidebar hidden lg:flex border-r border-[var(--lw-border)] bg-[var(--lw-sidebar-bg)]">
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Role Badge only, no double logo on desktop */}
            <div className="px-5 py-4 border-b border-[var(--lw-border)]">
              <div className="lw-sidebar-role-badge bg-amber-500/10 text-amber-600 border border-amber-500/20 m-0 w-full flex items-center justify-center py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />
                Verified Host
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lw-sidebar-nav space-y-0.5">
              {links.map(link => {
                const active = isActive(link.href, link.exact);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                       "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative lw-sidebar-nav-item",
                      active && "active"
                    )}
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom user card */}
          <div className="lw-sidebar-footer">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)]">
              <Avatar src={user.avatar} name={user.displayName} size="md" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-[var(--lw-text-primary)]">{user.displayName}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/auth/login'); }}
                className="p-2 text-[var(--lw-text-muted)] hover:text-red-500 transition-colors"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <div className="lw-flex-main gap-0">
          {/* Dashboard Header Bar */}
          <header className="p-5 border-b border-[var(--lw-border)] flex items-center justify-between gap-4 bg-[var(--lw-bg-card)] mb-6 -mx-6 -mt-6 px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl border border-[var(--lw-border)] hover:bg-[var(--lw-bg-secondary)] transition-all lg:hidden"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-[var(--lw-text-secondary)]" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Car className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-[var(--lw-text-primary)]">
                  {t.ownerDashboard.hostCommand}
                </h1>
                <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest">
                  Owner Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 border border-[var(--lw-border)] rounded-xl bg-[var(--lw-bg-secondary)]">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-semibold text-[var(--lw-text-secondary)]">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

