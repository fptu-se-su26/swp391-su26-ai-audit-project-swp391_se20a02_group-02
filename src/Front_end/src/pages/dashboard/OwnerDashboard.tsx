import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';

import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle
} from 'lucide-react';

import { useAuthStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
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
  const { id } = useParams();
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
        toast.error('Vehicle not found.');
        navigate('/owner/vehicles');
      }
      setFetching(false);
    }).catch(err => {
      console.error(err);
      toast.error('Error loading vehicle data.');
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
        toast.success('Vehicle Updated Successfully!', 'Your vehicle details have been saved.');
      } else {
        await vehicleService.create(user?.id || '', vehicleData);
        toast.success('Vehicle Listed Successfully!', 'Your vehicle is now live on the marketplace.');
      }
      navigate('/owner/vehicles');
    } catch (error) {
      toast.error('Failed to save vehicle listing.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/owner/vehicles" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
          ←
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            {id ? 'Edit Your Vehicle' : 'List Your Vehicle'}
          </h1>
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
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Vehicle Image</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-accent transition-colors cursor-pointer relative">
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
                  <div className="relative">
                    <img src={images[0]} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-2" />
                    <p className="text-xs text-green-600 font-medium">✓ Image uploaded</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📷</span>
                    </div>
                    <p className="text-sm font-medium text-[#0F172A] mb-1">Click or drag to upload image</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WEBP · Max 5MB</p>
                  </div>
                )}
              </div>
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
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Booking Requests</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage all bookings for your vehicles</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border-2 transition-all ${filter === status ? 'border-accent bg-blue-50 text-accent' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${bookings.length})`}
            {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full inline-flex items-center justify-center">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-[#0F172A] mb-1">No {filter !== 'all' ? filter : ''} bookings</h3>
          <p className="text-slate-400 text-sm">Bookings for your vehicles will appear here</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {filtered.map(booking => {
            const renter = { displayName: 'User ' + booking.renterId.slice(0, 4) };
            return (
            <motion.div key={booking.id} variants={staggerItem} className="luxury-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#0F172A] text-sm">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                      <span className={`badge text-[10px] border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.totalDays} days</p>
                    <p className="text-xs text-slate-400 mt-0.5">Renter: <span className="font-medium text-[#0F172A]">{renter?.displayName || booking.renterId.slice(0, 12) + '...'}</span></p>
                    <p className="text-sm font-bold text-[#0F172A] mt-1">{formatCurrency(booking.pricing.total)}</p>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleApprove(booking.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-xl text-xs font-semibold hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleReject(booking.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )})}
        </motion.div>
      )}
    </div>
  );
};

