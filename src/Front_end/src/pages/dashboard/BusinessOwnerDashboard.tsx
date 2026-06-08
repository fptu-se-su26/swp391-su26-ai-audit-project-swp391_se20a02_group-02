import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Car, Calendar, DollarSign, Settings, LogOut,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle, Clock, Shield,
  FileText, BarChart3, Activity, Menu, X, Bell, Search,
  ArrowUpRight, Zap, Globe, Database, Briefcase, Plus, Truck, Download
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useT } from '@/i18n/translations';
import { formatCurrency, formatDate, getInitials } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useToast } from '@/components/ui/Toast';

// ====== BUSINESS OVERVIEW HOME WIDGETS ======
export const BusinessOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const toast = useToast();
  const t = useT();

  const stats = {
    utilizationRate: '92.4%',
    activeDrivers: '8 / 12',
    corporateBookings: 42,
    fleetRevenue: 425000000, // 425,000,000 VND
  };

  const corporateReports = [
    { name: 'Q2 Fleet Logistics Audit', date: 'May 2026', size: '2.4 MB', type: 'PDF' },
    { name: ' Saigon Fleet Revenue Matrix', date: 'May 2026', size: '1.8 MB', type: 'XLSX' },
    { name: 'Driver Shift Attendance Log', date: 'May 2026', size: '920 KB', type: 'CSV' },
  ];

  const activeFleetTracking = [
    { car: 'Rolls-Royce Ghost', driver: 'Hoang Lam', route: 'District 1 → Tan Son Nhat Airport', status: 'ON ROUTE', battery: '82%', temp: '22°C' },
    { car: 'Bentley Continental GT', driver: 'Tran Minh', route: 'Saigon Garage', status: 'PARKED', battery: '95%', temp: '20°C' },
    { car: 'Porsche Taycan 4S', driver: 'Le Van', route: 'District 3 → Thao Dien Villa', status: 'ON ROUTE', battery: '47%', temp: '24°C' },
    { car: 'Lamborghini Urus', driver: 'Nguyen Binh', route: 'District 7', status: 'IDLE', battery: '78%', temp: '23°C' }
  ];

  const corporateChartData = [
    { week: 'Wk 1', revenue: 95000000, utility: 84 },
    { week: 'Wk 2', revenue: 120000000, utility: 88 },
    { week: 'Wk 3', revenue: 155000000, utility: 91 },
    { week: 'Wk 4', revenue: 425000000, utility: 92 },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Banner Greeting */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-sans font-black text-2.5xl tracking-tight text-slate-800 dark:text-white mb-1">
            {t.businessDashboard.operationsRoom}
          </h1>
          <p className="text-xs text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
            {user?.companyName || 'Saigon Fleet Rental Co.'} — {t.businessDashboard.enterpriseDashboard}
          </p>
        </div>
        <button 
          onClick={() => toast.success('Corporate Report Aggregation Triggered')}
          className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-lg hover-lift bg-gradient-to-r from-indigo-650 to-violet-650 text-white"
        >
          <Briefcase className="w-4 h-4" /> {t.businessDashboard.runAudit}
        </button>
      </motion.div>

      {/* Corporate Metrics Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Fleet Utilization', value: stats.utilizationRate, icon: Truck, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', sub: '11/12 active vehicles', progress: 92 },
          { label: 'Active Drivers', value: stats.activeDrivers, icon: Users, color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20', sub: 'Shift schedules synchronized', progress: 66 },
          { label: 'Corporate Trips', value: stats.corporateBookings, icon: Calendar, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', sub: '+15% this checkout cycle', progress: 80 },
          { label: 'Fleet Revenue', value: formatCurrency(stats.fleetRevenue), icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', sub: 'VND Cumulative monthly billing', progress: 100 },
        ].map(stat => (
          <motion.div 
            key={stat.label} 
            variants={staggerItem}
            className={`relative overflow-hidden rounded-[2.5rem] border backdrop-blur-md p-6 shadow-xl transition-all duration-300 ${
              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/50 shadow-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[8px] font-black tracking-widest px-2.5 py-1 rounded-xl uppercase ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                LIVE
              </span>
            </div>
            <p className={`text-2xl font-black mb-1.5 tracking-tight ${stat.color.includes('emerald') ? 'text-emerald-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {stat.label}
            </p>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {stat.sub}
            </p>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${stat.progress}%` }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Fleet Tracking Map visual & Shift analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 border rounded-[2.5rem] p-6 shadow-2xl ${
          isDark ? 'bg-slate-900/60 border-slate-800/80 shadow-slate-950/40' : 'bg-white/70 border-slate-200/60 shadow-slate-200/30'
        }`}>
          <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-200/40 dark:border-slate-800/60">
            <h3 className="font-sans text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
              Fleet Active GPS Tracking & Telemetry
            </h3>
            <span className="text-[8px] font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-2.5 py-1 rounded-xl uppercase tracking-widest animate-pulse">
              {activeFleetTracking.filter(f => f.status === 'ON ROUTE').length} Active
            </span>
          </div>

          <div className="space-y-4">
            {activeFleetTracking.map(item => (
              <div 
                key={item.car} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                  isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-slate-50/50 border-slate-150'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">{item.car}</p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Assigned to: <strong className="text-slate-650 dark:text-slate-350">{item.driver}</strong></p>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-2">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">📍 {item.route}</p>
                </div>

                <div className="flex items-center gap-4.5 flex-shrink-0">
                  <span className={`text-[8px] font-black tracking-widest px-2 py-1 rounded-xl border ${
                    item.status === 'ON ROUTE' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5 animate-pulse' :
                    item.status === 'PARKED' ? 'border-indigo-500/20 text-indigo-500 bg-indigo-500/5' :
                    'border-slate-500/20 text-slate-500 bg-slate-500/5'
                  }`}>
                    {item.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-800 dark:text-white">🔋 {item.battery}</p>
                    <p className="text-[9px] font-semibold text-slate-450 dark:text-slate-550">{item.temp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Reports Download Area */}
        <div className={`border rounded-[2.5rem] p-6 shadow-2xl flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800/80 shadow-slate-950/40' : 'bg-white/70 border-slate-200/60 shadow-slate-200/30'
        }`}>
          <div>
            <h3 className="font-sans text-xs font-black uppercase tracking-widest border-b pb-4 mb-5 border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200">
              Corporate Reports
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Securely compile and export company fleet revenue logs, driver rosters, and trip audit files.
            </p>

            <div className="space-y-3">
              {corporateReports.map(report => (
                <div key={report.name} className={`p-3.5 border rounded-xl flex items-center justify-between ${
                  isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-slate-50 border-slate-150'
                }`}>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate text-slate-800 dark:text-slate-200" title={report.name}>{report.name}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{report.date} · {report.size}</p>
                  </div>
                  <button 
                    onClick={() => toast.success(`Downloading ${report.name}`)}
                    className="p-2 border rounded-xl hover:bg-indigo-500/10 text-indigo-500 hover:border-indigo-400 transition-all flex-shrink-0 hover-lift"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => toast.success('Compiling new business records...')}
            className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover-lift flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Report
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`border rounded-[2.5rem] p-6 shadow-2xl ${
        isDark ? 'bg-slate-900/60 border-slate-800/80 shadow-slate-950/40' : 'bg-white/70 border-slate-200/60 shadow-slate-200/30'
      }`}>
        <h3 className="font-sans text-xs font-black uppercase tracking-widest mb-6 border-b pb-4 border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-250">
          Weekly Corporate Revenue & Fleet Utility Rates
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={corporateChartData}>
            <defs>
              <linearGradient id="corpRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748B', fontWeight: '800' }} stroke="transparent" />
            <YAxis tick={{ fontSize: 10, fill: '#64748B', fontWeight: '800' }} stroke="transparent" tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
            <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#corpRevGrad)" strokeWidth={3.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ====== DUMMY SUB VIEWS FOR ROUTING DEMONSTRATIONS ======
export const FleetManagementPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in font-sans">
    <div>
      <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-wider">Fleet Management</h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">Corporate fleet asset matrix and active statuses</p>
    </div>
    <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center text-slate-400">
      <Car className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm font-semibold">Active Fleet Matrix fully synchronized with Saigon Car Rental.</p>
    </div>
  </div>
);

export const EmployeeManagementPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in font-sans">
    <div>
      <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-wider">Employee Management</h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">Rosters, permissions, and shift schedules</p>
    </div>
    <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center text-slate-400">
      <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm font-semibold">Manager & Staff assignments are securely locked behind enterprise RBAC controls.</p>
    </div>
  </div>
);

