import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';

import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle
} from 'lucide-react';

import { useAuthStore, useUIStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import apiClient from '@/services/api';
import type { Vehicle, Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();
  const isVi = t.common.loading.includes('Đang');
  const analytics: any[] = [];

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

  // Mock data for display when real analytics is empty
  const revenueData = [
    { date: 'May 15', revenue: stats.revenue * 0.1, bookings: 1 },
    { date: 'May 17', revenue: stats.revenue * 0.15, bookings: 2 },
    { date: 'May 19', revenue: stats.revenue * 0.2, bookings: 1 },
    { date: 'May 21', revenue: stats.revenue * 0.35, bookings: 3 },
    { date: 'May 23', revenue: stats.revenue * 0.5, bookings: 2 },
    { date: 'May 25', revenue: stats.revenue * 0.75, bookings: 4 },
    { date: 'May 27', revenue: stats.revenue, bookings: 5 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3.5xl font-extrabold text-slate-800 dark:text-white mb-1.5 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t.ownerDashboard.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{t.ownerDashboard.subtitle.replace('{name}', user?.firstName || '')}</p>
        </div>
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift">
          <Plus className="w-4.5 h-4.5" /> {t.ownerDashboard.addVehicle}
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {[
          {
            label: t.ownerDashboard.totalRevenue,
            value: formatCurrency(stats.revenue),
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, #10B981, #059669)',
            change: isVi ? '+18% tháng này' : '+18% this month',
          },
          {
            label: t.ownerDashboard.activeVehicles,
            value: `${stats.activeVehicles}/${stats.totalVehicles}`,
            icon: Car,
            gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            change: t.ownerDashboard.activeVehiclesDesc,
          },
          {
            label: t.ownerDashboard.totalBookings,
            value: stats.totalBookings,
            icon: Calendar,
            gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
            change: t.ownerDashboard.totalBookingsDesc,
          },
          {
            label: t.ownerDashboard.myRating,
            value: `${stats.rating || '5.0'}/5`,
            icon: CheckCircle,
            gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
            change: t.ownerDashboard.myRatingDesc.replace('{count}', String(user?.totalReviews || 0)),
          },
        ].map(stat => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 cursor-default transition-all duration-300 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 blur-2xl pointer-events-none"
              style={{ background: stat.gradient }} />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                style={{ background: stat.gradient }}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              <p className="text-[10px] text-emerald-500 mt-2 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3 h-3 text-emerald-550" /> {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{t.ownerDashboard.revenueChartTitle}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.ownerDashboard.revenueChartSub}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-xl">
            {t.ownerDashboard.liveAnalytics}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="ownerRevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="url(#ownerRevGradient)" strokeWidth={3} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>      {/* Recent Bookings + Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{t.ownerDashboard.pendingRequests}</h3>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
              {t.ownerDashboard.pendingCount.replace('{count}', String(stats.pending))}
            </span>
          </div>
          <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[350px] pr-1">
            {bookings.filter(b => b.status === 'pending').slice(0, 4).map(booking => (
              <div key={booking.id} className="glass border border-gold/30 hover:border-gold/60 p-4 rounded-2xl flex items-center gap-4 hover-lift hover-glow transition-all duration-300">
                <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-slate-800 dark:text-white">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">📅 {formatDate(booking.startDate)} · {formatCurrency(booking.pricing.total)}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => bookingService.updateStatus(booking.id, 'confirmed')}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/10 hover-lift"
                    title="Confirm Booking"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-12 font-medium my-auto">{t.ownerDashboard.noPendingRequests}</p>
            )}
          </div>
        </div>

        {/* My Vehicles */}
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-slate-200/10 dark:border-white/5 pb-3">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{t.ownerDashboard.myFleet}</h3>
            <Link to="/owner/vehicles" className="text-xs font-extrabold text-gold hover:underline">{t.ownerDashboard.manageFleet}</Link>
          </div>
          <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[350px] pr-1">
            {vehicles.slice(0, 4).map(vehicle => (
              <div key={vehicle.id} className="flex items-center gap-4 p-3 bg-white/5 dark:bg-slate-900/40 border border-slate-200/20 dark:border-white/5 hover:border-gold/30 rounded-2.5xl hover-lift transition-all duration-300">
                <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-14 h-11 rounded-xl object-cover flex-shrink-0 border-2 border-white/10 shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{vehicle.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{formatCurrency(vehicle.pricePerDay)}{t.marketplace.perDay}</p>
                </div>
                <span className={`badge text-[9px] font-extrabold tracking-wider uppercase border-2 ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="text-center py-10 my-auto">
                <Car className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t.ownerDashboard.noVehiclesYet}</p>
                <Link to="/owner/vehicles/new" className="btn-gold mt-4 text-xs font-bold px-5 py-2.5 rounded-xl">{t.ownerDashboard.addFirstVehicle}</Link>
              </div>
            )}
          </div>
        </div>
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
    pricePerDay: 500, description: '', seats: 2, doors: 2,
    transmission: 'Automatic', fuelType: 'Gasoline',
    features: 'Bluetooth, Navigation, Backup Camera',
    address: '', city: '', state: '', zip: '', country: 'US',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  });

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
          pricePerDay: vehicle.pricePerDay || 500,
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
      pricePerDay: Number(form.pricePerDay),
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
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{isVi ? 'Giá Thuê Hàng Ngày (USD) *' : isJa ? '一日あたりの料金（USD） *' : 'Daily Rate (USD) *'}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">$</span>
                <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} required min="50" className="lux-input w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 rounded-xl text-slate-800 dark:text-white font-extrabold text-sm focus:border-[#EAB308]/50 focus:ring-2 focus:ring-[#EAB308]/20" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 font-medium">{isVi ? 'Trung bình trên LuxeWay: $450 - $800 dựa trên phân khúc siêu xe.' : `LuxeWay average: ${formatCurrency(450)} - ${formatCurrency(800)} based on supercars.`}</p>
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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    bookingService.getByOwner(user.id).then(b => { setBookings(b); setLoading(false); });
  }, [user]);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const thisMonth = completedBookings.filter(b => new Date(b.endDate).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + b.pricing.total, 0);
  const avgBooking = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

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
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#EAB308" fill="url(#ownerRevGrad)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

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
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94A3B8" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#EAB308" radius={[8, 8, 0, 0]} className="shadow-lg shadow-gold/10" />
          </BarChart>
        </ResponsiveContainer>
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

