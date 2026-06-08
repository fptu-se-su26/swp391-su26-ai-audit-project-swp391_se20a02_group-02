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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 text-center text-slate-400">
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
          <h2 className="text-2xl font-black text-white tracking-tight">Fleet Earnings & Revenue Center</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Track dynamic utilization rates and financial performance statements</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
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
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all disabled:opacity-50"
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
        <div className="bg-slate-900/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{formatVND(stats.totalRevenue)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Gross Earnings</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3" />
            +18.4% vs last month
          </div>
        </div>

        {/* Utilization Card */}
        <div className="bg-slate-900/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <Percent className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.utilizationRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Fleet Utilization Rate</p>
          <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold mt-2">
            <Activity className="w-3 h-3 animate-pulse" />
            Optimal range (60-80%)
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-900/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalBookings}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total Bookings Completed</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-2">
            <span>{stats.activeBookings} ongoing active rentals</span>
          </div>
        </div>

        {/* Fleet Size */}
        <div className="bg-slate-900/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
            <Car className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.fleetSize} Vehicles</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total Managed Fleet</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-2">
            <span>{stats.carCount} Cars</span>
            <span>·</span>
            <span>{stats.motorbikeCount} Motorbikes</span>
          </div>
        </div>
      </div>

      {/* Monthly Chart Card */}
      <div className="bg-slate-900/40 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Revenue and Booking Ledger</h3>
            <p className="text-xs text-slate-400">Comparing gross payouts vs completed bookings count</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (VND)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Breakdown History</h4>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {chartData.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{d.month}</p>
                    <p className="text-[10px] text-slate-500">{d.bookings} booking(s)</p>
                  </div>
                  <span className="font-extrabold text-indigo-400">{formatVND(d.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
