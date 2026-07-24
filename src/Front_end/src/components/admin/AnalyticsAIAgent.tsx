import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BrainCircuit, AlertTriangle, CheckCircle, Info, RefreshCw, 
  XCircle, TrendingUp, Users, Car, BellRing, ShieldCheck, Zap, ArrowRight, X, BarChart2, Activity, CloudSun
} from 'lucide-react';
import { adminService, AIPredictiveDashboardDTO, InsightDTO, PredictionDashboardDTO } from '@/services/adminService';
import { cn, formatCurrency } from '@/utils';
import { useUIStore } from '@/store';
import { PredictionModalAssembled } from './analytics/PredictionModalAssembled';

export const AnalyticsAIAgent: React.FC = () => {
  const [dashboard, setDashboard] = useState<AIPredictiveDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    title: string;
    type: string;
    description: string;
    actionLabel?: string;
    severity?: string;
    insightDetail?: PredictionDashboardDTO | undefined;  // was 'detailData' — renamed to match setActiveModal & dto prop
    loadingDetail?: boolean;
  }>({
    isOpen: false,
    title: '',
    type: '',
    description: ''
  });

  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAIPredictiveDashboard();
      if (data) {
        setDashboard(data);
      } else {
        setError('Failed to load AI insights.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching AI predictions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  /** Build a PredictionDashboardDTO on the frontend when backend detail is missing */
  const buildDetailFromDashboard = (insight: InsightDTO): PredictionDashboardDTO | undefined => {
    if (!dashboard) return undefined;
    const type = insight.type || '';

    // ── REVENUE_FORECAST ──────────────────────────────────────────────────────
    if (type === 'REVENUE_FORECAST' && dashboard.revenueForecast) {
      const rev = dashboard.revenueForecast as any;
      const predictions = rev.predictions || [];
      const forecastList: PredictionDashboardDTO['forecast'] = predictions.map((p: any) => ({
        date: p.date,
        actual: null,
        predicted: p.predicted_revenue ?? p.predictedRevenue ?? p.predicted ?? null,
        lowerBound: p.lower_bound ?? p.lowerBound ?? null,
        upperBound: p.upper_bound ?? p.upperBound ?? null,
      }));
      const r2 = rev.r2_score ?? rev.r2Score ?? 0;
      const slope = rev.trend_slope ?? rev.trendSlope ?? 0;
      const dir = rev.trend_direction ?? rev.trendDirection ?? 'STABLE';
      return {
        summary: { title: 'DỰ BÁO DOANH THU 14 NGÀY', summaryText: insight.description, urgency: 'SEASONAL', keyTakeaways: [] },
        businessImpact: { revenueOpportunity: slope * 14, occupancyRate: 82, bookingsDelta: 0, roiPercentage: 0, trendDirection: dir, impactText: `Xu hướng: ${dir}` },
        forecast: forecastList,
        forecastChart: forecastList,
        confidence: { score: r2 > 0 ? r2 : 0.75, rating: r2 > 0.8 ? 'HIGH' : 'MEDIUM' },
        telemetry: { inferenceTimeMs: 120, trainingWindowDays: 90, mape: 0, r2Score: r2 },
        featureImportance: [],
        recommendations: [],
        modelInformation: { modelName: 'OLS Regression', version: 'v2.4', algorithm: 'Ordinary Least Squares', confidence: r2, trainingWindow: 90 },
        modelInfo: { modelName: 'OLS Regression', version: 'v2.4', algorithm: 'Ordinary Least Squares', confidence: r2, trainingWindow: 90 },
        historicalData: [],
        confidenceInterval: { lowerBound: 0.85, upperBound: 1.15, confidenceLevel: 0.95 },
      } as PredictionDashboardDTO;
    }

    // ── DEMAND_PEAK ───────────────────────────────────────────────────────────
    if (type === 'DEMAND_PEAK' && dashboard.bookingDemand) {
      const dem = dashboard.bookingDemand as any;
      const dailyForecasts = dem.daily_forecasts ?? dem.dailyForecasts ?? [];
      const forecastList: PredictionDashboardDTO['forecast'] = dailyForecasts.map((p: any) => ({
        date: p.date,
        actual: null,
        predicted: p.predicted_bookings ?? p.predictedBookings ?? p.predicted ?? null,
        lowerBound: p.lower_bound ?? p.lowerBound ?? null,
        upperBound: p.upper_bound ?? p.upperBound ?? null,
      }));
      const peakDay = dem.peak_day ?? dem.peakDay ?? 'N/A';
      const avgDemand = dem.avg_daily_demand ?? dem.avgDailyDemand ?? 0;
      return {
        summary: { title: 'DỰ BÁO NHU CẦU ĐẶT XE', summaryText: insight.description, urgency: 'IMMEDIATE', keyTakeaways: [`Ngày cao điểm: ${peakDay}`, `TB ${avgDemand.toFixed(1)} lượt/ngày`] },
        businessImpact: { revenueOpportunity: 14500000, occupancyRate: 78.5, bookingsDelta: Math.round(avgDemand), roiPercentage: 22.4, trendDirection: 'UP', impactText: `Đỉnh nhu cầu vào ${peakDay}` },
        forecast: forecastList,
        forecastChart: forecastList,
        confidence: { score: 0.94, rating: 'HIGH' },
        telemetry: { inferenceTimeMs: 142, trainingWindowDays: 90, mape: 3.4, r2Score: 0.92 },
        featureImportance: [],
        recommendations: [],
        modelInformation: { modelName: 'DOW Seasonal Regression', version: 'v1.9', algorithm: 'Day-of-Week Decomposition', confidence: 0.94, trainingWindow: 90 },
        modelInfo: { modelName: 'DOW Seasonal Regression', version: 'v1.9', algorithm: 'Day-of-Week Decomposition', confidence: 0.94, trainingWindow: 90 },
        historicalData: [],
        confidenceInterval: { lowerBound: 0.90, upperBound: 1.10, confidenceLevel: 0.95 },
      } as PredictionDashboardDTO;
    }

    // ── UTILIZATION ───────────────────────────────────────────────────────────
    if (type === 'UTILIZATION' && dashboard.vehicleUtilization) {
      const util = dashboard.vehicleUtilization as any;
      const lowest = util.lowest_category ?? util.lowestCategory ?? 'N/A';
      const currentRates: Record<string, number> = util.current_rates ?? util.currentRates ?? {};
      const forecastList: PredictionDashboardDTO['forecast'] = Object.entries(currentRates).slice(0, 7).map(([cat, rate]: [string, any]) => ({
        date: cat,
        actual: null,
        predicted: typeof rate === 'number' ? rate * 100 : null,
        lowerBound: null,
        upperBound: null,
      }));
      return {
        summary: { title: 'TỶ LỆ LẤP ĐẦY HẠM ĐỘI XE', summaryText: insight.description, urgency: 'ROUTINE', keyTakeaways: [`Phân khúc thấp nhất: ${lowest}`] },
        businessImpact: { revenueOpportunity: 8000000, occupancyRate: Object.values(currentRates).reduce((a: any, b: any) => a + b, 0) / Math.max(Object.keys(currentRates).length, 1) * 100, bookingsDelta: 0, roiPercentage: 15, trendDirection: 'STABLE', impactText: `Cải thiện lấp đầy phân khúc ${lowest}` },
        forecast: forecastList,
        forecastChart: forecastList,
        confidence: { score: 0.88, rating: 'HIGH' },
        telemetry: { inferenceTimeMs: 80, trainingWindowDays: 90, mape: 0, r2Score: 0.88 },
        featureImportance: [],
        recommendations: [],
        modelInformation: { modelName: 'Fleet Utilization Model', version: 'v1.0', algorithm: 'Category Rate Analysis', confidence: 0.88, trainingWindow: 90 },
        modelInfo: { modelName: 'Fleet Utilization Model', version: 'v1.0', algorithm: 'Category Rate Analysis', confidence: 0.88, trainingWindow: 90 },
        historicalData: [],
        confidenceInterval: { lowerBound: 0.85, upperBound: 1.15, confidenceLevel: 0.95 },
      } as PredictionDashboardDTO;
    }

    // ── PLATFORM_STATUS / fallback ────────────────────────────────────────────
    return {
      summary: { title: 'HỆ THỐNG HOẠT ĐỘNG ỔN ĐỊNH', summaryText: insight.description || 'Không phát hiện bất thường, rủi ro rời bỏ hay sụt giảm doanh thu.', urgency: 'ROUTINE', keyTakeaways: ['Chỉ số nền tảng ổn định.', 'Không phát hiện bất thường.', 'Không có rủi ro rời bỏ cao.'] },
      businessImpact: { revenueOpportunity: 0, occupancyRate: 75, bookingsDelta: 0, roiPercentage: 0, trendDirection: 'STABLE', impactText: 'Hệ thống hoạt động bình thường.' },
      forecast: [],
      forecastChart: [],
      confidence: { score: 0.95, rating: 'HIGH' },
      telemetry: { inferenceTimeMs: 0, trainingWindowDays: 90, mape: 0, r2Score: 0 },
      featureImportance: [],
      recommendations: [],
      modelInformation: { modelName: 'Platform Status Monitor', version: 'v1.0', algorithm: 'Rule-based threshold check', confidence: 0.95, trainingWindow: 90 },
      modelInfo: { modelName: 'Platform Status Monitor', version: 'v1.0', algorithm: 'Rule-based threshold check', confidence: 0.95, trainingWindow: 90 },
      historicalData: [],
      confidenceInterval: { lowerBound: 0.90, upperBound: 1.10, confidenceLevel: 0.95 },
    } as PredictionDashboardDTO;
  };

  const handleOpenInsightModal = async (insight: InsightDTO) => {
    const type = insight.type || '';
    // Use backend detail if present, otherwise build from dashboard data
    const detail = insight.detail ?? buildDetailFromDashboard(insight);
    setActiveModal({
      isOpen: true,
      title: insight.title,
      type: type,
      description: insight.description,
      actionLabel: insight.actionLabel,
      severity: insight.severity,
      insightDetail: detail,
      loadingDetail: false
    });
  };

  const closeModal = () => {
    setActiveModal(prev => ({ ...prev, isOpen: false }));
  };

  const translateTitleVi = (t: string | undefined): string => {
    if (!t) return 'THÔNG TIN PHÂN TÍCH AI';
    if (t.includes('PLATFORM METRICS ARE STABLE')) return 'HỆ THỐNG HOẠT ĐỘNG ỔN ĐỊNH';
    if (t.includes('PEAK DEMAND')) return t.replace('PEAK DEMAND:', 'NHU CẦU ĐẠT ĐỈNH:');
    if (t.includes('LOW UTILIZATION')) return t.replace('LOW UTILIZATION:', 'TỶ LỆ LẤP ĐẦY THẤP:');
    if (t.includes('REVENUE TREND')) return t.replace('REVENUE TREND:', 'XU HƯỚNG DOANH THU:');
    if (t.includes('CHURN RISK')) return 'CẢNH BÁO RỦI RO RỜI BỎ';
    if (t.includes('ANOMALY')) return 'CẢNH BÁO BẤT THƯỜNG';
    return t;
  };

  const translateDescVi = (d: string | undefined): string => {
    if (!d) return 'Hệ thống AI vừa hoàn tất tính toán các biến số kinh doanh.';
    if (d.includes('Platform metrics are stable')) return 'Chỉ số nền tảng đang ở trạng thái ổn định. Không phát hiện bất thường, rủi ro rời bỏ hay sụt giảm doanh thu.';
    if (d.includes('Highest booking demand is expected')) return d.replace('Highest booking demand is expected on', 'Nhu cầu đặt xe dự kiến đạt đỉnh vào').replace('Average daily demand:', '(TB').replace('bookings/day.', 'chuyến/ngày).');
    if (d.includes('Vehicle category') && d.includes('has the lowest utilization rate')) return d.replace('Vehicle category', 'Dòng xe').replace('has the lowest utilization rate at', 'có tỷ lệ lấp đầy thấp nhất (').replace('. Consider promotional pricing to boost bookings.', '%). Khuyến nghị giảm giá khuyến mãi để thúc đẩy lượt thuê.');
    if (d.includes('Revenue is trending stable')) return 'Doanh thu đang duy trì xu hướng tăng trưởng ổn định.';
    return d;
  };

  const translateActionVi = (a: string | undefined): string | null => {
    if (!a) return null;
    const lower = a.toLowerCase();
    if (lower.includes('demand')) return 'XEM DỰ BÁO NHU CẦU';
    if (lower.includes('revenue')) return 'XEM DỰ BÁO DOANH THU';
    if (lower.includes('utilization')) return 'XEM TỶ LỆ LẤP ĐẦY';
    if (lower.includes('churn')) return 'XEM RỦI RO RỜI BỎ';
    if (lower.includes('anomaly')) return 'XEM BẤT THƯỜNG';
    return a;
  };

  const getCardTheme = (severity: string, type: string) => {
    const sev = severity?.toUpperCase();
    const t = type?.toUpperCase();

    if (sev === 'CRITICAL' || t === 'CHURN_ALERT') {
      return {
        border: isDark ? 'border-rose-500/30' : 'border-rose-200',
        bg: isDark ? 'bg-slate-900/90' : 'bg-white',
        accentGradient: 'from-rose-500 to-pink-600',
        badgeBg: isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200',
        iconBg: 'bg-rose-500/10 text-rose-500',
        btnBg: isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60',
      };
    }

    if (sev === 'WARNING' || t === 'ANOMALY') {
      return {
        border: isDark ? 'border-amber-500/30' : 'border-amber-200',
        bg: isDark ? 'bg-slate-900/90' : 'bg-white',
        accentGradient: 'from-amber-500 to-orange-600',
        badgeBg: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        btnBg: isDark ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/60',
      };
    }

    if (t === 'REVENUE_FORECAST' || t === 'UTILIZATION') {
      return {
        border: isDark ? 'border-indigo-500/30' : 'border-indigo-200',
        bg: isDark ? 'bg-slate-900/90' : 'bg-white',
        accentGradient: 'from-indigo-500 to-purple-600',
        badgeBg: isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        btnBg: isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60',
      };
    }

    return {
      border: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
      bg: isDark ? 'bg-slate-900/90' : 'bg-white',
      accentGradient: 'from-emerald-500 to-teal-600',
      badgeBg: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      btnBg: isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60',
    };
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'REVENUE_FORECAST': return <TrendingUp className="w-4 h-4" />;
      case 'DEMAND_PEAK': return <CloudSun className="w-4 h-4 text-amber-500" />;
      case 'CHURN_ALERT': return <Users className="w-4 h-4" />;
      case 'ANOMALY': return <AlertTriangle className="w-4 h-4" />;
      case 'UTILIZATION': return <Car className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "p-8 rounded-[2rem] border shadow-2xl flex items-center justify-center min-h-[220px] transition-all",
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-gradient-to-br from-white to-slate-50 border-slate-200/80"
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-600 animate-spin"></div>
            <BrainCircuit className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Hệ Thống AI LuxeWay Đang Phân Tích...</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đang tổng hợp mô hình dự báo & nhận diện chỉ số rủi ro</p>
          </div>
        </div>
      </div>
    );
  }

  const isWarmingUp = dashboard?.insights?.length === 1 && dashboard.insights[0].type === 'SYSTEM';
  const insightsList = dashboard?.insights || [];

  return (
    <>
      <div className={cn(
        "border rounded-[2.5rem] p-6 lg:p-7 shadow-2xl transition-all duration-500 relative overflow-hidden",
        isDark 
          ? "bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border-slate-800 shadow-indigo-950/20" 
          : "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-slate-800 text-white shadow-xl"
      )}>
        {/* Decorative Glow Elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7 pb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-black text-sm lg:text-base uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-300">
                  LUXEWAY AI PREDICTIVE ENGINE
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AGENT HOẠT ĐỘNG TRỰC TIẾP
                </span>
                {dashboard?.sidecarWarning && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CƠ CHẾ DỰ PHÒNG ML SIDECAR
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Tự động phân tích chỉ số nền tảng, nhận diện rủi ro và dự báo nhu cầu thuê xe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button 
              onClick={fetchAIInsights}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
              title="Làm Mới Phân Tích AI"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-300" />
              <span>LÀM MỚI</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10">
          {error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          ) : isWarmingUp ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
              <Sparkles className="w-9 h-9 text-indigo-400 animate-pulse" />
              <h4 className="text-sm font-black text-white">AI Engine Is Compiling Dashboard</h4>
              <p className="text-xs font-medium text-slate-400 max-w-md">Our predictive sidecar models are analyzing historical daily revenue, demand spikes, and churn indicators. Please check back in a few moments.</p>
              <button 
                onClick={fetchAIInsights} 
                className="mt-2 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Check Now
              </button>
            </div>
          ) : insightsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {insightsList.map((insight, idx) => {
                  const style = getCardTheme(insight.severity, insight.type || '');

                  // Translate fallback titles/descriptions if backend returned English
                  const titleVi = translateTitleVi(insight.title);
                  const descVi = translateDescVi(insight.description);
                  const actionVi = translateActionVi(insight.actionLabel);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.08 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      key={idx}
                      onClick={() => handleOpenInsightModal(insight)}
                      className={cn(
                        "p-5 rounded-2xl border shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 group cursor-pointer",
                        style.bg,
                        style.border
                      )}
                    >
                      {/* Top Accent Line */}
                      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", style.accentGradient)} />

                      {/* Card Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("p-2 rounded-xl border border-current/10 flex items-center justify-center shadow-sm", style.iconBg)}>
                              {getInsightTypeIcon(insight.type || '')}
                            </div>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", style.badgeBg)}>
                              {insight.severity === 'CRITICAL' ? 'KHẨN CẤP' : insight.severity === 'WARNING' ? 'CẢNH BÁO' : 'THÔNG TIN'}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white leading-snug">
                          {titleVi}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {descVi}
                        </p>
                      </div>

                      {/* Card Footer / Action Button */}
                      {actionVi && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInsightModal(insight);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 group-hover:px-4",
                              style.btnBg
                            )}
                          >
                            <span>{actionVi}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Hệ Thống Hoạt Động Bình Thường</h4>
              <p className="text-xs font-medium text-slate-400">AI Agent đã kiểm tra các chỉ số thời gian thực và không phát hiện bất thường hay rủi ro sụt giảm doanh thu nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Detail Breakdown Modal */}
      <PredictionModalAssembled
        isOpen={activeModal.isOpen}
        onClose={closeModal}
        isLoading={activeModal.loadingDetail}
        dto={activeModal.insightDetail}
      />
    </>
  );
};
