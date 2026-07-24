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
import { withdrawalService } from '@/services/withdrawalService';
import apiClient from '@/services/api';
import { useAuthStore, useUIStore } from '@/store';
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
  const { language } = useUIStore();
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const lang = (language || 'en').toLowerCase();

  const rvt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        fleetEarningsTitle: 'Trung tâm thu nhập & Doanh thu đội xe',
        fleetEarningsSub: 'Theo dõi tỷ lệ khai thác xe và báo cáo hiệu quả tài chính',
        withdrawFunds: 'Rút tiền',
        exportPdf: 'Xuất báo cáo PDF',
        exportCsv: 'Xuất bảng kê CSV',
        availableBalance: 'Số dư khả dụng',
        readyForWithdrawal: 'Sẵn sàng rút',
        grossEarnings: 'Tổng thu nhập',
        projected: 'Dự kiến',
        utilizationRate: 'Tỷ lệ khai thác đội xe',
        optimalRange: 'Mức tối ưu (60-80%)',
        totalBookingRequests: 'Tổng yêu cầu đặt xe',
        completed: 'hoàn thành',
        active: 'đang thuê',
        totalManagedFleet: 'Tổng đội xe quản lý',
        vehicles: 'Xe',
        cars: 'Ô tô',
        motorbikes: 'Xe máy',
        grossBookedValue: 'Tổng giá trị đặt xe',
        pendingPaymentApproval: 'Chờ thanh toán / duyệt',
        revenueRuleTitle: 'Quy tắc doanh thu',
        revenueRuleDesc: 'Doanh thu chỉ tính cho các chuyến thuê đã hoàn tất; các chuyến chưa hoàn tất được theo dõi riêng.',
        monthlyLedgerTitle: 'Bảng kê doanh thu & chuyến thuê hàng tháng',
        monthlyLedgerSub: 'So sánh tổng chi trả và số chuyến thuê hoàn thành',
        breakdownHistory: 'LỊCH SỬ CHI TIẾT',
        bookingCountSuffix: 'chuyến',
        withdrawModalTitle: 'Rút tiền về tài khoản',
        amountVnd: 'Số tiền (VNĐ)',
        bankName: 'Tên ngân hàng',
        accountName: 'Tên chủ tài khoản',
        accountNumber: 'Số tài khoản',
        cancel: 'Hủy',
        submitRequest: 'Gửi yêu cầu',
        processing: 'Đang xử lý...'
      },
      ja: {
        fleetEarningsTitle: 'フリート収益・売上センター',
        fleetEarningsSub: '車両稼働率と財務実績を追跡',
        withdrawFunds: '資金を引き出す',
        exportPdf: 'PDF明細を出力',
        exportCsv: 'CSV台帳を出力',
        availableBalance: '利用可能残高',
        readyForWithdrawal: '出金可能',
        grossEarnings: '総収益',
        projected: '見込み',
        utilizationRate: 'フリート稼働率',
        optimalRange: '最適範囲 (60-80%)',
        totalBookingRequests: '総予約リクエスト',
        completed: '完了',
        active: '稼働中',
        totalManagedFleet: '管理フリート総数',
        vehicles: '台',
        cars: '乗用車',
        motorbikes: 'バイク',
        grossBookedValue: '総予約額',
        pendingPaymentApproval: '支払い/承認待ち',
        revenueRuleTitle: '収益ルール',
        revenueRuleDesc: '完了したレンタルのみが売上としてカウントされます。保留中の予約は separate に追跡されます。',
        monthlyLedgerTitle: '月次売上・予約台帳',
        monthlyLedgerSub: '総支払額と完了した予約数の比較',
        breakdownHistory: '内訳履歴',
        bookingCountSuffix: '件',
        withdrawModalTitle: '出金リクエスト',
        amountVnd: '金額 (VND)',
        bankName: '銀行名',
        accountName: '口座名義',
        accountNumber: '口座番号',
        cancel: 'キャンセル',
        submitRequest: 'リクエストを送信',
        processing: '処理中...'
      },
      ko: {
        fleetEarningsTitle: '차량 수익 Center',
        fleetEarningsSub: '차량 가동률 및 재무 실적 추적',
        withdrawFunds: '출금하기',
        exportPdf: 'PDF 내역서 내보내기',
        exportCsv: 'CSV 장부 내보내기',
        availableBalance: '출금 가능 잔액',
        readyForWithdrawal: '출금 가능',
        grossEarnings: '총 수익',
        projected: '예상',
        utilizationRate: '차량 가동률',
        optimalRange: '최적 범위 (60-80%)',
        totalBookingRequests: '총 예약 요청',
        completed: '완료',
        active: '진행 중',
        totalManagedFleet: '총 관리 차량',
        vehicles: '대',
        cars: '승용차',
        motorbikes: '오토바이',
        grossBookedValue: '총 예약 금액',
        pendingPaymentApproval: '결제/승인 대기',
        revenueRuleTitle: '수익 규칙',
        revenueRuleDesc: '완료된 대여건만 매출로 집계되며 대기 중인 예약은 별도로 관리됩니다.',
        monthlyLedgerTitle: '월간 수익 및 예약 장부',
        monthlyLedgerSub: '총 지불액 vs 완료된 예약 건수 비교',
        breakdownHistory: '내역 이력',
        bookingCountSuffix: '건',
        withdrawModalTitle: '출금 신청',
        amountVnd: '금액 (VND)',
        bankName: '은행명',
        accountName: '예금주명',
        accountNumber: '계좌번호',
        cancel: '취소',
        submitRequest: '신청하기',
        processing: '처리 중...'
      },
      zh: {
        fleetEarningsTitle: '车队收益与收入中心',
        fleetEarningsSub: '追踪车辆利用率和财务业绩',
        withdrawFunds: '提现',
        exportPdf: '导出 PDF 账单',
        exportCsv: '导出 CSV 账单',
        availableBalance: '可用余额',
        readyForWithdrawal: '可提现',
        grossEarnings: '总收益',
        projected: '预计',
        utilizationRate: '车队利用率',
        optimalRange: '最佳范围 (60-80%)',
        totalBookingRequests: '总预订请求',
        completed: '已完成',
        active: '进行中',
        totalManagedFleet: '总管理车队',
        vehicles: '辆',
        cars: '轿车',
        motorbikes: '摩托车',
        grossBookedValue: '总预订金额',
        pendingPaymentApproval: '待付款/待审核',
        revenueRuleTitle: '收入规则',
        revenueRuleDesc: '已完成的租赁才计入收入；待处理的预订单独追踪。',
        monthlyLedgerTitle: '月度收入与预订明细',
        monthlyLedgerSub: '对比总支出与已完成预订数量',
        breakdownHistory: '明细历史',
        bookingCountSuffix: '次',
        withdrawModalTitle: '申请提现',
        amountVnd: '金额 (VND)',
        bankName: '银行名称',
        accountName: '开户人姓名',
        accountNumber: '银行账号',
        cancel: '取消',
        submitRequest: '提交申请',
        processing: '处理中...'
      }
    };

    const fallback = {
      fleetEarningsTitle: 'Fleet Earnings & Revenue Center',
      fleetEarningsSub: 'Track dynamic utilization rates and financial performance statements',
      withdrawFunds: 'Withdraw Funds',
      exportPdf: 'Export PDF Statement',
      exportCsv: 'Export CSV Ledger',
      availableBalance: 'Available Balance',
      readyForWithdrawal: 'Ready for withdrawal',
      grossEarnings: 'Gross Earnings',
      projected: 'Projected',
      utilizationRate: 'Fleet Utilization Rate',
      optimalRange: 'Optimal range (60-80%)',
      totalBookingRequests: 'Total Booking Requests',
      completed: 'completed',
      active: 'active',
      totalManagedFleet: 'Total Managed Fleet',
      vehicles: 'Vehicles',
      cars: 'Cars',
      motorbikes: 'Motorbikes',
      grossBookedValue: 'Gross booked value',
      pendingPaymentApproval: 'Pending payment / approval',
      revenueRuleTitle: 'Revenue rule',
      revenueRuleDesc: 'Completed revenue counts only completed rentals; pending bookings are tracked separately.',
      monthlyLedgerTitle: 'Monthly Revenue and Booking Ledger',
      monthlyLedgerSub: 'Comparing gross payouts vs completed bookings count',
      breakdownHistory: 'BREAKDOWN HISTORY',
      bookingCountSuffix: 'booking(s)',
      withdrawModalTitle: 'Withdraw Funds',
      amountVnd: 'Amount (VND)',
      bankName: 'Bank Name',
      accountName: 'Account Name',
      accountNumber: 'Account Number',
      cancel: 'Cancel',
      submitRequest: 'Submit Request',
      processing: 'Processing...'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  // Withdraw Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ownerAnalyticsService.getDashboardStats();
        setStats(data);
        
        // Fetch wallet balance
        if (user) {
          const userRes = await apiClient.get<any>(`/users/${user.id}`);
          const userData = userRes.data || userRes.user || userRes;
          setWalletBalance(userData?.walletBalance || 0);
        }
      } catch (err) {
        console.error('Failed to load owner stats:', err);
        toast.error('Failed to load fleet analytics metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (amountNum > walletBalance) {
      toast.error('Số dư không đủ để rút');
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawalService.requestWithdrawal(
        user.id,
        amountNum,
        bankName,
        accountName,
        accountNumber
      );
      toast.success('Yêu cầu rút tiền đã được gửi và đang chờ Admin xử lý.');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      // Optionally fetch balance again here, but it only drops when admin approves.
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gửi yêu cầu rút tiền');
    } finally {
      setWithdrawing(false);
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
          <h2 className="text-2xl font-black text-[var(--lw-text-primary)] tracking-tight">{rvt.fleetEarningsTitle}</h2>
          <p className="text-xs text-[var(--lw-text-secondary)] font-semibold mt-0.5">{rvt.fleetEarningsSub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <DollarSign className="w-4 h-4" />
            {rvt.withdrawFunds}
          </button>
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
            {rvt.exportPdf}
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
            {rvt.exportCsv}
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
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{formatVND(walletBalance)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">{rvt.availableBalance}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3" />
            {rvt.readyForWithdrawal}
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{formatVND(stats.totalRevenue)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">{rvt.grossEarnings}</p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3" />
            {rvt.projected}: {formatVND(stats.projectedRevenue || stats.totalRevenue)}
          </div>
        </div>

        {/* Utilization Card */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--lw-accent-glow)] rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-[var(--lw-accent-glow)] border border-[var(--lw-border-strong)] flex items-center justify-center mb-3">
            <Percent className="w-5 h-5 text-[var(--lw-accent)]" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.utilizationRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">{rvt.utilizationRate}</p>
          <div className="flex items-center gap-1 text-[10px] text-[var(--lw-accent)] font-bold mt-2">
            <Activity className="w-3 h-3 animate-pulse" />
            {rvt.optimalRange}
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.totalBookings}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">{rvt.totalBookingRequests}</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2">
            <span>{stats.completedBookings} {rvt.completed}, {stats.activeBookings} {rvt.active}</span>
          </div>
        </div>

        {/* Fleet Size */}
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
            <Car className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <p className="text-2xl font-black text-[var(--lw-text-primary)]">{stats.fleetSize} {rvt.vehicles}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-muted)] mt-1">{rvt.totalManagedFleet}</p>
          <div className="flex items-center gap-2 text-[10px] text-[var(--lw-text-secondary)] font-semibold mt-2">
            <span>{stats.carCount} {rvt.cars}</span>
            <span>·</span>
            <span>{stats.motorbikeCount} {rvt.motorbikes}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">{rvt.grossBookedValue}</p>
          <p className="text-lg font-black text-[var(--lw-text-primary)] mt-1">{formatVND(stats.grossBookedRevenue || stats.totalRevenue || 0)}</p>
        </div>
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">{rvt.pendingPaymentApproval}</p>
          <p className="text-lg font-black text-orange-600 mt-1">{formatVND(stats.pendingRevenue || 0)}</p>
        </div>
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-text-muted)]">{rvt.revenueRuleTitle}</p>
          <p className="text-xs font-semibold text-[var(--lw-text-secondary)] mt-1">{rvt.revenueRuleDesc}</p>
        </div>
      </div>

      {/* Monthly Chart Card */}
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-6 rounded-3xl relative overflow-hidden shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[var(--lw-text-primary)]">{rvt.monthlyLedgerTitle}</h3>
            <p className="text-xs text-[var(--lw-text-secondary)]">{rvt.monthlyLedgerSub}</p>
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
            <h4 className="text-xs font-bold text-[var(--lw-text-primary)] uppercase tracking-wider">{rvt.breakdownHistory}</h4>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {chartData.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[var(--lw-text-primary)]">{d.month}</p>
                    <p className="text-[10px] text-[var(--lw-text-muted)]">{d.bookings} {rvt.bookingCountSuffix}</p>
                  </div>
                  <span className="font-extrabold text-[var(--lw-accent)]">{formatVND(d.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{rvt.withdrawModalTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">{rvt.availableBalance}: {formatVND(walletBalance)}</p>
            </div>
            
            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{rvt.amountVnd}</label>
                <input 
                  type="number" 
                  required
                  min={100000}
                  max={walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{rvt.bankName}</label>
                <input 
                  type="text" 
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Vietcombank"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{rvt.accountName}</label>
                <input 
                  type="text" 
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. NGUYEN VAN A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{rvt.accountNumber}</label>
                <input 
                  type="text" 
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 10123456789"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors"
                >
                  {rvt.cancel}
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex-1 px-4 py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-colors disabled:opacity-50"
                >
                  {withdrawing ? rvt.processing : rvt.submitRequest}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
