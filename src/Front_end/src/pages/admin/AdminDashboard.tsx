import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Car, Calendar, DollarSign, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, Search, BarChart2, Globe, Loader2,
  Settings, HelpCircle, Edit2, Plus, Trash2, Activity
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { adminService, AdminStats } from '@/services/adminService';
import { useToast } from '@/components/ui/Toast';
import { useUIStore } from '@/store';

const COLORS = ['#EAB308', '#6366F1', '#10B981', '#A855F7', '#06B6D4'];

// Custom glassmorphic tooltip for Admin charts
const AdminCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-150 p-3.5 rounded-2xl shadow-xl text-xs font-semibold text-slate-800">
        <p className="text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-slate-800 font-extrabold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Revenue: <span className="text-blue-600">{formatCurrency(payload[0].value)}</span>
        </p>
        {payload[0].payload.bookings !== undefined && (
          <p className="text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Bookings: {payload[0].payload.bookings}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vehicles' | 'bookings' | 'disputes' | 'analytics' | 'settings' | 'faqs'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  // Settings, FAQs & Analytics Custom States
  const [settings, setSettings] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [editingSetting, setEditingSetting] = useState<{ settingKey: string; settingValue: string } | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', displayOrder: 1, isActive: true });
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch Dashboard Stats & Primary Data
  const fetchOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardStats = await adminService.getDashboardStats();
      if (dashboardStats) {
        setStats(dashboardStats);
      }

      // Pre-load pending approvals & recent items
      const pendingVeh = await adminService.listPendingVehicles(0, 10);
      setVehicles(pendingVeh.content || []);

      const userList = await adminService.listUsers(undefined, undefined, 0, 10);
      setUsers(userList.content || []);

      const bookingList = await adminService.listAllBookings(undefined, 0, 10);
      setBookings(bookingList.content || []);
    } catch (err: any) {
      setError('Failed to load dashboard overview data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tab Specific Data
  const fetchTabData = async () => {
    setError(null);
    try {
      if (activeTab === 'users') {
        setLoading(true);
        const data = await adminService.listUsers(undefined, userSearch || undefined, 0, 100);
        setUsers(data.content || []);
      } else if (activeTab === 'vehicles') {
        setLoading(true);
        const data = await adminService.listAllVehicles(undefined, 0, 100);
        setVehicles(data.content || []);
      } else if (activeTab === 'bookings') {
        setLoading(true);
        const data = await adminService.listAllBookings(undefined, 0, 100);
        setBookings(data.content || []);
      } else if (activeTab === 'disputes') {
        setLoading(true);
        const data = await adminService.listAllDisputes();
        setDisputes(data || []);
      } else if (activeTab === 'settings') {
        setLoading(true);
        const data = await adminService.listSettings();
        setSettings(data || []);
      } else if (activeTab === 'faqs') {
        setLoading(true);
        const data = await adminService.listAllFAQs();
        setFaqs(data || []);
      } else if (activeTab === 'analytics') {
        setLoading(true);
        const history = await adminService.getHistoricalAnalytics(30);
        const overview = await adminService.getAnalyticsOverview();
        setAnalyticsHistory(history || []);
        setAnalyticsOverview(overview || null);
      } else if (activeTab === 'overview') {
        await fetchOverviewData();
      }
    } catch (err: any) {
      setError(`Failed to fetch ${activeTab} list data.`);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Save dynamic system setting parameter
  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    try {
      const { settingKey, settingValue } = editingSetting;
      if (settingKey.endsWith('_rate') || settingKey.endsWith('_ratio')) {
        const rate = parseFloat(settingValue);
        if (isNaN(rate) || rate < 0.0 || rate > 1.0) {
          toast.error('Validation Error', 'Rates and ratios must be a decimal value between 0.0 and 1.0');
          return;
        }
      }
      await adminService.updateSetting(settingKey, settingValue);
      toast.success('Setting Updated', `${settingKey.replace(/_/g, ' ')} has been synchronized successfully.`);
      setSettings(prev => prev.map(s => s.settingKey === settingKey ? { ...s, settingValue } : s));
      setEditingSetting(null);
    } catch (e: any) {
      toast.error('Update Failed', e.message || 'Could not save parameter.');
    }
  };

  // Helper: Save FAQ record (Create or Update)
  const handleSaveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Validation Error', 'Question and Answer fields are required.');
      return;
    }
    try {
      if (editingFaq) {
        await adminService.updateFAQ(editingFaq.id, faqForm as any);
        toast.success('FAQ Updated', 'FAQ entry has been successfully revised.');
      } else {
        await adminService.createFAQ(faqForm as any);
        toast.success('FAQ Created', 'FAQ entry has been successfully launched.');
      }
      setIsFaqModalOpen(false);
      const data = await adminService.listAllFAQs();
      setFaqs(data || []);
    } catch (e: any) {
      toast.error('Operation Failed', 'Could not save FAQ record.');
    }
  };

  // Helper: Delete FAQ record
  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Are you sure you want to permanently purge this FAQ entry?')) return;
    try {
      await adminService.deleteFAQ(id);
      toast.success('FAQ Purged', 'FAQ has been removed from platform resources.');
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (e: any) {
      toast.error('Deletion Failed', 'Could not delete FAQ record.');
    }
  };

  // Helper: Trigger manual daily metric aggregation aggregation
  const handleTriggerAggregation = async () => {
    if (!manualDate) return;
    setLoading(true);
    try {
      await adminService.triggerAnalyticsAggregation(manualDate);
      toast.success('Aggregation Complete', `Metrics for ${manualDate} successfully compiled.`);
      const history = await adminService.getHistoricalAnalytics(30);
      const overview = await adminService.getAnalyticsOverview();
      setAnalyticsHistory(history || []);
      setAnalyticsOverview(overview || null);
    } catch (e: any) {
      toast.error('Aggregation Failed', 'Check date parameters formatting.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger load on tab change or search trigger
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Handle Debounced Search
  useEffect(() => {
    if (activeTab === 'users') {
      const delayDebounceFn = setTimeout(() => {
        fetchTabData();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [userSearch]);

  // Action: Toggle User Activation Status
  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const isVerified = targetUser?.verified || false;
      const isKycVerified = targetUser?.kycVerified || false;

      await adminService.updateUserStatus(userId, {
        active: !currentActive,
        verified: isVerified,
        kycVerified: isKycVerified
      });

      toast.success(
        currentActive ? 'Account Deactivated' : 'Account Activated',
        `User status updated successfully.`
      );

      // Refresh list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentActive, isActive: !currentActive } : u));
    } catch (err: any) {
      toast.error('Operation Failed', 'Could not update user account status.');
    }
  };

  // Action: Approve Vehicle Listing
  const handleApproveVehicle = async (vehicleId: string) => {
    try {
      await adminService.approveVehicle(vehicleId);
      toast.success('Vehicle Approved', 'The vehicle is now available on the marketplace.');
      
      // Update state local
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'available' } : v));
      if (activeTab === 'overview') {
        fetchOverviewData();
      }
    } catch (err: any) {
      toast.error('Approval Failed', 'Failed to approve vehicle listing.');
    }
  };

  // Action: Reject Vehicle Listing
  const handleRejectVehicle = async (vehicleId: string) => {
    const reason = prompt('Please enter the reason for rejecting this vehicle:');
    if (reason === null) return; // cancel
    if (!reason.trim()) {
      toast.error('Validation Error', 'A rejection reason is required.');
      return;
    }

    try {
      await adminService.rejectVehicle(vehicleId, reason);
      toast.success('Vehicle Rejected', 'Owner has been notified of the decision.');

      // Update state local
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'rejected' } : v));
      if (activeTab === 'overview') {
        fetchOverviewData();
      }
    } catch (err: any) {
      toast.error('Rejection Failed', 'Failed to reject vehicle listing.');
    }
  };

  // Action: Resolve/Update Dispute Status
  const handleResolveDispute = async (disputeId: number, currentStatus: string) => {
    const decision = prompt(`Please enter the resolution decision for Dispute #${disputeId}:`);
    if (decision === null) return;
    if (!decision.trim()) {
      toast.error('Validation Error', 'A resolution decision is required.');
      return;
    }

    try {
      await adminService.updateDisputeStatus(disputeId, 'RESOLVED', decision);
      toast.success('Dispute Resolved', `Dispute status updated to RESOLVED.`);
      
      // Update state local
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'RESOLVED', adminDecision: decision } : d));
    } catch (err: any) {
      toast.error('Operation Failed', 'Failed to resolve dispute.');
    }
  };

  const handleRejectDispute = async (disputeId: number) => {
    const decision = prompt(`Please enter the rejection reason for Dispute #${disputeId}:`);
    if (decision === null) return;
    if (!decision.trim()) {
      toast.error('Validation Error', 'A rejection reason is required.');
      return;
    }

    try {
      await adminService.updateDisputeStatus(disputeId, 'REJECTED', decision);
      toast.success('Dispute Rejected', `Dispute status updated to REJECTED.`);
      
      // Update state local
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'REJECTED', adminDecision: decision } : d));
    } catch (err: any) {
      toast.error('Operation Failed', 'Failed to reject dispute.');
    }
  };

  // Derived Analytics Data Mapped to DB Stats
  const displayStats = {
    totalUsers: stats?.totalUsers || users.length || 0,
    activeUsers: stats?.totalUsers ? (stats.totalUsers - stats.cancelledBookings) : users.filter(u => u.active || u.isActive).length,
    totalVehicles: stats?.totalVehicles || vehicles.length || 0,
    availableVehicles: stats?.availableVehicles || vehicles.filter(v => v.status === 'available').length || 0,
    totalBookings: stats?.totalBookings || bookings.length || 0,
    completedBookings: stats?.completedBookings || bookings.filter(b => b.status === 'completed').length || 0,
    totalRevenue: stats?.totalRevenue || 0,
    pendingApproval: stats?.pendingApprovalVehicles || vehicles.filter(v => v.status === 'pending_approval').length || 0,
  };

  // Fallback revenue charts data
  const monthlyData = [
    { date: 'Jan', revenue: displayStats.totalRevenue * 0.15 || 15000, bookings: displayStats.totalBookings * 0.1 || 5 },
    { date: 'Feb', revenue: displayStats.totalRevenue * 0.25 || 25000, bookings: displayStats.totalBookings * 0.2 || 12 },
    { date: 'Mar', revenue: displayStats.totalRevenue * 0.45 || 45000, bookings: displayStats.totalBookings * 0.35 || 18 },
    { date: 'Apr', revenue: displayStats.totalRevenue * 0.75 || 75000, bookings: displayStats.totalBookings * 0.6 || 32 },
    { date: 'May', revenue: displayStats.totalRevenue || 125000, bookings: displayStats.totalBookings || 48 },
  ];

  const categoryData = [
    { name: 'Supercar', value: vehicles.filter(v => v.category?.toLowerCase() === 'supercar').length || 2 },
    { name: 'SUV', value: vehicles.filter(v => v.category?.toLowerCase() === 'suv').length || 4 },
    { name: 'Luxury', value: vehicles.filter(v => v.category?.toLowerCase() === 'luxury').length || 3 },
    { name: 'Convertible', value: vehicles.filter(v => v.category?.toLowerCase() === 'convertible').length || 1 },
    { name: 'Electric', value: vehicles.filter(v => v.category?.toLowerCase() === 'electric').length || 2 },
  ];

  const pendingVehicles = vehicles.filter(v => v.status === 'pending_approval');
  const recentUsers = [...users].slice(0, 5);

  return (
    <div className={`min-h-screen pt-20 relative overflow-hidden ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-[#f4f7fe] text-slate-800'}`}>
      {/* Background ambient glowing orbs */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-80 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Admin Header */}
      <div className={`border-b sticky top-20 z-30 shadow-sm backdrop-blur-md ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/80 border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={`font-display text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Control Center</h1>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>LuxeWay Platform Management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-250 rounded-2xl shadow-sm">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest">System Live</span>
              </div>
              <Link to="/" className="text-slate-600 hover:text-blue-600 text-xs font-extrabold bg-white border border-slate-200 hover:border-blue-300 px-4.5 py-2.5 rounded-2xl transition-all duration-300 hover:bg-slate-50 hover-lift">
                ← Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tab Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8 border-b border-slate-200/60 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'vehicles', label: 'Vehicles', icon: Car },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          ].map(tab => {
            const ActiveIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest whitespace-nowrap transition-all duration-300 hover-lift shadow-sm ${
                  active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30' 
                    : isDark ? 'text-slate-400 bg-slate-700 border border-slate-600 hover:text-white hover:bg-slate-600' : 'text-slate-500 bg-white border border-slate-200 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <ActiveIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-36">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
            <span className="text-slate-455 text-xs font-extrabold tracking-widest uppercase mt-5 animate-pulse">Syncing Database Ledgers...</span>
          </div>
        )}

        {/* Error Display */}
        {error && !loading && (
          <div className="bg-red-950/30 border border-red-500/20 rounded-[2rem] p-5 mb-8 shadow-xl animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-red-400 font-extrabold text-sm uppercase tracking-wider">System Database Error</div>
                <div className="text-red-300/80 text-xs mt-0.5">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* ============ OVERVIEW TAB ============ */}
        {!loading && activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Total Earnings', value: formatCurrency(displayStats.totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50', change: '+23% this mo', isRevenue: true },
                { label: 'Total Accounts', value: displayStats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600 border border-blue-200/50', change: '+12% active' },
                { label: 'Total Fleet', value: displayStats.totalVehicles.toLocaleString(), icon: Car, color: 'bg-purple-50 text-purple-600 border border-purple-200/50', change: '+8% listings' },
                { label: 'Trips Placed', value: displayStats.totalBookings.toLocaleString(), icon: Calendar, color: 'bg-amber-50 text-amber-600 border border-amber-200/50', change: '+31% checkout' },
              ].map(stat => (
                <motion.div key={stat.label} variants={staggerItem} className={`border p-5 rounded-3xl relative overflow-hidden shadow-md hover-lift hover-shadow transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-widest ${isDark ? 'bg-slate-700 border-slate-600 border text-slate-400' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>{stat.change}</span>
                  </div>
                  <p className={`text-2xl font-black mb-0.5 tracking-tight ${stat.isRevenue ? 'text-emerald-600' : isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Metrics */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Pending Approvals', value: displayStats.pendingApproval, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm' },
                { label: 'Completed Trips', value: displayStats.completedBookings, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' },
                { label: 'Active Users', value: displayStats.activeUsers, icon: Users, color: 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' },
                { label: 'Operational Nodes', value: 'Global', icon: Globe, color: 'bg-purple-50 text-purple-600 border border-purple-100 shadow-sm' },
              ].map(stat => (
                <motion.div key={stat.label} variants={staggerItem} className={`border rounded-2xl p-4 shadow-sm transition-all duration-300 border-l-4 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60 shadow-slate-200/20'
                } ${
                  stat.label === 'Pending Approvals' ? 'border-l-amber-500' :
                  stat.label === 'Completed Trips' ? 'border-l-emerald-500' :
                  stat.label === 'Active Users' ? 'border-l-blue-500' :
                  'border-l-purple-500'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${isDark ? 'bg-slate-700 border-slate-600 border' : 'bg-slate-50 border border-slate-100'}`}><stat.icon className="w-4 h-4 text-slate-500" /></div>
                    <div>
                      <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value.toLocaleString()}</p>
                      <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
              <div className={`lg:col-span-2 border rounded-3xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div className={`flex items-center justify-between mb-6 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Revenue Stream Trend</h3>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Interactive Area Map</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B', fontWeight: '600' }} stroke="transparent" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B', fontWeight: '600' }} stroke="transparent" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<AdminCustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#adminRevenueGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={`border rounded-3xl p-6 shadow-xl flex flex-col justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div>
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider mb-5 border-b pb-3 ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-100'}`}>Fleet Inventory Distribution</h3>
                  <div className="h-44 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} dataKey="value" paddingAngle={4}>
                          {categoryData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 px-2">
                  {categoryData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>            {/* Pending Approvals & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <div className={`border rounded-3xl p-6 shadow-xl flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div className={`flex items-center justify-between mb-5 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Pending Listings</h3>
                  <span className="text-[9px] font-extrabold bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-0.5 rounded-lg uppercase tracking-widest">{pendingVehicles.length} vehicles</span>
                </div>
                <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[350px] pr-1">
                  {pendingVehicles.length === 0 ? (
                    <div className="text-center py-14 my-auto">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                      <p className="text-slate-500 text-xs font-semibold">All vehicles reviewed successfully</p>
                    </div>
                  ) : (
                    pendingVehicles.map(vehicle => (
                      <div key={vehicle.id} className="flex items-center gap-3.5 p-3 bg-slate-50/50 border border-slate-100 rounded-2.5xl hover:border-blue-300 transition-all duration-300 hover-lift">
                        <img src={vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&fit=crop'} alt={vehicle.name} className="w-14 h-10 rounded-xl object-cover border border-slate-200/60 flex-shrink-0 shadow-md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 text-xs font-bold truncate">{vehicle.name}</p>
                          <p className="text-slate-500 text-[10px] font-semibold tracking-wide mt-1"><span className="text-blue-600 font-extrabold">{formatCurrency(vehicle.pricePerDay)}</span>/day · {vehicle.brand}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleApproveVehicle(vehicle.id)} className="p-2 bg-emerald-550 hover:bg-emerald-600 text-white rounded-xl transition-all hover-lift shadow-sm shadow-emerald-500/10" title="Approve"><CheckCircle className="w-4.5 h-4.5" /></button>
                          <button onClick={() => handleRejectVehicle(vehicle.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 rounded-xl transition-all hover-lift" title="Reject"><XCircle className="w-4.5 h-4.5" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`border rounded-3xl p-6 shadow-xl flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div className={`flex items-center justify-between mb-5 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Recently Registered Users</h3>
                  <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">System Audited</span>
                </div>
                <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[350px] pr-1">
                  {recentUsers.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-10 font-medium my-auto">No accounts created</p>
                  ) : (
                    recentUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3.5 p-3 bg-slate-50/50 border border-slate-100 rounded-2.5xl hover:border-blue-300 transition-all duration-300 hover-lift">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.displayName} className="w-10 h-10 rounded-xl object-cover border border-slate-200/60 flex-shrink-0 shadow-md" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl text-xs bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-black flex-shrink-0">{u.firstName ? u.firstName[0].toUpperCase() : 'U'}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 text-xs font-bold truncate">{u.displayName}</p>
                          <p className="text-slate-500 text-[10px] truncate mt-1">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${u.role === 'admin' ? 'border-yellow-300 text-yellow-600 bg-yellow-50' : u.role === 'owner' ? 'border-indigo-300 text-indigo-600 bg-indigo-50' : 'border-slate-300 text-slate-600 bg-slate-50'}`}>{u.role}</span>
                          {u.verified && <Shield className="w-3.5 h-3.5 text-emerald-500 shadow-sm" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============ USERS TAB ============ */}
        {!loading && activeTab === 'users' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Accounts</h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Audit, activate, and manage platform permissions for operational users</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search accounts by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className={`pl-10 pr-4 py-3 border rounded-2xl text-xs placeholder:text-slate-400 outline-none w-72 transition-all duration-300 shadow-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200 focus:bg-slate-600' : 'bg-white border-slate-200 text-slate-800 focus:bg-slate-50 focus:border-blue-500/50'}`}
                />
              </div>
            </div>
            <div className={`border rounded-3xl overflow-hidden shadow-xl animate-scale-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDark ? 'bg-slate-700/50 border-slate-600' : 'border-slate-150 bg-slate-50/80'}`}>
                    <tr>
                      {['User Account', 'Email Address', 'System Role', 'Operational Status', 'Joined Date', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-4.5 text-xs font-black uppercase tracking-widest text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-slate-500 text-sm text-center py-16">No users match your criteria.</td>
                      </tr>
                    ) : (
                      users.map(u => {
                        const isUserActive = u.active !== false;
                        return (
                          <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/40'}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                {u.avatar ? (
                                  <img src={u.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm" />
                                ) : (
                                  <div className={`w-9 h-9 rounded-xl text-xs border flex items-center justify-center font-extrabold shadow-sm ${isDark ? 'bg-slate-600 border-slate-500 text-slate-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{u.firstName ? u.firstName[0].toUpperCase() : 'U'}</div>
                                )}
                                <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{u.displayName}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-widest ${u.role === 'admin' ? 'border-yellow-300 text-yellow-600 bg-yellow-50' : u.role === 'owner' ? 'border-indigo-300 text-indigo-600 bg-indigo-50' : 'border-slate-300 text-slate-600 bg-slate-50'}`}>{u.role}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-widest ${!isUserActive ? 'border-red-250 text-red-600 bg-red-50' : 'border-emerald-250 text-emerald-600 bg-emerald-50'}`}>
                                {isUserActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(u.joinedAt || u.createdAt, 'short')}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleUserStatus(u.id, isUserActive)}
                                className={`text-[10px] px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-widest hover-scale transition-all duration-300 shadow-sm ${
                                  !isUserActive 
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10' 
                                    : 'bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-250'
                                }`}
                              >
                                {isUserActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ VEHICLES TAB ============ */}
        {!loading && activeTab === 'vehicles' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Vehicles</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review active listings, verify technical specs, and coordinate approvals</p>
            </div>
            <div className={`border rounded-3xl overflow-hidden shadow-xl animate-scale-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDark ? 'bg-slate-700/50 border-slate-600' : 'border-slate-150 bg-slate-50/80'}`}>
                    <tr>
                      {['Vehicle Model', 'Brand Name', 'Category Type', 'Daily Rate', 'Instant Booking', 'Listing Status', 'Actions'].map(h => (
                        <th key={h} className={`text-left px-6 py-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {vehicles.length === 0 ? (
                      <tr><td colSpan={7} className="text-slate-500 text-sm text-center py-16">No vehicles registered on platform.</td></tr>
                    ) : (
                      vehicles.map(v => (
                        <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/40'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <img src={v.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&fit=crop'} alt={v.name} className="w-14 h-10 rounded-xl object-cover border border-slate-200 shadow-md" />
                              <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{v.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.brand}</td>
                          <td className={`px-6 py-4 text-xs font-bold capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.category?.toLowerCase()}</td>
                          <td className="px-6 py-4 text-xs text-blue-600 font-extrabold">{formatCurrency(v.pricePerDay)}</td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{v.instantBook ? '⚡ Instant' : 'Manual'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 border-2 rounded-lg ${
                              v.status?.toLowerCase() === 'available' ? 'border-emerald-200 text-emerald-600 bg-emerald-50 shadow-sm shadow-emerald-100/30' :
                              v.status?.toLowerCase() === 'pending_approval' ? 'border-amber-250 text-amber-600 bg-amber-50 shadow-sm shadow-amber-100/30' :
                              'border-red-250 text-red-600 bg-red-50 shadow-sm shadow-red-100/30'
                            }`}>
                              {v.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {v.status === 'pending_approval' && (
                                <>
                                  <button onClick={() => handleApproveVehicle(v.id)} className="text-[10px] px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold shadow-sm transition-all hover-lift">Approve</button>
                                  <button onClick={() => handleRejectVehicle(v.id)} className="text-[10px] px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 rounded-xl font-extrabold transition-all hover-lift">Reject</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ BOOKINGS TAB ============ */}
        {!loading && activeTab === 'bookings' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Trip Ledger</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review active transaction agreements, rental dates, and financial flows</p>
            </div>
            <div className={`border rounded-3xl overflow-hidden shadow-xl animate-scale-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDark ? 'bg-slate-700/50 border-slate-600' : 'border-slate-150 bg-slate-50/80'}`}>
                    <tr>
                      {['Transaction ID', 'Customer Renter', 'Vehicle Reserved', 'Dates Interval', 'Total Charge', 'Trip Status'].map(h => (
                        <th key={h} className={`text-left px-6 py-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={6} className="text-slate-500 text-sm text-center py-16">No checkouts documented.</td></tr>
                    ) : (
                      bookings.map(booking => {
                        return (
                          <tr key={booking.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/40'}`}>
                            <td className={`py-4 px-6 text-xs font-mono tracking-wider font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>#{booking.id.slice(-8).toUpperCase()}</td>
                            <td className={`py-4 px-6 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{booking.renter?.displayName || 'Customer Account'}</td>
                            <td className={`py-4 px-6 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{booking.vehicle?.name || 'Luxury Vehicle'}</td>
                            <td className={`py-4 px-6 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📅 {formatDate(booking.startDate, 'short')} - {formatDate(booking.endDate, 'short')}</td>
                            <td className="py-4 px-6 text-emerald-600 text-xs font-black">{formatCurrency(booking.pricing?.total)}</td>
                            <td className="py-4 px-6">
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 border-2 rounded-lg ${
                                booking.status?.toLowerCase() === 'completed' || booking.status?.toLowerCase() === 'confirmed' || booking.status?.toLowerCase() === 'active' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                booking.status?.toLowerCase() === 'pending' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                'border-red-200 text-red-600 bg-red-50'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ DISPUTES TAB ============ */}
        {!loading && activeTab === 'disputes' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Claims Resolution Desk</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Investigate operational conflicts, view photographic proof, and execute verdicts</p>
            </div>
            
            <div className={`border rounded-3xl overflow-hidden shadow-xl animate-scale-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDark ? 'bg-slate-700/50 border-slate-600' : 'border-slate-150 bg-slate-50/80'}`}>
                    <tr>
                      {['Claim ID', 'Booking Ref', 'Reporter Name', 'Conflict Description', 'Evidence', 'Created Date', 'Settlement Status', 'Operations'].map(h => (
                        <th key={h} className={`text-left px-6 py-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>

                    {disputes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-slate-500 text-sm text-center py-16">
                          <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 mb-4 animate-bounce" />
                          No active conflict disputes recorded in database.
                        </td>
                      </tr>
                    ) : (
                      disputes.map(dispute => {
                        return (
                          <tr key={dispute.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/40'}`}>
                            <td className={`py-4 px-6 text-xs font-mono tracking-wider font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>#DSP{dispute.id}</td>
                            <td className="py-4 px-6 text-blue-500 text-xs font-mono font-extrabold hover:underline">
                              <Link to={`/booking/${dispute.bookingId}`}>
                                #{dispute.bookingId ? dispute.bookingId.slice(-8).toUpperCase() : 'N/A'}
                              </Link>
                            </td>
                            <td className={`py-4 px-6 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{dispute.reporterName || 'Customer'}</td>
                            <td className="py-4 px-6 max-w-xs">
                              <div className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={dispute.reason}>{dispute.reason}</div>
                              <div className={`text-[11px] truncate mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`} title={dispute.description}>{dispute.description}</div>
                              {dispute.adminDecision && (
                                <div className="text-emerald-700 text-[10px] mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 font-bold">
                                  <strong>Verdict Decision:</strong> {dispute.adminDecision}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs">
                              {dispute.evidenceUrl ? (
                                <a href={dispute.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline inline-flex items-center gap-1 font-extrabold uppercase tracking-widest text-[9px] hover-lift">
                                  <Eye className="w-4 h-4" /> Photo Proof
                                </a>
                              ) : (
                                <span className="text-slate-400">None</span>
                              )}
                            </td>
                            <td className={`py-4 px-6 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(dispute.createdAt, 'short')}</td>
                            <td className="py-4 px-6">
                              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border-2 uppercase tracking-widest ${
                                dispute.status?.toLowerCase() === 'resolved' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                dispute.status?.toLowerCase() === 'open' || dispute.status?.toLowerCase() === 'investigating' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                'border-red-200 text-red-600 bg-red-50'
                              }`}>
                                {dispute.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {dispute.status === 'OPEN' ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleResolveDispute(dispute.id, dispute.status)} className="text-[10px] px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold shadow-sm transition-all hover-lift">Resolve</button>
                                  <button onClick={() => handleRejectDispute(dispute.id)} className="text-[10px] px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-extrabold transition-all hover-lift">Reject</button>
                                </div>
                              ) : (
                                <span className={`text-xs uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Settled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ ANALYTICS TAB ============ */}
        {!loading && activeTab === 'analytics' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Analytics</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deep-dive historical charts, cumulative logs, and manual aggregation triggers</p>
            </div>

            {/* Overview stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Cumulative Revenue', value: formatCurrency(analyticsOverview?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border border-emerald-250/50' },
                { label: 'Total Operations Accounts', value: (analyticsOverview?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50 border border-blue-250/50' },
                { label: 'Total Fleet Listings', value: (analyticsOverview?.totalVehicles || 0).toLocaleString(), icon: Car, color: 'text-purple-600 bg-purple-50 border border-purple-250/50' },
                { label: 'Cumulative Checkouts', value: (analyticsOverview?.totalBookings || 0).toLocaleString(), icon: Calendar, color: 'text-amber-600 bg-amber-50 border border-amber-250/50' },
              ].map(card => (
                <div key={card.label} className={`border p-5 rounded-3xl shadow-sm hover-lift transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70'}`}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}><card.icon className="w-4.5 h-4.5" /></div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</span>
                  </div>
                  <p className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Main Interactive charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 border rounded-3xl p-6 shadow-xl flex flex-col justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Historical Daily Revenue Stream</h3>
                  <span className="text-[9px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-0.5 rounded-lg uppercase tracking-widest">30 Days Log</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={analyticsHistory.map(a => ({ date: a.recordDate, revenue: a.revenue }))}>
                    <defs>
                      <linearGradient id="premiumRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748B', fontWeight: '600' }} stroke="transparent" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748B', fontWeight: '600' }} stroke="transparent" tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#premiumRevenueGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Action aggregation controller */}
              <div className={`border rounded-3xl p-6 shadow-xl flex flex-col justify-between hover-lift transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70 shadow-slate-200/30'}`}>
                <div>
                  <h3 className={`font-display text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-100'}`}>Aggregation Control</h3>
                  <p className={`text-xs mb-4 leading-relaxed font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>The backend scheduler automatically compiles metrics daily at midnight. You can manually compile or refresh metrics for any custom date here.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Target Date</label>
                      <input 
                        type="date" 
                        value={manualDate} 
                        onChange={e => setManualDate(e.target.value)} 
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleTriggerAggregation}
                  className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover-lift flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" /> Run Compilation
                </button>
              </div>
            </div>

            {/* Auxiliary double charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`border rounded-3xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70'}`}>
                <h4 className={`font-display text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily Bookings Counts Trend</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={analyticsHistory.map(a => ({ date: a.recordDate, bookings: a.bookingsCount }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#64748B' }} stroke="transparent" />
                    <YAxis tick={{ fontSize: 8, fill: '#64748B' }} stroke="transparent" />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="#EAB308" fill="rgba(234,179,8,0.08)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={`border rounded-3xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70'}`}>
                <h4 className={`font-display text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>New Fleet Listings & User Sign-ups</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={analyticsHistory.map(a => ({ date: a.recordDate, listings: a.newVehicles, signups: a.newUsers }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#64748B' }} stroke="transparent" />
                    <YAxis tick={{ fontSize: 8, fill: '#64748B' }} stroke="transparent" />
                    <Tooltip />
                    <Area type="monotone" dataKey="listings" stroke="#8B5CF6" fill="rgba(139,92,246,0.08)" strokeWidth={2} name="New Listings" />
                    <Area type="monotone" dataKey="signups" stroke="#10B981" fill="rgba(16,185,129,0.08)" strokeWidth={2} name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ SYSTEM SETTINGS TAB ============ */}
        {!loading && activeTab === 'settings' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>System Settings</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Configure platform rates, commission rules, and thresholds dynamically</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings.map(setting => (
                <div key={setting.id} className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover-lift transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150/70'}`}>
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <Settings className="w-5 h-5 text-indigo-500" />
                      <h4 className={`font-bold text-sm truncate uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>{setting.settingKey.replace(/_/g, ' ')}</h4>
                    </div>
                    <p className={`text-xs mb-4 h-10 overflow-hidden font-semibold leading-relaxed ${isDark ? 'text-slate-450' : 'text-slate-400'}`}>{setting.description}</p>
                    
                    <div className={`flex items-baseline gap-2 mb-4 p-3.5 rounded-2xl border ${isDark ? 'bg-slate-700/40 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-2xl font-black text-indigo-600">{setting.settingValue}</span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        {setting.settingKey.endsWith('_rate') || setting.settingKey.endsWith('_ratio') 
                          ? `(${(parseFloat(setting.settingValue) * 100).toFixed(0)}%)` 
                          : ''}
                      </span>
                    </div>
                  </div>

                  {editingSetting?.settingKey === setting.settingKey ? (
                    <div className="space-y-2 mt-2">
                      <input 
                        type="text" 
                        value={editingSetting?.settingValue || ''} 
                        onChange={e => setEditingSetting(prev => prev ? { ...prev, settingValue: e.target.value } : null)} 
                        className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveSetting} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">Save</button>
                        <button onClick={() => setEditingSetting(null)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setEditingSetting({ settingKey: setting.settingKey, settingValue: setting.settingValue })} 
                      className={`w-full py-2.5 border rounded-xl text-xs font-extrabold transition-all hover-lift ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600'}`}
                    >
                      Edit Parameter
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ============ FAQs MANAGEMENT TAB ============ */}
        {!loading && activeTab === 'faqs' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Help Center FAQs</h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add, update, and manage frequently asked questions for customers</p>
              </div>
              <button 
                onClick={() => {
                  setEditingFaq(null);
                  setFaqForm({ question: '', answer: '', displayOrder: 1, isActive: true });
                  setIsFaqModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover-lift"
              >
                <Plus className="w-4 h-4" /> Add FAQ Entry
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faqs.length === 0 ? (
                <div className={`text-center py-16 border rounded-3xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-xs font-semibold">No FAQs registered</p>
                </div>
              ) : (
                faqs.map(faq => (
                  <div key={faq.id} className={`border rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover-lift transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-150'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Order #{faq.displayOrder}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${faq.isActive ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-red-200 text-red-600 bg-red-50'}`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h4 className={`font-extrabold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{faq.question}</h4>
                      <p className={`text-xs leading-relaxed font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => {
                          setEditingFaq(faq);
                          setFaqForm({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder, isActive: faq.isActive });
                          setIsFaqModalOpen(true);
                        }}
                        className={`p-2 border rounded-xl transition-all shadow-sm ${isDark ? 'border-slate-600 hover:border-indigo-400 text-slate-300 hover:text-white' : 'border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFaq(faq.id)}
                        className={`p-2 border rounded-xl transition-all shadow-sm ${isDark ? 'border-red-900/50 hover:bg-red-950/20 text-red-400' : 'border-red-200 hover:bg-red-50 text-red-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FAQ Creation/Edit Modal */}
            {isFaqModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className={`rounded-3xl p-6 w-full max-w-lg border shadow-2xl relative animate-scale-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h3 className={`font-display text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{editingFaq ? 'Modify FAQ Entry' : 'Create FAQ Entry'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5">Question Text</label>
                      <input 
                        type="text" 
                        value={faqForm.question} 
                        onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} 
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        placeholder="Enter Question"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 mb-1.5">Answer Text</label>
                      <textarea 
                        value={faqForm.answer} 
                        onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} 
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs h-28 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        placeholder="Enter Answer details"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5">Display Order</label>
                        <input 
                          type="number" 
                          value={faqForm.displayOrder} 
                          onChange={e => setFaqForm({ ...faqForm, displayOrder: parseInt(e.target.value) || 1 })} 
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <input 
                          type="checkbox" 
                          id="isActiveCheckbox"
                          checked={faqForm.isActive} 
                          onChange={e => setFaqForm({ ...faqForm, isActive: e.target.checked })} 
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20"
                        />
                        <label htmlFor="isActiveCheckbox" className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Active on Platform</label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSaveFaq} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md">Save Entry</button>
                    <button onClick={() => setIsFaqModalOpen(false)} className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${isDark ? 'bg-slate-750 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