export const DriverManagementPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in font-sans">
    <div>
      <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-wider">Driver Management</h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">Assigned drivers, shift schedules, and safety ratings</p>
    </div>
    <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center text-slate-400">
      <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm font-semibold">Shift patterns, routes assignments, and telemetry profiles are fully synchronized.</p>
    </div>
  </div>
);

export const FleetAnalyticsPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in font-sans">
    <div>
      <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-wider">Fleet Analytics</h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">Daily utility indexes, telemetry heatmaps, and aggregate margins</p>
    </div>
    <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center text-slate-400">
      <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm font-semibold">Historical fleet telemetry aggregates are compiled daily at midnight.</p>
    </div>
  </div>
);

export const CorporateReportsPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in font-sans">
    <div>
      <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-wider">Corporate Reports</h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">Compile audits, expense claims, and logistics ledgers</p>
    </div>
    <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] text-center text-slate-400">
      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm font-semibold">Corporate tax ledgers and audit records fully synchronized.</p>
    </div>
  </div>
);

// ====== BUSINESS OWNER DASHBOARD LAYOUT ======
export const BusinessOwnerDashboardLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, sidebarOpen, setSidebarOpen } = useUIStore();
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated]);

  const links = [
    { href: '/', icon: Globe, label: t.businessDashboard.goHome, exact: true },
    { href: '/business', icon: LayoutDashboard, label: t.businessDashboard.overview, exact: true },
    { href: '/business/fleet', icon: Truck, label: t.businessDashboard.fleet },
    { href: '/business/employees', icon: Users, label: t.businessDashboard.employees },
    { href: '/business/drivers', icon: Briefcase, label: t.businessDashboard.drivers },
    { href: '/business/analytics', icon: BarChart3, label: t.businessDashboard.analytics },
    { href: '/business/reports', icon: FileText, label: t.businessDashboard.reports },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  if (!user) return null;

  return (
    <div 
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 font-sans ${
        isDark ? 'bg-[#080d16] text-slate-100' : 'bg-[#f4f7fa] text-slate-800'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.05) 1px, transparent 0)'
          : 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.02) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none bg-indigo-500" />
      
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Sticky Left Sidebar */}
        <aside className="w-66 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] rounded-[2.5rem] glass dark:glass-dark border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col justify-between hidden lg:flex relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-fuchsia-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Branding */}
            <div className="logo-wrapper flex items-center gap-3 px-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-650 flex items-center justify-center text-white shadow-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-sans font-black text-base tracking-wider text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400">
                  LuxeWay
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-500">
                  Enterprise
                </span>
              </div>
            </div>

            <div className="mx-2 mb-6 px-3.5 py-1.5 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 text-[8px] font-black uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-450 animate-ping" />
              Corporate Account
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
                    className={`w-full flex items-center gap-3 px-4.5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 relative group ${
                      active 
                        ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-xl shadow-fuchsia-500/20' 
                        : isDark 
                          ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                          : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {active && <span className="w-1 h-5 bg-white rounded-full absolute left-1" />}
                    <link.icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-450 group-hover:text-slate-800 dark:group-hover:text-white'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom user card */}
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/80">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/55 shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-indigo-500 text-white text-xs font-black flex items-center justify-center shadow-inner">
                {getInitials(user.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-slate-800 dark:text-white">{user.displayName}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400 mt-0.5">Business Owner</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/auth/login'); }}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
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
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-505">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-sans font-black text-lg tracking-tight text-slate-855 dark:text-white">
                  {t.businessDashboard.title}
                </h1>
                <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400 font-extrabold uppercase tracking-widest mt-0.5">
                  {t.businessDashboard.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden md:flex items-center gap-2.5 px-4.5 py-2.5 border rounded-2xl shadow-inner ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <Clock className="w-4 h-4 text-fuchsia-500" />
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
