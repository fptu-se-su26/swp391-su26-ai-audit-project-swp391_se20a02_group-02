import React, { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '@/components/ui/ImageUploader';
import { OwnerAnalyticsDashboard } from '@/components/enterprise/OwnerAnalyticsDashboard';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';

import {
  LayoutDashboard, Car, Calendar, TrendingUp, Users, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, Clock, DollarSign,
  BarChart2, Shield, AlertTriangle, LogOut, Globe, Menu,
  MapPin, Star, Activity, ArrowUpRight, Play, FileText
} from 'lucide-react';

import { useAuthStore, useUIStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import { reviewService } from '@/services/otherServices';
import apiClient from '@/services/api';
import type { Vehicle, Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor, convertCurrency, cn, SERVER_BASE } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// Custom glassmorphic tooltip for charts (styled as a premium white card with shadow)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xl text-xs font-semibold text-slate-800">
        <p className="text-slate-555 font-bold mb-1">{label}</p>
        <p className="text-slate-800 font-extrabold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Revenue: <span className="text-amber-600">{formatCurrency(payload[0].value)}</span>
        </p>
        {payload[0].payload.bookings !== undefined && (
          <p className="text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
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
  const { currency, language } = useUIStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();
  const lang = (language || 'en').toLowerCase();

  const ovt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        topVehicle: '🏆 Xe Nổi Bật Nhất',
        live: 'Hoạt động',
        perDay: '/ngày',
        addVehicle: 'Thêm xe',
        totalRevenue: 'Tổng doanh thu',
        revenueSub: '+18% tháng này',
        activeVehicles: 'Xe đang hoạt động',
        fleetStatus: 'Trạng thái đội xe',
        totalBookings: 'Tổng chuyến thuê',
        pendingSub: 'chờ duyệt',
        myRating: 'Đánh giá của tôi',
        reviewsSub: 'đánh giá',
        monthlyGoal: 'Mục tiêu tháng',
        revenueTarget: 'Chỉ tiêu doanh thu',
        recentVehicles: 'Xe gần đây',
        viewAll: 'Xem tất cả →',
        forRent: 'Sẵn sàng',
        rented: 'Đang thuê',
        revenueChartTitle: 'Doanh thu 14 ngày qua',
        yourEarningsThisYear: 'Thu nhập của bạn năm nay',
        liveAnalytics: 'Phân tích thời gian thực',
        pendingRequests: 'Yêu cầu chờ duyệt',
        noPendingRequests: 'Không có yêu cầu nào chờ duyệt',
        approveBtn: 'Duyệt ngay',
        tasksTitle: 'Nhiệm vụ',
        task1: 'Duyệt các yêu cầu đặt xe đang chờ',
        task2: 'Thêm hình ảnh cho danh sách xe',
        task3: 'Cập nhật lịch sẵn sàng của xe',
        task4: 'Phản hồi đánh giá của khách hàng',
        task5: 'Hoàn thiện bảng theo dõi thu nhập',
        completedOf: 'Đã hoàn thành',
        jan: 'Thg 1', feb: 'Thg 2', mar: 'Thg 3', apr: 'Thg 4',
        may: 'Thg 5', jun: 'Thg 6', jul: 'Thg 7', aug: 'Thg 8', sep: 'Thg 9'
      },
      ja: {
        topVehicle: '🏆 トップ人気車両',
        live: '公開中',
        perDay: '/日',
        addVehicle: '車両を追加',
        totalRevenue: '売上合計',
        revenueSub: '今月 +18%',
        activeVehicles: '稼働中車両',
        fleetStatus: 'フリートステータス',
        totalBookings: '予約総数',
        pendingSub: '件保留中',
        myRating: 'マイ評価',
        reviewsSub: '件のレビュー',
        monthlyGoal: '今月の目標',
        revenueTarget: '売上ターゲット',
        recentVehicles: '最近の車両',
        viewAll: 'すべて見る →',
        forRent: '貸出可',
        rented: '貸出中',
        revenueChartTitle: '収益（過去14日間）',
        yourEarningsThisYear: '今年の獲得収益',
        liveAnalytics: 'ライブ分析',
        pendingRequests: '保留中のリクエスト',
        noPendingRequests: '保留中のリクエストはありません',
        approveBtn: '承認',
        tasksTitle: 'タスク',
        task1: '保留中の予約リクエストを承認',
        task2: '掲載車両の写真を追加',
        task3: '車両の予約カレンダーを更新',
        task4: 'カスタマーレビューに返信',
        task5: '収益ダッシュボードを完了',
        completedOf: '完了',
        jan: '1月', feb: '2月', mar: '3月', apr: '4月',
        may: '5月', jun: '6月', jul: '7月', aug: '8月', sep: '9月'
      },
      ko: {
        topVehicle: '🏆 인기 대표 차량',
        live: '운행 중',
        perDay: '/일',
        addVehicle: '차량 추가',
        totalRevenue: '총 수익',
        revenueSub: '이번 달 +18%',
        activeVehicles: '운행 중인 차량',
        fleetStatus: '차량 상태',
        totalBookings: '총 예약 수',
        pendingSub: '건 대기 중',
        myRating: '내 평점',
        reviewsSub: '개 후기',
        monthlyGoal: '월간 목표',
        revenueTarget: '목표 수익',
        recentVehicles: '최근 등록 차량',
        viewAll: '전체 보기 →',
        forRent: '대여 가능',
        rented: '대여 중',
        revenueChartTitle: '최근 14일 수익',
        yourEarningsThisYear: '올해 총 수익',
        liveAnalytics: '실시간 분석',
        pendingRequests: '대기 중인 요청',
        noPendingRequests: '대기 중인 요청이 없습니다',
        approveBtn: '승인',
        tasksTitle: '작업',
        task1: '대기 중인 예약 요청 승인',
        task2: '차량 등록 사진 추가',
        task3: '차량 대여 가능 달력 업데이트',
        task4: '고객 후기에 답글 작성',
        task5: '수익 대시보드 완료',
        completedOf: '완료',
        jan: '1월', feb: '2월', mar: '3월', apr: '4월',
        may: '5월', jun: '6월', jul: '7월', aug: '8월', sep: '9월'
      },
      zh: {
        topVehicle: '🏆 热门精选车辆',
        live: '上线中',
        perDay: '/天',
        addVehicle: '添加车辆',
        totalRevenue: '总收入',
        revenueSub: '本月 +18%',
        activeVehicles: '运营中车辆',
        fleetStatus: '车队状态',
        totalBookings: '总预订数',
        pendingSub: '个待处理',
        myRating: '我的评分',
        reviewsSub: '条评价',
        monthlyGoal: '月度目标',
        revenueTarget: '收入目标',
        recentVehicles: '最近车辆',
        viewAll: '查看全部 →',
        forRent: '可出租',
        rented: '已出租',
        revenueChartTitle: '近 14 天收入',
        yourEarningsThisYear: '您今年的收益',
        liveAnalytics: '实时分析',
        pendingRequests: '待处理请求',
        noPendingRequests: '暂无待处理请求',
        approveBtn: '批准',
        tasksTitle: '任务',
        task1: '批准待处理的预订请求',
        task2: '为发布的车辆添加照片',
        task3: '更新车辆可用日历',
        task4: '回复客户评价',
        task5: '完成收益仪表板',
        completedOf: '已完成',
        jan: '1月', feb: '2月', mar: '3月', apr: '4月',
        may: '5月', jun: '6月', jul: '7月', aug: '8月', sep: '9月'
      }
    };

    const fallback = {
      topVehicle: '🏆 Your Top Vehicle',
      live: 'Live',
      perDay: '/day',
      addVehicle: 'Add Vehicle',
      totalRevenue: 'Total Revenue',
      revenueSub: '+18% this month',
      activeVehicles: 'Active Vehicles',
      fleetStatus: 'Fleet status',
      totalBookings: 'Total Bookings',
      pendingSub: 'pending',
      myRating: 'My Rating',
      reviewsSub: 'reviews',
      monthlyGoal: 'Monthly Goal',
      revenueTarget: 'Revenue Target',
      recentVehicles: 'Recent Vehicles',
      viewAll: 'View all →',
      forRent: 'For Rent',
      rented: 'Rented',
      revenueChartTitle: 'Revenue (Last 14 Days)',
      yourEarningsThisYear: 'Your earnings this year',
      liveAnalytics: 'Live Analytics',
      pendingRequests: 'Pending Requests',
      noPendingRequests: 'No pending requests',
      approveBtn: 'Approve',
      tasksTitle: 'Tasks',
      task1: 'Approve pending booking requests',
      task2: 'Add photos to your listings',
      task3: 'Update vehicle availability calendar',
      task4: 'Respond to customer reviews',
      task5: 'Complete earnings dashboard',
      completedOf: 'completed',
      jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
      may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep'
    };

    return dicts[lang] || fallback;
  }, [lang]);

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
  }, [user?.id]);

  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'available').length,
    totalBookings: bookings.length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.pricing.total, 0),
    pending: bookings.filter(b => b.status === 'pending').length,
    rating: user?.rating || 0,
  };

  const revenueData = [
    { month: ovt.jan, revenue: Math.max(stats.revenue * 0.08, 1000000) },
    { month: ovt.feb, revenue: Math.max(stats.revenue * 0.14, 1500000) },
    { month: ovt.mar, revenue: Math.max(stats.revenue * 0.22, 2000000) },
    { month: ovt.apr, revenue: Math.max(stats.revenue * 0.30, 2800000) },
    { month: ovt.may, revenue: Math.max(stats.revenue * 0.45, 3500000) },
    { month: ovt.jun, revenue: Math.max(stats.revenue * 0.60, 4200000) },
    { month: ovt.jul, revenue: Math.max(stats.revenue * 0.78, 5000000) },
    { month: ovt.aug, revenue: Math.max(stats.revenue * 0.90, 6000000) },
    { month: ovt.sep, revenue: Math.max(stats.revenue, 7000000) },
  ];

  const statCards = [
    { label: ovt.totalRevenue, value: formatCurrency(stats.revenue), icon: DollarSign, color: '#10B981', glow: 'rgba(16,185,129,0.3)', sub: ovt.revenueSub, isStr: true },
    { label: ovt.activeVehicles, value: `${stats.activeVehicles}/${stats.totalVehicles}`, icon: Car, color: '#F59E0B', glow: 'rgba(245,158,11,0.3)', sub: ovt.fleetStatus },
    { label: ovt.totalBookings, value: stats.totalBookings, icon: Calendar, color: '#6366F1', glow: 'rgba(99,102,241,0.3)', sub: `${stats.pending} ${ovt.pendingSub}` },
    { label: ovt.myRating, value: `${stats.rating || '5.0'}/5`, icon: CheckCircle, color: '#EC4899', glow: 'rgba(236,72,153,0.3)', sub: `${user?.totalReviews || 0} ${ovt.reviewsSub}` },
  ];

  const goalPct = 72;
  const featuredVehicle = vehicles[0];

  const tasks = [
    { label: ovt.task1, done: false, count: stats.pending, color: '#F59E0B', href: '/owner/bookings' },
    { label: ovt.task2, done: false, count: 2, color: '#6366F1', href: '/owner/vehicles' },
    { label: ovt.task3, done: false, count: 0, color: '#EC4899', href: '/owner/calendar' },
    { label: ovt.task4, done: true, count: 0, color: '#10B981', href: '/owner/revenue' },
    { label: ovt.task5, done: true, count: 0, color: '#10B981', href: '/owner/revenue' },
  ];

  return (
    <div className="space-y-5">
      {/* ---- TOP ROW: Hero Card + Stat Cards ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Hero / Featured Vehicle Card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-3 relative rounded-2xl overflow-hidden min-h-[260px] shadow-xl"
        >
          <img
            src={featuredVehicle?.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80'}
            alt={featuredVehicle?.name || 'Featured Vehicle'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(7,11,20,0.90) 0%, rgba(7,11,20,0.55) 55%, rgba(7,11,20,0.20) 100%)' }} />

          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.9)', color: '#000' }}>
              {ovt.topVehicle}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white">{ovt.live}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3 h-3" /> {featuredVehicle?.location?.city || 'Ho Chi Minh City'}, Vietnam
                </p>
                <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
                  {featuredVehicle?.name || 'Ferrari F8 Tributo'}
                </h2>
                <p className="text-xl font-extrabold mt-1 text-amber-400">
                  {formatCurrency(featuredVehicle?.pricePerDay || 8500000)}
                  <span className="text-sm font-semibold ml-1 text-white/50">{ovt.perDay}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to="/owner/vehicles/new"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-550 hover:bg-amber-600 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  {ovt.addVehicle}
                </Link>
                {featuredVehicle && (
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{featuredVehicle.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards + Goal */}
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          className="lg:col-span-2 grid grid-cols-2 gap-3"
        >
          {statCards.map(stat => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              className="lw-stat-card cursor-default group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" style={{ color: stat.color }} />
              </div>
              <div className="stat-icon" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-sub flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-2.5 h-2.5" /> {stat.sub}
              </p>
            </motion.div>
          ))}

          {/* Goal ring */}
          <motion.div
            variants={staggerItem}
            className="lw-stat-card col-span-2 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="stat-label">{ovt.monthlyGoal}</p>
                <p className="font-bold text-sm text-[var(--lw-text-primary)] mt-0.5">{ovt.revenueTarget}</p>
              </div>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="5" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#ownerGoalGrad)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 20 * goalPct / 100} ${2 * Math.PI * 20 * (1 - goalPct / 100)}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="ownerGoalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-[var(--lw-text-primary)]">{goalPct}%</span>
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ---- MIDDLE ROW: Recent Vehicles + Revenue Chart ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Vehicles */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">{ovt.recentVehicles}</h3>
            <Link to="/owner/vehicles" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">{ovt.viewAll}</Link>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              ([{
                name: 'Honda Vision 2022', city: 'Ho Chi Minh City', price: 130000, status: 'available',
                img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&q=80'
              }, {
                name: 'Honda Vision 2023 - Premium', city: 'Ho Chi Minh City', price: 150000, status: 'available',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80'
              }, {
                name: 'Honda Vision 2021', city: 'Ho Chi Minh City', price: 120000, status: 'available',
                img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80'
              }] as any[]).map((v, i) => (
                <motion.div key={i} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                <img src={v.thumbnailUrl || v.img} alt={v.name} className="w-16 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{v.name}</p>
                  <p className="text-[11px] font-medium flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3 h-3" />{v.location?.city || v.city}
                  </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: v.status === 'available' ? '#059669' : '#6366F1' }}>
                      {v.status === 'available' ? ovt.forRent : ovt.rented}
                    </span>
                    <p className="text-xs font-bold text-[var(--lw-text-primary)] mt-1">{formatCurrency(v.price)}</p>
                  </div>
                </motion.div>
              ))
            ) : vehicles.slice(0, 3).map(v => (
              <motion.div key={v.id} whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 bg-[var(--lw-bg-secondary)] hover:bg-[var(--lw-bg-card-hover)]">
                <img src={v.thumbnailUrl} alt={v.name} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--lw-text-primary)] truncate">{v.name}</p>
                  <p className="text-[11px] flex items-center gap-1 mt-0.5 text-[var(--lw-text-muted)]">
                    <MapPin className="w-2.5 h-2.5" />{v.location?.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: v.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: v.status === 'available' ? '#059669' : '#6366F1' }}>
                    {v.status === 'available' ? ovt.forRent : ovt.rented}
                  </span>
                  <p className="text-xs font-bold text-[var(--lw-text-primary)] mt-1">{formatCurrency(v.pricePerDay)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">{ovt.revenueChartTitle}</h3>
              <p className="text-[11px] mt-0.5 text-[var(--lw-text-muted)]">{ovt.yourEarningsThisYear}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{ovt.liveAnalytics}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217,119,6,0.06)', radius: 8 }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} cursor="pointer" activeBar={{ fillOpacity: 0.8 }}>
                {revenueData.map((_, index) => (
                  <Cell key={index}
                    fill={index === revenueData.length - 1 ? 'url(#ownerBarGrad)' : 'rgba(217,119,6,0.25)'} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="ownerBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ---- BOTTOM ROW: Pending Bookings + Tasks ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Bookings */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--lw-text-primary)] text-sm">{ovt.pendingRequests}</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200">
              {stats.pending} {ovt.pendingSub}
            </span>
          </div>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'pending').slice(0, 4).map(booking => (
              <div key={booking.id}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 hover:shadow-md">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-800/40 border border-amber-200 dark:border-amber-700/50">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs font-medium mt-1 text-slate-500 dark:text-slate-400">
                    📅 {formatDate(booking.startDate)} · {formatCurrency(booking.pricing.total)}
                  </p>
                </div>
                <button
                  onClick={() => bookingService.updateStatus(booking.id, 'confirmed')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                >
                  {ovt.approveBtn}
                </button>
              </div>
            ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-[var(--lw-text-muted)]">{ovt.noPendingRequests}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Panel */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="lw-stat-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{ovt.tasksTitle}</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              {tasks.filter(t => !t.done).length} {ovt.pendingSub}
            </span>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task, i) => (
              <Link key={i} to={task.href}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 group hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                style={{
                  opacity: task.done ? 0.6 : 1,
                }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {task.done
                    ? <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                </div>
                <span className="text-sm flex-1 font-medium text-slate-700 dark:text-slate-300"
                  style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
                <div className="flex items-center gap-2">
                  {!task.done && task.count > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: `${task.color}18`, color: task.color, border: `1px solid ${task.color}30` }}>
                      {task.count}
                    </span>
                  )}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--lw-border)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">
                {ovt.completedOf} {tasks.filter(t => t.done).length} / {tasks.length}
              </span>
              <span className="text-[10px] font-bold text-amber-600">
                {Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tasks.filter(t => t.done).length / tasks.length * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ====== VEHICLE MANAGEMENT ======
export const VehicleManagePage: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CAR' | 'MOTORBIKE'>('CAR');
  const toast = useToast();
  const t = useT();
  const lang = (language || 'en').toLowerCase();

  const vmt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        myVehicles: 'Xe của tôi',
        backToOverview: 'Quay lại tổng quan',
        addVehicle: 'Thêm xe',
        cars: '🚗 Ô tô',
        motorbikes: '🏍️ Xe máy',
        img: 'HÌNH ẢNH',
        name: 'TÊN XE',
        type: 'LOẠI XE',
        price: 'GIÁ THUÊ',
        status: 'TRẠNG THÁI',
        approvalNote: 'GHI CHÚ DUYỆT',
        action: 'THAO TÁC',
        available: 'SẴN SÀNG',
        rented: 'ĐANG THUÊ',
        submitted: 'CHỜ DUYỆT',
        rejected: 'TỪ CHỐI'
      },
      ja: {
        myVehicles: 'マイ車両',
        backToOverview: '概要に戻る',
        addVehicle: '車両を追加',
        cars: '🚗 乗用車',
        motorbikes: '🏍️ バイク',
        img: '画像',
        name: '車両名',
        type: 'タイプ',
        price: '料金',
        status: 'ステータス',
        approvalNote: '承認ノート',
        action: '操作',
        available: '利用可能',
        rented: '貸出中',
        submitted: '申請中',
        rejected: '却下'
      },
      ko: {
        myVehicles: '내 차량',
        backToOverview: '개요로 돌아가기',
        addVehicle: '차량 추가',
        cars: '🚗 승용차',
        motorbikes: '🏍️ 오토바이',
        img: '이미지',
        name: '차량명',
        type: '유형',
        price: '대여료',
        status: '상태',
        approvalNote: '승인 메모',
        action: '작업',
        available: '대여 가능',
        rented: '대여 중',
        submitted: '제출됨',
        rejected: '거절됨'
      },
      zh: {
        myVehicles: '我的车辆',
        backToOverview: '返回概览',
        addVehicle: '添加车辆',
        cars: '🚗 轿车',
        motorbikes: '🏍️ 摩托车',
        img: '图片',
        name: '车辆名称',
        type: '类型',
        price: '价格',
        status: '状态',
        approvalNote: '审核备注',
        action: '操作',
        available: '可出租',
        rented: '已出租',
        submitted: '已提交',
        rejected: '已拒绝'
      }
    };

    const fallback = {
      myVehicles: 'My Vehicles',
      backToOverview: 'Back to Overview',
      addVehicle: 'Add Vehicle',
      cars: '🚗 Cars',
      motorbikes: '🏍️ Motorbikes',
      img: 'IMAGE',
      name: 'NAME',
      type: 'TYPE',
      price: 'PRICE',
      status: 'STATUS',
      approvalNote: 'APPROVAL NOTE',
      action: 'ACTION',
      available: 'AVAILABLE',
      rented: 'RENTED',
      submitted: 'SUBMITTED',
      rejected: 'REJECTED'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  useEffect(() => {
    if (!user) return;
    vehicleService.getByOwner(user.id).then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, [user?.id]);

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (window.confirm(lang === 'vi' ? `Xác nhận xóa xe ${vehicleName}?` : `Delete ${vehicleName}?`)) {
      await vehicleService.delete(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success(lang === 'vi' ? 'Đã xóa phương tiện thành công' : 'Vehicle deleted');
    }
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: vmt.myVehicles }
  ];

  const filteredVehicles = vehicles.filter(v => (v.vehicleType || 'CAR').toUpperCase() === activeTab);

  const getStatusLabel = (status: string) => {
    const upper = status.toUpperCase();
    if (upper === 'AVAILABLE' || upper === 'APPROVED') return vmt.available;
    if (upper === 'RENTED' || upper === 'IN_RENTAL') return vmt.rented;
    if (upper === 'SUBMITTED' || upper === 'PENDING') return vmt.submitted;
    if (upper === 'REJECTED') return vmt.rejected;
    return upper;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title={vmt.myVehicles} items={breadcrumbItems} backHref="/owner" backText={vmt.backToOverview} className="mb-0 flex-1" />
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> {vmt.addVehicle}
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setActiveTab('CAR')}
          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 hover-lift ${
            activeTab === 'CAR'
              ? 'border-gold bg-amber-500/10 text-gold shadow-sm shadow-gold/20'
              : 'border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 hover:border-slate-300'
          }`}
        >
          {vmt.cars} ({vehicles.filter(v => (v.vehicleType || 'CAR').toUpperCase() === 'CAR').length})
        </button>
        <button
          onClick={() => setActiveTab('MOTORBIKE')}
          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 hover-lift ${
            activeTab === 'MOTORBIKE'
              ? 'border-gold bg-amber-500/10 text-gold shadow-sm shadow-gold/20'
              : 'border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 hover:border-slate-300'
          }`}
        >
          {vmt.motorbikes} ({vehicles.filter(v => (v.vehicleType || 'CAR').toUpperCase() === 'MOTORBIKE').length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-20 rounded-[2.5rem] shadow-sm">
          <Car className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg">{t.ownerDashboard.noVehiclesYet}</h3>
          <p className="text-slate-400 text-sm font-medium mb-6">{lang === 'vi' ? 'Bạn chưa có phương tiện nào trong danh mục này.' : `No ${activeTab.toLowerCase()}s found in this category.`}</p>
          <Link to="/owner/vehicles/new" className="btn-gold px-6 py-3.5 rounded-xl text-xs font-extrabold font-display hover-lift">{t.ownerDashboard.addFirstVehicle}</Link>
        </div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-sm"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">{vmt.img}</th>
                <th className="p-4">{vmt.name}</th>
                <th className="p-4">{vmt.type}</th>
                <th className="p-4">{vmt.price}</th>
                <th className="p-4">{vmt.status}</th>
                <th className="p-4">{vmt.approvalNote}</th>
                <th className="p-4 pr-6 text-right">{vmt.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-sm">
              {filteredVehicles.map(vehicle => {
                const statusLower = (vehicle.approvalStatus || vehicle.status || '').toLowerCase();
                const displayRaw = statusLower === 'approved' ? 'AVAILABLE' : statusLower.toUpperCase();
                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <img 
                        src={vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80'} 
                        alt={vehicle.name} 
                        className="w-16 h-12 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-800"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {vehicle.name}
                    </td>
                    <td className="p-4 font-semibold text-xs text-slate-500 uppercase">
                      {vehicle.vehicleType || 'CAR'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(vehicle.pricePerDay)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                        displayRaw === 'AVAILABLE' || displayRaw === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        displayRaw === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        displayRaw === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {getStatusLabel(displayRaw)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {displayRaw === 'REJECTED' && vehicle.approvalNote ? (
                        <span className="text-rose-600 font-medium">{vehicle.approvalNote}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/vehicles/${vehicle.id}`} title={lang === 'vi' ? 'Xem Tin Đăng' : 'View Listing'} className="p-2 border border-slate-200 dark:border-white/10 hover:border-gold hover:text-gold text-slate-500 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/owner/vehicles/${vehicle.id}/edit`} title={t.common.edit} className="p-2 border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-500 text-slate-500 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {(!vehicle.approvalStatus || vehicle.approvalStatus === 'draft' || vehicle.approvalStatus === 'rejected' || vehicle.approvalStatus === 'submitted') && (
                          <button
                            onClick={() => handleDelete(vehicle.id, vehicle.name)}
                            title={t.common.delete}
                            className="p-2 border border-red-500/20 hover:border-red-500 hover:text-red-500 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};


// ====== VEHICLE FORM PAGE ======
export const VehicleFormPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currency } = useUIStore();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vinLoading, setVinLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', brand: '', category: 'supercar', year: new Date().getFullYear(),
    pricePerDay: Math.round(convertCurrency(5000000, 'VND', currency)), description: '', seats: 2, doors: 2,
    transmission: 'Automatic', fuelType: 'Gasoline',
    features: 'Bluetooth, Navigation, Backup Camera',
    address: '', city: '', state: '', zip: '', country: 'US',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    lat: 10.762,
    lng: 106.660,
    vin: '',
  });

  const handleVinFill = async () => {
    if (!form.vin || form.vin.trim().length !== 17) {
      toast.error(isVi ? 'Số VIN phải đủ 17 ký tự' : 'VIN must be exactly 17 characters');
      return;
    }

    setVinLoading(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${form.vin}?format=json`);
      const data = await response.json();
      
      if (data && data.Results && data.Results[0]) {
        const res = data.Results[0];
        
        if (!res.Make && !res.Model) {
          toast.error(isVi ? 'Không tìm thấy thông tin xe với số VIN này.' : 'No vehicle information found for this VIN.');
          setVinLoading(false);
          return;
        }

        const brand = res.Make ? res.Make.trim() : '';
        const model = res.Model ? res.Model.trim() : '';
        const name = brand && model ? `${brand} ${model}` : (brand || model);
        const year = res.ModelYear ? parseInt(res.ModelYear) : new Date().getFullYear();
        const seats = res.Seats || res.NumberofSeats ? parseInt(res.Seats || res.NumberofSeats) : 5;
        const doors = res.Doors ? parseInt(res.Doors) : 4;
        
        let fuelType = 'Gasoline';
        const rawFuel = (res.FuelTypePrimary || '').toLowerCase();
        if (rawFuel.includes('electric') || rawFuel.includes('battery')) {
          fuelType = 'Electric';
        } else if (rawFuel.includes('hybrid')) {
          fuelType = 'Hybrid';
        } else if (rawFuel.includes('diesel')) {
          fuelType = 'Diesel';
        }

        let transmission = 'Automatic';
        const rawTrans = (res.TransmissionStyle || res.TransmissionSpeeds || '').toLowerCase();
        if (rawTrans.includes('manual')) {
          transmission = 'Manual';
        }

        let category = 'sedan';
        const bodyClass = (res.BodyClass || '').toLowerCase();
        if (bodyClass.includes('sport utility') || bodyClass.includes('suv')) {
          category = 'suv';
        } else if (bodyClass.includes('convertible') || bodyClass.includes('cabriolet')) {
          category = 'convertible';
        } else if (bodyClass.includes('sedan')) {
          category = 'sedan';
        } else if (fuelType === 'Electric') {
          category = 'electric';
        } else if (bodyClass.includes('coupe') || bodyClass.includes('supercar') || bodyClass.includes('exotic')) {
          category = 'supercar';
        }

        const horsepower = res.EngineHP ? `${res.EngineHP} HP` : '';
        const desc = isVi
          ? `Xe ${name} sản xuất năm ${year}. Động cơ ${res.DisplacementL || ''}L ${horsepower}, nhiên liệu ${fuelType}, số ${transmission}. Xe sở hữu cảm giác lái vượt trội, nội thất cao cấp và các trang bị hiện đại.`
          : `${year} ${name} featuring a ${res.DisplacementL || ''}L engine with ${horsepower}, running on ${fuelType} and ${transmission} transmission. Exceptional driving experience with luxury interior and premium amenities.`;

        setForm(f => ({
          ...f,
          brand: brand || f.brand,
          name: name || f.name,
          year: year || f.year,
          seats: seats || f.seats,
          doors: doors || f.doors,
          fuelType: fuelType || f.fuelType,
          transmission: transmission || f.transmission,
          category: category || f.category,
          description: desc || f.description,
        }));

        toast.success(
          isVi ? 'Đọc thông tin VIN thành công!' : 'VIN decoded successfully!',
          isVi 
            ? `Đã nhận diện: ${brand} ${model} (${year}).`
            : `Identified: ${brand} ${model} (${year}).`
        );
      } else {
        toast.error(isVi ? 'Số VIN không hợp lệ hoặc không có kết quả.' : 'Invalid VIN or no results found.');
      }
    } catch (error) {
      console.error('Error decoding VIN:', error);
      toast.error(isVi ? 'Có lỗi xảy ra khi gọi API tra cứu số VIN.' : 'An error occurred while decoding the VIN.');
    } finally {
      setVinLoading(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    return {
      USD: '$',
      VND: '₫',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: '$',
      AUD: '$',
      SGD: '$',
      KRW: '₩'
    }[code.toUpperCase()] || '$';
  };

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
          pricePerDay: Math.round(convertCurrency(vehicle.pricePerDay || 5000000, 'VND', currency)),
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
          lat: vehicle.location?.lat !== undefined ? vehicle.location.lat : ((vehicle as any).latitude || 10.762),
          lng: vehicle.location?.lng !== undefined ? vehicle.location.lng : ((vehicle as any).longitude || 106.660),
          vin: vehicle.vin || '',
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

  const update = (k: string, v: string | number) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) {
      setErrors(errs => {
        const next = { ...errs };
        delete next[k];
        return next;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.name.trim()) newErrors.name = isVi ? 'Tên xe không được để trống' : 'Vehicle name is required';
      if (!form.brand.trim()) newErrors.brand = isVi ? 'Thương hiệu không được để trống' : 'Brand is required';
      if (!form.year) newErrors.year = isVi ? 'Năm sản xuất không được để trống' : 'Year is required';
      else if (form.year < 1950 || form.year > new Date().getFullYear() + 1) {
        newErrors.year = isVi ? 'Năm sản xuất không hợp lệ' : 'Invalid manufacturing year';
      }
      if (!form.description.trim()) newErrors.description = isVi ? 'Mô tả không được để trống' : 'Description is required';
    } else if (currentStep === 2) {
      if (images.length === 0 && !form.thumbnailUrl) {
        newErrors.images = isVi ? 'Vui lòng tải lên ít nhất một hình ảnh' : 'At least one image is required';
      }
    } else if (currentStep === 3) {
      if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
        newErrors.pricePerDay = isVi ? 'Giá thuê phải lớn hơn 0' : 'Daily rate must be greater than 0';
      }
      if (!form.city.trim()) newErrors.city = isVi ? 'Thành phố không được để trống' : 'City is required';
      if (!form.state.trim()) newErrors.state = isVi ? 'Tỉnh/Bang không được để trống' : 'State/Province is required';
      if (form.lat === undefined || isNaN(Number(form.lat))) newErrors.lat = isVi ? 'Vĩ độ không được để trống' : 'Latitude is required';
      if (form.lng === undefined || isNaN(Number(form.lng))) newErrors.lng = isVi ? 'Kinh độ không được để trống' : 'Longitude is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) {
      toast.error(isVi ? 'Vui lòng kiểm tra lại thông tin nhập vào' : 'Please check your inputs');
      return;
    }
    if (step < 3) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    const currentThumbnail = images.length > 0 ? images[0] : form.thumbnailUrl;

    const vehicleData: Omit<Vehicle, 'id'> = {
      ownerId: user?.id || '',
      vin: form.vin || undefined,
      name: form.name,
      brand: form.brand,
      category: form.category as any,
      year: Number(form.year),
      pricePerDay: Math.round(convertCurrency(Number(form.pricePerDay), currency, 'VND')),
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
        lat: Number(form.lat) || 10.762,
        lng: Number(form.lng) || 106.660,
        timezone: 'Asia/Ho_Chi_Minh'
      },
      model: 'Custom',
      deposit: parseFloat(form.pricePerDay.toString()) * 0.1 || 500000,
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
    } catch (error: any) {
      const errMsg = error?.message || '';
      toast.error(
        isVi ? 'Không thể lưu thông tin xe.' : 'Failed to save vehicle listing.',
        errMsg ? errMsg : undefined
      );
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

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.myVehicles, href: '/owner/vehicles' },
    { label: id ? (isVi ? 'Chỉnh sửa' : 'Edit') : (isVi ? 'Thêm mới' : 'Add New') }
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Breadcrumbs 
        title={id ? (isVi ? 'Chỉnh Sửa Phương Tiện' : 'Edit Your Vehicle') : (isVi ? 'Đăng Xe Cao Cấp Mới' : 'List a Luxury Vehicle')} 
        items={breadcrumbItems} 
        backHref="/owner/vehicles" 
        backText={isVi ? 'Quay lại danh sách' : 'Back to list'} 
      />

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
            
            <div className="md:col-span-2 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 lw-form-group mb-0">
                  <label className="lw-form-label flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>🔑</span>
                    {isVi ? 'Nhập Số VIN (Tra cứu thông số)' : 'Enter VIN (Decode specs)'}
                  </label>
                  <input
                    value={form.vin}
                    onChange={e => update('vin', e.target.value.toUpperCase())}
                    placeholder="e.g. 1FA6P8CF0H5XXXXXX"
                    className="lw-input-interactive"
                    maxLength={17}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVinFill}
                  disabled={vinLoading || !form.vin || form.vin.trim().length < 17}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-gold dark:hover:bg-[#CA9E26] text-white dark:text-slate-950 text-xs font-extrabold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap lw-btn-interactive border border-transparent dark:border-none"
                >
                  {vinLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isVi ? 'Đang đọc...' : 'Decoding...'}
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      {isVi ? 'Tự Động Điền' : 'Auto-fill Specs'}
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {isVi 
                  ? 'Nhập 17 ký tự số VIN của xe và nhấn "Tự Động Điền" để tải thông tin chính thức từ cơ sở dữ liệu NHTSA.' 
                  : 'Enter the 17-character Vehicle Identification Number and click "Auto-fill Specs" to fetch details from the NHTSA database.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Tên Xe *' : isJa ? '車両名 *' : 'Vehicle Name *'}</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Ferrari F8 Tributo" className={`lw-input-interactive ${errors.name ? 'error' : ''}`} />
                {errors.name && <p className="lw-form-error-text">{errors.name}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Thương Hiệu *' : isJa ? 'ブランド *' : 'Brand *'}</label>
                <input value={form.brand} onChange={e => update('brand', e.target.value)} required placeholder="e.g. Ferrari" className={`lw-input-interactive ${errors.brand ? 'error' : ''}`} />
                {errors.brand && <p className="lw-form-error-text">{errors.brand}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Phân Khúc *' : isJa ? 'カテゴリー *' : 'Category *'}</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option value="supercar">Supercar</option>
                  <option value="suv">Luxury SUV</option>
                  <option value="convertible">Convertible</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="electric">Electric</option>
                  <option value="classic">Classic</option>
                </select>
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Năm Sản Xuất *' : isJa ? '製造年 *' : 'Year *'}</label>
                <input type="number" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max={new Date().getFullYear() + 1} className={`lw-input-interactive ${errors.year ? 'error' : ''}`} />
                {errors.year && <p className="lw-form-error-text">{errors.year}</p>}
              </div>
              <div className="md:col-span-2 lw-form-group">
                <label className="lw-form-label">{isVi ? 'Mô Tả Chi Tiết *' : isJa ? '詳細説明 *' : 'Description *'}</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} required rows={4} className={`lw-input-interactive resize-none ${errors.description ? 'error' : ''}`} placeholder={isVi ? 'Mô tả chi tiết về tình trạng xe, cảm giác lái và các trang bị độc đáo...' : 'Describe your vehicle\'s condition, drive feeling, and unique amenities...'} />
                {errors.description && <p className="lw-form-error-text">{errors.description}</p>}
              </div>
            </div>
          </motion.div>
        )}
 
        {step === 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Thông Số & Tiện Nghi' : isJa ? 'スペック・装備' : 'Specs & Features'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Số Chỗ' : isJa ? '座席数' : 'Seats'}</label>
                <input type="number" value={form.seats} onChange={e => update('seats', e.target.value)} min="1" className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Số Cửa' : isJa ? 'ドア数' : 'Doors'}</label>
                <input type="number" value={form.doors} onChange={e => update('doors', e.target.value)} min="2" className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Hộp Số' : isJa ? 'ギア' : 'Transmission'}</label>
                <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option>Automatic</option><option>Manual</option><option>Dual-Clutch</option>
                </select>
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Nhiên Liệu' : isJa ? '燃料' : 'Fuel Type'}</label>
                <select value={form.fuelType} onChange={e => update('fuelType', e.target.value)} className="lw-input-interactive text-slate-800 dark:text-slate-100">
                  <option>Gasoline</option><option>Electric</option><option>Hybrid</option><option>Diesel</option>
                </select>
              </div>
            </div>
            <div className="lw-form-group">
              <label className="lw-form-label">{isVi ? 'Tiện Nghi (Ngăn Cách Bởi Dấu Phẩy)' : isJa ? '装備（カンマ区切り）' : 'Features (comma separated)'}</label>
              <input value={form.features} onChange={e => update('features', e.target.value)} className="lw-input-interactive" placeholder="Bluetooth, Apple CarPlay, Heated Seats..." />
            </div>
            <div className="mt-4">
              <label className="lw-form-label mb-3">{isVi ? 'Hình Ảnh Xe' : isJa ? '車両画像' : 'Vehicle Image'}</label>
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
                      const res = await fetch(`${SERVER_BASE}/upload/vehicle-image`, {
                        method: 'POST',
                        headers: {
                          ...(SERVER_BASE.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {}),
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
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
              {errors.images && <p className="lw-form-error-text mt-2">{errors.images}</p>}
            </div>
          </motion.div>
        )}
 
        {step === 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-white/5 pb-3">{isVi ? 'Giá Cả & Địa Điểm' : isJa ? '料金・所在地' : 'Pricing & Location'}</h3>
            <div className="lw-form-group">
              <label className="lw-form-label">{isVi ? `Giá Thuê Hàng Ngày (${currency}) *` : isJa ? `一日あたりの料金（${currency}） *` : `Daily Rate (${currency}) *`}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">{getCurrencySymbol(currency)}</span>
                <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} required min="1" className={`lw-input-interactive pl-9 ${errors.pricePerDay ? 'error' : ''}`} />
              </div>
              {errors.pricePerDay && <p className="lw-form-error-text">{errors.pricePerDay}</p>}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 font-medium">{isVi ? `Trung bình trên LuxeWay: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} dựa trên phân khúc siêu xe.` : `LuxeWay average: ${formatCurrency(450 * 25400)} - ${formatCurrency(800 * 25400)} based on supercars.`}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 lw-form-group">
                <label className="lw-form-label">{isVi ? 'Địa Chỉ Cụ Thể' : isJa ? '所在地（住所）' : 'Street Address'}</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className="lw-input-interactive" />
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Thành Phố *' : isJa ? '市区町村 *' : 'City *'}</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} required className={`lw-input-interactive ${errors.city ? 'error' : ''}`} />
                {errors.city && <p className="lw-form-error-text">{errors.city}</p>}
              </div>
              <div className="lw-form-group">
                <label className="lw-form-label">{isVi ? 'Tỉnh/Bang *' : isJa ? '都道府県 *' : 'State/Province *'}</label>
                <input value={form.state} onChange={e => update('state', e.target.value)} required className={`lw-input-interactive ${errors.state ? 'error' : ''}`} />
                {errors.state && <p className="lw-form-error-text">{errors.state}</p>}
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="lw-form-group">
                  <label className="lw-form-label">Latitude *</label>
                  <input type="number" step="any" value={form.lat} onChange={e => update('lat', parseFloat(e.target.value) || 0)} required className={`lw-input-interactive font-mono ${errors.lat ? 'error' : ''}`} />
                  {errors.lat && <p className="lw-form-error-text">{errors.lat}</p>}
                </div>
                <div className="lw-form-group">
                  <label className="lw-form-label">Longitude *</label>
                  <input type="number" step="any" value={form.lng} onChange={e => update('lng', parseFloat(e.target.value) || 0)} required className={`lw-input-interactive font-mono ${errors.lng ? 'error' : ''}`} />
                  {errors.lng && <p className="lw-form-error-text">{errors.lng}</p>}
                </div>
              </div>
 
              <div className="md:col-span-2 space-y-2.5">
                <label className="lw-form-label">
                  {isVi ? 'Vị Trí Trên Bản Đồ (Click để chọn tọa độ mới)' : 'Location on Map (Click to select new coordinates)'}
                </label>
                <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-10">
                  <LocationPickerMap lat={form.lat || 10.762} lng={form.lng || 106.660} onChange={(lat, lng) => {
                    setForm(f => ({ ...f, lat, lng }));
                  }} />
                </div>
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
  const { language } = useUIStore();
  const t = useT();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const lang = (language || 'en').toLowerCase();
  
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const clt = React.useMemo(() => {
    const dicts: Record<string, Record<string, any>> = {
      vi: {
        fleetCalendar: 'Lịch xe đội',
        backToOverview: 'Quay lại tổng quan',
        allFleetVehicles: 'Tất cả xe',
        waitingPayment: 'CHỜ THANH TOÁN',
        confirmed: 'ĐÃ XÁC NHẬN',
        activeRental: 'ĐANG THUÊ',
        cancelReview: 'XEM XÉT HỦY',
        completed: 'HOÀN THÀNH',
        days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        monthFormat: 'tháng M năm YYYY'
      },
      ja: {
        fleetCalendar: 'フリートカレンダー',
        backToOverview: '概要に戻る',
        allFleetVehicles: 'すべての車両',
        waitingPayment: '支払い待ち',
        confirmed: '確認済み',
        activeRental: 'レンタル中',
        cancelReview: 'キャンセル審査',
        completed: '完了',
        days: ['日', '月', '火', '水', '木', '金', '土'],
        monthFormat: 'YYYY年M月'
      },
      ko: {
        fleetCalendar: '차량 달력',
        backToOverview: '개요로 돌아가기',
        allFleetVehicles: '모든 차량',
        waitingPayment: '결제 대기',
        confirmed: '확정됨',
        activeRental: '대여 중',
        cancelReview: '취소 검토',
        completed: '완료',
        days: ['일', '월', '화', '수', '목', '금', '토'],
        monthFormat: 'YYYY년 M월'
      },
      zh: {
        fleetCalendar: '车队日历',
        backToOverview: '返回概览',
        allFleetVehicles: '所有车辆',
        waitingPayment: '等待付款',
        confirmed: '已确认',
        activeRental: '租赁中',
        cancelReview: '取消审核',
        completed: '已完成',
        days: ['日', '一', '二', '三', '四', '五', '六'],
        monthFormat: 'YYYY年M月'
      }
    };

    const fallback = {
      fleetCalendar: 'Fleet Calendar',
      backToOverview: 'Back to Overview',
      allFleetVehicles: 'All Fleet Vehicles',
      waitingPayment: 'WAITING PAYMENT',
      confirmed: 'CONFIRMED',
      activeRental: 'ACTIVE RENTAL',
      cancelReview: 'CANCEL REVIEW',
      completed: 'COMPLETED',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monthFormat: 'MMMM YYYY'
    };

    return dicts[lang] || fallback;
  }, [lang]);

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
  }, [user?.id]);

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

  const calendarStatusStyles: Record<string, string> = {
    waiting_payment: 'bg-amber-500/15 text-amber-700 border-amber-300',
    payment_pending: 'bg-orange-500/15 text-orange-700 border-orange-300',
    pending: 'bg-sky-500/15 text-sky-700 border-sky-300',
    confirmed: 'bg-blue-500/15 text-blue-700 border-blue-300',
    owner_approved: 'bg-blue-500/15 text-blue-700 border-blue-300',
    active: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    in_rental: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    completed: 'bg-slate-500/15 text-slate-700 border-slate-300',
    cancellation_requested: 'bg-rose-500/15 text-rose-700 border-rose-300',
  };

  const calendarLegend = [
    { status: 'waiting_payment', label: clt.waitingPayment },
    { status: 'confirmed', label: clt.confirmed },
    { status: 'active', label: clt.activeRental },
    { status: 'cancellation_requested', label: clt.cancelReview },
    { status: 'completed', label: clt.completed },
  ];

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.calendar }
  ];

  const formatMonthTitle = () => {
    if (lang === 'vi') return `tháng ${currentMonth + 1} năm ${currentYear}`;
    if (lang === 'ja' || lang === 'zh') return `${currentYear}年${currentMonth + 1}月`;
    if (lang === 'ko') return `${currentYear}년 ${currentMonth + 1}월`;
    return new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title={clt.fleetCalendar} items={breadcrumbItems} backHref="/owner" backText={clt.backToOverview} className="mb-0 flex-1" />
        <div className="flex items-center gap-3">
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="lux-input py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white font-extrabold min-w-[220px] rounded-xl focus:border-gold/50"
          >
            <option value="all">{clt.allFleetVehicles}</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="glass border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] shadow-md overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/25 dark:border-white/5 flex items-center justify-between bg-slate-500/5">
          <h2 className="font-display text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
            {formatMonthTitle()}
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

        <div className="px-5 py-3 border-b border-slate-200/25 dark:border-white/5 flex flex-wrap gap-2 bg-white/60 dark:bg-slate-950/20">
          {calendarLegend.map(item => (
            <span key={item.status} className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${calendarStatusStyles[item.status]}`}>
              {item.label}
            </span>
          ))}
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-200/25 dark:border-white/5 bg-slate-500/3">
          {(clt.days as string[]).map(d => (
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
                      <Link
                        key={b.id}
                        to={`/owner/bookings?booking=${b.id}`}
                        className={`block text-[9px] leading-tight px-2 py-1 rounded-lg border font-bold truncate shadow-sm hover:scale-102 transition-transform duration-300 ${calendarStatusStyles[b.status] || 'bg-gold/15 text-gold border-gold/25'}`}
                        title={`Booking #${b.id.slice(-6)} - ${b.status.replace('_', ' ')}`}
                      >
                        {(vehicles.find(v => v.id === b.vehicleId)?.name || 'Booked')} - {b.status.replace('_', ' ')}
                      </Link>
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
  const { language } = useUIStore();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const toast = useToast();
  const t = useT();
  const lang = (language || 'en').toLowerCase();

  const bkt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        bookingRequestsTitle: 'Yêu cầu đặt xe',
        backToOverview: 'Quay lại tổng quan',
        all: 'Tất cả',
        pending: 'Chờ duyệt',
        cancelReview: 'Xem xét hủy',
        paymentReview: 'Duyệt thanh toán',
        confirmed: 'Đã xác nhận',
        active: 'Đang thuê',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        renter: 'Khách thuê',
        vehicle: 'XE THUÊ',
        renterHeader: 'NGƯỜI THUÊ',
        rentalWindow: 'THỜI GIAN THUÊ',
        deposit: 'TIỀN CỌC',
        currentStatus: 'TRẠNG THÁI HIỆN TẠI',
        payment: 'THANH TOÁN',
        contract: 'HỢP ĐỒNG',
        days: 'ngày',
        contractNote: 'Khách thuê ký trước; chủ xe ký riêng từ trang hợp đồng.',
        cancellationNotice: 'Khách hàng đã yêu cầu hủy chuyến. Vui lòng xem xét ngày và chính sách để phê duyệt hủy hoặc từ chối để giữ chuyến xe.',
        viewStatusDetails: 'Xem Trạng thái & Chi tiết',
        reviewSignContract: 'Xem xét & Ký Hợp đồng',
        approveRequest: 'Duyệt Yêu cầu',
        reject: 'Từ chối',
        approveCancel: 'Duyệt Hủy',
        rejectCancel: 'Từ chối Hủy',
        simulateTrack: 'Mô phỏng & Theo dõi'
      },
      ja: {
        bookingRequestsTitle: '予約リクエスト',
        backToOverview: '概要に戻る',
        all: 'すべて',
        pending: '保留中',
        cancelReview: 'キャンセル審査',
        paymentReview: 'お支払い審査',
        confirmed: '確認済み',
        active: 'レンタル中',
        completed: '完了',
        cancelled: 'キャンセル済み',
        renter: '借手',
        vehicle: '車両',
        renterHeader: '借手',
        rentalWindow: 'レンタル期間',
        deposit: '保証金',
        currentStatus: '現在のステータス',
        payment: 'お支払い',
        contract: '契約',
        days: '日間',
        contractNote: '借手が先に署名し、オーナーは契約ページから別途署名します。',
        cancellationNotice: 'お客様からキャンセルリクエストが送信されました。日付とポリシーを確認して承認または却下してください。',
        viewStatusDetails: 'ステータスと詳細を見る',
        reviewSignContract: '契約書を確認して署名',
        approveRequest: 'リクエスト承認',
        reject: '却下',
        approveCancel: 'キャンセル承認',
        rejectCancel: 'キャンセル却下',
        simulateTrack: 'シミュレーションと追跡'
      },
      ko: {
        bookingRequestsTitle: '예약 요청',
        backToOverview: '개요로 돌아가기',
        all: '전체',
        pending: '대기 중',
        cancelReview: '취소 검토',
        paymentReview: '결제 검토',
        confirmed: '확정됨',
        active: '대여 중',
        completed: '완료',
        cancelled: '취소됨',
        renter: '대여자',
        vehicle: '차량',
        renterHeader: '대여자',
        rentalWindow: '대여 기간',
        deposit: '보증금',
        currentStatus: '현재 상태',
        payment: '결제',
        contract: '계약',
        days: '일',
        contractNote: '대여자가 먼저 서명하며, 호스트는 계약 페이지에서 별도로 서명합니다.',
        cancellationNotice: '고객이 취소를 요청했습니다. 날짜와 정책을 검토한 후 승인 hoặc 거절하세요.',
        viewStatusDetails: '상태 및 상세 보기',
        reviewSignContract: '계약서 검토 및 서명',
        approveRequest: '요청 승인',
        reject: '거절',
        approveCancel: '취소 승인',
        rejectCancel: '취소 거절',
        simulateTrack: '시뮬레이션 및 추적'
      },
      zh: {
        bookingRequestsTitle: '预订请求',
        backToOverview: '返回概览',
        all: '全部',
        pending: '待处理',
        cancelReview: '取消审核',
        paymentReview: '付款审核',
        confirmed: '已确认',
        active: '租赁中',
        completed: '已完成',
        cancelled: '已取消',
        renter: '租客',
        vehicle: '车辆',
        renterHeader: '租客',
        rentalWindow: '租赁时间',
        deposit: '押金',
        currentStatus: '当前状态',
        payment: '支付',
        contract: '合同',
        days: '天',
        contractNote: '租客先签署；车主从合同页面单独签署。',
        cancellationNotice: '客户已申请取消。请查看日期和政策，然后批准取消或拒绝以保持预订有效。',
        viewStatusDetails: '查看状态与详情',
        reviewSignContract: '审查并签署合同',
        approveRequest: '批准请求',
        reject: '拒绝',
        approveCancel: '批准取消',
        rejectCancel: '拒绝取消',
        simulateTrack: '模拟与追踪'
      }
    };

    const fallback = {
      bookingRequestsTitle: 'Booking Requests',
      backToOverview: 'Back to Overview',
      all: 'All',
      pending: 'Pending',
      cancelReview: 'Cancel Review',
      paymentReview: 'Payment Review',
      confirmed: 'Confirmed',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      renter: 'Renter',
      vehicle: 'VEHICLE',
      renterHeader: 'RENTER',
      rentalWindow: 'RENTAL WINDOW',
      deposit: 'DEPOSIT',
      currentStatus: 'CURRENT STATUS',
      payment: 'PAYMENT',
      contract: 'CONTRACT',
      days: 'days',
      contractNote: 'Renter signs first; owner signs separately from the contract page.',
      cancellationNotice: 'Customer requested cancellation. Review the dates and policy, then approve to cancel and release availability or reject to keep the booking active.',
      viewStatusDetails: 'View Status & Details',
      reviewSignContract: 'Review & Sign Contract',
      approveRequest: 'Approve Request',
      reject: 'Reject',
      approveCancel: 'Approve Cancel',
      rejectCancel: 'Reject Cancel',
      simulateTrack: 'Simulate & Track'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  React.useEffect(() => {
    if (!user) return;
    bookingService.getByOwner(user.id).then(b => {
      setBookings(b);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const statusTabs = [
    { value: 'all', label: bkt.all },
    { value: 'pending', label: bkt.pending },
    { value: 'cancellation_requested', label: bkt.cancelReview },
    { value: 'payment_pending', label: bkt.paymentReview },
    { value: 'confirmed', label: bkt.confirmed },
    { value: 'active', label: bkt.active },
    { value: 'completed', label: bkt.completed },
    { value: 'cancelled', label: bkt.cancelled },
  ];
  const countByStatus = (status: string) => status === 'all'
    ? bookings.length
    : bookings.filter(b => b.status === status).length;
  const bookingTitle = (booking: Booking) => booking.bookingCode || `#${booking.id.slice(-6).toUpperCase()}`;
  const vehicleTitle = (booking: Booking) => {
    const vehicle = booking.vehicle as any;
    const brand = vehicle?.brand || vehicle?.brandName || '';
    const name = vehicle?.name || vehicle?.modelName || booking.vehicleId || 'Vehicle';
    return `${brand} ${name}`.trim();
  };
  const renterTitle = (booking: Booking) => booking.renter?.displayName || booking.renter?.email || booking.renterId || 'Renter';
  const paymentState = (status: string) => {
    if (status === 'payment_pending') return lang === 'vi' ? 'Đã thanh toán - chờ duyệt' : 'Customer paid - waiting review';
    if (['payment_verified', 'confirmed', 'active', 'completed', 'in_rental', 'return_completed'].includes(status)) return lang === 'vi' ? 'Đã xác nhận thanh toán' : 'Payment confirmed';
    if (status === 'payment_expired') return lang === 'vi' ? 'Hết hạn thời gian thanh toán' : 'Payment window expired';
    if (status === 'waiting_payment') return lang === 'vi' ? 'Thanh toán sau - chờ thanh toán' : 'Pay later - waiting payment';
    if (status === 'payment_rejected') return lang === 'vi' ? 'Thanh toán bị từ chối' : 'Payment rejected';
    return lang === 'vi' ? 'Chưa cần thanh toán' : 'No payment required yet';
  };
  const contractState = (status: string) => {
    if (['waiting_payment', 'payment_rejected'].includes(status)) return lang === 'vi' ? 'Bước ký/thanh toán của khách' : 'Renter signing/payment stage';
    if (['payment_pending', 'payment_verified', 'confirmed', 'active', 'completed', 'in_rental', 'return_completed'].includes(status)) return lang === 'vi' ? 'Chủ xe có thể xem/ký hợp đồng' : 'Owner review/sign available';
    if (['cancelled', 'customer_cancelled', 'owner_cancelled', 'system_cancelled'].includes(status)) return lang === 'vi' ? 'Hợp đồng đã đóng' : 'Contract closed';
    return lang === 'vi' ? 'Chuẩn bị sau khi duyệt' : 'Prepared after approval';
  };
  const nextStep = (status: string) => {
    switch (status) {
      case 'pending': return lang === 'vi' ? 'Xem xét yêu cầu người thuê, sau đó duyệt hoặc từ chối.' : 'Review renter request, then approve or reject.';
      case 'waiting_payment': return lang === 'vi' ? 'Khách thuê có thể ký và thanh toán ngay.' : 'Renter may sign and pay now, or continue payment later.';
      case 'payment_pending': return lang === 'vi' ? 'Khách đã gửi thanh toán. Kiểm tra và ký phía chủ xe.' : 'Customer payment was submitted. Review payment, then sign the owner side if needed.';
      case 'cancellation_requested': return lang === 'vi' ? 'Xem xét chính sách hủy và chấp nhận hoặc từ chối.' : 'Review cancellation policy and approve or reject.';
      case 'confirmed':
      case 'ready_for_pickup': return lang === 'vi' ? 'Chuẩn bị giao xe và theo dõi bàn giao.' : 'Prepare pickup and track handover.';
      case 'active':
      case 'in_rental': return lang === 'vi' ? 'Theo dõi chuyến thuê đang diễn ra.' : 'Monitor active rental and return condition.';
      case 'completed':
      case 'return_completed': return lang === 'vi' ? 'Chuyến đi hoàn tất. Kiểm tra doanh thu.' : 'Trip finished. Review revenue and feedback.';
      case 'cancelled':
      case 'customer_cancelled':
      case 'owner_cancelled':
      case 'system_cancelled': return lang === 'vi' ? 'Đơn đặt xe đã đóng.' : 'Booking is closed.';
      default: return lang === 'vi' ? 'Mở chi tiết trạng thái để xem tình trạng mới nhất.' : 'Open status details for the latest operation state.';
    }
  };

  const handleApprove = async (bookingId: string) => {
    await bookingService.updateStatus(bookingId, 'confirmed');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    toast.success(lang === 'vi' ? 'Đã duyệt đặt xe!' : 'Booking approved!', lang === 'vi' ? 'Khách thuê đã được thông báo.' : 'The renter has been notified.');
  };

  const handleReject = async (bookingId: string) => {
    await bookingService.updateStatus(bookingId, 'cancelled');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    toast.success(lang === 'vi' ? 'Đã từ chối đặt xe' : 'Booking rejected', lang === 'vi' ? 'Khách thuê đã được thông báo.' : 'The renter has been notified.');
  };

  const handleApproveCancellation = async (bookingId: string) => {
    const updated = await bookingService.approveCancellation(bookingId, 'Cancellation approved by owner');
    if (updated) {
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      toast.success(lang === 'vi' ? 'Đã chấp nhận hủy' : 'Cancellation approved', lang === 'vi' ? 'Đơn đã hủy và khách thuê đã được thông báo.' : 'The booking has been cancelled and the renter has been notified.');
    } else {
      toast.error(lang === 'vi' ? 'Phê duyệt thất bại' : 'Approval failed', lang === 'vi' ? 'Không thể chấp nhận yêu cầu hủy này.' : 'Could not approve this cancellation request.');
    }
  };

  const handleRejectCancellation = async (bookingId: string) => {
    const updated = await bookingService.rejectCancellation(bookingId, 'Cancellation rejected after policy review');
    if (updated) {
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      toast.success(lang === 'vi' ? 'Đã từ chối hủy' : 'Cancellation rejected', lang === 'vi' ? 'Khách thuê đã được thông báo.' : 'The renter has been notified.');
    } else {
      toast.error(lang === 'vi' ? 'Từ chối thất bại' : 'Reject failed', lang === 'vi' ? 'Không thể từ chối yêu cầu hủy này.' : 'Could not reject this cancellation request.');
    }
  };

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: bkt.bookingRequestsTitle }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs title={bkt.bookingRequestsTitle} items={breadcrumbItems} backHref="/owner" backText={bkt.backToOverview} />

      {/* Filter Tabs - Premium Capsule Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-none">
        {statusTabs.map(tab => {
          const count = countByStatus(tab.value);
          return (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 hover-lift ${
              filter === tab.value 
                ? 'border-gold bg-yellow-500/10 text-gold shadow-sm shadow-gold/20' 
                : 'border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-slate-500/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            {tab.label}
            <span className={`ml-2 min-w-5 h-5 px-1.5 rounded-full inline-flex items-center justify-center text-[9px] font-extrabold ${
              count > 0 && ['pending', 'cancellation_requested', 'payment_pending'].includes(tab.value)
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-slate-300'
            }`}>
              {count}
            </span>
          </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-[2rem] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-20 rounded-[2.5rem] shadow-sm">
          <Calendar className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-pulse" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-lg">{lang === 'vi' ? 'Không có đơn đặt xe' : 'No bookings'}</h3>
          <p className="text-slate-400 text-xs font-semibold">{lang === 'vi' ? 'Các đơn đặt xe của bạn sẽ xuất hiện tại đây' : 'Bookings for your vehicles will appear here'}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {filtered.map(booking => {
            const isPending = booking.status === 'pending';
            const isCancellationRequested = booking.status === 'cancellation_requested';
            const canOpenContract = !['pending', 'cancelled', 'customer_cancelled', 'owner_cancelled', 'system_cancelled'].includes(booking.status);
            const statusLabel = booking.status.replace(/_/g, ' ').toUpperCase();
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
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · <span className="text-gold font-extrabold">{booking.totalDays} {bkt.days}</span></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1">{bkt.renter}: <span className="font-bold text-slate-700 dark:text-slate-200">{renterTitle(booking)}</span></p>
                      <p className="text-base font-extrabold text-emerald-500 dark:text-emerald-400 mt-2.5">{formatCurrency(booking.pricing.total)}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 max-w-5xl">
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{bkt.vehicle}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{vehicleTitle(booking)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{bkt.renterHeader}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{renterTitle(booking)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{bkt.rentalWindow}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{bkt.deposit}</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(booking.pricing.deposit)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 max-w-5xl">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/80 dark:bg-blue-500/10 dark:border-blue-500/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">{bkt.currentStatus}</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{statusLabel}</p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{nextStep(booking.status)}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 dark:bg-emerald-500/10 dark:border-emerald-500/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">{bkt.payment}</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{paymentState(booking.status)}</p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Total {formatCurrency(booking.pricing.total)}</p>
                        </div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">{bkt.contract}</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{contractState(booking.status)}</p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{bkt.contractNote}</p>
                        </div>
                      </div>
                      {isCancellationRequested && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 max-w-5xl">
                          <p className="text-xs font-bold text-amber-800">
                            {bkt.cancellationNotice}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {isPending ? (
                    <div className="flex flex-col gap-2.5 flex-shrink-0 justify-end mt-2 sm:mt-0 min-w-[220px]">
                      <Link
                        to={`/owner/bookings/${booking.id}/tracking`}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/15 transition-all hover-lift"
                      >
                        <Eye className="w-3.5 h-3.5" /> {bkt.viewStatusDetails}
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleApprove(booking.id)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/10 transition-all hover-lift"
                      >
                        <CheckCircle className="w-4 h-4" /> {bkt.approveRequest}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleReject(booking.id)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 rounded-xl text-xs font-extrabold transition-all hover-lift"
                      >
                        {bkt.reject}
                      </motion.button>
                    </div>
                  ) : isCancellationRequested ? (
                    <div className="flex flex-col gap-2.5 flex-shrink-0 justify-end mt-2 sm:mt-0 min-w-[220px]">
                      <Link
                        to={`/owner/bookings/${booking.id}/tracking`}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/15 transition-all hover-lift"
                      >
                        <Eye className="w-3.5 h-3.5" /> {bkt.viewStatusDetails}
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleApproveCancellation(booking.id)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/10 transition-all hover-lift"
                      >
                        <CheckCircle className="w-4 h-4" /> {bkt.approveCancel}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleRejectCancellation(booking.id)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 rounded-xl text-xs font-extrabold transition-all hover-lift"
                      >
                        {bkt.rejectCancel}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 flex-shrink-0 justify-end mt-2 sm:mt-0 min-w-[220px]">
                      <Link
                        to={`/owner/bookings/${booking.id}/tracking`}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/15 transition-all hover-lift"
                      >
                        <Eye className="w-3.5 h-3.5" /> {bkt.viewStatusDetails}
                      </Link>
                      {canOpenContract && (
                      <Link
                        to={`/booking/${booking.id}/contract`}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-slate-900/15 transition-all hover-lift"
                      >
                        <FileText className="w-3.5 h-3.5" /> {bkt.reviewSignContract}
                      </Link>
                      )}
                      {(booking.status === 'confirmed' || booking.status === 'active' || booking.status === 'in_rental') && (
                      <Link
                        to={`/owner/bookings/${booking.id}/tracking`}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-extrabold transition-all hover-lift"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-800" /> {bkt.simulateTrack}
                      </Link>
                      )}
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
  const t = useT();
  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: t.ownerDashboard.revenue }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs title={t.ownerDashboard.revenue} items={breadcrumbItems} backHref="/owner" backText="Back to Overview" />
      <OwnerAnalyticsDashboard />
    </div>
  );
};

// ====== FLEET MANAGEMENT PAGE (SRS REQ-FLEET-001) ======
export const FleetManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const t = useT();

  useEffect(() => {
    if (!user) return;
    vehicleService.getByOwner(user.id).then(v => {
      setVehicles(v);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = selectedStatus === 'all' ? vehicles : vehicles.filter(v => v.status === selectedStatus);

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  const utilizationRate = stats.total > 0 ? Math.round((stats.rented / stats.total) * 100) : 0;

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: 'Fleet Management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title="Fleet Management" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <Link to="/owner/vehicles/new" className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> Add to Fleet
        </Link>
      </div>

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
  const t = useT();

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

  const breadcrumbItems = [
    { label: t.marketplace.home, href: '/' },
    { label: 'Host Portal', href: '/owner' },
    { label: 'Team Management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lw-border)] pb-5">
        <Breadcrumbs title="Team & Operations" items={breadcrumbItems} backHref="/owner" backText="Back to Overview" className="mb-0 flex-1" />
        <button onClick={() => setShowAddForm(true)} className="btn-gold flex items-center gap-2 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift lw-btn-interactive">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

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

export const OwnerDashboardLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, sidebarOpen, setSidebarOpen, language } = useUIStore();
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const lang = (language || 'en').toLowerCase();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
    setSidebarOpen(window.innerWidth >= 1024);
  }, [isAuthenticated]);

  const navText = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        hostCommand: 'Điều Hành Chủ Xe',
        ownerPortal: 'CỔNG CHỦ XE',
        verifiedHost: 'CHỦ XE ĐÃ XÁC THỰC',
        overview: 'Tổng quan',
        myVehicles: 'Xe của tôi',
        calendar: 'Lịch đặt xe',
        bookings: 'Đơn đặt xe',
        revenue: 'Doanh thu',
        reviews: 'Đánh giá',
        settings: 'Cài đặt'
      },
      ja: {
        hostCommand: 'ホスト管理センター',
        ownerPortal: 'オーナーポータル',
        verifiedHost: '認証済みオーナー',
        overview: '概要',
        myVehicles: 'マイ車両',
        calendar: 'カレンダー',
        bookings: '予約一覧',
        revenue: '売上',
        reviews: 'レビュー',
        settings: '設定'
      },
      ko: {
        hostCommand: '호스트 관리 센터',
        ownerPortal: '오너 포탈',
        verifiedHost: '인증된 호스트',
        overview: '개요',
        myVehicles: '내 차량',
        calendar: '달력',
        bookings: '예약 목록',
        revenue: '수익',
        reviews: '후기',
        settings: '설정'
      },
      zh: {
        hostCommand: '车主控制台',
        ownerPortal: '车主门户',
        verifiedHost: '已认证车主',
        overview: '概览',
        myVehicles: '我的车辆',
        calendar: '日历',
        bookings: '预订列表',
        revenue: '收入',
        reviews: '评价',
        settings: '设置'
      }
    };

    const fallback = {
      hostCommand: 'Host Command',
      ownerPortal: 'OWNER PORTAL',
      verifiedHost: 'VERIFIED HOST',
      overview: 'Overview',
      myVehicles: 'My Vehicles',
      calendar: 'Calendar',
      bookings: 'Bookings',
      revenue: 'Revenue',
      reviews: 'Reviews',
      settings: 'Settings'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  const links = [
    { href: '/owner', icon: LayoutDashboard, label: navText.overview, exact: true },
    { href: '/owner/vehicles', icon: Car, label: navText.myVehicles },
    { href: '/owner/calendar', icon: Clock, label: navText.calendar },
    { href: '/owner/bookings', icon: Calendar, label: navText.bookings },
    { href: '/owner/revenue', icon: TrendingUp, label: navText.revenue },
    { href: '/owner/reviews', icon: Star, label: navText.reviews },
    { href: '/owner/settings', icon: Settings, label: navText.settings },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'O';
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  if (!user) return null;

  return (
    <div
      className="theme-owner min-h-screen relative font-sans bg-[var(--lw-bg-primary)] text-[var(--lw-text-primary)] transition-colors duration-300"
    >
      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            {/* Sliding navigation drawer - mobile */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lw-sidebar fixed left-0 top-0 h-full z-50 flex lg:hidden shadow-2xl"
            >
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                {/* Branding */}
                <div className="lw-sidebar-logo">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="lw-sidebar-logo-text text-[var(--lw-text-primary)]">LuxeWay</h2>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Host Center</span>
                  </div>
                </div>

                <div className="lw-sidebar-role-badge bg-amber-500/10 text-amber-600 border border-amber-500/20 m-0 mx-5 my-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {navText.verifiedHost}
                </div>

                {/* Links */}
                <div className="lw-sidebar-nav space-y-0.5">
                  {links.map(link => {
                    const active = isActive(link.href, link.exact);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative lw-sidebar-nav-item",
                          active && "active"
                        )}
                      >
                        <link.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom user card */}
              <div className="lw-sidebar-footer">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)]">
                  <Avatar src={user.avatar} name={user.displayName} size="md" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-[var(--lw-text-primary)]">{user.displayName}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); setSidebarOpen(false); navigate('/auth/login'); }}
                    className="p-2 text-[var(--lw-text-muted)] hover:text-red-500 transition-colors"
                    title={t.nav.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main dashboard flex layout */}
      <div className="lw-flex-layout pt-16">
        
        {/* ============ SIDEBAR ============ */}
        <aside className="lw-sidebar hidden lg:flex border-r border-[var(--lw-border)] bg-[var(--lw-sidebar-bg)]">
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Role Badge only, no double logo on desktop */}
            <div className="px-5 py-4 border-b border-[var(--lw-border)]">
              <div className="lw-sidebar-role-badge bg-amber-500/10 text-amber-600 border border-amber-500/20 m-0 w-full flex items-center justify-center py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />
                {navText.verifiedHost}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lw-sidebar-nav space-y-0.5">
              {links.map(link => {
                const active = isActive(link.href, link.exact);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                       "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative lw-sidebar-nav-item",
                      active && "active"
                    )}
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom user card */}
          <div className="lw-sidebar-footer">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)]">
              <Avatar src={user.avatar} name={user.displayName} size="md" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-[var(--lw-text-primary)]">{user.displayName}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mt-0.5">{t.ownerDashboard.vehicleHost}</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/auth/login'); }}
                className="p-2 text-[var(--lw-text-muted)] hover:text-red-500 transition-colors"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <div className="lw-flex-main gap-0">
          {/* Dashboard Header Bar */}
          <header className="p-5 border-b border-[var(--lw-border)] flex items-center justify-between gap-4 bg-[var(--lw-bg-card)] mb-6 -mx-6 -mt-6 px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl border border-[var(--lw-border)] hover:bg-[var(--lw-bg-secondary)] transition-all lg:hidden"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-[var(--lw-text-secondary)]" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Car className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-[var(--lw-text-primary)]">
                  {navText.hostCommand}
                </h1>
                <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest">
                  {navText.ownerPortal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 border border-[var(--lw-border)] rounded-xl bg-[var(--lw-bg-secondary)]">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-semibold text-[var(--lw-text-secondary)] uppercase">
                  {new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
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

export const OwnerReviewsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const lang = (language || 'en').toLowerCase();

  const rvt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        title: 'Đánh giá & Phản hồi',
        sub: 'Theo dõi phản hồi của hành khách và xếp hạng dịch vụ đội xe',
        noReviews: 'Chưa nhận được đánh giá nào',
        totalReviews: 'tổng số đánh giá',
        scoreMetricsTitle: 'Điểm số đánh giá chủ xe',
        scoreMetricsSub: 'Đánh giá cao giúp tăng hiển thị tin đăng và ưu tiên kết nối trên chợ xe.',
        vehicle: 'Phương tiện'
      },
      ja: {
        title: 'レビュー・フィードバック',
        sub: '乗客のフィードバックとサービス評価を監視',
        noReviews: 'まだレビューはありません',
        totalReviews: '件のレビュー',
        scoreMetricsTitle: 'ホスト評価スコア',
        scoreMetricsSub: '高評価はマーケットプレイスでの表示回数とマッチング優先度を向上させます。',
        vehicle: '車両'
      },
      ko: {
        title: '후기 및 피드백',
        sub: '승객 피드백 및 서비스 평점 모니터링',
        noReviews: '아직 작성된 후기가 없습니다',
        totalReviews: '개의 총 후기',
        scoreMetricsTitle: '호스트 점수 지표',
        scoreMetricsSub: '높은 평점은 매물 노출도를 높이고 우선 매칭을 도와줍니다.',
        vehicle: '차량'
      },
      zh: {
        title: '评价与反馈',
        sub: '监控乘客反馈与车队服务评分',
        noReviews: '暂无评价',
        totalReviews: '条评价',
        scoreMetricsTitle: '车主评分指标',
        scoreMetricsSub: '高评分可提高车辆曝光率与匹配优先级。',
        vehicle: '车辆'
      }
    };
    const fallback = {
      title: 'Reviews & Feedback',
      sub: 'Monitor passenger feedback and fleet service ratings',
      noReviews: 'No reviews received yet',
      totalReviews: 'total reviews',
      scoreMetricsTitle: 'Host Score Metrics',
      scoreMetricsSub: 'High ratings increase listing visibility and matching prioritization on the marketplace index.',
      vehicle: 'Vehicle'
    };
    return dicts[lang] || fallback;
  }, [lang]);

  useEffect(() => {
    if (user?.id) {
      reviewService.getByOwner(user.id)
        .then(res => setReviews(res.content || []))
        .catch(err => {
          console.error(err);
          toast.error('Error', 'Failed to load reviews');
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const ratingAvg = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--lw-border)] pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[var(--lw-text-primary)]">{rvt.title}</h2>
        <p className="text-xs text-[var(--lw-text-muted)] mt-1">{rvt.sub}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass border border-slate-200/50 dark:border-white/5 text-center py-16 rounded-[2rem] shadow-sm">
          <Star className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
          <p className="text-slate-400 text-sm font-semibold">{rvt.noReviews}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:border-r border-slate-200/20 md:pr-8 flex-shrink-0">
              <p className="text-5xl font-black text-amber-500 tracking-tight">{ratingAvg}</p>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 fill-current ${i < Math.round(Number(ratingAvg) || 5) ? 'text-amber-500' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-2">{reviews.length} {rvt.totalReviews}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{rvt.scoreMetricsTitle}</p>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">{rvt.scoreMetricsSub}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm hover-lift transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={review.user?.avatar} name={review.user?.displayName || 'Customer'} size="md" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{review.user?.displayName || 'Customer'}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-xl text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{review.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-sm mt-4 leading-relaxed italic">"{review.comment || 'No comment provided'}"</p>
                <div className="border-t border-slate-200/10 dark:border-white/5 mt-4 pt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-550 font-semibold">
                  <span>{rvt.vehicle}: <strong className="text-slate-700 dark:text-slate-300">{review.vehicleName || 'Vehicle'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OwnerSettingsPage: React.FC = () => {
  const { user, initAuth } = useAuthStore();
  const { language } = useUIStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const lang = (language || 'en').toLowerCase();

  const stt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        title: 'Cài đặt chủ xe',
        sub: 'Cấu hình tiểu sử chủ xe công khai và thông tin hồ sơ',
        personalProfile: 'HỒ SƠ CÁ NHÂN',
        firstName: 'Tên',
        lastName: 'Họ',
        phone: 'Số điện thoại',
        bio: 'Tiểu sử chủ xe',
        bioPlaceholder: 'Giới thiệu với khách thuê về lịch sử cho thuê hoặc bộ sưu tập xe của bạn...',
        location: 'Khu vực hoạt động',
        locationPlaceholder: 'Ví dụ: Quận 1, TP.HCM',
        verification: 'XÁC MINH & GIẤY PHÉP LÁI XE',
        licenseClass: 'Hạng bằng lái',
        licenseClassPlaceholder: 'Ví dụ: B2',
        licenseNumber: 'Số bằng lái',
        licenseNumberPlaceholder: 'Số hiệu bằng lái',
        payoutBanking: 'THANH TOÁN & NGÂN HÀNG',
        bankName: 'Tên ngân hàng',
        bankNamePlaceholder: 'Ví dụ: Vietcombank',
        accountNumber: 'Số tài khoản',
        accountNumberPlaceholder: 'Số tài khoản ngân hàng',
        accountHolder: 'Tên chủ tài khoản',
        accountHolderPlaceholder: 'Tên pháp lý chủ tài khoản',
        enablePayout: 'Kích hoạt hồ sơ nhận tiền',
        enablePayoutDesc: 'Đánh dấu chủ xe sẵn sàng đối soát thanh toán sau khi hoàn tất chuyến thuê.',
        notificationsSecurity: 'THÔNG BÁO & BẢO MẬT',
        language: 'Ngôn ngữ mặc định',
        currency: 'Tiền tệ',
        emailBookingAlerts: 'Thông báo đặt xe qua email',
        emailBookingAlertsDesc: 'Nhận thông báo khi có yêu cầu đặt, thanh toán hoặc hủy chuyến.',
        emailReviewAlerts: 'Thông báo đánh giá qua email',
        emailReviewAlertsDesc: 'Nhận thông báo khi khách thuê gửi phản hồi.',
        marketingAlerts: 'Mẹo và khuyến mãi cho chủ xe',
        marketingAlertsDesc: 'Nhận cập nhật sản phẩm và chiến dịch cho thuê.',
        pushNotifications: 'Thông báo trong ứng dụng',
        pushNotificationsDesc: 'Hiển thị cảnh báo trong phần thông báo LuxeWay.',
        twoFactor: 'Xác thực 2 yếu tố',
        twoFactorDesc: 'Lưu cấu hình bảo mật nâng cao tài khoản.',
        saveSettings: 'Lưu thay đổi',
        saving: 'Đang lưu...'
      },
      ja: {
        title: 'ホスト設定',
        sub: '公開ホストプロフィールと各種設定の構成',
        personalProfile: '個人プロフィール',
        firstName: '名',
        lastName: '姓',
        phone: '電話番号',
        bio: 'ホストの紹介',
        bioPlaceholder: '実績や luxury 車両コレクションについて紹介してください...',
        location: '営業エリア',
        locationPlaceholder: '例: ホーチミン市1区',
        verification: '本人確認・運転免許証',
        licenseClass: '免許の種類',
        licenseClassPlaceholder: '例: B2',
        licenseNumber: '免許証番号',
        licenseNumberPlaceholder: '免許証の番号',
        payoutBanking: '出金・振込口座',
        bankName: '銀行名',
        bankNamePlaceholder: '例: Vietcombank',
        accountNumber: '口座番号',
        accountNumberPlaceholder: '銀行口座番号',
        accountHolder: '口座名義',
        accountHolderPlaceholder: '正式な口座名義人',
        enablePayout: '出金プロファイルを有効化',
        enablePayoutDesc: 'レンタル完了後の精算準備を完了状態にします。',
        notificationsSecurity: '通知・セキュリティ',
        language: '優先言語',
        currency: '通貨',
        emailBookingAlerts: '予約のメール通知',
        emailBookingAlertsDesc: 'リクエスト、お支払い、キャンセル時に通知します。',
        emailReviewAlerts: 'レビューのメール通知',
        emailReviewAlertsDesc: 'レビューが投稿された際に通知します。',
        marketingAlerts: 'ホスト向けアドバイスとプロモーション',
        marketingAlertsDesc: 'アップデートやキャンペーン情報を受け取ります。',
        pushNotifications: 'アプリ内通知',
        pushNotificationsDesc: 'LuxeWayアプリ内でアラートを表示します。',
        twoFactor: '2段階認証フラグ',
        twoFactorDesc: 'アカウント保護のためのセキュリティ設定を保存します。',
        saveSettings: '設定を保存',
        saving: '保存中...'
      },
      ko: {
        title: '호스트 설정',
        sub: '공개 호스트 프로필 및 등록 파라미터 구성',
        personalProfile: '개인 프로필',
        firstName: '이름',
        lastName: '성',
        phone: '전화번호',
        bio: '호스트 소개',
        bioPlaceholder: '대여자들에게 호스트 이력이나 보유 차량 컬렉션을 소개하세요...',
        location: '활동 지역',
        locationPlaceholder: '예: 호치민 1군',
        verification: '인증 및 운전면허',
        licenseClass: '면허 종목',
        licenseClassPlaceholder: '예: B2',
        licenseNumber: '면허 번호',
        licenseNumberPlaceholder: '면허증 번호',
        payoutBanking: '출금 및 계좌',
        bankName: '은행명',
        bankNamePlaceholder: '예: Vietcombank',
        accountNumber: '계좌번호',
        accountNumberPlaceholder: '은행 계좌번호',
        accountHolder: '예금주명',
        accountHolderPlaceholder: '법적 예금주 성명',
        enablePayout: '출금 프로필 활성화',
        enablePayoutDesc: '대여 완료 후 정산이 가능한 상태로 표시합니다.',
        notificationsSecurity: '알림 및 보안',
        language: '기본 언어',
        currency: '통화',
        emailBookingAlerts: '예약 이메일 알림',
        emailBookingAlertsDesc: '요청, 결제, 취소 변경 시 알림을 받습니다.',
        emailReviewAlerts: '후기 이메일 알림',
        emailReviewAlertsDesc: '대여자가 후기를 작성하면 알림을 받습니다.',
        marketingAlerts: '호스트 팁 및 프로모션',
        marketingAlertsDesc: '업데이트 및 호스팅 캠페인을 수신합니다.',
        pushNotifications: '인앱 알림',
        pushNotificationsDesc: 'LuxeWay 알림함에 알림을 표시합니다.',
        twoFactor: '2단계 인증',
        twoFactorDesc: '계정 보안 강화를 위한 옵션을 저장합니다.',
        saveSettings: '설정 저장',
        saving: '저장 중...'
      },
      zh: {
        title: '车主设置',
        sub: '配置公开车主简介与档案参数',
        personalProfile: '个人资料',
        firstName: '名',
        lastName: '姓',
        phone: '电话号码',
        bio: '车主简介',
        bioPlaceholder: '向租客介绍您的出租历史或豪华车队...',
        location: '运营区域',
        locationPlaceholder: '例如：胡志明市第一郡',
        verification: '验证与驾驶执照',
        licenseClass: '驾照等级',
        licenseClassPlaceholder: '例如：B2',
        licenseNumber: '驾照号码',
        licenseNumberPlaceholder: '驾照证件号码',
        payoutBanking: '提现与银行账户',
        bankName: '银行名称',
        bankNamePlaceholder: '例如：Vietcombank',
        accountNumber: '银行账号',
        accountNumberPlaceholder: '银行账号',
        accountHolder: '开户人姓名',
        accountHolderPlaceholder: '法定开户人姓名',
        enablePayout: '启用提现资料',
        enablePayoutDesc: '标记此车主已准备好在租赁完成后进行对账提现。',
        notificationsSecurity: '通知与安全',
        language: '语言设置',
        currency: '货币',
        emailBookingAlerts: '预订邮件提醒',
        emailBookingAlertsDesc: '在请求、付款或取消发生变化时通知。',
        emailReviewAlerts: '评价邮件提醒',
        emailReviewAlertsDesc: '当租客提交评价时通知。',
        marketingAlerts: '车主技巧与活动',
        marketingAlertsDesc: '接收产品更新和活动通知。',
        pushNotifications: '应用内通知',
        pushNotificationsDesc: '在 LuxeWay 通知中心显示提醒。',
        twoFactor: '双因素验证',
        twoFactorDesc: '保存安全设置以强化账户。',
        saveSettings: '保存设置',
        saving: '保存中...'
      }
    };
    const fallback = {
      title: 'Host Settings',
      sub: 'Configure your public host bio and registry profile parameters',
      personalProfile: 'Personal Profile',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      bio: 'Host Bio',
      bioPlaceholder: 'Tell prospective renters about your hosting history or luxury vehicle collection...',
      location: 'Operating Location',
      locationPlaceholder: 'e.g. District 1, HCMC',
      verification: 'Verification & Driving License',
      licenseClass: 'License Class',
      licenseClassPlaceholder: 'e.g. B2',
      licenseNumber: 'License Number',
      licenseNumberPlaceholder: 'License ID number',
      payoutBanking: 'Payout & Banking',
      bankName: 'Bank Name',
      bankNamePlaceholder: 'e.g. Vietcombank',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Bank account number',
      accountHolder: 'Account Holder',
      accountHolderPlaceholder: 'Legal account holder name',
      enablePayout: 'Enable payout profile',
      enablePayoutDesc: 'Marks this host as ready for payout reconciliation after completed rentals.',
      notificationsSecurity: 'Notifications & Security',
      language: 'Language',
      currency: 'Currency',
      emailBookingAlerts: 'Booking email alerts',
      emailBookingAlertsDesc: 'Notify when requests, payments, or cancellations change.',
      emailReviewAlerts: 'Review email alerts',
      emailReviewAlertsDesc: 'Notify when renters submit feedback.',
      marketingAlerts: 'Host tips and promotions',
      marketingAlertsDesc: 'Receive product updates and hosting campaigns.',
      pushNotifications: 'In-app notifications',
      pushNotificationsDesc: 'Show alerts in LuxeWay notifications.',
      twoFactor: 'Two-factor flag',
      twoFactorDesc: 'Persist the security preference for account hardening.',
      saveSettings: 'Save Settings',
      saving: 'Saving...'
    };
    return dicts[lang] || fallback;
  }, [lang]);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    preferredLanguage: user?.preferredLanguage || 'en',
    preferredCurrency: user?.preferredCurrency || 'VND',
    emailBookingNotifications: user?.emailBookingNotifications ?? true,
    emailReviewNotifications: user?.emailReviewNotifications ?? true,
    emailMarketingNotifications: user?.emailMarketingNotifications ?? false,
    pushNotifications: user?.pushNotifications ?? true,
    ownerBankName: user?.ownerBankName || '',
    ownerBankAccountNumber: user?.ownerBankAccountNumber || '',
    ownerBankAccountHolder: user?.ownerBankAccountHolder || '',
    ownerPayoutEnabled: user?.ownerPayoutEnabled ?? false,
    securityTwoFactorEnabled: user?.securityTwoFactorEnabled ?? false,
    licenseClass: user?.licenseClass || '',
    licenseNumber: user?.licenseNumber || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      toast.error('Missing Info', 'First and Last name are required.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.put(`/users/${user?.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        bio: form.bio,
        location: form.location,
        preferredLanguage: form.preferredLanguage,
        preferredCurrency: form.preferredCurrency,
        emailBookingNotifications: form.emailBookingNotifications,
        emailReviewNotifications: form.emailReviewNotifications,
        emailMarketingNotifications: form.emailMarketingNotifications,
        pushNotifications: form.pushNotifications,
        ownerBankName: form.ownerBankName,
        ownerBankAccountNumber: form.ownerBankAccountNumber,
        ownerBankAccountHolder: form.ownerBankAccountHolder,
        ownerPayoutEnabled: form.ownerPayoutEnabled,
        securityTwoFactorEnabled: form.securityTwoFactorEnabled,
        licenseClass: form.licenseClass,
        licenseNumber: form.licenseNumber
      });
      
      const stored = JSON.parse(localStorage.getItem('luxeway_user') || '{}');
      const updatedUser = {
        ...stored,
        ...form,
        displayName: `${form.firstName} ${form.lastName}`
      };
      localStorage.setItem('luxeway_user', JSON.stringify(updatedUser));
      initAuth();
      toast.success('Profile Saved', 'Your Host profile details have been synchronized.');
    } catch (err: any) {
      console.error(err);
      toast.error('Save Failed', err.response?.data?.error || 'Failed to update host details.');
    } finally {
      setLoading(false);
    }
  };

  const Toggle: React.FC<{ value: boolean; onChange: () => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-white/60 dark:bg-slate-950/30 px-4 py-3">
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p>
        {desc && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={onChange} className={`relative h-6 w-12 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--lw-border)] pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[var(--lw-text-primary)]">{stt.title}</h2>
        <p className="text-xs text-[var(--lw-text-muted)] mt-1">{stt.sub}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-slate-200/10 dark:border-white/5 pb-2.5">{stt.personalProfile}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.firstName}</label>
              <input 
                type="text" 
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.lastName}</label>
              <input 
                type="text" 
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.phone}</label>
            <input 
              type="text" 
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.bio}</label>
            <textarea 
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="lux-input h-24 bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100 resize-none py-2"
              placeholder={stt.bioPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.location}</label>
            <input 
              type="text" 
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              placeholder={stt.locationPlaceholder}
            />
          </div>
        </div>

        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-slate-200/10 dark:border-white/5 pb-2.5">{stt.verification}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.licenseClass}</label>
              <input 
                type="text" 
                value={form.licenseClass}
                onChange={e => setForm(f => ({ ...f, licenseClass: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100 uppercase"
                placeholder={stt.licenseClassPlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.licenseNumber}</label>
              <input 
                type="text" 
                value={form.licenseNumber}
                onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
                placeholder={stt.licenseNumberPlaceholder}
              />
            </div>
          </div>
        </div>

        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-slate-200/10 dark:border-white/5 pb-2.5">{stt.payoutBanking}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.bankName}</label>
              <input
                type="text"
                value={form.ownerBankName}
                onChange={e => setForm(f => ({ ...f, ownerBankName: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
                placeholder={stt.bankNamePlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.accountNumber}</label>
              <input
                type="text"
                value={form.ownerBankAccountNumber}
                onChange={e => setForm(f => ({ ...f, ownerBankAccountNumber: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
                placeholder={stt.accountNumberPlaceholder}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.accountHolder}</label>
            <input
              type="text"
              value={form.ownerBankAccountHolder}
              onChange={e => setForm(f => ({ ...f, ownerBankAccountHolder: e.target.value }))}
              className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              placeholder={stt.accountHolderPlaceholder}
            />
          </div>
          <Toggle
            value={form.ownerPayoutEnabled}
            onChange={() => setForm(f => ({ ...f, ownerPayoutEnabled: !f.ownerPayoutEnabled }))}
            label={stt.enablePayout}
            desc={stt.enablePayoutDesc}
          />
        </div>

        <div className="glass border border-slate-200/50 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-slate-200/10 dark:border-white/5 pb-2.5">{stt.notificationsSecurity}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.language}</label>
              <select
                value={form.preferredLanguage}
                onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stt.currency}</label>
              <select
                value={form.preferredCurrency}
                onChange={e => setForm(f => ({ ...f, preferredCurrency: e.target.value }))}
                className="lux-input bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-white/5 text-slate-800 dark:text-slate-100"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle value={form.emailBookingNotifications} onChange={() => setForm(f => ({ ...f, emailBookingNotifications: !f.emailBookingNotifications }))} label={stt.emailBookingAlerts} desc={stt.emailBookingAlertsDesc} />
            <Toggle value={form.emailReviewNotifications} onChange={() => setForm(f => ({ ...f, emailReviewNotifications: !f.emailReviewNotifications }))} label={stt.emailReviewAlerts} desc={stt.emailReviewAlertsDesc} />
            <Toggle value={form.emailMarketingNotifications} onChange={() => setForm(f => ({ ...f, emailMarketingNotifications: !f.emailMarketingNotifications }))} label={stt.marketingAlerts} desc={stt.marketingAlertsDesc} />
            <Toggle value={form.pushNotifications} onChange={() => setForm(f => ({ ...f, pushNotifications: !f.pushNotifications }))} label={stt.pushNotifications} desc={stt.pushNotificationsDesc} />
            <Toggle value={form.securityTwoFactorEnabled} onChange={() => setForm(f => ({ ...f, securityTwoFactorEnabled: !f.securityTwoFactorEnabled }))} label={stt.twoFactor} desc={stt.twoFactorDesc} />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }} 
          type="submit" 
          disabled={loading}
          className="btn-gold flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-gold/20 hover:shadow-gold/30 hover-lift disabled:opacity-50"
        >
          {loading ? stt.saving : stt.saveSettings}
        </motion.button>
      </form>
    </div>
  );
};

