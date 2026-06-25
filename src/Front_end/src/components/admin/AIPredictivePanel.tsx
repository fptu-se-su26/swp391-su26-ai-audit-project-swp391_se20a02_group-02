import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, RefreshCw,
  ChevronDown, ChevronUp, Brain, Zap, Activity, Users, Car
} from 'lucide-react';
import { cn, formatCurrency, convertCurrency } from '@/utils';
import {
  adminService,
  AIPredictiveDashboardDTO,
  RevenueForecastDTO,
  BookingDemandDTO,
  VehicleUtilizationDTO,
  ChurnRiskDTO,
  AnomalyDTO,
  InsightDTO,
} from '@/services/adminService';

// ─── Props ─────────────────────────────────────────────────────────────────
interface AIPredictivePanelProps {
  isDark: boolean;
  currency: string;
}

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#A855F7'];

// ─── Helper: glassmorphic card class ───────────────────────────────────────
const glassCard = (isDark: boolean) =>
  cn(
    'rounded-2xl border backdrop-blur-md transition-all duration-300',
    isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-white/80 border-slate-200 dark:border-slate-700'
  );

// ─── Skeleton placeholder ──────────────────────────────────────────────────
const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-xl bg-slate-200/20 dark:bg-slate-700/30', className)} />
);

// ─── Risk badge helper ─────────────────────────────────────────────────────
const riskColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
};