// ====== OWNER REVENUE PAGE ======
export const OwnerRevenuePage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const analytics: any[] = [];

  React.useEffect(() => {
    if (!user) return;
    bookingService.getByOwner(user.id).then(b => { setBookings(b); setLoading(false); });
  }, [user]);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const thisMonth = completedBookings.filter(b => new Date(b.endDate).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + b.pricing.total, 0);
  const avgBooking = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  const revenueData = analytics.filter(a => a.period === 'day').slice(0, 14).reverse().map(a => ({
    date: a.date.slice(5), revenue: Math.round(a.revenue / 8), bookings: a.bookings,
  }));

  const monthlyData = analytics.filter(a => a.period === 'month').slice(0, 6).reverse().map(a => ({
    date: a.date.slice(0, 7), revenue: Math.round(a.revenue / 8), bookings: a.bookings,
  }));

  return (
    <div>
      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-display text-2xl font-bold text-[#0F172A] mb-6">Revenue Analytics</motion.h1>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600', change: '+18%' },
          { label: 'This Month', value: formatCurrency(thisMonth), icon: TrendingUp, color: 'bg-blue-50 text-blue-600', change: 'vs last month' },
          { label: 'Completed Trips', value: completedBookings.length.toString(), icon: CheckCircle, color: 'bg-purple-50 text-purple-600', change: 'all time' },
          { label: 'Avg per Booking', value: formatCurrency(avgBooking), icon: BarChart2, color: 'bg-yellow-50 text-yellow-600', change: 'per trip' },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <div className="luxury-card p-6 mb-6">
        <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Daily Revenue (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="ownerRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#CBD5E1" />
            <YAxis tick={{ fontSize: 11 }} stroke="#CBD5E1" tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#ownerRevGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown */}
      <div className="luxury-card p-6">
        <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Monthly Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#CBD5E1" />
            <YAxis tick={{ fontSize: 11 }} stroke="#CBD5E1" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
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
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Fleet Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Oversee and manage your entire vehicle fleet</p>
        </div>
        <Link to="/owner/vehicles/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add to Fleet
        </Link>
      </motion.div>

      {/* Fleet Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Fleet', value: stats.total, icon: Car, color: 'bg-blue-50 text-blue-600', sub: 'All vehicles' },
          { label: 'Available', value: stats.available, icon: CheckCircle, color: 'bg-green-50 text-green-600', sub: 'Ready to rent' },
          { label: 'Currently Rented', value: stats.rented, icon: Users, color: 'bg-purple-50 text-purple-600', sub: `${utilizationRate}% utilization` },
          { label: 'In Maintenance', value: stats.maintenance, icon: Shield, color: 'bg-orange-50 text-orange-600', sub: 'Under service' },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Utilization Bar */}
      <div className="luxury-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[#0F172A]">Fleet Utilization Rate</p>
          <span className="text-sm font-bold text-accent">{utilizationRate}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationRate}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{stats.rented} of {stats.total} vehicles currently generating revenue</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {['all', 'available', 'rented', 'maintenance', 'unavailable'].map(s => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border-2 transition-all ${selectedStatus === s ? 'border-accent bg-blue-50 text-accent' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            {s === 'all' && ` (${vehicles.length})`}
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Car className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">No vehicles with status: {selectedStatus}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="luxury-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Vehicle', 'Status', 'Price/Day', 'Rating', 'Location', 'Actions'].map(h => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(vehicle => (
                <motion.tr key={vehicle.id} variants={staggerItem} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 pl-5">
                    <div className="flex items-center gap-3">
                      <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-12 h-9 object-cover rounded-xl flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-[#0F172A]">{vehicle.name}</p>
                        <p className="text-xs text-slate-400">{vehicle.brand} · {vehicle.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge text-[10px] border ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#0F172A]">{formatCurrency(vehicle.pricePerDay)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{vehicle.rating?.toFixed(1) ?? '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{vehicle.location?.city ?? '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/vehicles/${vehicle.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-accent transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/owner/vehicles/${vehicle.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
  role: 'driver' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  joinedAt: string;
  assignedVehicles: number;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Nguyen Van A', email: 'vana@example.com', role: 'driver', status: 'active', joinedAt: '2025-01-15', assignedVehicles: 2 },
  { id: '2', name: 'Tran Thi B', email: 'thib@example.com', role: 'manager', status: 'active', joinedAt: '2024-11-03', assignedVehicles: 5 },
  { id: '3', name: 'Le Van C', email: 'vanc@example.com', role: 'staff', status: 'inactive', joinedAt: '2025-03-22', assignedVehicles: 0 },
];

export const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', role: 'driver' as Employee['role'] });
  const toast = useToast();

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;
    const emp: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      status: 'active',
      joinedAt: new Date().toISOString().slice(0, 10),
      assignedVehicles: 0,
    };
    setEmployees(prev => [emp, ...prev]);
    setNewEmployee({ name: '', email: '', role: 'driver' });
    setShowAddForm(false);
    toast.success('Employee added', `${emp.name} has been added to your team.`);
  };

  const toggleStatus = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e));
  };

  const roleColors: Record<Employee['role'], string> = {
    driver: 'bg-blue-50 text-blue-600 border-blue-200',
    manager: 'bg-purple-50 text-purple-600 border-purple-200',
    staff: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Team & Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your drivers, managers, and staff</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Staff', value: employees.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: employees.filter(e => e.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: 'Drivers', value: employees.filter(e => e.role === 'driver').length, color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <motion.div key={s.label} variants={staggerItem} className="stat-card text-center">
            <p className={`text-3xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Employee Form */}
      {showAddForm && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="luxury-card p-6 mb-6 border-2 border-accent/20">
          <h3 className="font-display text-lg font-bold text-[#0F172A] mb-4">Add New Employee</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name *</label>
              <input
                value={newEmployee.name}
                onChange={e => setNewEmployee(p => ({ ...p, name: e.target.value }))}
                className="lux-input"
                placeholder="Nguyen Van A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email *</label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={e => setNewEmployee(p => ({ ...p, email: e.target.value }))}
                className="lux-input"
                placeholder="employee@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Role</label>
              <select
                value={newEmployee.role}
                onChange={e => setNewEmployee(p => ({ ...p, role: e.target.value as Employee['role'] }))}
                className="lux-input bg-white"
              >
                <option value="driver">Driver</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addEmployee} className="btn-primary text-sm px-6 py-2.5">Add Employee</button>
            <button onClick={() => setShowAddForm(false)} className="btn-ghost border border-slate-200 text-sm px-6 py-2.5 rounded-xl">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Employee Table */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="luxury-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Employee', 'Role', 'Assigned Vehicles', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(emp => (
              <motion.tr key={emp.id} variants={staggerItem} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0F172A]">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`badge text-[10px] border ${roleColors[emp.role]}`}>{emp.role}</span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-[#0F172A]">{emp.assignedVehicles}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-sm text-slate-500">{emp.joinedAt}</td>
                <td className="py-3.5 px-4">
                  <span className={`badge text-[10px] border ${emp.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => toggleStatus(emp.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-accent hover:text-accent transition-colors"
                  >
                    {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

