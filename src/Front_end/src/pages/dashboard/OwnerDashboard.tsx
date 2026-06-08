import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';

import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle, LogOut, Globe, Menu,
  MapPin, Star, Activity, ArrowUpRight
} from 'lucide-react';

import { useAuthStore, useUIStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import apiClient from '@/services/api';
import type { Vehicle, Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor, convertCurrency } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// Custom glassmorphic tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong border border-slate-200/50 dark:border-white/10 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold">
        <p className="text-slate-400 dark:text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-slate-800 dark:text-white font-extrabold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          Revenue: <span className="text-gold">{formatCurrency(payload[0].value)}</span>
        </p>
        {payload[0].payload.bookings !== undefined && (
          <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
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
          className="lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[260px] shadow-2xl"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
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
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                  <MapPin className="w-3 h-3" /> {featuredVehicle?.location?.city || 'Ho Chi Minh City'}, Vietnam
                </p>
                <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
                  {featuredVehicle?.name || 'Ferrari F8 Tributo'}
                </h2>
                <p className="text-xl font-extrabold mt-1" style={{ color: '#EAB308' }}>
                  {formatCurrency(featuredVehicle?.pricePerDay || 8500000)}
                  <span className="text-sm font-semibold ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/day</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to="/owner/vehicles/new"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-black transition-all"
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
                <p className="text-xl font-extrabold text-white tracking-tight leading-none">{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{stat.label}</p>
                <p className="text-[10px] mt-1 font-semibold flex items-center gap-1" style={{ color: '#10B981' }}>
                  <TrendingUp className="w-2.5 h-2.5" /> {stat.sub}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Goal ring */}
          <motion.div
            variants={staggerItem}
            className="col-span-2 rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>Monthly Goal</p>
                <p className="text-white font-bold text-sm mt-0.5">Revenue Target</p>
              </div>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#ownerGoalGrad)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 20 * goalPct / 100} ${2 * Math.PI * 20 * (1 - goalPct / 100)}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="ownerGoalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EAB308" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-white">{goalPct}%</span>
                </div>
              </div>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #EAB308)' }}
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
          className="lg:col-span-2 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Recent Properties</h3>
            <Link to="/owner/vehicles" className="text-xs font-bold" style={{ color: '#F59E0B' }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              [{
                name: 'Luxury Villa in Bali', city: 'Bali', price: 7500000, status: 'available',
                img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&q=80'
              }, {
                name: 'Modern House in BSD', city: 'BSD City', price: 6200000, status: 'rented',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80'
              }, {
                name: 'Minimalist Home', city: 'Jakarta Selatan', price: 5800000, status: 'available',
                img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80'
              }].map((v, i) => (
                <motion.div key={i} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={v.img} alt={v.name} className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v.name}</p>
                    <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
                      <MapPin className="w-2.5 h-2.5" />{v.city}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: v.status === 'available' ? '#10B981' : '#818CF8' }}>
                      {v.status === 'available' ? 'For Rent' : 'Rented'}
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{formatCurrency(v.price)}</p>
                  </div>
                </motion.div>
              ))
            ) : vehicles.slice(0, 3).map(v => (
              <motion.div key={v.id} whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={v.thumbnailUrl} alt={v.name} className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{v.name}</p>
                  <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    <MapPin className="w-2.5 h-2.5" />{v.location?.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: v.status === 'available' ? '#10B981' : '#818CF8' }}>
                    {v.status === 'available' ? 'For Rent' : 'Rented'}
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{formatCurrency(v.pricePerDay)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-3 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white text-sm">{t.ownerDashboard.revenueChartTitle}</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>Your earnings this year</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Activity className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{t.ownerDashboard.liveAnalytics}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: 'rgba(148,163,184,0.6)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.08)', radius: 8 }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueData.map((_, index) => (
                  <Cell key={index}
                    fill={index === revenueData.length - 1 ? 'url(#ownerBarGrad)' : 'rgba(245,158,11,0.30)'} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="ownerBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
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
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">{t.ownerDashboard.pendingRequests}</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {stats.pending} pending
            </span>
          </div>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'pending').slice(0, 4).map(booking => (
              <div key={booking.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    📅 {formatDate(booking.startDate)} · {formatCurrency(booking.pricing.total)}
                  </p>
                </div>
                <button
                  onClick={() => bookingService.updateStatus(booking.id, 'confirmed')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-black transition-all flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  Approve
                </button>
              </div>
            ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(148,163,184,0.3)' }} />
                <p className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.5)' }}>No pending requests</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Panel */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <BarChart2 className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Tasks</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              {tasks.filter(t => !t.done).length} pending
            </span>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task, i) => (
              <Link key={i} to={task.href}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 group"
                style={{
                  background: task.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${task.done ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: task.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                    border: task.done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                  {task.done
                    ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                    : <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(148,163,184,0.3)' }} />}
                </div>
                <span className="text-sm flex-1 font-medium"
                  style={{ color: task.done ? 'rgba(148,163,184,0.4)' : 'rgba(226,232,240,0.9)', textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
                <div className="flex items-center gap-2">
                  {!task.done && task.count > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: `${task.color}22`, color: task.color, border: `1px solid ${task.color}33` }}>
                      {task.count}
                    </span>
                  )}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#F59E0B' }} />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>
                {tasks.filter(t => t.done).length} of {tasks.length} completed
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>
                {Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tasks.filter(t => t.done).length / tasks.length * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #EAB308)' }}
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t.ownerDashboard.myVehicles}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">{t.ownerDashboard.fleetSubtitle}</p>
        </div>
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift">
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
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {vehicles.map(vehicle => (
            <motion.div key={vehicle.id} variants={staggerItem} className="glass border border-slate-200/50 dark:border-white/5 overflow-hidden rounded-[2rem] hover-lift hover-glow shadow-md group transition-all duration-300 relative">
              <div className="relative h-48 overflow-hidden">
                <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className={`badge text-[9px] font-extrabold uppercase tracking-widest border-2 px-2.5 py-1 rounded-lg ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-5.5">
                <div className="flex items-start justify-between mb-4 border-b border-slate-200/10 dark:border-white/5 pb-3.5">
                  <div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 tracking-tight">{vehicle.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{vehicle.location.city} · <span className="text-gold font-extrabold">{formatCurrency(vehicle.pricePerDay)}</span>{t.marketplace.perDay}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/10 px-2.5 py-1 rounded-lg shadow-sm">
                    <span className="text-amber-500">⭐</span> {vehicle.rating?.toFixed(1) ?? '5.0'}
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Link to={`/vehicles/${vehicle.id}`} className="btn-ghost border border-slate-200/60 dark:border-white/10 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 font-extrabold text-slate-600 dark:text-slate-300 hover:border-gold hover:text-gold transition-colors">
                    <Eye className="w-4 h-4" /> {isVi ? 'Xem Tin Đăng' : 'View Listing'}
                  </Link>
                  <Link to={`/owner/vehicles/${vehicle.id}/edit`} className="btn-ghost border border-slate-200/60 dark:border-white/10 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 font-extrabold text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <Edit className="w-4 h-4" /> {t.common.edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                    className="text-xs font-extrabold px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-1.5 ml-auto shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> {t.common.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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

  const [form, setForm] = useState({
    name: '', brand: '', category: 'supercar', year: new Date().getFullYear(),
    pricePerDay: Math.round(convertCurrency(5000000, 'VND', currency)), description: '', seats: 2, doors: 2,
    transmission: 'Automatic', fuelType: 'Gasoline',
    features: 'Bluetooth, Navigation, Backup Camera',
    address: '', city: '', state: '', zip: '', country: 'US',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
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

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        lat: 34.0522,
        lng: -118.2437,
        timezone: 'America/Los_Angeles'
      },
      model: 'Custom',
      deposit: 0,
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
    } catch (error) {
      toast.error(isVi ? 'Không thể lưu thông tin xe.' : 'Failed to save vehicle listing.');
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

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/owner/vehicles" className="p-3 rounded-xl border border-slate-200/50 dark:border-white/10 hover:bg-slate-500/5 transition-colors text-slate-500 dark:text-slate-400 font-extrabold hover:text-[#EAB308]">
          ← {isVi ? 'Quay Lại' : isJa ? '戻る' : 'Back'}
        </Link>
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {id ? (isVi ? 'Chỉnh Sửa Phương Tiện' : isJa ? '車両情報を編集' : 'Edit Your Vehicle') : (isVi ? 'Đăng Xe Cao Cấp Mới' : isJa ? '高級車を掲載' : 'List a Luxury Vehicle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">{isVi ? 'Định nghĩa trải nghiệm đẳng cấp của bạn' : 'Define your high-end experience'}</p>
        </div>
      </div>

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
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Tên Xe *' : isJa ? '車両名 *' : 'Vehicle Name *'}</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Ferrari F8 Tributo" className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Thương Hiệu *' : isJa ? 'ブランド *' : 'Brand *'}</label>
                <input value={form.brand} onChange={e => update('brand', e.target.value)} required placeholder="e.g. Ferrari" className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Phân Khúc *' : isJa ? 'カテゴリー *' : 'Category *'}</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20">
                  <option value="supercar">Supercar</option>
                  <option value="suv">Luxury SUV</option>
                  <option value="convertible">Convertible</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="electric">Electric</option>
                  <option value="classic">Classic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Năm Sản Xuất *' : isJa ? '製造年 *' : 'Year *'}</label>
                <input type="number" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max={new Date().getFullYear() + 1} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Mô Tả Chi Tiết *' : isJa ? '詳細説明 *' : 'Description *'}</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} required rows={4} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm resize-none focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" placeholder={isVi ? 'Mô tả chi tiết về tình trạng xe, cảm giác lái và các trang bị độc đáo...' : 'Describe your vehicle\'s condition, drive feeling, and unique amenities...'} />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Thông Số & Tiện Nghi' : isJa ? 'スペック・装備' : 'Specs & Features'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Số Chỗ' : isJa ? '座席数' : 'Seats'}</label>
                <input type="number" value={form.seats} onChange={e => update('seats', e.target.value)} min="1" className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Số Cửa' : isJa ? 'ドア数' : 'Doors'}</label>
                <input type="number" value={form.doors} onChange={e => update('doors', e.target.value)} min="2" className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Hộp Số' : isJa ? 'ギア' : 'Transmission'}</label>
                <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20">
                  <option>Automatic</option><option>Manual</option><option>Dual-Clutch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Nhiên Liệu' : isJa ? '燃料' : 'Fuel Type'}</label>
                <select value={form.fuelType} onChange={e => update('fuelType', e.target.value)} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20">
                  <option>Gasoline</option><option>Electric</option><option>Hybrid</option><option>Diesel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Tiện Nghi (Ngăn Cách Bởi Dấu Phẩy)' : isJa ? '装備（カンマ区切り）' : 'Features (comma separated)'}</label>
              <input value={form.features} onChange={e => update('features', e.target.value)} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" placeholder="Bluetooth, Apple CarPlay, Heated Seats..." />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{isVi ? 'Hình Ảnh Xe' : isJa ? '車両画像' : 'Vehicle Image'}</label>
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
                      const res = await fetch('http://localhost:8080/api/v1/upload/vehicle-image', {
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
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Giá Cả & Địa Điểm' : isJa ? '料金・所在地' : 'Pricing & Location'}</h3>
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? `Giá Thuê Hàng Ngày (${currency}) *` : isJa ? `一日あたりの料金（${currency}） *` : `Daily Rate (${currency}) *`}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">{getCurrencySymbol(currency)}</span>
                <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} required min="1" className="lux-input w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl text-slate-800 dark:text-white font-extrabold text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 font-medium">{isVi ? `Trung bình trên LuxeWay: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} dựa trên phân khúc siêu xe.` : `LuxeWay average: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} based on supercars.`}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Địa Chỉ Cụ Thể' : isJa ? '所在地（住所）' : 'Street Address'}</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Thành Phố *' : isJa ? '市区町村 *' : 'City *'}</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} required className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Tỉnh/Bang *' : isJa ? '都道府県 *' : 'State/Province *'}</label>
                <input value={form.state} onChange={e => update('state', e.target.value)} required className="lux-input w-full bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Fleet Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">Manage your vehicle availability, blocked dates, and timelines</p>
        </div>
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

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-2">
        <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Booking Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">Manage and respond to all bookings for your vehicles</p>
      </motion.div>

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
                  {isPending && (
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
                  )}
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
  const { user } = useAuthStore();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    Promise.all([
      bookingService.getByOwner(user.id),
      vehicleService.getByOwner(user.id)
    ]).then(([b, v]) => {
      setBookings(b);
      setVehicles(v);
      setLoading(false);
    });
  }, [user]);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const thisMonth = completedBookings.filter(b => new Date(b.endDate).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + b.pricing.total, 0);
  const avgBooking = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  const carBookings = completedBookings.filter(b => {
    const v = vehicles.find(vh => vh.id === b.vehicleId);
    return v?.vehicleType === 'car' || (v && !['scooter', 'automatic_scooter', 'manual_motorcycle', 'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'].includes(v.category?.toLowerCase()));
  });

  const motorbikeBookings = completedBookings.filter(b => {
    const v = vehicles.find(vh => vh.id === b.vehicleId);
    return v?.vehicleType === 'motorbike' || (v && ['scooter', 'automatic_scooter', 'manual_motorcycle', 'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'].includes(v.category?.toLowerCase()));
  });

  const carRevenue = carBookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const motorbikeRevenue = motorbikeBookings.reduce((sum, b) => sum + b.pricing.total, 0);

  const carBookingsCount = bookings.filter(b => {
    const v = vehicles.find(vh => vh.id === b.vehicleId);
    return v?.vehicleType === 'car' || (v && !['scooter', 'automatic_scooter', 'manual_motorcycle', 'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'].includes(v.category?.toLowerCase()));
  }).length;

  const motorbikeBookingsCount = bookings.filter(b => {
    const v = vehicles.find(vh => vh.id === b.vehicleId);
    return v?.vehicleType === 'motorbike' || (v && ['scooter', 'automatic_scooter', 'manual_motorcycle', 'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'].includes(v.category?.toLowerCase()));
  }).length;

  const totalEcosystemBookings = carBookingsCount + motorbikeBookingsCount;
  const carRevenuePercent = totalRevenue > 0 ? Math.round((carRevenue / totalRevenue) * 100) : 0;
  const motorbikeRevenuePercent = totalRevenue > 0 ? Math.round((motorbikeRevenue / totalRevenue) * 100) : 0;
  const carBookingsPercent = totalEcosystemBookings > 0 ? Math.round((carBookingsCount / totalEcosystemBookings) * 100) : 0;
  const motorbikeBookingsPercent = totalEcosystemBookings > 0 ? Math.round((motorbikeBookingsCount / totalEcosystemBookings) * 100) : 0;

  // Mock data for display when real analytics is empty
  const revenueData = [
    { date: 'May 15', revenue: totalRevenue * 0.1, bookings: 1 },
    { date: 'May 17', revenue: totalRevenue * 0.15, bookings: 2 },
    { date: 'May 19', revenue: totalRevenue * 0.2, bookings: 1 },
    { date: 'May 21', revenue: totalRevenue * 0.35, bookings: 3 },
    { date: 'May 23', revenue: totalRevenue * 0.5, bookings: 2 },
    { date: 'May 25', revenue: totalRevenue * 0.75, bookings: 4 },
    { date: 'May 27', revenue: totalRevenue || 5200, bookings: 5 },
  ];

  const monthlyData = [
    { date: '2026-01', revenue: totalRevenue * 0.4, bookings: 4 },
    { date: '2026-02', revenue: totalRevenue * 0.6, bookings: 6 },
    { date: '2026-03', revenue: totalRevenue * 0.5, bookings: 5 },
    { date: '2026-04', revenue: totalRevenue * 0.8, bookings: 8 },
    { date: '2026-05', revenue: totalRevenue || 5200, bookings: 10 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-2">
        <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Revenue & Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">Deep-dive financial breakdowns and metrics for your listings</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Earnings', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20', change: '+18% this mo', isRevenue: true },
          { label: 'This Month', value: formatCurrency(thisMonth), icon: TrendingUp, color: 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20', change: 'vs last month' },
          { label: 'Completed Trips', value: completedBookings.length.toString(), icon: CheckCircle, color: 'bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20', change: 'all time' },
          { label: 'Avg / Trip', value: formatCurrency(avgBooking), icon: BarChart2, color: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20', change: 'per trip' },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="stat-card glass hover-lift hover-glow border border-slate-200/50 dark:border-white/5 p-5.5 rounded-3xl relative overflow-hidden shadow-sm">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4.5 ${stat.color} shadow-sm`}>
              <stat.icon className="w-5.5 h-5.5" />
            </div>
            <p className={`text-2.5xl font-extrabold tracking-tight ${stat.isRevenue ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
            <p className="text-[10px] text-emerald-500 mt-2.5 flex items-center gap-1 font-bold"><TrendingUp className="w-3 h-3 text-emerald-500" /> {stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200/10 dark:border-white/5 pb-3">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Daily Revenue Flow</h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Last 14 Days</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="ownerRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" tickFormatter={v => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#EAB308" fill="url(#ownerRevGrad)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200/10 dark:border-white/5 pb-3">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Monthly Volume Analysis</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-medium">Trip Performance</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" tickFormatter={v => formatCurrency(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#EAB308" radius={[8, 8, 0, 0]} className="shadow-lg shadow-gold/10" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ecosystem Split */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/10 dark:border-white/5 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Ecosystem Performance Split</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold mt-0.5">Comparative performance: Cars vs Motorbikes</p>
            </div>
            <Activity className="w-5 h-5 text-gold" />
          </div>

          {/* Revenue Split */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">Earnings Split</span>
              <span className="text-slate-700 dark:text-slate-200">
                {carRevenuePercent}% Cars / {motorbikeRevenuePercent}% Motorbikes
              </span>
            </div>
            <div className="h-3.5 bg-slate-200/20 dark:bg-slate-800/40 rounded-full overflow-hidden flex border border-slate-200/5 dark:border-white/5">
              {totalRevenue > 0 ? (
                <>
                  <div 
                    style={{ width: `${carRevenuePercent}%` }} 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500" 
                    title={`Cars: ${formatCurrency(carRevenue)}`}
                  />
                  <div 
                    style={{ width: `${motorbikeRevenuePercent}%` }} 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                    title={`Motorbikes: ${formatCurrency(motorbikeRevenue)}`}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-slate-300/30 dark:bg-slate-700/30 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                  No revenue recorded
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                <span>Cars: <strong className="text-slate-800 dark:text-white">{formatCurrency(carRevenue)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
                <span>Motorbikes: <strong className="text-slate-800 dark:text-white">{formatCurrency(motorbikeRevenue)}</strong></span>
              </div>
            </div>
          </div>

          {/* Bookings/Trips Split */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">Trip Volume Split</span>
              <span className="text-slate-700 dark:text-slate-200">
                {carBookingsPercent}% Cars / {motorbikeBookingsPercent}% Motorbikes
              </span>
            </div>
            <div className="h-3.5 bg-slate-200/20 dark:bg-slate-800/40 rounded-full overflow-hidden flex border border-slate-200/5 dark:border-white/5">
              {totalEcosystemBookings > 0 ? (
                <>
                  <div 
                    style={{ width: `${carBookingsPercent}%` }} 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500" 
                    title={`Cars: ${carBookingsCount} trips`}
                  />
                  <div 
                    style={{ width: `${motorbikeBookingsPercent}%` }} 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                    title={`Motorbikes: ${motorbikeBookingsCount} trips`}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-slate-300/30 dark:bg-slate-700/30 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                  No trips booked
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                <span>Cars: <strong className="text-slate-800 dark:text-white">{carBookingsCount} trips</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
                <span>Motorbikes: <strong className="text-slate-800 dark:text-white">{motorbikeBookingsCount} trips</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== FLEET MANAGEMENT PAGE (SRS REQ-FLEET-001) ======
export const FleetManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Fleet Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">Oversee and manage your entire luxury vehicle fleet</p>
        </div>
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift">
          <Plus className="w-4 h-4" /> Add to Fleet
        </Link>
      </motion.div>

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

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2.5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Team & Operations</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">Manage and assign roles for your fleet drivers, support staff, and managers</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </motion.div>

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
      className="min-h-screen relative overflow-hidden font-sans text-slate-100"
      style={{ background: 'linear-gradient(135deg, #070B14 0%, #0B1221 50%, #070B14 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[450px] h-[450px] rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-1/4 w-80 h-80 rounded-full pointer-events-none opacity-8 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none bg-amber-500" />
      
      {/* Mobile Sidebar Navigation Drawer (SRS REQ-RESP-001) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            {/* Sliding navigation drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-66 z-50 flex flex-col justify-between p-6 lg:hidden shadow-2xl border-r border-slate-200/50 dark:border-slate-800/80"
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, #080d16 0%, #0c1524 60%, #080d16 100%)'
                  : 'linear-gradient(180deg, #f4f7fa 0%, #e9edf3 60%, #f4f7fa 100%)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                {/* Branding */}
                <div className="logo-wrapper flex items-center gap-3 px-2 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-905 shadow-lg">
                    <Car className="w-5.5 h-5.5 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="font-sans font-black text-base tracking-wider text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400">
                      LuxeWay
                    </h2>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                      {t.ownerDashboard.hostCommand}
                    </span>
                  </div>
                </div>

                <div className="mx-2 mb-6 px-3.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-450 animate-ping" />
                  {t.ownerDashboard.verifiedHost}
                </div>

                <hr className="border-slate-200/50 dark:border-slate-800/80 mb-6" />

                {/* Links */}
                <nav className="space-y-1.5 flex-1 overflow-y-auto sidebar-scroll pr-1">
                  {links.map(link => {
                    const active = isActive(link.href, link.exact);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center gap-3 px-4.5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-305 relative group ${
                          active 
                            ? 'bg-gradient-to-r from-amber-550 to-yellow-500 text-slate-900 shadow-xl shadow-amber-500/25 font-black' 
                            : isDark 
                              ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                              : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100/50'
                        }`}
                      >
                        {active && <span className="w-1 h-5 bg-slate-900 rounded-full absolute left-1" />}
                        <link.icon className={`w-4.5 h-4.5 ${active ? 'text-slate-900' : 'text-slate-450 group-hover:text-slate-800 dark:group-hover:text-white'}`} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom user card */}
              <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/80">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/55 shadow-inner">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-900 text-xs font-black flex items-center justify-center shadow-inner">
                    {getInitials(user.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-slate-800 dark:text-white">{user.displayName}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-amber-550 dark:text-amber-400 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); setSidebarOpen(false); navigate('/auth/login'); }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Sticky Left Sidebar */}
        <aside className="w-66 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] rounded-[2.5rem] glass dark:glass-dark border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col justify-between hidden lg:flex relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Branding */}
            <div className="logo-wrapper flex items-center gap-3 px-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-905 shadow-lg">
                <Car className="w-5.5 h-5.5 text-slate-900" />
              </div>
              <div>
                <h2 className="font-sans font-black text-base tracking-wider text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400">
                  LuxeWay
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                  Host Center
                </span>
              </div>
            </div>

            <div className="mx-2 mb-6 px-3.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-450 animate-ping" />
              Verified Host
            </div>

            <hr className="border-slate-200/50 dark:border-slate-800/80 mb-6" />

            {/* Links */}
            <nav className="space-y-1.5 flex-1 overflow-y-auto sidebar-scroll pr-1">
              {links.map(link => {
                const active = isActive(link.href, link.exact);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`w-full flex items-center gap-3 px-4.5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-305 relative group ${
                      active 
                        ? 'bg-gradient-to-r from-amber-550 to-yellow-500 text-slate-900 shadow-xl shadow-amber-500/25 font-black' 
                        : isDark 
                          ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                          : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {active && <span className="w-1 h-5 bg-slate-900 rounded-full absolute left-1" />}
                    <link.icon className={`w-4.5 h-4.5 ${active ? 'text-slate-900' : 'text-slate-450 group-hover:text-slate-800 dark:group-hover:text-white'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom user card */}
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/80">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/55 shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-900 text-xs font-black flex items-center justify-center shadow-inner">
                {getInitials(user.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-slate-800 dark:text-white">{user.displayName}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-550 dark:text-amber-400 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/auth/login'); }}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content canvas */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <header className={`rounded-[2rem] border backdrop-blur-xl transition-all duration-500 ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800/80 shadow-2xl shadow-slate-950/30' 
              : 'bg-white/80 border-slate-200/60 shadow-xl shadow-slate-200/40'
          } p-6 flex items-center justify-between`}>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl border border-slate-200/50 dark:border-white/10 hover:bg-slate-500/10 transition-all lg:hidden shadow-sm"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-550">
                <Car className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="font-sans font-black text-lg tracking-tight text-slate-855 dark:text-white">
                  {t.ownerDashboard.hostCommand}
                </h1>
                <p className="text-[10px] text-amber-550 dark:text-amber-450 font-extrabold uppercase tracking-widest mt-0.5">
                  Platform rental Room
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden md:flex items-center gap-2.5 px-4.5 py-2.5 border rounded-2xl shadow-inner ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button 
                onClick={() => { logout(); navigate('/auth/login'); }}
                className="text-[9px] font-black uppercase tracking-widest px-5 py-3.5 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-500/10 transition-all hover-lift"
              >
                {t.nav.logout}
              </button>
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

