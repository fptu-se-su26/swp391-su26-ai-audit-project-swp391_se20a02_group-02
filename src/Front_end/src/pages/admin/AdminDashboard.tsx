import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Car, Calendar, DollarSign, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, Search, BarChart2, Globe
} from 'lucide-react';
import { getDb } from '@/mock/db';
import { formatCurrency, formatDate, getStatusColor } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#EAB308', '#22C55E', '#EF4444', '#8B5CF6'];

const AdminDashboard: React.FC = () => {
  const { users, vehicles, bookings, payments, analytics, reviews } = getDb();

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
    pendingApproval: vehicles.filter(v => v.status === 'pending_approval').length,
  };

  const monthlyData = analytics
    .filter(a => a.period === 'month')
    .slice(0, 6)
    .reverse()
    .map(a => ({ date: a.date.slice(0, 7), revenue: Math.round(a.revenue), bookings: a.bookings }));

  const categoryData = ['supercar', 'suv', 'luxury', 'convertible', 'electric', 'classic'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: vehicles.filter(v => v.category === cat).length,
  }));

  const bookingStatusData = ['completed', 'confirmed', 'pending', 'cancelled'].map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: bookings.filter(b => b.status === status).length,
  }));

  const recentUsers = [...users].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5);
  const pendingVehicles = vehicles.filter(v => v.status === 'pending_approval').slice(0, 5);
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20">
      {/* Admin Header */}
      <div className="bg-[#0F172A] border-b border-white/10 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Admin Control Center</h1>
              <p className="text-slate-400 text-sm">LuxeWay Platform Management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-xl">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-success text-xs font-medium">System Operational</span>
              </div>
              <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Exit Admin</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'from-blue-500 to-blue-700', change: '+23%' },
            { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-green-500 to-green-700', change: '+12%' },
            { label: 'Total Vehicles', value: stats.totalVehicles.toLocaleString(), icon: Car, color: 'from-purple-500 to-purple-700', change: '+8%' },
            { label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), icon: Calendar, color: 'from-gold to-yellow-600', change: '+31%' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.color} p-5 text-white`}
            >
              <div className="flex items-start justify-between mb-4">
                <stat.icon className="w-6 h-6 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-white/70 text-sm">{stat.label}</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Pending Approval', value: stats.pendingApproval, icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-900/30' },
            { label: 'Completed Trips', value: stats.completedBookings, icon: CheckCircle, color: 'text-green-400 bg-green-900/30' },
            { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-blue-400 bg-blue-900/30' },
            { label: 'Total Reviews', value: reviews.length, icon: BarChart2, color: 'text-purple-400 bg-purple-900/30' },
          ].map(stat => (
            <motion.div key={stat.label} variants={staggerItem} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">Monthly Revenue & Bookings</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF10" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="transparent" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC' }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#adminRevenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Categories */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">Fleet by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-white">Pending Vehicle Approvals</h3>
              <span className="badge-gold">{pendingVehicles.length} pending</span>
            </div>
            <div className="space-y-3">
              {pendingVehicles.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No pending approvals</p>
              ) : (
                pendingVehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                    <img src={vehicle.thumbnailUrl} alt={vehicle.name} className="w-10 h-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{vehicle.name}</p>
                      <p className="text-slate-400 text-xs">{formatCurrency(vehicle.pricePerDay)}/day</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="p-1.5 bg-success/20 text-success rounded-lg hover:bg-success/30">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 bg-danger/20 text-danger rounded-lg hover:bg-danger/30">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-white">Recent Users</h3>
              <button className="text-xs text-accent font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.displayName} className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="avatar w-9 h-9 rounded-xl text-xs">{u.firstName[0]}{u.lastName[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.displayName}</p>
                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge text-[10px] ${u.role === 'admin' ? 'badge-gold' : u.role === 'owner' ? 'badge-blue' : 'badge-slate'}`}>
                      {u.role}
                    </span>
                    {u.verified && <Shield className="w-3 h-3 text-success" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white">Recent Bookings</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none w-40" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  {['Booking ID', 'Renter', 'Vehicle', 'Dates', 'Amount', 'Status'].map(h => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white text-xs font-mono">#{booking.id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{booking.renterId.slice(0, 12)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{booking.vehicleId.slice(-6)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{formatDate(booking.startDate, 'short')}</td>
                    <td className="py-3 pr-4 text-white text-xs font-semibold">{formatCurrency(booking.pricing.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-[10px] border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
