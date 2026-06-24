import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import { getDb } from '@/mock/db';
import type { Vehicle, Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { useToast } from '@/components/ui/Toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

// ====== OWNER OVERVIEW ======
export const OwnerOverview: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { analytics } = getDb();

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

  const revenueData = analytics
    .filter(a => a.period === 'day')
    .slice(0, 14)
    .reverse()
    .map(a => ({
      date: a.date.slice(5),
      revenue: a.revenue / 10, // Scale for demo
      bookings: a.bookings,
    }));

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Owner Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.firstName}. Here's your performance.</p>
        </div>
        <Link to="/owner/vehicles/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'bg-green-50 text-green-600', change: '+18% this month' },
          { label: 'Active Vehicles', value: `${stats.activeVehicles}/${stats.totalVehicles}`, icon: Car, color: 'bg-blue-50 text-blue-600', change: 'Currently listed' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'bg-purple-50 text-purple-600', change: 'All time' },
          { label: 'My Rating', value: `${stats.rating}/5`, icon: CheckCircle, color: 'bg-yellow-50 text-yellow-600', change: `${user?.totalReviews} reviews` },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stat.change}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <div className="luxury-card p-6 mb-6">
        <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Revenue (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#CBD5E1" />
            <YAxis tick={{ fontSize: 11 }} stroke="#CBD5E1" tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revenueGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Bookings + Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-[#0F172A]">Pending Requests</h3>
            <span className="badge-red">{stats.pending} pending</span>
          </div>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'pending').slice(0, 4).map(booking => (
              <div key={booking.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{formatDate(booking.startDate)} · {formatCurrency(booking.pricing.total)}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => bookingService.updateStatus(booking.id, 'confirmed')}
                    className="p-1.5 bg-success text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">No pending requests</p>
            )}
          </div>
        </div>

        {/* My Vehicles */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-[#0F172A]">My Vehicles</h3>
            <Link to="/owner/vehicles" className="text-sm text-accent font-medium">Manage →</Link>
          </div>
          <div className="space-y-3">
            {vehicles.slice(0, 4).map(vehicle => (
              <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-12 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{vehicle.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(vehicle.pricePerDay)}/day</p>
                </div>
                <span className={`badge text-[10px] border ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="text-center py-6">
                <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No vehicles yet</p>
                <Link to="/owner/vehicles/new" className="btn-primary mt-3 text-xs px-4 py-2">Add First Vehicle</Link>
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

  useEffect(() => {
    if (!user) return;
    vehicleService.getByOwner(user.id).then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (window.confirm(`Delete ${vehicleName}?`)) {
      await vehicleService.delete(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Vehicle deleted');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">My Vehicles</h1>
        <Link to="/owner/vehicles/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">No vehicles listed</h3>
          <p className="text-slate-400 mb-6">Start earning by listing your first vehicle.</p>
          <Link to="/owner/vehicles/new" className="btn-gold">List Your First Vehicle</Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {vehicles.map(vehicle => (
            <motion.div key={vehicle.id} variants={staggerItem} className="luxury-card overflow-hidden">
              <div className="relative h-40">
                <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className={`badge text-[10px] border ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm text-[#0F172A]">{vehicle.name}</h4>
                    <p className="text-xs text-slate-400">{vehicle.location.city} · {formatCurrency(vehicle.pricePerDay)}/day</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-yellow-500">⭐</span> {vehicle.rating}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/vehicles/${vehicle.id}`} className="btn-ghost border border-slate-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link to={`/owner/vehicles/${vehicle.id}/edit`} className="btn-ghost border border-slate-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                    className="text-xs px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '', brand: '', category: 'supercar', year: new Date().getFullYear(),
    pricePerDay: 500, description: '', seats: 2, doors: 2,
    transmission: 'Automatic', fuelType: 'Gasoline',
    features: 'Bluetooth, Navigation, Backup Camera',
    address: '', city: '', state: '', zip: '', country: 'US',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  });

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate API

    const newVehicle: Omit<Vehicle, 'id'> = {
      ownerId: user?.id || '',
      name: form.name,
      brand: form.brand,
      category: form.category as any,
      year: Number(form.year),
      pricePerDay: Number(form.pricePerDay),
      description: form.description,
      status: 'available',
      rating: 5.0,
      thumbnailUrl: form.thumbnailUrl,
      images: [form.thumbnailUrl],
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
      features: form.features.split(',').map(s => s.trim()),
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

    // In a real app, we'd use vehicleService.create(newVehicle)
    toast.success('Vehicle Listed Successfully!', 'Your vehicle is now live on the marketplace.');
    navigate('/owner/vehicles');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/owner/vehicles" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
          ←
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">List Your Vehicle</h1>
          <p className="text-slate-500 text-sm">Step {step} of 3</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-[#0F172A]' : 'bg-slate-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="luxury-card p-6 md:p-8">
        {step === 1 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-[#0F172A] border-b border-slate-100 pb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Vehicle Name *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Ferrari F8 Tributo" className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Brand *</label>
                <input value={form.brand} onChange={e => update('brand', e.target.value)} required placeholder="e.g. Ferrari" className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="lux-input bg-white">
                  <option value="supercar">Supercar</option>
                  <option value="suv">Luxury SUV</option>
                  <option value="convertible">Convertible</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="electric">Electric</option>
                  <option value="classic">Classic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Year *</label>
                <input type="number" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max={new Date().getFullYear() + 1} className="lux-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} required rows={4} className="lux-input resize-none" placeholder="Describe your vehicle's condition, experience, and unique features..." />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-[#0F172A] border-b border-slate-100 pb-4">Specs & Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Seats</label>
                <input type="number" value={form.seats} onChange={e => update('seats', e.target.value)} min="1" className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Doors</label>
                <input type="number" value={form.doors} onChange={e => update('doors', e.target.value)} min="2" className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Transmission</label>
                <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className="lux-input bg-white">
                  <option>Automatic</option><option>Manual</option><option>Dual-Clutch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Fuel Type</label>
                <select value={form.fuelType} onChange={e => update('fuelType', e.target.value)} className="lux-input bg-white">
                  <option>Gasoline</option><option>Electric</option><option>Hybrid</option><option>Diesel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Features (comma separated)</label>
              <input value={form.features} onChange={e => update('features', e.target.value)} className="lux-input" placeholder="Bluetooth, Apple CarPlay, Heated Seats..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Primary Image URL</label>
              <input value={form.thumbnailUrl} onChange={e => update('thumbnailUrl', e.target.value)} className="lux-input" placeholder="https://..." />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-[#0F172A] border-b border-slate-100 pb-4">Pricing & Location</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Daily Rate (USD) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} required min="50" className="lux-input pl-8" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Recommended: {formatCurrency(450)} - {formatCurrency(800)} based on similar vehicles.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Street Address</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">City *</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} required className="lux-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State/Province *</label>
                <input value={form.state} onChange={e => update('state', e.target.value)} required className="lux-input" />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }} className="btn-ghost border border-slate-200 px-6 py-3 rounded-xl">
              Back
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base">
            {loading ? 'Processing...' : step === 3 ? 'Publish Listing' : 'Next Step'}
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Calendar</h1>
          <p className="text-slate-500 text-sm">Manage your vehicle availability</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="lux-input py-2 bg-white min-w-[200px]"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="luxury-card overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-display text-xl font-bold text-[#0F172A]">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              ←
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              →
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {paddingDays.map(i => <div key={`pad-${i}`} className="h-24 rounded-2xl bg-slate-50/50 border border-slate-100/50" />)}
            
            {days.map(day => {
              const dayBookings = getBookingsForDay(day);
              const isToday = day === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear();
              
              return (
                <div 
                  key={day} 
                  className={`h-24 rounded-2xl border p-2 flex flex-col ${
                    isToday ? 'border-accent bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'
                  } transition-colors relative group`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-accent' : 'text-slate-600'}`}>{day}</span>
                  
                  <div className="mt-1 flex-1 overflow-y-auto space-y-1">
                    {dayBookings.map((b, i) => (
                      <div key={b.id} className="text-[10px] leading-tight px-1.5 py-1 rounded bg-yellow-100 text-yellow-800 font-medium truncate" title={`Booking #${b.id.slice(-4)}`}>
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