// ─── Section Wrapper with collapse toggle ─────────────────────────────────
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isDark: boolean;
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  badge?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, isDark, children, onRefresh, isRefreshing, badge }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(glassCard(isDark), 'overflow-hidden')}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/10 dark:border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            {icon}
          </div>
          <h3 className={cn('font-black text-xs uppercase tracking-widest', isDark ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200')}>
            {title}
          </h3>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
              Refresh
            </button>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-8000/10 transition-all"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AIPredictivePanel: React.FC<AIPredictivePanelProps> = ({ isDark, currency }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [aiDashboard, setAiDashboard] = useState<AIPredictiveDashboardDTO | null>(null);

  // Per-section refresh states
  const [revRefreshing, setRevRefreshing] = useState(false);
  const [demandRefreshing, setDemandRefreshing] = useState(false);
  const [utilRefreshing, setUtilRefreshing] = useState(false);
  const [churnRefreshing, setChurnRefreshing] = useState(false);
  const [anomalyRefreshing, setAnomalyRefreshing] = useState(false);
  const [insightRefreshing, setInsightRefreshing] = useState(false);

  // Initial load
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getAIPredictiveDashboard();
        setAiDashboard(data);
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Currency helper ──
  const fmt = useCallback((val: number) => formatCurrency(convertCurrency(val, 'VND', currency)), [currency]);

  // ── Per-section refresh handlers ──
  const refreshRevenue = async () => {
    setRevRefreshing(true);
    const data = await adminService.refreshRevenueForecast(14);
    if (data) setAiDashboard(prev => prev ? { ...prev, revenueForecast: data } : prev);
    setRevRefreshing(false);
  };

  const refreshDemand = async () => {
    setDemandRefreshing(true);
    const data = await adminService.refreshBookingDemand(14);
    if (data) setAiDashboard(prev => prev ? { ...prev, bookingDemand: data } : prev);
    setDemandRefreshing(false);
  };

  const refreshUtil = async () => {
    setUtilRefreshing(true);
    const data = await adminService.getVehicleUtilization(7);
    if (data) setAiDashboard(prev => prev ? { ...prev, vehicleUtilization: data } : prev);
    setUtilRefreshing(false);
  };

  const refreshChurn = async () => {
    setChurnRefreshing(true);
    const data = await adminService.getChurnRisks();
    setAiDashboard(prev => prev ? { ...prev, churnRisks: data } : prev);
    setChurnRefreshing(false);
  };

  const refreshAnomalies = async () => {
    setAnomalyRefreshing(true);
    const data = await adminService.getAnomalies();
    setAiDashboard(prev => prev ? { ...prev, anomalies: data } : prev);
    setAnomalyRefreshing(false);
  };

  const refreshInsights = async () => {
    setInsightRefreshing(true);
    const data = await adminService.getAIInsights();
    setAiDashboard(prev => prev ? { ...prev, insights: data } : prev);
    setInsightRefreshing(false);
  };

  // ────────────────────────────────────────────────────────────────────────
  // Loading skeleton
  // ────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn(glassCard(isDark), 'p-6 space-y-4')}>
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-36 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Error / unavailable banner
  // ────────────────────────────────────────────────────────────────────────
  if ((error || !aiDashboard) && !dismissed) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">AI Predictions temporarily unavailable.</span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-xs font-black uppercase hover:opacity-75">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!aiDashboard) return null;

  const rev = aiDashboard.revenueForecast;
  const demand = aiDashboard.bookingDemand;
  const util = aiDashboard.vehicleUtilization;
  const churnRisks = aiDashboard.churnRisks ?? [];
  const anomalies = aiDashboard.anomalies ?? [];
  const insights = aiDashboard.insights ?? [];

  // Chart data helpers
  const revenueChartData = (rev?.predictions ?? []).map(p => ({
    date: p.date,
    Upper: p.upper_bound,
    Revenue: p.predicted_revenue ?? 0,
    Lower: p.lower_bound,
  }));

  const demandChartData = (demand?.daily_forecasts ?? []).map(p => ({
    date: p.date,
    Bookings: p.predicted_bookings ?? 0,
    Upper: p.upper_bound,
    Lower: p.lower_bound,
  }));

  const utilizationCategories = Object.keys(util?.by_category ?? {});
  const utilizationChartData: Record<string, any>[] = [];
  if (util?.by_category) {
    const categories = Object.entries(util.by_category);
    const maxLen = Math.max(...categories.map(([, pts]) => pts.length), 0);
    for (let i = 0; i < maxLen; i++) {
      const entry: Record<string, any> = { index: i + 1 };
      categories.forEach(([cat, pts]) => {
        entry[cat] = pts[i]?.predicted != null ? (pts[i].predicted! * 100).toFixed(1) : null;
      });
      utilizationChartData.push(entry);
    }
  }

  // Trend direction badge
  const trendBadge = (dir?: string) => {
    if (dir === 'UP') return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <TrendingUp className="w-3 h-3" /> UP
      </span>
    );
    if (dir === 'DOWN') return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
        <TrendingDown className="w-3 h-3" /> DOWN
      </span>
    );
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-50 dark:bg-slate-9000/10 text-slate-400 border border-slate-500/20">
        <Minus className="w-3 h-3" /> STABLE
      </span>
    );
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Sidecar warning banner */}
      {aiDashboard.sidecarWarning && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold">Using simplified forecast model</span>
        </div>
      )}

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 1 — Revenue Forecast                */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="AI Revenue Forecast"
        icon={<TrendingUp className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshRevenue}
        isRefreshing={revRefreshing}
        badge={
          <div className="flex items-center gap-2 ml-2">
            {trendBadge(rev?.trend_direction)}
            {rev && (
              <span className={cn('text-[9px] font-black uppercase px-2 py-1 rounded-full border', isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 dark:border-slate-700 text-slate-500')}>
                R² {(rev.r2_score * 100).toFixed(1)}%
              </span>
            )}
          </div>
        }
      >
        {!rev ? (
          <SkeletonBlock className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: '800' }} stroke="transparent" />
              <YAxis tick={{ fontSize: 9, fontWeight: '800' }} stroke="transparent" tickFormatter={(v) => fmt(v)} />
              <Tooltip
                formatter={(value: any, name: string) => [fmt(Number(value)), name]}
                contentStyle={{
                  background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '11px'
                }}
              />
              <Area type="monotone" dataKey="Upper" stroke="#6366F1" strokeOpacity={0.3} strokeWidth={1} fill="url(#ciGrad)" fillOpacity={1} name="Upper CI" />
              <Area type="monotone" dataKey="Revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#revGrad)" fillOpacity={1} name="Predicted Revenue" />
              <Area type="monotone" dataKey="Lower" stroke="#6366F1" strokeOpacity={0.3} strokeWidth={1} fill="transparent" name="Lower CI" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 2 — Booking Demand                  */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="Booking Demand Forecast"
        icon={<Activity className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshDemand}
        isRefreshing={demandRefreshing}
      >
        {!demand ? (
          <SkeletonBlock className="h-48 w-full" />
        ) : (
          <div className="space-y-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demandChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: '800' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 9, fontWeight: '800' }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '11px'
                  }}
                />
                <Bar dataKey="Bookings" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* DoW distribution chips */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(demand.dow_distribution ?? {}).map(([day, weight]) => {
                const isPeak = day === demand.peak_day;
                return (
                  <span
                    key={day}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border',
                      isPeak
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {day.slice(0, 3)} {(weight * 100).toFixed(1)}%
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 3 — Vehicle Utilization             */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="Vehicle Utilization Forecast"
        icon={<Car className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshUtil}
        isRefreshing={utilRefreshing}
      >
        {!util ? (
          <SkeletonBlock className="h-48 w-full" />
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={utilizationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                <XAxis dataKey="index" tick={{ fontSize: 9 }} stroke="transparent" />
                <YAxis tick={{ fontSize: 9 }} stroke="transparent" unit="%" />
                <Tooltip
                  formatter={(v: any) => [`${v}%`]}
                  contentStyle={{
                    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {utilizationCategories.map((cat, i) => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {/* Current rate badges */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(util.current_rates ?? {}).map(([cat, rate], i) => (
                <span
                  key={cat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {cat}: {(rate * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 4 — Churn Risk                      */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="Churn Risk Analysis"
        icon={<Users className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshChurn}
        isRefreshing={churnRefreshing}
        badge={
          churnRisks.length > 0 ? (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black">
              {churnRisks.filter(c => c.churn_score >= 60).length} at risk
            </span>
          ) : undefined
        }
      >
        {churnRisks.length === 0 ? (
          <p className="text-sm text-slate-400 font-semibold text-center py-8">No churn risk data available.</p>
        ) : (
          <div className="overflow-y-auto max-h-[400px] space-y-2 pr-1">
            {churnRisks.slice(0, 50).map((c, i) => (
              <div
                key={c.user_id}
                className={cn(
                  'flex items-center justify-between gap-3 p-3.5 rounded-2xl border',
                  isDark ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/60'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-xs font-black truncate', isDark ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200')}>
                      {c.display_name}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-slate-400">Bookings</p>
                    <p className="text-xs font-black">{c.total_bookings}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-slate-400">Last seen</p>
                    <p className="text-xs font-black">{c.days_since_last_booking}d ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400">Score</p>
                    <p className="text-xs font-black">{c.churn_score.toFixed(0)}</p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-full text-[9px] font-black uppercase border', riskColor(c.risk_level))}>
                    {c.risk_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 5 — Anomaly Detection               */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="Anomaly Detection"
        icon={<AlertTriangle className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshAnomalies}
        isRefreshing={anomalyRefreshing}
        badge={
          anomalies.length > 0 ? (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
              {anomalies.length}
            </span>
          ) : undefined
        }
      >
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <p className="text-sm text-slate-400 font-semibold">No anomalies detected in the past 90 days.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={cn('border-b', isDark ? 'border-slate-700' : 'border-slate-200 dark:border-slate-700')}>
                  {['Date', 'Metric', 'Actual', 'Expected', 'Z-Score', 'Severity'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 font-black uppercase tracking-widest text-[9px] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a, i) => (
                  <tr key={i} className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800')}>
                    <td className="py-2.5 px-3 font-mono">{a.date}</td>
                    <td className="py-2.5 px-3 font-bold capitalize">{a.metric}</td>
                    <td className="py-2.5 px-3">{a.actual_value.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{a.expected_value.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono">{a.z_score.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-black uppercase border',
                        a.severity === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      )}>
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 6 — AI Insights Panel               */}
      {/* ──────────────────────────────────────────── */}
      <Section
        title="AI Insights"
        icon={<Brain className="w-4 h-4" />}
        isDark={isDark}
        onRefresh={refreshInsights}
        isRefreshing={insightRefreshing}
      >
        {insights.length === 0 ? (
          <p className="text-sm text-slate-400 font-semibold text-center py-8">No insights generated yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 8).map((insight, i) => {
              const isCritical = insight.severity === 'CRITICAL';
              const isWarning = insight.severity === 'WARNING';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex gap-4 p-4 rounded-2xl border',
                    isCritical
                      ? 'bg-red-500/5 border-red-500/20'
                      : isWarning
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : isDark ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCritical ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-xs font-black mb-1',
                      isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                    )}>
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
                    {insight.actionLabel && (
                      <button className={cn(
                        'mt-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all',
                        isCritical
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : isWarning
                          ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                          : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
                      )}>
                        {insight.actionLabel}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};

export default AIPredictivePanel;
export { AIPredictivePanel };
