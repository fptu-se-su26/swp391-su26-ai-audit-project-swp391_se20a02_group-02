import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Calendar, DollarSign, Activity, FileText, Download, 
  TrendingDown, Percent, Car, ShieldAlert, Award
} from 'lucide-react';
import { ownerAnalyticsService } from '@/services/enterpriseService';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';

const formatVND = (val: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(val);
};

const CustomAnalyticsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xl text-xs font-semibold text-slate-800">
        <p className="text-slate-550 font-bold mb-1">{label}</p>
        <p className="text-slate-800 font-extrabold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
          Revenue: <span className="text-indigo-600">{formatVND(payload[0].value)}</span>
        </p>
        {payload[0].payload.bookings !== undefined && (
          <p className="text-slate-655 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" />
            Bookings: {payload[0].payload.bookings}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const OwnerAnalyticsDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ownerAnalyticsService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load owner stats:', err);
        toast.error('Failed to load fleet analytics metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const url = await ownerAnalyticsService.getPdfReportUrl();
      const token = localStorage.getItem('luxeway_access_token');
      // Fetch with auth header
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = 'luxeway-fleet-revenue-statement.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('PDF report statement downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export PDF statement.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const url = await ownerAnalyticsService.getExcelReportUrl();
      const token = localStorage.getItem('luxeway_access_token');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('CSV generation failed');
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = 'luxeway-fleet-revenue-statement.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV spreadsheet exported successfully.');
    } catch (err) {
      toast.error('Failed to export CSV spreadsheet.');
    } finally {
      setExportingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-3xl p-8 text-center text-[var(--lw-text-secondary)] shadow-md">
        No analytics data available for this owner profile.
      </div>
    );
  }

  const chartData = stats.monthlyStats || [];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--lw-text-primary)] tracking-tight">Fleet Earnings & Revenue Center</h2>
          <p className="text-xs text-[var(--lw-text-secondary)] font-semibold mt-0.5">Track dynamic utilization rates and financial performance statements</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {exportingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export PDF Statement
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 bg-[var(--lw-bg-secondary)] hover:bg-[var(--lw-bg-secondary)]/85 border border-[var(--lw-border)] text-[var(--lw-text-primary)] font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {exportingExcel ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue Card */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{formatVND(stats.totalRevenue)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">Completed Revenue</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3" />
            Projected: {formatVND(stats.projectedRevenue || stats.totalRevenue)}
          </div>
        </div>

        {/* Utilization Card */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--lw-accent-glow)] rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-[var(--lw-accent-glow)] border border-[var(--lw-border-strong)] flex items-center justify-center mb-3">
            <Percent className="w-5 h-5 text-[var(--lw-accent)]" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.utilizationRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">Fleet Utilization Rate</p>
          <div className="flex items-center gap-1 text-[10px] text-[var(--lw-accent)] font-bold mt-2">
            <Activity className="w-3 h-3 animate-pulse" />
            Optimal range (60-80%)
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.totalBookings}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">Total Booking Requests</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2">
            <span>{stats.completedBookings} completed, {stats.activeBookings} active</span>
          </div>
        </div>

        {/* Fleet Size */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
            <Car className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.fleetSize} Vehicles</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">Total Managed Fleet</p>
          <div className="flex items-center gap-2 text-[10px] text-[var(--lw-text-secondary)] font-semibold mt-2">
            <span>{stats.carCount} Cars</span>
            <span>·</span>
            <span>{stats.motorbikeCount} Motorbikes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">Gross booked value</p>
          <p className="text-lg font-black text-[var(--lw-text-primary)] mt-1">{formatVND(stats.grossBookedRevenue || stats.totalRevenue || 0)}</p>
        </div>
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">Pending payment / approval</p>
          <p className="text-lg font-black text-orange-600 mt-1">{formatVND(stats.pendingRevenue || 0)}</p>
        </div>
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">Revenue rule</p>
          <p className="text-xs font-semibold text-[var(--lw-text-secondary)] mt-1">Completed revenue counts only completed rentals; pending bookings are tracked separately.</p>
        </div>
      </div>

      {/* Monthly Chart Card */}
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-6 rounded-3xl relative overflow-hidden shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[var(--lw-text-primary)]">Monthly Revenue and Booking Ledger</h3>
            <p className="text-xs text-[var(--lw-text-secondary)]">Comparing gross payouts vs completed bookings count</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--lw-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--lw-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lw-border)" strokeWidth={0.5} opacity={0.3} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--lw-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--lw-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--lw-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (VND)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-[var(--lw-text-primary)] uppercase tracking-wider">Breakdown History</h4>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {chartData.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[var(--lw-text-primary)]">{d.month}</p>
                    <p className="text-[10px] text-[var(--lw-text-muted)]">{d.bookings} booking(s)</p>
                  </div>
                  <span className="font-extrabold text-[var(--lw-accent)]">{formatVND(d.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
