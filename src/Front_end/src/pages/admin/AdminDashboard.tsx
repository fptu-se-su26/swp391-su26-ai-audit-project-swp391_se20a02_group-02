import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Car, Calendar, DollarSign, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, Search, BarChart2, Globe, Loader2,
  Settings, HelpCircle, Edit2, Plus, Trash2, Activity, LogOut, Clock, Menu, X,
  ArrowUpRight, ArrowDownRight, Scale, Ban, RefreshCw, Download, FileText, Check, Lock,
  Cpu, HardDrive, Bell, ShieldAlert, Wifi, Terminal, Mail, Send, Share2, FileSpreadsheet, PanelLeftClose, PanelLeftOpen, Building, Wallet
} from 'lucide-react';
import { formatCurrency, formatDate, cn, convertCurrency } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import { adminService, AdminStats } from '@/services/adminService';
import { bookingService, paymentService } from '@/services/bookingService';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { useUIStore, useAuthStore } from '@/store';
import { useT } from '@/i18n/translations';
import { AuditTrailDashboard } from '@/components/enterprise/AuditTrailDashboard';
import { AdminPayoutsTab } from '@/components/admin/AdminPayoutsTab';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import logoImage from '@/image/logo.png';

const COLORS = ['#EAB308', '#6366F1', '#10B981', '#A855F7', '#06B6D4', '#EC4899'];

// Custom White Card Tooltip for Charts
const AdminCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xl text-xs font-semibold text-slate-800">
        <p className="text-slate-550 font-bold mb-1.5">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} className="font-extrabold flex items-center gap-2 text-xs mt-1" style={{ color: '#1e293b' }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            {item.name}: <span className="text-indigo-650">{typeof item.value === 'number' && item.name.toLowerCase().includes('revenue') ? formatCurrency(item.value) : item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============ REUSABLE PREMIUM SLIDE-OUT DRAWER ============
interface AdminSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const AdminSlideDrawer: React.FC<AdminSlideDrawerProps> = ({ isOpen, onClose, title, children }) => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] md:w-[580px] shadow-2xl p-6 flex flex-col border-l backdrop-blur-xl",
              isDark ? "bg-[#0b101c]/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200 text-slate-800"
            )}
          >
            <div className="flex justify-between items-center border-b dark:border-slate-850 pb-4 mb-6">
              <div>
                <h3 className={cn("font-black text-sm uppercase tracking-widest", isDark ? "text-indigo-400" : "text-indigo-600")}>
                  {title}
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-500/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 sidebar-scroll">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { theme, currency, desktopSidebarCollapsed, setDesktopSidebarCollapsed, language } = useUIStore();
  const { user, logout } = useAuthStore();
  const isDark = theme === 'dark';
  const t = useT();
  const lang = language || 'en';
  const isVi = lang === 'vi';
  const location = useLocation();

  const adminBreadcrumbLabel = {
    vi: 'Quản Trị',
    ja: '管理',
    ko: '관리자',
    zh: '管理',
    fr: 'Admin',
    de: 'Admin',
    es: 'Admin',
    en: 'Admin'
  }[lang] || 'Admin';

  const formatStatusLabel = (status?: string | null): string => {
    if (!status) return '';
    const s = status.toLowerCase().trim();

    const dict: Record<string, Record<string, string>> = {
      payment_expired: { vi: 'Hết hạn thanh toán', ja: '支払い期限切れ', ko: '결제 기한 만료', zh: '支付已过期', fr: 'Paiement expiré', de: 'Zahlung abgelaufen', es: 'Pago expirado', en: 'Payment Expired' },
      unpaid: { vi: 'Chưa thanh toán', ja: '未払い', ko: '미결제', zh: '未支付', fr: 'Non payé', de: 'Unbezahlt', es: 'No pagado', en: 'Unpaid' },
      paid: { vi: 'Đã thanh toán', ja: '支払い済み', ko: '결제 완료', zh: '已支付', fr: 'Payé', de: 'Bezahlt', es: 'Pagado', en: 'Paid' },
      pending: { vi: 'Chờ xử lý', ja: '保留中', ko: '대기 중', zh: '待处理', fr: 'En attente', de: 'Ausstehend', es: 'Pendiente', en: 'Pending' },
      waiting_payment: { vi: 'Chờ thanh toán', ja: '支払い待ち', ko: '결제 대기', zh: '等待支付', fr: 'En attente de paiement', de: 'Warten auf Zahlung', es: 'Esperando pago', en: 'Waiting Payment' },
      payment_pending: { vi: 'Đang xác minh', ja: '支払い確認中', ko: '결제 확인 중', zh: '支付核验中', fr: 'Paiement en cours', de: 'Zahlung ausstehend', es: 'Pago pendiente', en: 'Payment Pending' },
      payment_verified: { vi: 'Đã xác minh', ja: '支払い確認済み', ko: '결제 검증됨', zh: '支付已核验', fr: 'Paiement vérifié', de: 'Zahlung verifiziert', es: 'Pago verificado', en: 'Payment Verified' },
      payment_rejected: { vi: 'Từ chối thanh toán', ja: '支払い拒否', ko: '결제 거절됨', zh: '支付已拒绝', fr: 'Paiement rejeté', de: 'Zahlung abgelehnt', es: 'Pago rechazado', en: 'Payment Rejected' },
      confirmed: { vi: 'Đã xác nhận', ja: '確認済み', ko: '확정됨', zh: '已确认', fr: 'Confirmé', de: 'Bestätigt', es: 'Confirmado', en: 'Confirmed' },
      completed: { vi: 'Hoàn thành', ja: '完了', ko: '완료됨', zh: '已完成', fr: 'Terminé', de: 'Abgeschlossen', es: 'Completado', en: 'Completed' },
      cancelled: { vi: 'Đã hủy', ja: 'キャンセル済み', ko: '취소됨', zh: '已取消', fr: 'Annulé', de: 'Storniert', es: 'Cancelado', en: 'Cancelled' },
      disputed: { vi: 'Tranh chấp', ja: '紛争中', ko: '분쟁 중', zh: '争议中', fr: 'Contesté', de: 'Strittig', es: 'En disputa', en: 'Disputed' },
      active: { vi: 'Hoạt động', ja: '有効', ko: '활성', zh: '活跃', fr: 'Actif', de: 'Aktiv', es: 'Activo', en: 'Active' },
      inactive: { vi: 'Vô hiệu', ja: '無効', ko: '비활성', zh: '未激活', fr: 'Inactif', de: 'Inaktiv', es: 'Inactivo', en: 'Inactive' },
      blocked: { vi: 'Đã khóa', ja: 'ブロック済み', ko: '차단됨', zh: '已封禁', fr: 'Bloqué', de: 'Blockiert', es: 'Bloqueado', en: 'Blocked' },
      verified: { vi: 'Đã xác thực', ja: '認証済み', ko: '인증됨', zh: '已验证', fr: 'Vérifié', de: 'Verifiziert', es: 'Verificado', en: 'Verified' },
      pending_approval: { vi: 'Chờ duyệt', ja: '承認待ち', ko: '승인 대기 중', zh: '待审核', fr: 'En attente', de: 'Ausstehend', es: 'Pendiente', en: 'Pending Approval' },
      approved: { vi: 'Đã duyệt', ja: '承認済み', ko: '승인됨', zh: '已批准', fr: 'Approuvé', de: 'Genehmigt', es: 'Aprobado', en: 'Approved' },
      rejected: { vi: 'Từ chối', ja: '却下済み', ko: '거절됨', zh: '已拒绝', fr: 'Rejeté', de: 'Abgelehnt', es: 'Rechazado', en: 'Rejected' },
      submitted: { vi: 'Đã nộp', ja: '提出済み', ko: '제출됨', zh: '已提交', fr: 'Soumis', de: 'Eingereicht', es: 'Enviado', en: 'Submitted' },
      resolved: { vi: 'Đã giải quyết', ja: '解決済み', ko: '해결됨', zh: '已解决', fr: 'Résolu', de: 'Gelöst', es: 'Resuelto', en: 'Resolved' },
      expired: { vi: 'Hết hạn', ja: '期限切れ', ko: '만료됨', zh: '已过期', fr: 'Expiré', de: 'Abgelaufen', es: 'Expirado', en: 'Expired' },
    };

    const entry = dict[s];
    if (entry) {
      return entry[lang] || entry['en'] || status.replace(/_/g, ' ').toUpperCase();
    }
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const getTableHeaderText = (header: string): string => {
    const tableHeadersMap: Record<string, Record<string, string>> = {
      'Booking ID': { vi: 'MÃ ĐẶT XE', ja: '予約ID', ko: '예약 ID', zh: '预订 ID', fr: 'ID réservation', de: 'Buchungs-ID', es: 'ID reserva', en: 'Booking ID' },
      'Renter Guest': { vi: 'KHÁCH THUÊ', ja: '借り手ゲスト', ko: '대여자 게스트', zh: '租客', fr: 'Client locataire', de: 'Mieter', es: 'Cliente inquilino', en: 'Renter Guest' },
      'Owner Partner': { vi: 'CHỦ XE ĐỐI TÁC', ja: 'オーナーパートナー', ko: '호스트 파트너', zh: '车主伙伴', fr: 'Partenaire', de: 'Partner-Eigentümer', es: 'Socio propietario', en: 'Owner Partner' },
      'Vehicle Reserved': { vi: 'XE THUÊ', ja: '予約車両', ko: '예약된 차량', zh: '预订车辆', fr: 'Véhicule réservé', de: 'Reserviertes Fahrzeug', es: 'Vehículo reservado', en: 'Vehicle Reserved' },
      'Rental Dates': { vi: 'THỜI GIAN THUÊ', ja: 'レンタル期間', ko: '대여 기간', zh: '租赁日期', fr: 'Dates de location', de: 'Mietdaten', es: 'Fechas de alquiler', en: 'Rental Dates' },
      'Charge Total': { vi: 'TỔNG CHI PHÍ', ja: '合計料金', ko: '총 금액', zh: '总费用', fr: 'Total facturé', de: 'Gesamtbetrag', es: 'Total cobrado', en: 'Charge Total' },
      'Status': { vi: 'TRẠNG THÁI', ja: 'ステータス', ko: '상태', zh: '状态', fr: 'Statut', de: 'Status', es: 'Estado', en: 'Status' },
      'Payments': { vi: 'THANH TOÁN', ja: '支払い', ko: '결제', zh: '支付', fr: 'Paiements', de: 'Zahlungen', es: 'Pagos', en: 'Payments' },
      'Actions': { vi: 'THAO TÁC', ja: '操作', ko: '작업', zh: '操作', fr: 'Actions', de: 'Aktionen', es: 'Acciones', en: 'Actions' },
      'Mã đặt xe (Memo)': { vi: 'Mã đặt xe (Nội dung)', ja: '予約コード (メモ)', ko: '예약 코드 (메모)', zh: '预订代码（水单）', fr: 'Code de réservation', de: 'Buchungscode', es: 'Código de reserva', en: 'Booking Code (Memo)' },
      'Khách thuê': { vi: 'Khách thuê', ja: '顧客', ko: '고객', zh: '客户', fr: 'Client', de: 'Kunde', es: 'Cliente', en: 'Customer' },
      'Số tiền cần chuyển': { vi: 'Số tiền cần chuyển', ja: '必要金額', ko: '필요 금액', zh: '应付金额', fr: 'Montant requis', de: 'Erforderlicher Betrag', es: 'Monto requerido', en: 'Amount Required' },
      'Trạng thái': { vi: 'Trạng thái', ja: 'ステータス', ko: '상태', zh: '状态', fr: 'Statut', de: 'Status', es: 'Estado', en: 'Status' },
      'Thời gian khởi tạo': { vi: 'Thời gian khởi tạo', ja: '作成日時', ko: '생성 일시', zh: '创建时间', fr: 'Créé le', de: 'Erstellt am', es: 'Creado el', en: 'Created At' },
      'Thao tác': { vi: 'Thao tác', ja: '操作', ko: '작업', zh: '操作', fr: 'Actions', de: 'Aktionen', es: 'Acciones', en: 'Actions' },
      'Vehicle Model': { vi: 'Mẫu Xe', ja: '車両モデル', ko: '차량 모델', zh: '车辆型号', fr: 'Modèle', de: 'Fahrzeugmodell', es: 'Modelo', en: 'Vehicle Model' },
      'Brand Info': { vi: 'Thương Hiệu', ja: 'ブランド情報', ko: 'ブランド 정보', zh: '品牌信息', fr: 'Marque', de: 'Markeninfo', es: 'Marca', en: 'Brand Info' },
      'Daily Cost Rate': { vi: 'Giá Thuê/Ngày', ja: '日額料金', ko: '일일 대여료', zh: '每日租金', fr: 'Tarif/jour', de: 'Tagespreis', es: 'Tarifa/día', en: 'Daily Cost Rate' },
      'Year Model': { vi: 'Năm Sản Xuất', ja: '年式', ko: '연식', zh: '生产年份', fr: 'Année', de: 'Baujahr', es: 'Año', en: 'Year Model' },
      'Registration Status': { vi: 'Trạng Thái Duyệt', ja: '登録ステータス', ko: '등록 상태', zh: '注册状态', fr: 'Statut d\'inscription', de: 'Registrierungsstatus', es: 'Estado de registro', en: 'Registration Status' },
      'Rating Grade': { vi: 'Đánh Giá', ja: '評価グレード', ko: '평점 등급', zh: '评分等级', fr: 'Note', de: 'Bewertung', es: 'Calificación', en: 'Rating Grade' },
      'User Account': { vi: 'Tài Khoản Người Dùng', ja: 'ユーザーアカウント', ko: '사용자 계정', zh: '用户账户', fr: 'Compte utilisateur', de: 'Benutzerkonto', es: 'Cuenta de usuario', en: 'User Account' },
      'Email Address': { vi: 'Địa Chỉ Email', ja: 'メールアドレス', ko: '이메일 주소', zh: '电子邮箱', fr: 'E-mail', de: 'E-Mail-Adresse', es: 'Correo electrónico', en: 'Email Address' },
      'Platform Role': { vi: 'Vai Trò', ja: '役割', ko: '플랫폼 역할', zh: '平台角色', fr: 'Rôle', de: 'Rolle', es: 'Rol', en: 'Platform Role' },
      'KYC Status': { vi: 'Trạng Thái KYC', ja: 'KYCステータス', ko: 'KYC 상태', zh: 'KYC 状态', fr: 'Statut KYC', de: 'KYC-Status', es: 'Estado KYC', en: 'KYC Status' },
      'Account Status': { vi: 'Trạng Thái Tài Khoản', ja: 'アカウント状態', ko: '계정 상태', zh: '账户状态', fr: 'Statut du compte', de: 'Konto-Status', es: 'Estado de cuenta', en: 'Account Status' },
      'Identity Score': { vi: 'Điểm Định Danh', ja: '本人確認スコア', ko: '본인 확인 점수', zh: '身份评分', fr: 'Score d\'identité', de: 'Identitätswert', es: 'Puntuación de identidad', en: 'Identity Score' },
      'Verification Status': { vi: 'Trạng Thái Xác Minh', ja: '確認ステータス', ko: '검증 상태', zh: '核验状态', fr: 'Statut de vérification', de: 'Verifizierungsstatus', es: 'Estado de verificación', en: 'Verification Status' },
      'Dispute ID': { vi: 'Mã Tranh Chấp', ja: '紛争ID', ko: '분쟁 ID', zh: '争议 ID', fr: 'ID de litige', de: 'Streitfall-ID', es: 'ID de disputa', en: 'Dispute ID' },
      'Booking Reference': { vi: 'Tham Chiếu Đặt Xe', ja: '予約参照', ko: '예약 참조', zh: '预订参考', fr: 'Réf. réservation', de: 'Buchungsreferenz', es: 'Ref. reserva', en: 'Booking Reference' },
      'Conflict Reason': { vi: 'Lý Do Tranh Chấp', ja: '紛争理由', ko: '분쟁 사유', zh: '争议原因', fr: 'Raison du litige', de: 'Streitgrund', es: 'Razón de disputa', en: 'Conflict Reason' },
      'Current State': { vi: 'Trạng Thái Hiện Tại', ja: '現在の状態', ko: '현재 상태', zh: '当前状态', fr: 'État actuel', de: 'Aktueller Status', es: 'Estado actual', en: 'Current State' },
      'Creation Date': { vi: 'Ngày Tạo', ja: '作成日', ko: '생성일', zh: '创建日期', fr: 'Date de création', de: 'Erstellungsdatum', es: 'Fecha de création', en: 'Creation Date' },
      'Risk Score': { vi: 'Điểm Rủi Ro', ja: 'リスクスコア', ko: '위험 점수', zh: '风险评分', fr: 'Score de risque', de: 'Risikowert', es: 'Puntuación de riesgo', en: 'Risk Score' },
      'Flagged Indicators': { vi: 'Cảnh Báo Dấu Hiệu', ja: '検出されたフラグ', ko: '감지된 지표', zh: '标记指标', fr: 'Indicateurs signalés', de: 'Flaggensignale', es: 'Indicadores marcados', en: 'Flagged Indicators' },
      'Risk Level': { vi: 'Mức Độ Rủi Ro', ja: 'リスクレベル', ko: '위험 수준', zh: '风险等级', fr: 'Niveau de risque', de: 'Risikostufe', es: 'Nivel de riesgo', en: 'Risk Level' },
      'Operations Actions': { vi: 'Thao Tác Vận Hành', ja: '運用アクション', ko: '운영 작업', zh: '运维操作', fr: 'Actions d\'exploitation', de: 'Betriebsaktionen', es: 'Acciones de operación', en: 'Operations Actions' },
    };

    const item = tableHeadersMap[header];
    if (item) {
      return item[lang] || item['en'] || header;
    }
    return header;
  };

  const formatRoleLabel = (role?: string): string => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return { vi: 'QUẢN TRỊ VIÊN', ja: '管理者', ko: '관리자', zh: '管理员', fr: 'ADMIN', de: 'ADMIN', es: 'ADMIN', en: 'ADMIN' }[lang] || 'ADMIN';
    if (r === 'owner') return { vi: 'CHỦ XE', ja: 'オーナー', ko: '호스트', zh: '车主', fr: 'PROPRIÉTAIRE', de: 'EIGENTÜMER', es: 'PROPIETARIO', en: 'OWNER' }[lang] || 'OWNER';
    return { vi: 'KHÁCH THUÊ', ja: '顧客', ko: '고객', zh: '客户', fr: 'CLIENT', de: 'KUNDE', es: 'CLIENTE', en: 'CUSTOMER' }[lang] || 'CUSTOMER';
  };

  const queryTab = new URLSearchParams(location.search).get('tab');
  const validTabs = ['overview', 'marketplace', 'vehicles', 'kyc', 'owner-applications', 'bookings', 'payments', 'payouts', 'disputes', 'users', 'fraud', 'analytics', 'notifications', 'logs', 'health', 'settings'];
  const normalizeStatus = (value?: string | null) => String(value || '').trim().toUpperCase();
  const isPendingVehicleApproval = (vehicle: any) => {
    const status = normalizeStatus(vehicle?.status);
    const approvalStatus = normalizeStatus(vehicle?.approvalStatus);
    return status === 'PENDING_APPROVAL' || approvalStatus === 'PENDING_APPROVAL';
  };
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'vehicles' | 'kyc' | 'owner-applications' | 'bookings' | 'payments' | 'payouts' | 'disputes' | 'users' | 'fraud' | 'analytics' | 'notifications' | 'logs' | 'health' | 'settings'>(
    queryTab && validTabs.includes(queryTab) ? (queryTab as any) : 'overview'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [fleetSplitType, setFleetSplitType] = useState<'category' | 'ecosystem'>('ecosystem');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Payment Verification Enriched Queues & Config
  const [paymentQueue, setPaymentQueue] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('PENDING');
  const [verifyingBooking, setVerifyingBooking] = useState<any | null>(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [adminPaymentSettings, setAdminPaymentSettings] = useState<any>({ bankName: 'MB Bank', accountNumber: '0377096245', ownerName: 'NGUYEN VAN DANG', enabled: true });

  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userKycStatusFilter, setUserKycStatusFilter] = useState('ALL');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('PENDING_APPROVAL');
  
  // KYC specific states
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [kycSearch, setKycSearch] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('PENDING');

  // Owner Applications
  const [ownerApps, setOwnerApps] = useState<any[]>([]);
  const [loadingOwnerApps, setLoadingOwnerApps] = useState(false);
  const [ownerAppsStatusFilter, setOwnerAppsStatusFilter] = useState('SUBMITTED');
  const [selectedOwnerApp, setSelectedOwnerApp] = useState<any | null>(null);

  // Debounced search values
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [debouncedVehicleSearch, setDebouncedVehicleSearch] = useState('');
  const [debouncedKycSearch, setDebouncedKycSearch] = useState('');

  // Debounce effect for User Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [userSearch]);

  // Debounce effect for Vehicle Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVehicleSearch(vehicleSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [vehicleSearch]);

  // Debounce effect for KYC Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKycSearch(kycSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [kycSearch]);

  const fetchUsers = async (role?: string, kycStatus?: string, keyword?: string) => {
    try {
      const res = await adminService.listUsers(
        role === 'ALL' ? undefined : role,
        kycStatus === 'ALL' ? undefined : kycStatus,
        keyword || undefined,
        0,
        100
      );
      if (res && res.content) {
        setUsers(res.content);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchKycUsers = async (kycStatus?: string, keyword?: string) => {
    try {
      let usersList: any[] = [];
      if (kycStatus === 'PENDING') {
        usersList = await adminService.getPendingKyc();
      } else {
        const res = await adminService.listUsers(
          'customer',
          kycStatus === 'ALL' ? undefined : kycStatus,
          undefined,
          0,
          100
        );
        if (res && res.content) {
          usersList = res.content;
        }
      }

      if (keyword) {
        const kw = keyword.toLowerCase();
        usersList = usersList.filter(u => 
          (u.displayName && u.displayName.toLowerCase().includes(kw)) ||
          (u.email && u.email.toLowerCase().includes(kw)) ||
          (u.phone && u.phone.toLowerCase().includes(kw)) ||
          (u.id && u.id.toLowerCase().includes(kw))
        );
      }
      setKycUsers(usersList);
    } catch (err) {
      console.error('Failed to fetch KYC users:', err);
    }
  };

  const fetchVehicles = async (status?: string, keyword?: string) => {
    try {
      const requestedStatus = normalizeStatus(status);
      const res = requestedStatus === 'PENDING_APPROVAL' && !keyword
        ? await adminService.listPendingVehicles(0, 100)
        : await adminService.listAllVehicles(
            requestedStatus === 'ALL' ? undefined : requestedStatus,
            keyword || undefined,
            0,
            100
          );
      const content = Array.isArray(res) ? res : (res?.content || []);
      setVehicles(
        requestedStatus === 'PENDING_APPROVAL'
          ? content.filter(isPendingVehicleApproval)
          : content
      );
      if (requestedStatus === 'PENDING_APPROVAL' && keyword) {
        const pendingRes = await adminService.listPendingVehicles(0, 100);
        const kw = keyword.toLowerCase();
        const pendingContent = (Array.isArray(pendingRes) ? pendingRes : (pendingRes?.content || []))
          .filter(isPendingVehicleApproval)
          .filter((v: any) =>
            String(v.name || '').toLowerCase().includes(kw) ||
            String(v.brand || '').toLowerCase().includes(kw) ||
            String(v.model || '').toLowerCase().includes(kw) ||
            String(v.licensePlate || v.specs?.licensePlate || '').toLowerCase().includes(kw) ||
            String(v.owner?.displayName || v.ownerName || '').toLowerCase().includes(kw)
          );
        setVehicles(pendingContent);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  // Trigger fetch users when filters change
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(userRoleFilter, userKycStatusFilter, debouncedUserSearch);
    }
  }, [userRoleFilter, userKycStatusFilter, debouncedUserSearch, activeTab]);

  // Filter logic
  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchKycUsers(kycStatusFilter, debouncedKycSearch);
    }
    if (activeTab === 'owner-applications') {
      loadOwnerApplications();
    }
  }, [activeTab, kycStatusFilter, ownerAppsStatusFilter, debouncedKycSearch]);

  // Trigger fetch vehicles when filters change
  useEffect(() => {
    if (activeTab === 'vehicles') {
      fetchVehicles(vehicleStatusFilter, debouncedVehicleSearch);
    }
  }, [vehicleStatusFilter, debouncedVehicleSearch, activeTab]);

  // Operations review side panel states
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedKycUser, setSelectedKycUser] = useState<any | null>(null);
  const [kycUserDocs, setKycUserDocs] = useState<any[]>([]);
  const [loadingKycDocs, setLoadingKycDocs] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Review comment input
  const [rejectionReason, setRejectionReason] = useState('');
  const [disputeDecision, setDisputeDecision] = useState('');

  // Primary platform metrics
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  
  // Timeline log filters and items
  const [logFilters, setLogFilters] = useState({
    VEHICLE: true,
    KYC: true,
    PAYMENT: true,
    SETTING: true,
    DISPUTE: true,
    USER: true,
  });
  const [logs, setLogs] = useState<any[]>([]);

  // Telemetry real-time dynamic health parameters
  const [healthSystem, setHealthSystem] = useState({
    cpu: 24,
    memory: 5.4,
    storage: 64.2,
    connections: 452,
    wsLatency: 12,
    apiLatency: 28,
    sqlLatency: 8,
    redisLatency: 2,
  });

  // Notification center broadcast inputs
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [targetSegment, setTargetSegment] = useState<'all' | 'owners' | 'customers'>('all');
  const [notifyChannel, setNotifyChannel] = useState<'all' | 'push' | 'email'>('all');
  const [broadcasts, setBroadcasts] = useState([
    { id: '1', title: 'Summer Supercar Promo 15%', body: 'Get 15% discount on all lamborghini and ferrari rentals this summer.', segment: 'customers', channel: 'push', sentCount: 1540, openRate: '68.4%', clickRate: '12.5%', status: 'SENT', time: '2026-06-01T15:00:00Z' },
    { id: '2', title: 'Platform Fee Structure Update', body: 'Important update regarding owner commission adjustments starting next month.', segment: 'owners', channel: 'email', sentCount: 180, openRate: '94.2%', clickRate: '34.8%', status: 'SENT', time: '2026-05-28T09:00:00Z' },
    { id: '3', title: 'System Maintenance Window', body: 'LuxeWay databases will undergo scheduled maintenance on June 5th, 2AM-4AM GMT+7.', segment: 'all', channel: 'all', sentCount: 1720, openRate: '52.1%', clickRate: '5.2%', status: 'SENT', time: '2026-05-25T11:30:00Z' },
  ]);

  // Fraud alerts state
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

  // Suspicious bookings
  const [suspiciousBookings, setSuspiciousBookings] = useState<any[]>([]);

  // Chargebacks monitoring
  const [chargebacks, setChargebacks] = useState<any[]>([]);

  // Device fingerprint sharing
  const [fingerprints, setFingerprints] = useState<any[]>([]);

  // Update active tab based on query param when URL changes
  useEffect(() => {
    const searchTab = new URLSearchParams(location.search).get('tab');
    if (searchTab && validTabs.includes(searchTab)) {
      setActiveTab(searchTab as any);
    }
  }, [location.search]);

  // Fetch KYC user documents when selected
  useEffect(() => {
    if (selectedKycUser) {
      setLoadingKycDocs(true);
      adminService.getUserDocuments(selectedKycUser.id)
        .then(docs => {
          setKycUserDocs(docs || []);
          setLoadingKycDocs(false);
        })
        .catch(err => {
          console.error(err);
          setKycUserDocs([]);
          setLoadingKycDocs(false);
        });
    } else {
      setKycUserDocs([]);
    }
  }, [selectedKycUser]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System Health telemetry update interval loop
  useEffect(() => {
    if (activeTab === 'health') {
      const interval = setInterval(() => {
        setHealthSystem(prev => ({
          cpu: Math.min(98, Math.max(5, Math.round(prev.cpu + (Math.random() * 8 - 4)))),
          memory: Math.min(15.8, Math.max(4.0, parseFloat((prev.memory + (Math.random() * 0.4 - 0.2)).toFixed(2)))),
          storage: Math.min(99, Math.max(10, parseFloat((prev.storage + (Math.random() * 0.02 - 0.01)).toFixed(2)))),
          connections: Math.min(1200, Math.max(50, prev.connections + Math.round(Math.random() * 12 - 6))),
          wsLatency: Math.min(100, Math.max(2, prev.wsLatency + Math.round(Math.random() * 6 - 3))),
          apiLatency: Math.min(250, Math.max(10, prev.apiLatency + Math.round(Math.random() * 8 - 4))),
          sqlLatency: Math.min(80, Math.max(1, prev.sqlLatency + Math.round(Math.random() * 4 - 2))),
          redisLatency: Math.min(15, Math.max(1, prev.redisLatency + Math.round(Math.random() * 0.8 - 0.4))),
        }));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadOwnerApplications = async () => {
    try {
      setLoadingOwnerApps(true);
      const res = await apiClient.get<any>(`/admin/owner-applications?status=${ownerAppsStatusFilter}`);
      setOwnerApps(res?.data?.data?.content || res?.data?.content || res?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOwnerApps(false);
    }
  };

  const loadFraudAlerts = async () => {};
  const loadSystemHealth = async () => {};

  // Fetch Dashboard Stats & Primary Data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, userList, vehList, bookList, disputeList, payList, settingList, analyticsOverviewRes, analyticsHistoryRes, paymentSettingsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.listUsers(undefined, undefined, undefined, 0, 100),
        adminService.listAllVehicles(undefined, undefined, 0, 100),
        adminService.listAllBookings(undefined, 0, 100),
        adminService.listAllDisputes(),
        adminService.listAllPayments(0, 100),
        adminService.listSettings(),
        adminService.getAnalyticsOverview(),
        adminService.getHistoricalAnalytics(30),
        paymentService.getPaymentSettings().catch(() => null),
        loadFraudAlerts(),
        loadSystemHealth(),
        loadOwnerApplications()
      ]);

      if (statsRes) setStats(statsRes);
      if (userList) {
        const userContent = userList.content || [];
        setUsers(userContent);
        setKycUsers(userContent.filter((u: any) => u.role === 'customer'));
      }
      if (vehList) setVehicles(vehList.content || []);
      if (bookList) setBookings(bookList.content || []);
      if (disputeList) setDisputes(disputeList || []);
      if (payList) setPayments(payList.content || []);
      if (settingList) setSettings(settingList || []);
      if (analyticsOverviewRes) setAnalyticsOverview(analyticsOverviewRes);
      if (analyticsHistoryRes) setAnalyticsHistory(analyticsHistoryRes);
      if (paymentSettingsRes && paymentSettingsRes.data) setAdminPaymentSettings(paymentSettingsRes.data);

      // Generate simulated mock audit logs for premium tracking
      setLogs([
        { id: '1', action: 'VEHICLE_APPROVE', admin: 'Alex Admin', target: 'Ferrari F8 Tributo', status: 'SUCCESS', time: '2026-06-02T10:12:00Z', ip: '192.168.1.10', type: 'VEHICLE' },
        { id: '2', action: 'USER_KYC_VERIFY', admin: 'Jane Admin', target: 'John Doe', status: 'SUCCESS', time: '2026-06-02T09:44:00Z', ip: '192.168.1.12', type: 'KYC' },
        { id: '3', action: 'PAYMENT_REFUND', admin: 'Alex Admin', target: 'Booking #LW-930492', status: 'SUCCESS', time: '2026-06-02T08:15:00Z', ip: '192.168.1.10', type: 'PAYMENT' },
        { id: '4', action: 'SETTING_UPDATE', admin: 'System Operator', target: 'platform_fee_percentage', status: 'SUCCESS', time: '2026-06-02T07:00:00Z', ip: '127.0.0.1', type: 'SETTING' },
        { id: '5', action: 'DISPUTE_RESOLVE', admin: 'Jane Admin', target: 'Dispute #3', status: 'SUCCESS', time: '2026-06-01T23:19:00Z', ip: '192.168.1.12', type: 'DISPUTE' },
        { id: '6', action: 'USER_SUSPEND', admin: 'Jane Admin', target: 'Spammer Account #928', status: 'SUCCESS', time: '2026-06-01T15:20:00Z', ip: '192.168.1.12', type: 'USER' }
      ]);

    } catch (err: any) {
      setError('Failed to load operational marketplace parameters. Please try again.');
      toast.error('Network Error', 'Could not sync dashboard values with the Spring Boot backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Action: Approve Vehicle
  const handleApproveVehicle = async (id: string) => {
    try {
      await adminService.approveVehicle(id);
      toast.success('Listing Approved', 'The premium vehicle is now live on the marketplace.');
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'available', approvalStatus: 'approved' } : v));
      setSelectedVehicle(null);
      setLogs(prev => [
        { id: String(prev.length + 1), action: 'VEHICLE_APPROVE', admin: user?.displayName || 'Admin', target: `Vehicle ID ${id.substring(0,8)}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'VEHICLE' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Operation Failed', 'Could not approve listing.');
    }
  };

  // Action: Reject Vehicle
  const handleRejectVehicle = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Required Field', 'Please enter a rejection reason.');
      return;
    }
    try {
      await adminService.rejectVehicle(id, rejectionReason);
      toast.success('Listing Rejected', 'Listing request was declined and owner was notified.');
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected', approvalStatus: 'rejected', approvalNote: rejectionReason } : v));
      setSelectedVehicle(null);
      setRejectionReason('');
      setLogs(prev => [
        { id: String(prev.length + 1), action: 'VEHICLE_REJECT', admin: user?.displayName || 'Admin', target: `Vehicle ID ${id.substring(0,8)}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'VEHICLE' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Operation Failed', 'Could not decline vehicle.');
    }
  };

  // Action: Review user document (KYC)
  const handleReviewUserKyc = async (userId: string, approved: boolean, docId: string) => {
    try {
      if (approved) {
        await adminService.approveUserKyc(userId);
      } else {
        await adminService.rejectUserKyc(userId, rejectionReason || 'Documents rejected by administrator');
      }
      toast.success(approved ? 'KYC Approved' : 'KYC Declined', `Verification status for user has been successfully synchronized.`);
      const updatedUserMapper = (u: any) => u.id === userId ? { 
        ...u, 
        verified: approved, 
        kycVerified: approved,
        kycStatus: approved ? 'VERIFIED' : 'REJECTED',
        driverLicenseStatus: approved ? 'VERIFIED' : 'REJECTED'
      } : u;
      setUsers(prev => prev.map(updatedUserMapper));
      setKycUsers(prev => prev.map(updatedUserMapper));
      setSelectedKycUser(null);
      setRejectionReason('');
      setLogs(prev => [
        { id: String(prev.length + 1), action: approved ? 'USER_KYC_APPROVE' : 'USER_KYC_DECLINE', admin: user?.displayName || 'Admin', target: `User ID ${userId.substring(0,8)}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'KYC' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('KYC Update Failed', 'Failed to update user identity status.');
    }
  };

  // Action: Toggle User active/suspend status
  const handleToggleUserStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      const u = users.find(usr => usr.id === userId);
      const isVerified = u?.verified || false;
      const isKycVerified = u?.kycVerified || false;
      await adminService.updateUserStatus(userId, {
        active: !isCurrentlyActive,
        verified: isVerified,
        kycVerified: isKycVerified
      });
      toast.success(
        isCurrentlyActive ? 'User Suspended' : 'User Activated',
        `User status has been successfully updated.`
      );
      const updatedActiveMapper = (usr: any) => usr.id === userId ? { ...usr, active: !isCurrentlyActive } : usr;
      setUsers(prev => prev.map(updatedActiveMapper));
      setKycUsers(prev => prev.map(updatedActiveMapper));
      setLogs(prev => [
        { id: String(prev.length + 1), action: isCurrentlyActive ? 'USER_SUSPEND' : 'USER_ACTIVATE', admin: user?.displayName || 'Admin', target: `User ID ${userId.substring(0, 8)}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'USER' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Operation Failed', 'Failed to update user status.');
    }
  };

  // Action: Resolve dispute
  const handleResolveDispute = async (disputeId: number, status: 'RESOLVED' | 'REJECTED') => {
    if (!disputeDecision.trim()) {
      toast.error('Required Field', 'Please provide an administrative decision summary.');
      return;
    }
    try {
      await adminService.updateDisputeStatus(disputeId, status, disputeDecision);
      toast.success('Dispute Resolved', 'Dispute ledger was finalized.');
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status, adminDecision: disputeDecision } : d));
      setSelectedDispute(null);
      setDisputeDecision('');
      setLogs(prev => [
        { id: String(prev.length + 1), action: 'DISPUTE_FINALIZED', admin: user?.displayName || 'Admin', target: `Dispute #${disputeId}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'DISPUTE' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Update Failed', 'Failed to submit dispute decision.');
    }
  };

  // Action: Force Refund
  const handleForceRefund = async (paymentId: string, amount: number) => {
    try {
      await paymentService.refund(paymentId, amount);
      toast.success('Refund Issued', 'Payment transaction was reversed and renter credited.');
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded', refundAmount: amount } : p));
      setSelectedBooking(null);
      setLogs(prev => [
        { id: String(prev.length + 1), action: 'PAYMENT_FORCE_REFUND', admin: user?.displayName || 'Admin', target: `Payment ID ${paymentId.substring(0,8)}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'PAYMENT' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Refund Failed', 'Could not process transaction refund.');
    }
  };

  // Action: Update System Settings
  const handleUpdateSetting = async (key: string, val: string) => {
    try {
      await adminService.updateSetting(key, val);
      toast.success('Setting Saved', `Platform variable ${key.replace(/_/g, ' ')} was synchronized.`);
      setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: val } : s));
      setLogs(prev => [
        { id: String(prev.length + 1), action: 'SETTING_UPDATE', admin: user?.displayName || 'Admin', target: key, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'SETTING' },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Update Failed', 'Could not update system parameter.');
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    try {
      setLoading(true);
      await bookingService.verifyPayment(bookingId);
      toast.success(t.adminDashboard.paymentApproved, t.adminDashboard.paymentApprovedDesc);
      const updatedBookings = await adminService.listAllBookings(undefined, 0, 100);
      if (updatedBookings) setBookings(updatedBookings.content || []);
      setVerifyingBooking(null);
    } catch (err: any) {
      toast.error(t.adminDashboard.verificationFailed, err.message || 'Error executing request.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async (bookingId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error(t.adminDashboard.rejectionReasonRequired, t.adminDashboard.rejectionReasonRequired);
      return;
    }
    try {
      setLoading(true);
      await bookingService.rejectPayment(bookingId, reason);
      toast.success(t.adminDashboard.paymentRejected, t.adminDashboard.paymentRejectedDesc);
      const updatedBookings = await adminService.listAllBookings(undefined, 0, 100);
      if (updatedBookings) setBookings(updatedBookings.content || []);
      setVerifyingBooking(null);
      setPaymentRejectionReason('');
    } catch (err: any) {
      toast.error(t.adminDashboard.rejectionFailed, err.message || 'Error executing request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await paymentService.updatePaymentSettings(adminPaymentSettings);
      toast.success(t.adminDashboard.settingsSaved, t.adminDashboard.settingsSavedDesc);
    } catch (err: any) {
      toast.error(t.adminDashboard.saveFailed, err.message || 'Error executing request.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPaymentsCSV = () => {
    const activeQueueBookings = bookings.filter(b => {
      const matchSearch = 
        (b.bookingCode && b.bookingCode.toLowerCase().includes(paymentSearch.toLowerCase())) ||
        (b.renter?.displayName && b.renter.displayName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
        (b.renter?.email && b.renter.email.toLowerCase().includes(paymentSearch.toLowerCase())) ||
        (b.id && b.id.toLowerCase().includes(paymentSearch.toLowerCase()));

      if (!matchSearch) return false;

      const statusLower = b.status?.toLowerCase();
      if (paymentQueue === 'PENDING') return statusLower === 'payment_pending';
      if (paymentQueue === 'APPROVED') return ['confirmed', 'payment_verified', 'owner_approved'].includes(statusLower);
      if (paymentQueue === 'REJECTED') return statusLower === 'payment_rejected';
      if (paymentQueue === 'EXPIRED') return statusLower === 'payment_expired';
      return false;
    });

    let csv = 'Booking Code,Renter Name,Email,Amount,Status,Created At\n';
    activeQueueBookings.forEach(b => {
      csv += `"${b.bookingCode || ''}","${b.renter?.displayName || ''}","${b.renter?.email || ''}","${b.pricing?.total || 0}","${b.status || ''}","${b.createdAt || ''}"\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `luxeway_payment_verifications_${paymentQueue.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(t.adminDashboard.csvExported);
  };

  // Action: Handle custom broadcasts
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      toast.error('Missing fields', 'Broadcast announcement title and body are required.');
      return;
    }
    const newBroadcast = {
      id: String(broadcasts.length + 1),
      title: announcementTitle,
      body: announcementBody,
      segment: targetSegment,
      channel: notifyChannel,
      sentCount: targetSegment === 'all' ? 1720 : targetSegment === 'owners' ? 180 : 1540,
      openRate: '0.0%',
      clickRate: '0.0%',
      status: 'SENT',
      time: new Date().toISOString()
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    setAnnouncementTitle('');
    setAnnouncementBody('');
    toast.success('Broadcast Dispatched', `Broadcast notification successfully sent to segment: ${targetSegment.toUpperCase()}`);
    setLogs(prev => [
      { id: String(prev.length + 1), action: 'SYSTEM_BROADCAST', admin: user?.displayName || 'Admin', target: announcementTitle, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'SETTING' },
      ...prev
    ]);
  };

  // Action: Trigger fraud operations
  const handleFraudAction = (fraudId: string, actionType: string) => {
    setFraudAlerts(prev => prev.map(f => f.id === fraudId ? { ...f, status: 'actions_taken' } : f));
    toast.success('Fraud Protocol Dispatched', `Action: ${actionType} triggered for alert reference: ${fraudId}.`);
    setLogs(prev => [
      { id: String(prev.length + 1), action: `FRAUD_${actionType.toUpperCase()}`, admin: user?.displayName || 'Admin', target: `Alert ${fraudId}`, status: 'SUCCESS', time: new Date().toISOString(), ip: '127.0.0.1', type: 'USER' },
      ...prev
    ]);
  };

  // Action: Analytics Exporters Simulation
  const handleExportData = (format: 'CSV' | 'Excel' | 'PDF') => {
    toast.info('Generating Export', `Preparing data structures for LuxeWay BI ${format} export...`);
    setTimeout(() => {
      // Simulate file download trigger
      const element = document.createElement("a");
      const file = new Blob([`LuxeWay Marketplace BI Report - Generated At ${new Date().toLocaleString()}\nGBV: ${formatCurrency(totalGBV)}\nPlatform Revenue: ${formatCurrency(platformRevenue)}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `luxeway_bi_report_${new Date().toISOString().slice(0,10)}.${format.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Download Complete', `${format} file was successfully exported and stored.`);
    }, 1500);
  };

  const handleLogout = () => {
    // Custom slide-out confirmation instead of browser confirmation
    toast.info('Sign Out Triggered', 'Session terminating.');
    logout();
    navigate('/auth/login');
  };

  // Derived calculations
  const totalGBV = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
  const platformRevenue = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => sum + (b.pricing?.platformFee || (b.pricing?.total * 0.12) || 0), 0);
  const ownerPayouts = totalGBV - platformRevenue;
  const activeListingsCount = vehicles.filter(v => normalizeStatus(v.status) === 'AVAILABLE').length;
  const pendingApprovalsCount = vehicles.filter(isPendingVehicleApproval).length;
  const pendingKycCount = kycUsers.filter(u => {
    const kycStatus = String(u.kycStatus || '').toUpperCase();
    const driverLicenseStatus = String(u.driverLicenseStatus || '').toUpperCase();
    return ['PENDING', 'PENDING_APPROVAL'].includes(kycStatus) || ['PENDING', 'PENDING_APPROVAL'].includes(driverLicenseStatus);
  }).length;
  const openDisputesCount = disputes.filter(d => d.status === 'PENDING').length;
  const failedPaymentsCount = payments.filter(p => p.status === 'failed').length;
  const activeFraudAlertsCount = fraudAlerts.filter(f => f.status === 'pending').length;

  const menuItems = [
    { id: 'overview', label: t.adminDashboard.overview, icon: BarChart2, badge: 0 },
    { id: 'users', label: t.adminDashboard.users, icon: Users, badge: 0 },
    { id: 'vehicles', label: t.adminDashboard.vehicles, icon: Car, badge: pendingApprovalsCount },
    { id: 'owner-applications', label: t.adminDashboard.ownerApplications, icon: Building, badge: ownerApps.filter(a => a.status === 'SUBMITTED').length },
    { id: 'kyc', label: t.adminDashboard.kyc, icon: Shield, badge: pendingKycCount },
    { id: 'bookings', label: t.adminDashboard.bookings, icon: Calendar, badge: 0 },
    { id: 'payments', label: t.adminDashboard.payments, icon: DollarSign, badge: failedPaymentsCount },
    { id: 'payouts', label: t.adminDashboard.payouts, icon: Wallet, badge: 0 },
    { id: 'disputes', label: t.adminDashboard.disputes, icon: Scale, badge: openDisputesCount },
    { id: 'fraud', label: t.adminDashboard.fraud, icon: ShieldAlert, badge: activeFraudAlertsCount },
    { id: 'analytics', label: t.adminDashboard.analytics, icon: TrendingUp, badge: 0 },
    { id: 'logs', label: t.adminDashboard.logs, icon: FileText, badge: 0 },
    { id: 'health', label: t.adminDashboard.health, icon: Activity, badge: 0 },
  ] as const;

  // Search filter calculations
  const filteredUsers = users;
  const filteredVehicles = vehicles;
  const filteredBookings = bookings.filter(b => b.id?.toLowerCase().includes(bookingSearch.toLowerCase()) || b.renter?.displayName?.toLowerCase().includes(bookingSearch.toLowerCase()));
  const filteredPayments = payments.filter(p => p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase()) || p.id?.toLowerCase().includes(paymentSearch.toLowerCase()));

  // Filtered timeline logs
  const filteredLogs = logs.filter(log => {
    const logType = log.type as keyof typeof logFilters;
    return logFilters[logType] !== false;
  });

  // Chart Mappings - sử dụng mock data vì analyticsHistory chưa được fetch
  const chartRevenueData = [
    { date: 'Jan', Revenue: 12500000, Bookings: 8, Growth: 3 },
    { date: 'Feb', Revenue: 18200000, Bookings: 12, Growth: 5 },
    { date: 'Mar', Revenue: 15800000, Bookings: 10, Growth: 4 },
    { date: 'Apr', Revenue: 22400000, Bookings: 16, Growth: 7 },
    { date: 'May', Revenue: 19500000, Bookings: 14, Growth: 6 },
    { date: 'Jun', Revenue: 27800000, Bookings: 20, Growth: 9 },
    { date: 'Jul', Revenue: 31200000, Bookings: 23, Growth: 11 },
    { date: 'Aug', Revenue: 28600000, Bookings: 21, Growth: 10 },
    { date: 'Sep', Revenue: 35400000, Bookings: 27, Growth: 13 },
  ];

  const categoryDistributionData = [
    { name: 'Supercar', value: vehicles.filter(v => v.category?.toLowerCase() === 'supercar').length || 10 },
    { name: 'Luxury SUV', value: vehicles.filter(v => v.category?.toLowerCase() === 'suv').length || 15 },
    { name: 'Convertible', value: vehicles.filter(v => v.category?.toLowerCase() === 'convertible').length || 8 },
    { name: 'Classic', value: vehicles.filter(v => v.category?.toLowerCase() === 'classic').length || 5 },
    { name: 'Electric', value: vehicles.filter(v => v.category?.toLowerCase() === 'electric').length || 12 },
  ];

  const ecosystemDistributionData = [
    { name: lang === 'vi' ? 'Ô Tô (Cars)' : lang === 'ja' ? '乗用車 (Cars)' : lang === 'ko' ? '승용차 (Cars)' : lang === 'zh' ? '轿车 (Cars)' : 'Cars', value: vehicles.filter(v => v.vehicleType === 'car' || v.vehicleType === 'CAR' || (!v.vehicleType && v.category?.toLowerCase() !== 'motorbike')).length || 20 },
    { name: lang === 'vi' ? 'Xe Máy (Motorbikes)' : lang === 'ja' ? 'バイク (Motorbikes)' : lang === 'ko' ? '오토バイ (Motorbikes)' : lang === 'zh' ? '摩托车 (Motorbikes)' : 'Motorbikes', value: vehicles.filter(v => v.vehicleType === 'motorbike' || v.vehicleType === 'MOTORBIKE').length || 15 }
  ];  return (
    <div className="theme-admin min-h-screen transition-colors duration-300 bg-[var(--lw-bg-primary)] text-[var(--lw-text-primary)]">
      <div className={cn("lw-flex-layout", desktopSidebarCollapsed && "sidebar-collapsed")} style={{ display: 'flex' }}>
        
        {/* ============ SIDEBAR ============ */}
        <aside className="lw-sidebar hidden lg:flex bg-[var(--lw-sidebar-bg)] border-r border-[var(--lw-border)]">
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Header section with brand logo and toggle button */}
            <div className="px-5 py-4 border-b border-[var(--lw-border)] flex items-center justify-between gap-2 h-16">
              {!desktopSidebarCollapsed ? (
                <>
                  <motion.span
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    animate={{ opacity: 1, letterSpacing: '0.25em' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="font-black text-[10px] text-[var(--lw-accent)] uppercase select-none"
                  >
                    LUXEWAY
                  </motion.span>
                  <button
                    onClick={() => setDesktopSidebarCollapsed(true)}
                    className="p-1.5 rounded-lg border border-[var(--lw-border)] hover:bg-[var(--lw-bg-secondary)] text-[var(--lw-text-secondary)] transition-all flex-shrink-0"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDesktopSidebarCollapsed(false)}
                  className="mx-auto p-1.5 rounded-lg border border-[var(--lw-border)] hover:bg-[var(--lw-bg-secondary)] text-[var(--lw-text-secondary)] transition-all flex items-center justify-center"
                  title="Expand Sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role Badge, hidden when collapsed */}
            {!desktopSidebarCollapsed && (
              <div className="px-5 py-3">
                <div className="lw-sidebar-role-badge bg-rose-500/10 text-rose-600 border border-rose-500/20 m-0 w-full flex items-center justify-center py-2.5">
                  ✨ ADMIN
                </div>
              </div>
            )}

            {/* Sidebar Navigation items */}
            <div className="lw-sidebar-nav space-y-0.5">
              <Link
                to="/"
                title={desktopSidebarCollapsed ? t.adminDashboard.goHome : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group lw-sidebar-nav-item text-[var(--lw-text-secondary)] hover:bg-[var(--lw-bg-card-hover)] hover:text-[var(--lw-text-primary)]",
                  desktopSidebarCollapsed && "justify-center px-0 py-2.5"
                )}
              >
                <Globe className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                <span>{t.adminDashboard.goHome}</span>
              </Link>
              {menuItems.map(tab => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setMobileMenuOpen(false); }}
                    title={desktopSidebarCollapsed ? tab.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group lw-sidebar-nav-item",
                      active && "active"
                    )}
                  >
                    <TabIcon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && !desktopSidebarCollapsed && (
                      <span className="ml-auto bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Status Bottom Widget */}
          <div className="lw-sidebar-footer">
            {desktopSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-3 p-2 rounded-2xl border border-[var(--lw-border)] bg-[var(--lw-bg-secondary)] shadow-inner">
                <Avatar src={user?.avatar} name={user?.displayName || 'Test Admin'} size="md" className="flex-shrink-0" />
                <button onClick={handleLogout} className="p-2 text-slate-455 hover:text-red-500 transition-colors flex-shrink-0" title={t.adminDashboard.signOut}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--lw-border)] bg-[var(--lw-bg-secondary)] shadow-inner">
                <Avatar src={user?.avatar} name={user?.displayName || 'Test Admin'} size="md" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate text-[var(--lw-text-primary)]">{user?.displayName || 'Test Admin'}</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-rose-500 mt-0.5">{t.adminDashboard.superAdmin}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-455 hover:text-red-500 transition-colors flex-shrink-0" title={t.adminDashboard.signOut}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ============ MAIN VIEWPORT CONTENT ============ */}
        {/* ── MAIN CONTENT ─────────────────────────────────────────────
             Responsive flex layout container starting below top navbar (64px offset)
        ──────────────────────────────────────────────────────────── */}
        <div
          style={{ paddingTop: '64px' }}
          className="lw-flex-main-container"
        >
          
          {/* Dashboard Header Bar */}
          <header className="p-6 border-b border-[var(--lw-border)] flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 bg-[var(--lw-bg-card)]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-3 border rounded-2xl bg-[var(--lw-bg-secondary)] border-[var(--lw-border)] text-[var(--lw-text-primary)] lg:hidden hover-lift shadow-sm hover:bg-[var(--lw-bg-card-hover)]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
 
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-black text-lg tracking-tight text-[var(--lw-text-primary)]">
                    {t.adminDashboard.title}
                  </h1>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                    {t.adminDashboard.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Time / System status alerts */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div className="hidden md:flex items-center gap-2.5 px-4.5 py-2.5 border rounded-2xl shadow-inner bg-[var(--lw-bg-secondary)] border-[var(--lw-border)] text-[var(--lw-text-secondary)]">
                <Clock className="w-4 h-4 text-indigo-550" />
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--lw-text-secondary)]">
                  {currentTime}
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4.5 py-2.5 border rounded-2xl shadow-inner bg-[var(--lw-bg-secondary)] border-[var(--lw-border)] text-[var(--lw-text-secondary)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
                  {t.adminDashboard.systemSecure}
                </span>
              </div>
              <button 
                onClick={loadDashboardData}
                className="p-2.5 border rounded-2xl transition-all duration-300 hover:rotate-180 hover-lift shadow-sm bg-[var(--lw-bg-card)] border-[var(--lw-border)] hover:bg-[var(--lw-bg-card-hover)] text-[var(--lw-text-primary)]"
                title={t.adminDashboard.syncData}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Mobile responsive navigation drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden rounded-[2rem] border p-5 shadow-2xl overflow-hidden flex flex-col gap-2.5 bg-[var(--lw-bg-card)] border-[var(--lw-border)]"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {menuItems.map(tab => {
                    const active = activeTab === tab.id;
                    const TabIcon = tab.icon;
                        return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                          active 
                            ? "bg-indigo-600 text-white shadow-lg" 
                            : "bg-[var(--lw-bg-secondary)] text-[var(--lw-text-primary)] border border-[var(--lw-border)]"
                        )}
                      >
                        <TabIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary View Router */}
          <main className="lw-main-content">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-36">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-600 animate-spin" />
                  <Loader2 className="w-6 h-6 animate-pulse text-indigo-500 absolute" />
                </div>
                <span className="text-slate-500 text-xs font-black tracking-widest uppercase mt-6 animate-pulse">
                  Syncing Marketplace Ledgers...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-500/5 border border-red-500/15 rounded-[2rem] p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
                    <AlertTriangle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-red-550 font-extrabold text-sm uppercase tracking-widest">Platform Sync Fault</div>
                    <div className="text-slate-500 text-xs mt-1 font-semibold">{error}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* ============ TABS: OVERVIEW ============ */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <Breadcrumbs 
                      title={t.adminDashboard.overview} 
                      items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: t.adminDashboard.overview }]} 
                    />
                    {/* Executive KPI Grid - Standardized to 8 Cards in a 4x2 desktop grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: { vi: 'Tổng Giá Trị Đặt Xe', ja: '総予約額 (GBV)', ko: '총 예약 금액', zh: '总预订额', fr: 'Valeur brute des réservations', de: 'Bruttobuchungswert', es: 'Valor bruto de reserva', en: 'Gross Booking Value' }[lang] || 'Gross Booking Value', value: formatCurrency(totalGBV), icon: DollarSign, change: { vi: '+14% tháng trước', ja: '前月比 +14%', ko: '지난달 대비 +14%', zh: '上月 +14%', fr: '+14% le mois dernier', de: '+14% im letzten Monat', es: '+14% el mes pasado', en: '+14% last month' }[lang] || '+14% last month', style: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' },
                        { label: { vi: 'Doanh Thu Nền Tảng', ja: 'プラットフォーム収益', ko: '플랫폼 수익', zh: '平台收益', fr: 'Revenu de la plateforme', de: 'Plattformeinnahmen', es: 'Ingresos de la plataforma', en: 'Platform Revenue' }[lang] || 'Platform Revenue', value: formatCurrency(platformRevenue), icon: Activity, change: { vi: 'Phí nền tảng 12%', ja: '手数料率 12%', ko: '수수료 기준 12%', zh: '12% 基础费率', fr: 'Frais de base 12%', de: '12% Gebührenbasis', es: '12% Base de tarifa', en: '12% Fee base' }[lang] || '12% Fee base', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
                        { label: { vi: 'Thanh Toán Cho Chủ Xe', ja: 'オーナーへの支払い', ko: '호스트 정산금', zh: '车主出金', fr: 'Paiements aux propriétaires', de: 'Eigentümer-Auszahlungen', es: 'Pagos a propietarios', en: 'Owner Payouts' }[lang] || 'Owner Payouts', value: formatCurrency(ownerPayouts), icon: Users, change: { vi: '88% tổng GBV', ja: '総GBVの 88%', ko: '총 GBV의 88%', zh: '占总 GBV 88%', fr: '88% du GBV total', de: '88% des gesamten GBV', es: '88% del GBV total', en: '88% of total GBV' }[lang] || '88% of total GBV', style: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
                        { label: { vi: 'Xe Đang Hoạt Động', ja: '有効な掲載車両', ko: '활성 등록 차량', zh: '上架车辆', fr: 'Annonces actives', de: 'Aktive Angebote', es: 'Anuncios activos', en: 'Active Listings' }[lang] || 'Active Listings', value: activeListingsCount, icon: Car, change: { vi: 'Xe đã duyệt', ja: '承認済み車両', ko: '승인된 차량', zh: '已批准车辆', fr: 'Véhicules approuvés', de: 'Genehmigte Fahrzeuge', es: 'Vehículos aprobados', en: 'Approved vehicles' }[lang] || 'Approved vehicles', style: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
                        { label: { vi: 'Xe Chờ Duyệt', ja: '承認待ちの車両', ko: '승인 대기 차량', zh: '待审核车辆', fr: 'Annonces en attente', de: 'Ausstehende Angebote', es: 'Anuncios pendientes', en: 'Pending Listings' }[lang] || 'Pending Listings', value: pendingApprovalsCount, icon: AlertTriangle, change: { vi: 'Cần kiểm duyệt', ja: 'レビューが必要', ko: '검토 필요', zh: '需要审核', fr: 'Exige un examen', de: 'Überprüfung erforderlich', es: 'Requiere revisión', en: 'Requires review' }[lang] || 'Requires review', style: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
                        { label: { vi: 'Hồ Sơ KYC Chờ Duyệt', ja: 'KYC確認待ち', ko: 'KYC 검토 대기', zh: 'KYC 待审核', fr: 'Examens KYC en attente', de: 'Ausstehende KYC-Prüfungen', es: 'Revisiones KYC pendientes', en: 'Pending KYC Reviews' }[lang] || 'Pending KYC Reviews', value: pendingKycCount, icon: Shield, change: { vi: 'Xác thực danh tính', ja: '本人確認', ko: '신원 인증', zh: '身份验证', fr: 'Vérification d\'identité', de: 'Identitätsprüfung', es: 'Verificación de identidad', en: 'Identity verification' }[lang] || 'Identity verification', style: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' },
                        { label: { vi: 'Tranh Chấp Đang Mở', ja: '未解決の紛争', ko: '진행 중인 분쟁', zh: '待处理争议', fr: 'Litiges ouverts', de: 'Offene Streitfälle', es: 'Disputas abiertas', en: 'Open Disputes' }[lang] || 'Open Disputes', value: openDisputesCount, icon: Scale, change: { vi: 'Vụ việc trọng tài', ja: '仲裁案件', ko: '중재 건', zh: '仲裁案件', fr: 'Affaires d\'arbitrage', de: 'Schlichtungsfälle', es: 'Casos de arbitraje', en: 'Arbitration cases' }[lang] || 'Arbitration cases', style: 'bg-red-500/10 border-red-500/20 text-red-500' },
                        { label: { vi: 'Cảnh Báo Gian Lận', ja: '不正アラート', ko: '사기 경고', zh: '欺诈警报', fr: 'Alertes de fraude', de: 'Betrugswarnungen', es: 'Alertas de fraude', en: 'Fraud Alerts' }[lang] || 'Fraud Alerts', value: activeFraudAlertsCount, icon: ShieldAlert, change: { vi: 'Chú ý khẩn cấp', ja: '要緊急対応', ko: '긴급 확인', zh: '高危关注', fr: 'Attention critique', de: 'Kritische Aufmerksamkeit', es: 'Atención crítica', en: 'Critical attention' }[lang] || 'Critical attention', style: 'bg-rose-500/10 border-rose-500/20 text-rose-500' },
                      ].map(kpi => (
                        <div key={kpi.label} className="rounded-3xl border border-[var(--lw-border)] bg-[var(--lw-bg-card)] p-5 shadow-sm lw-card-interactive relative overflow-hidden">
                          <div className="flex justify-between items-center mb-4">
                            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", kpi.style)}>
                              <kpi.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-slate-500/5 px-2.5 py-1 rounded-lg border border-[var(--lw-border)] text-slate-500">
                              {kpi.change}
                            </span>
                          </div>
                          <p className="text-2xl font-black mb-1 tracking-tight text-[var(--lw-text-primary)]">
                            {kpi.value}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--lw-text-muted)]">
                            {kpi.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Operational Status Chart & Alerts */}
                    {/* Full-width Marketplace Volume Trends Chart */}
                    <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-[2rem] p-6 shadow-xl">
                      <div className="flex justify-between items-center mb-5 border-b border-[var(--lw-border)] pb-4">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--lw-text-secondary)]">
                          {{ vi: 'Xu hướng doanh số nền tảng', ja: 'プラットフォーム取引量の動向', ko: '마켓플레이스 거래량 추이', zh: '平台交易量趋势', fr: 'Tendances du volume du marché', de: 'Marktplatz-Volumentrends', es: 'Tendencias de volumen del mercado', en: 'Marketplace Volume Trends' }[lang] || 'Marketplace Volume Trends'}
                        </h3>
                        <span className="text-[8px] font-black text-[var(--lw-accent)] bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                          {{ vi: 'Dòng doanh thu hàng ngày', ja: '日次収益ストリーム', ko: '일일 수익 스트림', zh: '每日收益流', fr: 'Flux de revenus quotidien', de: 'Täglicher Einnahmenstrom', es: 'Flujo de ingresos diario', en: 'Daily Revenue Stream' }[lang] || 'Daily Revenue Stream'}
                        </span>
                      </div>
                      <div className="w-full" style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="opRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="transparent" />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="transparent" tickFormatter={(v) => `₫${(v/1000000).toFixed(0)}M`} />
                            <Tooltip content={<AdminCustomTooltip />} />
                            <Area type="monotone" dataKey="Revenue" stroke="#6366F1" fill="url(#opRevenueGrad)" strokeWidth={2.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-3 border rounded-[2rem] p-6 shadow-2xl bg-[var(--lw-bg-card)] border-[var(--lw-border)] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-5 border-b border-[var(--lw-border)] pb-4">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-450">
                              {{ vi: 'Phân bổ đội xe', ja: 'フリート構成割合', ko: '보유 차량 구성', zh: '车队分布', fr: 'Répartition de la flotte', de: 'Flottenaufteilung', es: 'Distribución de la flota', en: 'Fleet Split' }[lang] || 'Fleet Split'}
                            </h3>
                            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                              <button 
                                onClick={() => setFleetSplitType('ecosystem')}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                  fleetSplitType === 'ecosystem' 
                                    ? "bg-white shadow text-indigo-500 animate-fade-in" 
                                    : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                {{ vi: 'Phân Loại', ja: 'タイプ別', ko: '유형별', zh: '按类型', fr: 'Par type', de: 'Nach Typ', es: 'Por tipo', en: 'By Type' }[lang] || 'Phân Loại'}
                              </button>
                              <button 
                                onClick={() => setFleetSplitType('category')}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                  fleetSplitType === 'category' 
                                    ? "bg-white shadow text-indigo-500 animate-fade-in" 
                                    : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                {{ vi: 'Phân Khúc', ja: 'カテゴリー別', ko: '범주별', zh: '按级别', fr: 'Par catégorie', de: 'Nach Kategorie', es: 'Por categoría', en: 'By Category' }[lang] || 'Phân Khúc'}
                              </button>
                            </div>
                          </div>
                          <div className="h-44 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={fleetSplitType === 'ecosystem' ? ecosystemDistributionData : categoryDistributionData} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={58} 
                                  outerRadius={78} 
                                  dataKey="value" 
                                  paddingAngle={5}
                                >
                                  {(fleetSplitType === 'ecosystem' ? ecosystemDistributionData : categoryDistributionData).map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                                {{ vi: 'Phương tiện', ja: '車両', ko: '차량', zh: '车辆', fr: 'Véhicules', de: 'Fahrzeuge', es: 'Vehículos', en: 'Vehicles' }[lang] || 'Vehicles'}
                              </span>
                              <span className="text-2xl font-black mt-0.5 text-[var(--lw-text-primary)]">{vehicles.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 px-2">
                          {(fleetSplitType === 'ecosystem' ? ecosystemDistributionData : categoryDistributionData).map((item, i) => (
                            <div key={item.name} className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="truncate">{item.name} ({item.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* ============ TABS: MARKETPLACE COMMAND ============ */}
              {activeTab === 'marketplace' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={t.adminDashboard.marketplace} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: t.adminDashboard.marketplace }]} 
                  />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Active Trips', value: bookings.filter(b => b.status === 'active').length, icon: Calendar, style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                      { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                      { label: 'Completed Bookings', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
                      { label: 'Cancelled Bookings', value: bookings.filter(b => b.status === 'cancelled').length, icon: XCircle, style: 'bg-red-500/10 text-red-500 border-red-500/20' },
                    ].map(card => (
                      <div key={card.label} className={cn(
                        "rounded-3xl border p-5 shadow-sm relative overflow-hidden",
                        isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/50"
                      )}>
                        <div className="flex items-center gap-3.5">
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", card.style)}>
                            <card.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-850")}>{card.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">{card.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Split Command View */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performing Owners */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-5 border-b dark:border-slate-800 pb-4">Top Fleet Partners</h3>
                      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 sidebar-scroll">
                        {users.filter(u => u.role === 'owner').slice(0, 5).map((partner, idx) => (
                          <div key={partner.id} className={cn(
                            "flex items-center gap-4 p-3.5 border rounded-2xl transition-all duration-300",
                            isDark ? "bg-slate-950/30 border-slate-850" : "bg-slate-50 border-slate-200"
                          )}>
                            <div className="text-xs font-black text-slate-400 dark:text-slate-500 w-5">#0{idx+1}</div>
                            <Avatar src={partner.avatar} name={partner.displayName || 'Owner'} size="md" className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-black truncate", isDark ? "text-slate-200" : "text-slate-800")}>{partner.displayName}</p>
                              <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{partner.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-indigo-505">⭐ {partner.rating?.toFixed(1) || '5.0'}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{partner.totalReviews || 0} reviews</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Most Booked Vehicles */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-5 border-b dark:border-slate-800 pb-4">Most Rented Fleet</h3>
                      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 sidebar-scroll">
                        {vehicles.slice(0, 5).map((vehicle, idx) => (
                          <div key={vehicle.id} className={cn(
                            "flex items-center gap-4 p-3.5 border rounded-2xl transition-all duration-300",
                            isDark ? "bg-slate-950/30 border-slate-850" : "bg-slate-50 border-slate-200"
                          )}>
                            <div className="text-xs font-black text-slate-400 dark:text-slate-500 w-5">#0{idx+1}</div>
                            <img src={vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&fit=crop'} className="w-14 h-10 rounded-xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-black truncate", isDark ? "text-slate-200" : "text-slate-800")}>{vehicle.name}</p>
                              <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{vehicle.brand} · <span className="text-emerald-500 font-extrabold">{formatCurrency(vehicle.pricePerDay)}</span>/day</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-indigo-505">🏎️ {vehicle.totalBookings || idx * 4 + 2} trips</p>
                              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 text-emerald-555 bg-emerald-500/5 px-2 py-0.5 rounded-lg mt-1">AVAILABLE</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: VEHICLE APPROVALS ============ */}
              {activeTab === 'vehicles' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={t.adminDashboard.vehicles} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: t.adminDashboard.vehicles }]} 
                  />
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.adminDashboard.vehiclesDesc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={vehicleStatusFilter}
                        onChange={e => setVehicleStatusFilter(e.target.value)}
                        className={cn(
                          "px-4 py-3 border rounded-xl text-xs outline-none transition-all duration-300",
                          isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                        )}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="REJECTED">Rejected</option>
                      </select>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          placeholder="Search model or brand..."
                          value={vehicleSearch}
                          onChange={e => setVehicleSearch(e.target.value)}
                          className={cn(
                            "pl-11 pr-5 py-3 border rounded-xl text-xs placeholder:text-slate-450 outline-none w-72 transition-all duration-300",
                            isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Vehicle Model', 'Brand Info', 'Daily Cost Rate', 'Year Model', 'Registration Status', 'Rating Grade'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {filteredVehicles.length === 0 ? (
                          <tr><td colSpan={6} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">No matching fleet vehicles detected.</td></tr>
                        ) : (
                          filteredVehicles.map(v => (
                            <tr 
                              key={v.id} 
                              onClick={() => setSelectedVehicle(v)}
                              className={cn(
                                "transition-all duration-200 cursor-pointer",
                                selectedVehicle?.id === v.id ? (isDark ? "bg-indigo-500/10" : "bg-indigo-50") : (isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")
                              )}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3.5">
                                  <img src={v.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&fit=crop'} className="w-12 h-9 rounded-lg object-cover border dark:border-white/5 shadow-inner" alt="" />
                                  <span className={cn("text-xs font-black uppercase tracking-wider", isDark ? "text-slate-200" : "text-slate-800")}>{v.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-400">{v.brand}</td>
                              <td className="px-6 py-4 text-xs font-black text-emerald-500">{formatCurrency(v.pricePerDay)}</td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-400">{v.year || 2024}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={v.approvalStatus || v.status} label={formatStatusLabel(v.approvalStatus || v.status)} />
                              </td>
                              <td className="px-6 py-4 text-xs font-black text-amber-500">⭐ {v.rating?.toFixed(1) || '5.0'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ TABS: OWNER APPLICATIONS ============ */}
              {activeTab === 'owner-applications' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-amber-500" /> {t.adminDashboard.ownerApplications}
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">{t.adminDashboard.ownerApplicationsDesc}</p>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={ownerAppsStatusFilter}
                        onChange={(e) => setOwnerAppsStatusFilter(e.target.value)}
                        className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="SUBMITTED">Pending Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    {loadingOwnerApps ? (
                      <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                        <p>Loading applications...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {ownerApps.length === 0 ? (
                          <div className="p-12 text-center text-slate-500">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                            <p className="font-semibold text-lg">No pending applications</p>
                          </div>
                        ) : (
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                              <tr>
                                <th className="p-4">Applicant</th>
                                <th className="p-4">Service Area</th>
                                <th className="p-4">Submitted At</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {ownerApps.map((app: any) => (
                                <tr key={app.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/30 transition-colors">
                                  <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                                    <div className="text-xs text-slate-500">{app.displayName}</div>
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400">{app.serviceArea}</td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400">{formatDate(app.submittedAt)}</td>
                                  <td className="p-4">
                                    <StatusBadge status={app.status === 'APPROVED' ? 'active' : app.status === 'SUBMITTED' ? 'pending' : 'inactive'} label={formatStatusLabel(app.status)} />
                                  </td>
                                  <td className="p-4 text-right">
                                    <button 
                                      onClick={() => setSelectedOwnerApp(app)}
                                      className="btn-glass text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 ml-auto"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Review
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============ TABS: KYC REVIEWS ============ */}
              {activeTab === 'kyc' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="KYC Verification Hub" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: "KYC" }]} 
                  />
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Review guest identity passports, national IDs, and driver licenses</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={kycStatusFilter}
                        onChange={e => setKycStatusFilter(e.target.value)}
                        className={cn(
                          "px-4 py-3 border rounded-xl text-xs outline-none transition-all duration-300",
                          isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                        )}
                      >
                        <option value="ALL">All KYC Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                      </select>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          placeholder="Search guest by name/email..."
                          value={kycSearch}
                          onChange={e => setKycSearch(e.target.value)}
                          className={cn(
                            "pl-11 pr-5 py-3 border rounded-xl text-xs placeholder:text-slate-450 outline-none w-72 transition-all duration-300",
                            isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Renter Guest', 'Email Address', 'Verification Status', 'Identity Score'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {kycUsers.length === 0 ? (
                          <tr><td colSpan={4} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">No pending verification items.</td></tr>
                        ) : (
                          kycUsers.map(u => (
                            <tr 
                              key={u.id} 
                              onClick={() => setSelectedKycUser(u)}
                              className={cn(
                                "transition-all duration-200 cursor-pointer",
                                selectedKycUser?.id === u.id ? (isDark ? "bg-indigo-500/10" : "bg-indigo-50") : (isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")
                              )}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3.5">
                                  <Avatar src={u.avatar} name={u.displayName || 'Customer'} size="sm" className="flex-shrink-0" />
                                  <span className={cn("text-xs font-black uppercase tracking-wider", isDark ? "text-slate-200" : "text-slate-800")}>{u.displayName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-400">{u.email}</td>
                              <td className="px-6 py-4">
                                <StatusBadge 
                                  status={(u.kycStatus === 'PENDING_APPROVAL' || u.kycStatus === 'PENDING' || !u.kycVerified) ? 'pending' : 'active'} 
                                  label={formatStatusLabel((u.kycStatus === 'PENDING_APPROVAL' || u.kycStatus === 'PENDING' || !u.kycVerified) ? 'pending' : 'verified')} 
                                />
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-black text-indigo-505">{u.kycVerified ? '96%' : '84%'} Confidence</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ TABS: BOOKINGS ============ */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={t.adminDashboard.bookings} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: t.adminDashboard.bookings }]} 
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.adminDashboard.bookingsDesc}</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          placeholder={t.adminDashboard.searchPlaceholder}
                        value={bookingSearch}
                        onChange={e => setBookingSearch(e.target.value)}
                        className={cn(
                          "pl-11 pr-5 py-3 border rounded-xl text-xs placeholder:text-slate-450 outline-none w-72 transition-all duration-300",
                          isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                        )}
                      />
                    </div>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                            {['Booking ID', 'Renter Guest', 'Owner Partner', 'Vehicle Reserved', 'Rental Dates', 'Charge Total', 'Status', 'Payments', 'Actions'].map(h => (
                              <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                          {filteredBookings.length === 0 ? (
                            <tr><td colSpan={9} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">No platform bookings matching search parameters.</td></tr>
                          ) : (
                            filteredBookings.map(b => (
                              <tr 
                                key={b.id} 
                                onClick={() => setSelectedBooking(b)}
                                className={cn("transition-colors duration-200 cursor-pointer", isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")}
                              >
                                <td className="py-4 px-6 font-mono text-xs font-black text-indigo-500">#{b.id.substring(0,8).toUpperCase()}</td>
                                <td className="py-4 px-6 text-xs font-bold text-slate-450 dark:text-slate-400">{b.renter?.displayName || 'Customer'}</td>
                                <td className="py-4 px-6 text-xs font-bold text-slate-450 dark:text-slate-400">{b.vehicle?.owner?.displayName || 'Partner'}</td>
                                <td className="py-4 px-6 text-xs font-bold text-slate-450 dark:text-slate-400">{b.vehicle?.name || 'Vehicle'}</td>
                                <td className="py-4 px-6 text-xs font-bold text-slate-450 dark:text-slate-500">{formatDate(b.startDate)} - {formatDate(b.endDate)}</td>
                                <td className="py-4 px-6 text-xs font-black text-emerald-500">{formatCurrency(b.pricing?.total)}</td>
                                <td className="py-4 px-6">
                                  <StatusBadge status={b.status} label={formatStatusLabel(b.status)} />
                                </td>
                                <td className="py-4 px-6">
                                  <StatusBadge status={b.paymentStatus === 'paid' ? 'active' : 'inactive'} label={formatStatusLabel(b.paymentStatus || 'unpaid')} />
                                </td>
                                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                  {b.status !== 'cancelled' && b.paymentStatus === 'paid' && (
                                    <button 
                                      onClick={() => handleForceRefund(b.id, b.pricing?.total)} 
                                      className="text-[8px] bg-red-500 hover:bg-red-650 text-white px-3 py-2 rounded-xl font-black uppercase tracking-widest transition-all hover-lift shadow-md shadow-red-500/10"
                                    >
                                      Force Refund
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: PAYMENTS ============ */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <Breadcrumbs
                    title={t.adminDashboard.paymentsTitle}
                    items={[{ label: 'LuxeWay', href: '/' }, { label: t.nav.admin }, { label: t.adminDashboard.paymentsTitle }]}
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t.adminDashboard.paymentsDesc}
                    </p>
                  </div>

                  {/* Operational Metrics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: t.adminDashboard.totalRevenue, value: formatCurrency(totalGBV), icon: DollarSign, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/20' },
                      { label: t.adminDashboard.pendingVerification, value: bookings.filter(b => b.status?.toLowerCase() === 'payment_pending').length, icon: Clock, color: 'text-amber-500 bg-amber-500/5 border-amber-500/20' },
                      { label: t.adminDashboard.approvedTransactions, value: bookings.filter(b => ['confirmed', 'payment_verified', 'owner_approved'].includes(b.status?.toLowerCase())).length, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' },
                      { label: t.adminDashboard.rejectedPayments, value: bookings.filter(b => b.status?.toLowerCase() === 'payment_rejected').length, icon: XCircle, color: 'text-rose-500 bg-rose-500/5 border-rose-500/20' },
                    ].map(card => (
                      <div key={card.label} className={cn(
                        "rounded-3xl border p-5 shadow-sm relative overflow-hidden",
                        isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/50"
                      )}>
                        <div className="flex items-center gap-3.5">
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", card.color)}>
                            <card.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-855")}>{card.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">{card.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Queues Tabs & Search filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                      {[
                        { id: 'PENDING', label: t.adminDashboard.statuses.pending, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                        { id: 'APPROVED', label: t.adminDashboard.statuses.approved, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                        { id: 'REJECTED', label: t.adminDashboard.statuses.rejected, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
                        { id: 'EXPIRED', label: t.adminDashboard.statuses.expired, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
                      ].map(q => (
                        <button
                          key={q.id}
                          onClick={() => setPaymentQueue(q.id as any)}
                          className={cn(
                            "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                            paymentQueue === q.id 
                              ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/15" 
                              : "text-slate-400 hover:text-foreground"
                          )}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          placeholder={t.adminDashboard.searchPlaceholder}
                          value={paymentSearch}
                          onChange={e => setPaymentSearch(e.target.value)}
                          className={cn(
                            "pl-11 pr-5 py-2.5 border rounded-xl text-xs outline-none w-64 transition-all",
                            isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                          )}
                        />
                      </div>
                      <button
                        onClick={handleExportPaymentsCSV}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider hover-lift text-indigo-400 hover:text-indigo-500 transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Verification Queue Table */}
                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                            {['Mã đặt xe (Memo)', 'Khách thuê', 'Số tiền cần chuyển', 'Trạng thái', 'Thời gian khởi tạo', 'Thao tác'].map(h => (
                              <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                          {bookings.filter(b => {
                            const matchSearch = 
                              (b.bookingCode && b.bookingCode.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                              (b.renter?.displayName && b.renter.displayName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                              (b.renter?.email && b.renter.email.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                              (b.id && b.id.toLowerCase().includes(paymentSearch.toLowerCase()));

                            if (!matchSearch) return false;

                            const statusLower = b.status?.toLowerCase();
                            if (paymentQueue === 'PENDING') return statusLower === 'payment_pending';
                            if (paymentQueue === 'APPROVED') return ['confirmed', 'payment_verified', 'owner_approved'].includes(statusLower);
                            if (paymentQueue === 'REJECTED') return statusLower === 'payment_rejected';
                            if (paymentQueue === 'EXPIRED') return statusLower === 'payment_expired';
                            return false;
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">
                                {t.adminDashboard.noTransactionsInQueue}
                              </td>
                            </tr>
                          ) : (
                            bookings.filter(b => {
                              const matchSearch = 
                                (b.bookingCode && b.bookingCode.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                                (b.renter?.displayName && b.renter.displayName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                                (b.renter?.email && b.renter.email.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                                (b.id && b.id.toLowerCase().includes(paymentSearch.toLowerCase()));

                              if (!matchSearch) return false;

                              const statusLower = b.status?.toLowerCase();
                              if (paymentQueue === 'PENDING') return statusLower === 'payment_pending';
                              if (paymentQueue === 'APPROVED') return ['confirmed', 'payment_verified', 'owner_approved'].includes(statusLower);
                              if (paymentQueue === 'REJECTED') return statusLower === 'payment_rejected';
                              if (paymentQueue === 'EXPIRED') return statusLower === 'payment_expired';
                              return false;
                            }).map(b => (
                              <tr 
                                key={b.id} 
                                onClick={() => setVerifyingBooking(b)}
                                className={cn("transition-colors duration-200 cursor-pointer", isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")}
                              >
                                <td className="py-4 px-6 font-mono text-xs font-black text-amber-500">{b.bookingCode || 'LXW-XX-XXXXXX'}</td>
                                <td className="py-4 px-6">
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-black block text-foreground uppercase">{b.renter?.displayName || 'Customer'}</span>
                                    <span className="text-[10px] text-slate-400 block">{b.renter?.email}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-xs font-black text-blue-500">{formatCurrency(b.pricing?.total || 0)}</td>
                                <td className="py-4 px-6">
                                  <StatusBadge status={b.status} label={formatStatusLabel(b.status)} />
                                </td>
                                <td className="py-4 px-6 text-xs font-medium text-slate-400">{formatDate(b.createdAt)}</td>
                                <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                                  <div className="flex gap-2">
                                    {paymentQueue === 'PENDING' && (
                                      <>
                                        <button 
                                          onClick={() => handleVerifyPayment(b.id)}
                                          className="text-[8px] bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all"
                                        >
                                          {t.adminDashboard.approveBtnLabel}
                                        </button>
                                        <button 
                                          onClick={() => setVerifyingBooking(b)}
                                          className="text-[8px] bg-red-500 hover:bg-red-650 text-white px-2.5 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all"
                                        >
                                          {t.adminDashboard.rejectBtnLabel}
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      onClick={() => setVerifyingBooking(b)}
                                      className="text-[8px] bg-slate-500/10 hover:bg-slate-500/20 border border-slate-200/20 dark:border-slate-800/20 text-foreground px-2.5 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all"
                                    >
                                      {t.adminDashboard.detailsLabel}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: DISPUTES HUB ============ */}
              {activeTab === 'payouts' && (
                <AdminPayoutsTab />
              )}

              {/* ============ TABS: DISPUTES HUB ============ */}
              {activeTab === 'disputes' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={{ vi: 'Phòng Giải Quyết Tranh Chấp', ja: '紛争解決ルーム', ko: '분쟁 해결 실', zh: '争议解决室', fr: 'Chambre de résolution des litiges', de: 'Streitbeilegungsraum', es: 'Sala de resolución de disputas', en: 'Dispute Resolution Room' }[lang] || 'Dispute Resolution Room'} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: { vi: 'Tranh Chấp', ja: '紛争', ko: '분쟁', zh: '争议', fr: 'Litiges', de: 'Streitfälle', es: 'Disputas', en: 'Disputes' }[lang] || 'Disputes' }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {{ vi: 'Xem xét bằng chứng từ khách hàng và giải quyết mâu thuẫn giao dịch', ja: '顧客の証拠書類を確認し、取引の競合を解決します', ko: '고객 증거 문서를 검토하고 거래 분쟁을 해결합니다', zh: '审查客户证据文件并解决交易冲突', en: 'Review customer evidence documents and resolve transaction conflicts' }[lang] || 'Review customer evidence documents and resolve transaction conflicts'}
                    </p>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Dispute ID', 'Booking Reference', 'Conflict Reason', 'Current State', 'Creation Date'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {disputes.length === 0 ? (
                          <tr><td colSpan={5} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">All disputes resolved successfully.</td></tr>
                        ) : (
                          disputes.map(d => (
                            <tr 
                              key={d.id} 
                              onClick={() => setSelectedDispute(d)}
                              className={cn(
                                "transition-all duration-200 cursor-pointer",
                                selectedDispute?.id === d.id ? (isDark ? "bg-indigo-500/10" : "bg-indigo-50") : (isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")
                              )}
                            >
                              <td className="px-6 py-4 font-mono text-xs font-bold text-slate-450 dark:text-indigo-400 font-black">#DISP-00{d.id}</td>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-slate-450">#{d.bookingId?.substring(0,8).toUpperCase() || 'LW-9324'}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-450 truncate max-w-[120px]">{d.reason}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={d.status === 'RESOLVED' ? 'active' : d.status === 'PENDING' ? 'pending' : 'inactive'} label={formatStatusLabel(d.status)} />
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-450">{formatDate(d.createdAt || new Date().toISOString())}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ TABS: USERS ============ */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={{ vi: 'Danh Mục Tài Khoản Nền Tảng', ja: 'プラットフォームアカウントディレクトリ', ko: '플랫폼 계정 디렉토리', zh: '平台账户目录', fr: 'Répertoire des comptes', de: 'Kontoverzeichnis', es: 'Directorio de cuentas', en: 'Platform Accounts Directory' }[lang] || 'Platform Accounts Directory'} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: { vi: 'Người Dùng', ja: 'ユーザー', ko: '사용자', zh: '用户', fr: 'Utilisateurs', de: 'Benutzer', es: 'Usuarios', en: 'Users' }[lang] || 'Users' }]} 
                  />
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {{ vi: 'Kiểm toán quyền truy cập người dùng, xác minh hồ sơ khách/chủ xe và quản lý nhật ký trạng thái', ja: 'ユーザーアクセスを監査し、顧客/オーナーのプロファイルを検証し、ステータスログを管理します', ko: '사용자 액세스를 감사하고, 고객/호스트 프로필을 검증하며, 상태 로그를 관리합니다', zh: '审计用户访问，验证客户/车主资料，并管理状态日志', en: 'Audit user access, verify customer/owner profiles, and manage status logs' }[lang] || 'Audit user access, verify customer/owner profiles, and manage status logs'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value)}
                        className={cn(
                          "px-4 py-3 border rounded-xl text-xs outline-none transition-all duration-300",
                          isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                        )}
                      >
                        <option value="ALL">{{ vi: 'Tất cả vai trò', ja: 'すべての役割', ko: '모든 역할', zh: '所有角色', en: 'All Roles' }[lang] || 'All Roles'}</option>
                        <option value="CUSTOMER">{{ vi: 'Khách thuê', ja: '顧客', ko: '고객', zh: '客户', en: 'Customer' }[lang] || 'Customer'}</option>
                        <option value="OWNER">{{ vi: 'Chủ xe', ja: 'オーナー', ko: '호스트', zh: '车主', en: 'Owner' }[lang] || 'Owner'}</option>
                        <option value="ADMIN">{{ vi: 'Quản trị viên', ja: '管理者', ko: '관리자', zh: '管理员', en: 'Admin' }[lang] || 'Admin'}</option>
                      </select>

                      <select
                        value={userKycStatusFilter}
                        onChange={e => setUserKycStatusFilter(e.target.value)}
                        className={cn(
                          "px-4 py-3 border rounded-xl text-xs outline-none transition-all duration-300",
                          isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                        )}
                      >
                        <option value="ALL">{{ vi: 'Tất cả trạng thái KYC', ja: 'すべてのKYCステータス', ko: '모든 KYC 상태', zh: '所有 KYC 状态', en: 'All KYC Statuses' }[lang] || 'All KYC Statuses'}</option>
                        <option value="PENDING">{{ vi: 'Chờ duyệt', ja: '承認待ち', ko: '대기 중', zh: '待审核', en: 'Pending' }[lang] || 'Pending'}</option>
                        <option value="VERIFIED">{{ vi: 'Đã xác minh', ja: '確認済み', ko: '인증됨', zh: '已验证', en: 'Verified' }[lang] || 'Verified'}</option>
                        <option value="REJECTED">{{ vi: 'Từ chối', ja: '拒否済み', ko: '거절됨', zh: '已拒绝', en: 'Rejected' }[lang] || 'Rejected'}</option>
                      </select>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          placeholder={{ vi: 'Tìm theo tên hoặc email...', ja: '名前またはメールで検索...', ko: '이름 또는 이메일로 검색...', zh: '按姓名或邮箱搜索...', en: 'Search by name or email...' }[lang] || 'Search by name or email...'}
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          className={cn(
                            "pl-11 pr-5 py-3 border rounded-xl text-xs placeholder:text-slate-450 outline-none w-72 transition-all duration-300",
                            isDark ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['User Account', 'Email Address', 'Platform Role', 'KYC Status', 'Account Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{getTableHeaderText(h)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={6} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">No matching user accounts.</td></tr>
                        ) : (
                          filteredUsers.map(u => {
                            const isUserActive = u.active !== false;
                            return (
                              <tr key={u.id} className={cn("transition-colors duration-200", isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3.5">
                                    <Avatar src={u.avatar} name={u.displayName || 'User'} size="sm" className="flex-shrink-0" />
                                    <span className={cn("text-xs font-black uppercase tracking-wider", isDark ? "text-slate-200" : "text-slate-800")}>{u.displayName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-400">{u.email}</td>
                                <td className="px-6 py-4">
                                  <span className={cn("text-[8px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider",
                                    u.role === 'admin' ? "border-yellow-500/20 text-yellow-555 bg-yellow-500/5" :
                                    u.role === 'owner' ? "border-indigo-500/20 text-indigo-550 bg-indigo-500/5" :
                                    "border-slate-500/20 text-slate-555 bg-slate-555/5"
                                  )}>{formatRoleLabel(u.role)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={u.kycVerified ? 'active' : 'pending'} label={formatStatusLabel(u.kycVerified ? 'verified' : 'pending')} />
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={isUserActive ? 'active' : 'inactive'} label={formatStatusLabel(isUserActive ? 'active' : 'blocked')} />
                                </td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => handleToggleUserStatus(u.id, isUserActive)}
                                    className={cn(
                                      "text-[8px] px-3.5 py-2 rounded-xl font-black uppercase tracking-widest transition-all duration-300 hover-lift shadow-sm",
                                      isUserActive 
                                        ? "border dark:border-slate-700 hover:bg-red-500/10 text-red-555" 
                                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/15"
                                    )}
                                  >
                                    {isUserActive ? 'Suspend' : 'Activate'}
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
              )}

              {/* ============ TABS: FRAUD CENTER (NEW) ============ */}
              {activeTab === 'fraud' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title={{ vi: 'Trung Tâm Kiểm Soát Rủi Ro & Gian Lận', ja: '不正・リスク管理センター', ko: '사기 및 리스크 관리 센터', zh: '欺诈与风险控制中心', fr: 'Centre de contrôle de la fraude et des risques', de: 'Betrugs- & Risikokontrollzentrum', es: 'Centro de control de fraude y riesgos', en: 'Fraud & Risk Control Center' }[lang] || 'Fraud & Risk Control Center'} 
                    items={[{ label: "LuxeWay", href: "/" }, { label: adminBreadcrumbLabel }, { label: { vi: 'Trung Tâm Gian Lận', ja: '不正対策センター', ko: '사기 방지 센터', zh: '反欺诈中心', fr: 'Centre de fraude', de: 'Betrugszentrum', es: 'Centro de fraude', en: 'Fraud Center' }[lang] || 'Fraud Center' }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {{ vi: 'Chấm điểm rủi ro thời gian thực, xác minh dấu vết thiết bị và danh sách chặn VPN', ja: 'リアルタイムのリスクスコアリング、デバイス指紋の検証、VPNブロックリスト', ko: '실시간 리스크 스코어링, 기기 지문 검증 및 VPN 차단 목록', zh: '实时风险评分、设备指纹验证和 VPN 阻止列表', en: 'Real-time risk scoring, device fingerprint verification, and VPN block lists' }[lang] || 'Real-time risk scoring, device fingerprint verification, and VPN block lists'}
                    </p>
                  </div>

                  {/* Top KPIs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { label: 'Gross Risk Alerts', value: fraudAlerts.length, icon: ShieldAlert, style: 'bg-red-500/10 text-red-500 border-red-500/20' },
                      { label: 'Chargebacks Pending', value: chargebacks.filter(c => c.status === 'disputed_evidence_submitted').length, icon: Scale, style: 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' },
                      { label: 'Device Conflicts Flagged', value: fingerprints.filter(f => f.riskScore >= 80).length, icon: Terminal, style: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
                      { label: 'Fraud Prevention Rate', value: '98.6%', icon: CheckCircle, style: 'bg-emerald-500/10 text-emerald-505 border-emerald-500/20' }
                    ].map(card => (
                      <div key={card.label} className={cn(
                        "rounded-3xl border p-5 shadow-sm relative overflow-hidden",
                        isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/50"
                      )}>
                        <div className="flex items-center gap-3.5">
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", card.style)}>
                            <card.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-850")}>{card.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">{card.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Risk Scoring Engine */}
                    <div className={cn("lg:col-span-2 border rounded-[2rem] overflow-hidden shadow-2xl p-6 flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Risk Scoring Engine</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b dark:border-slate-850">
                              {['User Account', 'Risk Score', 'Flagged Indicators', 'Risk Level', 'Operations Actions'].map(h => (
                                <th key={h} className="text-left py-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-450">{getTableHeaderText(h)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-850">
                            {fraudAlerts.map(alert => {
                              const scoreColor = alert.score >= 80 ? 'text-red-500' : alert.score >= 50 ? 'text-amber-500' : 'text-emerald-500';
                              return (
                                <tr key={alert.id} className="transition-colors hover:bg-slate-500/5">
                                  <td className="py-4 px-2 text-xs font-black text-slate-200 uppercase">{alert.name}</td>
                                  <td className={cn("py-4 px-2 text-sm font-black", scoreColor)}>{alert.score} pts</td>
                                  <td className="py-4 px-2 text-[11px] text-slate-400 font-semibold max-w-[200px] truncate" title={alert.indicators}>{alert.indicators}</td>
                                  <td className="py-4 px-2">
                                    <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg border",
                                      alert.level === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-500' :
                                      alert.level === 'HIGH' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' :
                                      'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                    )}>{alert.level}</span>
                                  </td>
                                  <td className="py-4 px-2 flex items-center gap-1.5 flex-wrap">
                                    {alert.status === 'pending' ? (
                                      <>
                                        <button onClick={() => handleFraudAction(alert.id, 'suspend')} className="text-[7.5px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-650 text-white px-2 py-1.5 rounded-lg shadow-sm">Suspend</button>
                                        <button onClick={() => handleFraudAction(alert.id, 'freeze')} className="text-[7.5px] font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700/20 text-slate-300 px-2 py-1.5 rounded-lg">Freeze Wallet</button>
                                        <button onClick={() => handleFraudAction(alert.id, 'ban')} className="text-[7.5px] font-black uppercase tracking-widest bg-black border border-red-500/40 text-red-400 hover:bg-red-950/20 px-2 py-1.5 rounded-lg">Ban</button>
                                      </>
                                    ) : (
                                      <span className="text-[8px] font-black text-emerald-500 flex items-center gap-1">✓ PROTOCOL DISPATCHED</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Hardware Fingerprint Graph list */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Duplicate Device Canvas Fingerprints</h3>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 sidebar-scroll">
                        {fingerprints.map(fp => (
                          <div key={fp.hardwareHash} className="p-3.5 bg-slate-500/5 border dark:border-slate-850 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs font-black text-indigo-500">{fp.hardwareHash}</span>
                              <span className="text-[8px] font-black bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded-lg">{fp.riskScore}% Co-relation</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                              <strong className="text-slate-300">Linked Profiles:</strong> {fp.linkedAccounts.join(' , ')}
                            </p>
                            <div className="text-[8px] text-slate-500 font-semibold text-right">
                              Last Session: {formatDate(fp.lastActive, 'relative')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Suspicious Bookings */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Suspicious Transactions Feed</h3>
                      <div className="space-y-3">
                        {suspiciousBookings.map(sb => (
                          <div key={sb.id} className="p-3.5 bg-slate-500/5 border dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-red-400">{sb.id}</span>
                                <span className="text-[9px] font-black bg-red-500/10 text-red-505 px-2 py-0.2 rounded-lg">{sb.score} Risk Level</span>
                              </div>
                              <p className="text-xs font-bold text-slate-200">{sb.customer} booked {sb.vehicle}</p>
                              <p className="text-[10px] font-semibold text-slate-450 leading-relaxed">{sb.reason}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2.5">
                              <span className="text-xs font-black text-emerald-500">{formatCurrency(sb.amount)}</span>
                              <div className="flex gap-1">
                                <button onClick={() => {
                                  setSuspiciousBookings(prev => prev.filter(p => p.id !== sb.id));
                                  toast.success('Booking Bypassed', 'Verification check bypass approved.');
                                }} className="text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg shadow-sm">Bypass</button>
                                <button onClick={() => {
                                  setSuspiciousBookings(prev => prev.filter(p => p.id !== sb.id));
                                  toast.success('Hold Imposed', 'Transaction payment put on hold.');
                                }} className="text-[8px] font-black uppercase tracking-widest bg-red-500 text-white px-2.5 py-1.5 rounded-lg shadow-sm">Flag Hold</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chargeback Monitoring */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Chargeback disputes tracking</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b dark:border-slate-850">
                              {['TX Ref', 'Merchant', 'Amount', 'Customer', 'Status'].map(h => (
                                <th key={h} className="text-left py-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-450">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-850">
                            {chargebacks.map(cb => (
                              <tr key={cb.id} className="text-xs transition-colors hover:bg-slate-500/5">
                                <td className="py-3 px-1 font-mono font-bold text-indigo-400">{cb.transactionId}</td>
                                <td className="py-3 px-1 font-semibold">{cb.provider}</td>
                                <td className="py-3 px-1 font-black text-red-500">{formatCurrency(cb.amount)}</td>
                                <td className="py-3 px-1 font-bold text-slate-350">{cb.customer}</td>
                                <td className="py-3 px-1">
                                  <span className={cn("text-[7.5px] font-black px-2 py-0.5 rounded-lg border",
                                    cb.status === 'chargeback_reversed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-555' : 'border-amber-500/30 bg-amber-500/10 text-amber-505 animate-pulse'
                                  )}>{cb.status?.replace(/_/g, ' ').toUpperCase()}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: ANALYTICS ============ */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="BI Analytics Dashboard" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Analytics" }]} 
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deep-dive performance graphs, revenue streams, and customer metrics</p>
                    </div>

                    {/* Exporters Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExportData('CSV')} 
                        className={cn(
                          "flex items-center gap-2 px-4.5 py-2.5 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 hover-lift shadow-sm",
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                        )}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        <span>Export CSV</span>
                      </button>
                      <button 
                        onClick={() => handleExportData('Excel')} 
                        className={cn(
                          "flex items-center gap-2 px-4.5 py-2.5 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 hover-lift shadow-sm",
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                        )}
                      >
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        <span>Export Excel</span>
                      </button>
                      <button 
                        onClick={() => handleExportData('PDF')} 
                        className={cn(
                          "flex items-center gap-2 px-4.5 py-2.5 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 hover-lift shadow-sm",
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                        )}
                      >
                        <Download className="w-4 h-4 text-rose-500" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Ratios row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { label: 'Take Rate Ratio', value: '12.5%', icon: PercentIcon, desc: 'Flat fee allocation' },
                      { label: 'Refund Rate', value: '1.4%', icon: RefreshCw, desc: 'Disputes reversal factor' },
                      { label: 'Customer Retention', value: '74.2%', icon: Users, desc: 'Repeat renter ratio' },
                      { label: 'Booking Success Rate', value: '96.8%', icon: CheckCircle, desc: 'Completed rentals split' },
                    ].map(card => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className={cn(
                          "rounded-3xl border p-5 shadow-sm relative overflow-hidden",
                          isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/50"
                        )}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-550">{card.label}</span>
                            <Icon className="w-4 h-4 text-indigo-500" />
                          </div>
                          <p className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-850")}>{card.value}</p>
                          <span className="text-[8px] font-semibold text-slate-400 mt-1 block">{card.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Multi-Month Trend */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-5 border-b dark:border-slate-800 pb-4">Revenue Stream Timeline</h3>
                      <ResponsiveContainer width="100%" height={230}>
                        <LineChart data={chartRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth={0.5} opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: '800', fill: 'var(--lw-text-muted)' }} stroke="transparent" />
                          <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: 'var(--lw-text-muted)' }} stroke="transparent" />
                          <Tooltip content={<AdminCustomTooltip />} />
                          <Line type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bookings Volume Analysis */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-5 border-b dark:border-slate-800 pb-4">Checkouts Frequency Volume</h3>
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={chartRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth={0.5} opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: '800', fill: 'var(--lw-text-muted)' }} stroke="transparent" />
                          <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: 'var(--lw-text-muted)' }} stroke="transparent" />
                          <Tooltip content={<AdminCustomTooltip />} />
                          <Bar dataKey="Bookings" fill="#10B981" radius={[6, 6, 0, 0]} cursor="pointer" activeBar={{ fillOpacity: 0.8 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CSS Animated Conversion Funnel */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Platform Conversion Funnel</h3>
                      <div className="space-y-4 py-2">
                        {[
                          { step: 'Searches & Location Queries', val: '124,500', ratio: '100%', width: '100%', color: 'from-indigo-650 to-indigo-500' },
                          { step: 'Vehicle Detail Views', val: '58,400', ratio: '46.9%', width: '46.9%', color: 'from-purple-600 to-purple-500' },
                          { step: 'Initiated Checkout Steps', val: '18,200', ratio: '14.6%', width: '14.6%', color: 'from-pink-600 to-pink-500' },
                          { step: 'Confirmed Bookings Paid', val: '4,550', ratio: '3.6%', width: '3.6%', color: 'from-emerald-600 to-emerald-500' },
                        ].map(item => (
                          <div key={item.step} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                              <span className="text-slate-350">{item.step}</span>
                              <span className="text-slate-100">{item.val} ({item.ratio})</span>
                            </div>
                            <div className="w-full h-7.5 bg-slate-500/10 rounded-xl overflow-hidden border dark:border-slate-850 shadow-inner flex items-center relative">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: item.width }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className={cn("h-full bg-gradient-to-r shadow-inner rounded-l-xl", item.color)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Geographic Split */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-455 border-b dark:border-slate-850 pb-3">Geographic Fleet Heatmap</h3>
                      <div className="space-y-3">
                        {[
                          { city: 'Hồ Chí Minh City', trips: 1840, share: '40.4%', width: 'w-[40.4%]' },
                          { city: 'Hà Nội City', trips: 1320, share: '29.0%', width: 'w-[29.0%]' },
                          { city: 'Đà Nẵng City', trips: 680, share: '14.9%', width: 'w-[14.9%]' },
                          { city: 'Nha Trang Hub', trips: 450, share: '9.9%', width: 'w-[9.9%]' },
                          { city: 'Phú Quốc Island', trips: 260, share: '5.8%', width: 'w-[5.8%]' },
                        ].map(geo => (
                          <div key={geo.city} className="flex items-center justify-between gap-4 p-3 bg-slate-500/5 rounded-2xl border dark:border-slate-850">
                            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{geo.city}</span>
                            <div className="flex-1 max-w-[200px] h-2 bg-slate-500/10 rounded-full overflow-hidden">
                              <div className={cn("h-full bg-indigo-500 rounded-full", geo.width)} />
                            </div>
                            <span className="text-xs font-black text-indigo-400">{geo.trips} trips ({geo.share})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: NOTIFICATION CENTER (NEW) ============ */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="Notification Broadcast Center" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Notifications" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configure system broadcasts, push notifications campaigns, and promotional emails</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Broadcast Dispatcher */}
                    <div className={cn("lg:col-span-2 border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">New Announcement Campaign</h3>
                      <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Campaign Title</label>
                          <input 
                            placeholder="Enter announcement subject..."
                            value={announcementTitle}
                            onChange={e => setAnnouncementTitle(e.target.value)}
                            className={cn(
                              "w-full px-4.5 py-3 border rounded-xl text-xs outline-none focus:border-indigo-500 transition-all",
                              isDark ? "bg-slate-950/60 border-slate-850 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                            )}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notification Body Message</label>
                          <textarea 
                            placeholder="Formulate notifications message contents..."
                            value={announcementBody}
                            onChange={e => setAnnouncementBody(e.target.value)}
                            rows={4}
                            className={cn(
                              "w-full px-4.5 py-3 border rounded-xl text-xs outline-none focus:border-indigo-500 transition-all resize-none",
                              isDark ? "bg-slate-950/60 border-slate-850 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Segment</label>
                            <select 
                              value={targetSegment} 
                              onChange={e => setTargetSegment(e.target.value as any)}
                              className={cn(
                                "w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none",
                                isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                              )}
                            >
                              <option value="all">All Platform Users</option>
                              <option value="owners">Owners (Fleet Partners)</option>
                              <option value="customers">Customers (Traveler Guests)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dispatch Channels</label>
                            <select 
                              value={notifyChannel} 
                              onChange={e => setNotifyChannel(e.target.value as any)}
                              className={cn(
                                "w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none",
                                isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                              )}
                            >
                              <option value="all">Push Notification & Email</option>
                              <option value="push">In-App Push Only</option>
                              <option value="email">Direct Email campaigns</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-lg shadow-indigo-500/25 transition-all">
                          <Send className="w-4 h-4" />
                          <span>Dispatch Announcement Campaign</span>
                        </button>
                      </form>
                    </div>

                    {/* Sent Campaigns Timeline */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-3">Campaigns Logs</h3>
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 sidebar-scroll">
                        {broadcasts.map(b => (
                          <div key={b.id} className="p-3.5 bg-slate-500/5 border dark:border-slate-850 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-black text-slate-200 truncate uppercase max-w-[180px]">{b.title}</h4>
                              <span className="text-[7.5px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-lg">{b.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-2">{b.body}</p>
                            <hr className="border-slate-800/60" />
                            <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-black text-indigo-400 uppercase">
                              <div>
                                <span className="text-[8px] text-slate-500 block">DELIVERED</span>
                                {b.sentCount}
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 block">OPEN RATE</span>
                                {b.openRate}
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 block">CLICK RATE</span>
                                {b.clickRate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ TABS: LOGS (TIMELINE ENRICHED VIEW) ============ */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="Security & Audit Ledger Trail" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Security Logs" }]} 
                  />
                  <AuditTrailDashboard />
                </div>
              )}

              {/* ============ TABS: SYSTEM HEALTH (NEW) ============ */}
              {activeTab === 'health' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="System Health & Telemetry" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "System Health" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real-time status monitoring, API gateways latency, and memory utilization telemetry</p>
                  </div>

                  {/* Telemetry charts row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CPU Utilization */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-2 w-full">CPU Core Telemetry</h4>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" className="stroke-slate-800 fill-none" strokeWidth="8" />
                          <circle cx="64" cy="64" r="54" className="stroke-indigo-550 fill-none" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * healthSystem.cpu) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-indigo-400">{healthSystem.cpu}%</span>
                          <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase">LOAD</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Fluctuates Live Telemetry</span>
                    </div>

                    {/* Memory Allocation */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-2 w-full">Memory Allocations</h4>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" className="stroke-slate-800 fill-none" strokeWidth="8" />
                          <circle cx="64" cy="64" r="54" className="stroke-emerald-500 fill-none" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * (healthSystem.memory / 16 * 100)) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-emerald-405">{healthSystem.memory} GB</span>
                          <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase">allocated / 16GB</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-505 uppercase">HEAP ALLOCATION OK</span>
                    </div>

                    {/* SSD Cluster Storage */}
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center", isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/60")}>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-450 border-b dark:border-slate-850 pb-2 w-full">Storage Pool cluster</h4>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" className="stroke-slate-800 fill-none" strokeWidth="8" />
                          <circle cx="64" cy="64" r="54" className="stroke-purple-500 fill-none" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * healthSystem.storage) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-purple-400">{healthSystem.storage}%</span>
                          <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase">USED</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase">RAID 10 ACTIVE</span>
                    </div>
                  </div>

                  {/* Components Node Health Table */}
                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Component Service Node', 'Response Latency', 'Availability Rate', 'Uptime Rate', 'Error Rate', 'Health State'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-450">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {[
                          { node: 'LuxeWay Frontend App Client', type: 'Vite Production Bundler / Vercel Edge Node', latency: `${healthSystem.wsLatency + 8}ms`, availability: '100%', uptime: '99.98%', errorRate: '0.00%', status: 'ONLINE' },
                          { node: 'Spring Boot REST Gateway Api', type: 'Embedded Tomcat Gateway API Layer', latency: `${healthSystem.apiLatency}ms`, availability: '99.96%', uptime: '99.95%', errorRate: '0.04%', status: 'ONLINE' },
                          { node: 'MS SQL Server Database node', type: 'Azure SQL AlwaysOn Replication node', latency: `${healthSystem.sqlLatency}ms`, availability: '100%', uptime: '100%', errorRate: '0.00%', status: 'ONLINE' },
                          { node: 'Redis Sessions Caching Node', type: 'Redis Enterprise Session Cache server', latency: `${healthSystem.redisLatency}ms`, availability: '100%', uptime: '99.99%', errorRate: '0.00%', status: 'ONLINE' },
                          { node: 'VNPay Webhook Web Server', type: 'External VNPay Transaction Webhook Provider', latency: '42ms', availability: '99.90%', uptime: '99.94%', errorRate: '0.10%', status: 'ONLINE' },
                          { node: 'Stripe API Gateway Endpoint', type: 'External Merchant Payment Processing APIs', latency: '115ms', availability: '100%', uptime: '99.99%', errorRate: '0.00%', status: 'ONLINE' },
                          { node: 'SMTP Email Service Gateway', type: 'External SendGrid Mailing Node', latency: '150ms', availability: '99.95%', uptime: '99.98%', errorRate: '0.05%', status: 'ONLINE' },
                          { node: 'WebSocket STOMP Channel server', type: 'Spring Websocket Server broker', latency: `${healthSystem.wsLatency}ms`, availability: '99.99%', uptime: '99.99%', errorRate: '0.01%', status: 'ONLINE' },
                          { node: 'CDN Asset Cluster (Cloudflare)', type: 'Media Asset Storage & Delivery network', latency: '14ms', availability: '100%', uptime: '100%', errorRate: '0.00%', status: 'ONLINE' },
                        ].map(comp => (
                          <tr key={comp.node} className={cn("transition-colors duration-200", isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")}>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <span className={cn("text-xs font-black uppercase tracking-wider block", isDark ? "text-slate-200" : "text-slate-800")}>{comp.node}</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{comp.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-400">{comp.latency}</td>
                            <td className="px-6 py-4 text-xs font-black text-emerald-500">{comp.availability}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-400">{comp.uptime}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-red-500">{comp.errorRate}</td>
                            <td className="px-6 py-4">
                              <span className={cn("inline-flex items-center gap-1.5 text-[8px] font-black px-2.5 py-1 border rounded-xl uppercase tracking-widest",
                                comp.status === 'ONLINE' ? "border-emerald-500/25 text-emerald-555 bg-emerald-500/5" : "border-red-500/25 text-red-555 bg-red-500/5"
                              )}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 animate-pulse" />
                                {comp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ TABS: SETTINGS ============ */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="System Rules Control" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "System Settings" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Review dynamic checkout multipliers, platform commission ratios, and database states</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b dark:border-slate-800 pb-3">Financial Variables</h3>
                      {settings.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">No active system settings retrieved.</div>
                      ) : (
                        settings.map(s => (
                          <div key={s.settingKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b dark:border-slate-850 last:border-0">
                            <div>
                              <p className={cn("text-xs font-black capitalize", isDark ? "text-white" : "text-slate-800")}>{s.settingKey.replace(/_/g, ' ')}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Value Type: Float Decimal ratio</p>
                            </div>
                            <input
                              defaultValue={s.settingValue}
                              onBlur={e => handleUpdateSetting(s.settingKey, e.target.value)}
                              className={cn(
                                "px-3.5 py-2 border rounded-xl text-xs font-black outline-none w-28 text-right focus:border-indigo-500",
                                isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                              )}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b dark:border-slate-800 pb-3">System Nodes Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-1">
                          <div>
                            <p className={cn("text-xs font-black", isDark ? "text-white" : "text-slate-800")}>Active Database Node</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">MS SQL Server AlwaysOn Replica Cluster</p>
                          </div>
                          <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2.5 py-1 rounded-xl">ACTIVE CONNECTED</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <div>
                            <p className={cn("text-xs font-black", isDark ? "text-white" : "text-slate-800")}>Cache Server Session</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Redis Cluster In-Memory Cache</p>
                          </div>
                          <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2.5 py-1 rounded-xl">ACTIVE CONNECTED</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn("border rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 col-span-1 md:col-span-2", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                      <h3 className="font-black text-xs uppercase tracking-widest text-indigo-400 border-b dark:border-slate-805 pb-3">
                        {t.adminDashboard.bankSettingsTitle}
                      </h3>
                      <form onSubmit={handleSavePaymentSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.adminDashboard.bankNameLabel}</label>
                          <input
                            type="text"
                            value={adminPaymentSettings.bankName || ''}
                            onChange={e => setAdminPaymentSettings({ ...adminPaymentSettings, bankName: e.target.value })}
                            placeholder="e.g. MB, VCB, ICB"
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:border-indigo-500",
                              isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                            )}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.adminDashboard.accountNumberLabel}</label>
                          <input
                            type="text"
                            value={adminPaymentSettings.accountNumber || ''}
                            onChange={e => setAdminPaymentSettings({ ...adminPaymentSettings, accountNumber: e.target.value })}
                            placeholder="e.g. 0377096245"
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:border-indigo-500",
                              isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                            )}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.adminDashboard.accountHolderLabel}</label>
                          <input
                            type="text"
                            value={adminPaymentSettings.ownerName || ''}
                            onChange={e => setAdminPaymentSettings({ ...adminPaymentSettings, ownerName: e.target.value.toUpperCase() })}
                            placeholder="e.g. NGUYEN VAN DANG"
                            className={cn(
                              "w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:border-indigo-500",
                              isDark ? "bg-slate-950/60 border-slate-850 text-indigo-400" : "bg-slate-50 border-slate-200 text-indigo-650"
                            )}
                          />
                        </div>
                        <div className="space-y-1.5 flex items-center justify-between sm:pt-6">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.adminDashboard.enabledSettingsLabel}</span>
                          <input
                            type="checkbox"
                            checked={adminPaymentSettings.enabled === true}
                            onChange={e => setAdminPaymentSettings({ ...adminPaymentSettings, enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-800"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2 pt-2">
                          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-lg shadow-indigo-500/25 transition-all">
                            {t.adminDashboard.savePaymentConfig}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>

      {/* ============ STYLISH SLIDE DRAWER DETAILS SHEETS ============ */}

      {/* 1. Vehicle Details Drawer */}
      <AdminSlideDrawer
        isOpen={selectedVehicle !== null}
        onClose={() => setSelectedVehicle(null)}
        title="Vehicle Technical Spec Verification"
      >
        {selectedVehicle && (
          <div className="space-y-5 text-sm">
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-inner border dark:border-slate-850">
              <img src={selectedVehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&fit=crop'} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-sm font-black uppercase tracking-wider">{selectedVehicle.name}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{selectedVehicle.brand} · {selectedVehicle.year || 2024}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-500/5 rounded-xl border dark:border-slate-850">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rate Per Day</span>
                <p className="text-sm font-black text-emerald-505 mt-0.5">{formatCurrency(selectedVehicle.pricePerDay)}</p>
              </div>
              <div className="p-3 bg-slate-500/5 rounded-xl border dark:border-slate-850">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Renter Rating</span>
                <p className="text-sm font-black text-amber-500 mt-0.5">⭐ {selectedVehicle.rating?.toFixed(1) || '5.0'}</p>
              </div>
            </div>

            <div className="p-4.5 bg-slate-500/5 rounded-2xl border dark:border-slate-855 space-y-2.5">
              <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 border-b dark:border-slate-850 pb-1.5">Technical Specs Summary</h5>
              <p className="text-xs font-semibold text-slate-350"><span className="text-slate-400">Transmission:</span> {selectedVehicle.specs?.transmission || 'Automatic'}</p>
              <p className="text-xs font-semibold text-slate-350"><span className="text-slate-400">Fuel System:</span> {selectedVehicle.specs?.fuelType || 'Gasoline'}</p>
              <p className="text-xs font-semibold text-slate-350"><span className="text-slate-400">Capacity Configuration:</span> {selectedVehicle.specs?.seats || 4} Seats · {selectedVehicle.specs?.doors || 4} Doors</p>
              <p className="text-xs font-semibold text-slate-350"><span className="text-slate-400">License Plate Identifier:</span> {selectedVehicle.specs?.licensePlate || 'N/A'}</p>
            </div>

            {selectedVehicle.status === 'pending_approval' && (
              <div className="space-y-3 pt-2 border-t dark:border-slate-850">
                <textarea
                  placeholder="Provide rejection/revision details reason..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className={cn(
                    "w-full p-3.5 border rounded-xl text-xs outline-none resize-none h-20",
                    isDark ? "bg-slate-950/60 border-slate-850 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  )}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleApproveVehicle(selectedVehicle.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-emerald-500/10">Approve Listing</button>
                  <button onClick={() => handleRejectVehicle(selectedVehicle.id)} className="flex-1 bg-red-500 hover:bg-red-650 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-red-500/10">Reject</button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSlideDrawer>

      {/* 2. KYC Details Drawer */}
      <AdminSlideDrawer
        isOpen={selectedKycUser !== null}
        onClose={() => setSelectedKycUser(null)}
        title="KYC Renter Documents Reviewer"
      >
        {selectedKycUser && (
          <div className="space-y-6 text-sm">
            {/* User profile info */}
            <div className="flex items-center gap-3 p-4 bg-slate-500/5 rounded-2xl border dark:border-slate-850">
              <Avatar src={selectedKycUser.avatar} name={selectedKycUser.displayName || 'Customer'} size="lg" className="flex-shrink-0" />
              <div>
                <h5 className={cn("text-xs font-black uppercase tracking-wider", isDark ? "text-white" : "text-slate-800")}>{selectedKycUser.displayName}</h5>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Phone: {selectedKycUser.phone || 'Not provided'}</p>
                <p className="text-[9px] font-semibold text-slate-400">Email: {selectedKycUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-extrabold uppercase">
                    {selectedKycUser.kycStatus || 'UNVERIFIED'}
                  </span>
                </div>
              </div>
            </div>

            {loadingKycDocs ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <span className="text-xs text-slate-400">Loading uploaded renter documents...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const cccdFront = kycUserDocs.find(d => d.documentType === 'CCCD_FRONT');
                  const cccdBack = kycUserDocs.find(d => d.documentType === 'CCCD_BACK');
                  const carDlFront = kycUserDocs.find(d => d.documentType === 'DRIVER_LICENSE_FRONT');
                  const carDlBack = kycUserDocs.find(d => d.documentType === 'DRIVER_LICENSE_BACK');
                  const motorbikeDlFront = kycUserDocs.find(d => d.documentType === 'MOTORBIKE_LICENSE_FRONT');
                  const motorbikeDlBack = kycUserDocs.find(d => d.documentType === 'MOTORBIKE_LICENSE_BACK');
                  const selfie = kycUserDocs.find(d => d.documentType === 'SELFIE');

                  if (!cccdFront && !cccdBack && !carDlFront && !carDlBack && !motorbikeDlFront && !motorbikeDlBack && !selfie) {
                    return (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 text-yellow-600 text-xs rounded-xl text-center font-semibold">
                        No KYC verification photos uploaded yet.
                      </div>
                    );
                  }

                  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';
                  const resolveDocUrl = (url?: string) => {
                    if (!url) return '';
                    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                      return url;
                    }
                    return `${apiBaseUrl}${url}`;
                  };

                  let expiryDate = 'N/A';
                  if (cccdFront?.ocrData) {
                    try {
                      const parsed = JSON.parse(cccdFront.ocrData);
                      expiryDate = parsed?.data?.[0]?.doe || parsed?.doe || parsed?.expiryDate || 'N/A';
                    } catch (e) {
                      // ignore
                    }
                  }

                  let similarity = 'N/A';
                  let liveness = 'N/A';
                  if (selfie?.ocrData) {
                    try {
                      const parsed = JSON.parse(selfie.ocrData);
                      similarity = parsed?.similarity ? `${parsed.similarity}%` : 'N/A';
                      liveness = parsed?.livenessResult || parsed?.liveness || 'N/A';
                    } catch (e) {
                      // ignore
                    }
                  }

                  return (
                    <div className="space-y-6">
                      {/* Document Photos Grid */}
                      <div className="space-y-3">
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">Document Photos Comparison</span>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* CCCD Front */}
                          <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">CCCD Front</span>
                            {cccdFront ? (
                              <img src={resolveDocUrl(cccdFront.url)} className="w-full h-32 object-cover" alt="CCCD Front" />
                            ) : (
                              <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No CCCD Front Image</div>
                            )}
                          </div>

                          {/* CCCD Back */}
                          <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">CCCD Back</span>
                            {cccdBack ? (
                              <img src={resolveDocUrl(cccdBack.url)} className="w-full h-32 object-cover" alt="CCCD Back" />
                            ) : (
                              <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No CCCD Back Image</div>
                            )}
                          </div>

                          {/* Car DL Front & Back */}
                          {(carDlFront || carDlBack) && (
                            <>
                              <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                                <span className="absolute top-2 left-2 bg-indigo-600 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">🚗 Car DL Front (Ô Tô)</span>
                                {carDlFront ? (
                                  <img src={resolveDocUrl(carDlFront.url)} className="w-full h-32 object-cover" alt="Car License Front" />
                                ) : (
                                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No Car DL Front</div>
                                )}
                              </div>

                              <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                                <span className="absolute top-2 left-2 bg-indigo-600 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">🚗 Car DL Back (Ô Tô)</span>
                                {carDlBack ? (
                                  <img src={resolveDocUrl(carDlBack.url)} className="w-full h-32 object-cover" alt="Car License Back" />
                                ) : (
                                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No Car DL Back</div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Motorbike DL Front & Back */}
                          {(motorbikeDlFront || motorbikeDlBack) && (
                            <>
                              <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                                <span className="absolute top-2 left-2 bg-amber-600 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">🏍️ Motorbike DL Front (Xe Máy)</span>
                                {motorbikeDlFront ? (
                                  <img src={resolveDocUrl(motorbikeDlFront.url)} className="w-full h-32 object-cover" alt="Motorbike License Front" />
                                ) : (
                                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No Motorbike DL Front</div>
                                )}
                              </div>

                              <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                                <span className="absolute top-2 left-2 bg-amber-600 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">🏍️ Motorbike DL Back (Xe Máy)</span>
                                {motorbikeDlBack ? (
                                  <img src={resolveDocUrl(motorbikeDlBack.url)} className="w-full h-32 object-cover" alt="Motorbike License Back" />
                                ) : (
                                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No Motorbike DL Back</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Selfie Image - Full Width */}
                        <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">Selfie holding CCCD</span>
                          {selfie ? (
                            <img src={resolveDocUrl(selfie.url)} className="w-full h-40 object-cover" alt="Selfie" />
                          ) : (
                            <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No Selfie Image</div>
                          )}
                        </div>
                      </div>

                      {/* OCR & Verification Details */}
                      <div className="space-y-4">
                        {/* CCCD OCR */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">CCCD OCR EXTRACTED DATA</span>
                          <div className="p-3.5 bg-slate-500/5 rounded-xl border dark:border-slate-850 text-xs space-y-1.5 font-semibold text-slate-400">
                            <div className="flex justify-between">
                              <span>Citizen Name:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{cccdFront?.ekycFullName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Citizen ID:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{cccdFront?.ekycIdNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Date of Birth:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{cccdFront?.ekycDob || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expiry Date:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{expiryDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Car Driver License OCR */}
                        {carDlFront && (
                          <div className="space-y-2">
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block font-display">🚗 CAR DRIVING LICENSE (GPLX Ô TÔ) OCR DATA</span>
                            <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs space-y-1.5 font-semibold text-slate-400">
                              <div className="flex justify-between">
                                <span>License Name:</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{carDlFront?.licenseFullName || selectedKycUser.displayName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>License Number:</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{carDlFront?.licenseNumber || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>License Class:</span>
                                <span className="font-black text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded font-extrabold">{carDlFront?.licenseClass || 'B2'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Motorbike Driver License OCR */}
                        {motorbikeDlFront && (
                          <div className="space-y-2">
                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block font-display">🏍️ MOTORBIKE DRIVING LICENSE (GPLX XE MÁY) OCR DATA</span>
                            <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs space-y-1.5 font-semibold text-slate-400">
                              <div className="flex justify-between">
                                <span>License Name:</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{motorbikeDlFront?.licenseFullName || selectedKycUser.displayName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>License Number:</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{motorbikeDlFront?.licenseNumber || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>License Class:</span>
                                <span className="font-black text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded font-extrabold">{motorbikeDlFront?.licenseClass || 'A1'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Face Matching & Liveness */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">Face Comparison Metrics</span>
                          <div className="p-3.5 bg-slate-500/5 rounded-xl border dark:border-slate-850 text-xs space-y-1.5 font-semibold text-slate-400">
                            <div className="flex justify-between">
                              <span>Face Similarity Score:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{similarity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Liveness Verification:</span>
                              <span className={cn("font-black uppercase", liveness.toLowerCase().includes('pass') ? "text-emerald-500" : "text-rose-500")}>
                                {liveness}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Rejection input and Actions */}
                {(selectedKycUser.kycStatus === 'PENDING' || selectedKycUser.kycStatus === 'PENDING_APPROVAL' || !selectedKycUser.kycVerified || kycUserDocs.some(d => d.status === 'PENDING' || d.verificationStatus === 'UNDER_REVIEW')) && (
                  <div className="space-y-3 pt-4 border-t dark:border-slate-850">
                    <textarea
                      placeholder="Add administrative rejection feedback reason if declining..."
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className={cn(
                        "w-full p-3.5 border rounded-xl text-xs outline-none resize-none h-20",
                        isDark ? "bg-slate-950/60 border-slate-850 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                      )}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReviewUserKyc(selectedKycUser.id, true, '1')} 
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-emerald-500/10"
                      >
                        Approve KYC
                      </button>
                      <button 
                        onClick={() => handleReviewUserKyc(selectedKycUser.id, false, '1')} 
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-rose-500/10"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </AdminSlideDrawer>

      {/* 3. Dispute Resolution Drawer */}
      <AdminSlideDrawer
        isOpen={selectedDispute !== null}
        onClose={() => setSelectedDispute(null)}
        title="Dispute Claim Resolution room"
      >
        {selectedDispute && (
          <div className="space-y-5 text-sm">
            <div>
              <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Reason / Conflict Claim</span>
              <p className={cn("text-xs font-extrabold mt-1", isDark ? "text-white" : "text-slate-800")}>{selectedDispute.reason}</p>
            </div>

            <div>
              <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Description Details</span>
              <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">{selectedDispute.description || 'No description provided.'}</p>
            </div>

            {selectedDispute.evidenceUrl && (
              <div>
                <span className="text-[8px] font-black text-slate-455 uppercase tracking-widest">Evidence image attachments</span>
                <div className="h-40 rounded-xl border dark:border-slate-850 overflow-hidden mt-1 shadow-inner bg-slate-500/10 flex items-center justify-center">
                  <img src={selectedDispute.evidenceUrl} className="w-full h-full object-cover" alt="Evidence" />
                </div>
              </div>
            )}

            {selectedDispute.status === 'PENDING' ? (
              <div className="space-y-3 pt-2 border-t dark:border-slate-850">
                <textarea
                  placeholder="Formulate administrative decision details..."
                  value={disputeDecision}
                  onChange={e => setDisputeDecision(e.target.value)}
                  className={cn(
                    "w-full p-3.5 border rounded-xl text-xs outline-none resize-none h-20",
                    isDark ? "bg-slate-950/60 border-slate-850 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  )}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleResolveDispute(selectedDispute.id, 'RESOLVED')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-emerald-500/10">Resolve Case</button>
                  <button onClick={() => handleResolveDispute(selectedDispute.id, 'REJECTED')} className="flex-1 bg-red-500 hover:bg-red-650 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest">Decline dispute</button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-500/5 rounded-xl border dark:border-slate-850 mt-2">
                <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Resolution decision</span>
                <p className="text-xs font-bold text-indigo-505 mt-1">{selectedDispute.adminDecision || 'Case closed without notes.'}</p>
              </div>
            )}
          </div>
        )}
      </AdminSlideDrawer>

      {/* 4. Booking Ledger Details Drawer (NEW) */}
      <AdminSlideDrawer
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title="Marketplace Booking Operations Details"
      >
        {selectedBooking && (
          <div className="space-y-5 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Booking ID</span>
                <p className="font-mono text-sm font-black text-indigo-400">#{selectedBooking.id.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Status state</span>
                <p className="mt-0.5">
                  <span className="text-[9px] font-black px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg uppercase">{selectedBooking.status}</span>
                </p>
              </div>
            </div>

            <hr className="border-slate-850" />

            {/* Traveler and Partner Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-black text-slate-500 block mb-1">RENTER CUSTOMER</span>
                <p className="text-xs font-black text-slate-205">{selectedBooking.renter?.displayName || 'Traveler'}</p>
                <p className="text-[10px] text-slate-450 font-semibold">{selectedBooking.renter?.email}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-500 block mb-1">FLEET OWNER PARTNER</span>
                <p className="text-xs font-black text-slate-205">{selectedBooking.vehicle?.owner?.displayName || 'Partner Host'}</p>
                <p className="text-[10px] text-slate-450 font-semibold">{selectedBooking.vehicle?.owner?.email}</p>
              </div>
            </div>

            <hr className="border-slate-850" />

            {/* Vehicle Details */}
            <div>
              <span className="text-[8px] font-black text-slate-500 block mb-1.5">RESERVED VEHICLE</span>
              <div className="flex items-center gap-3 p-3 bg-slate-500/5 rounded-2xl border dark:border-slate-850">
                <img src={selectedBooking.vehicle?.thumbnailUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&fit=crop'} className="w-14 h-10 rounded-xl object-cover" alt="" />
                <div>
                  <p className="text-xs font-black text-slate-200">{selectedBooking.vehicle?.name}</p>
                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{selectedBooking.vehicle?.brand} · {selectedBooking.vehicle?.specs?.licensePlate || 'Plate pending'}</p>
                </div>
              </div>
            </div>

            {/* Trip Schedule Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-black text-slate-500 block mb-0.5">TRIP START DATE</span>
                <p className="text-xs font-black text-slate-200">{formatDate(selectedBooking.startDate)}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-500 block mb-0.5">TRIP END DATE</span>
                <p className="text-xs font-black text-slate-200">{formatDate(selectedBooking.endDate)}</p>
              </div>
            </div>

            <hr className="border-slate-850" />

            {/* Financial Ledger details */}
            <div className="p-4 bg-slate-500/5 rounded-2xl border dark:border-slate-850 space-y-2">
              <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 border-b dark:border-slate-850 pb-1.5">Checkout Price Breakdown</h5>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Daily Rental Fee Split:</span>
                <span className="font-bold">{formatCurrency(selectedBooking.pricing?.basePrice || selectedBooking.pricing?.total * 0.7)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Services Fee commission (12%):</span>
                <span className="font-bold">{formatCurrency(selectedBooking.pricing?.serviceFee || selectedBooking.pricing?.total * 0.12)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Delivery logistics:</span>
                <span className="font-bold">{formatCurrency(selectedBooking.pricing?.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-xs border-t dark:border-slate-850 pt-2 font-black">
                <span className="text-slate-205">Cumulative Total:</span>
                <span className="text-emerald-500">{formatCurrency(selectedBooking.pricing?.total)}</span>
              </div>
            </div>

            {selectedBooking.status !== 'cancelled' && selectedBooking.paymentStatus === 'paid' && (
              <div className="space-y-3.5 pt-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleForceRefund(selectedBooking.id, selectedBooking.pricing?.total)}
                    className="flex-1 bg-red-500 hover:bg-red-650 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-red-500/10"
                  >
                    Force Refund Transaction
                  </button>
                  <button 
                    onClick={() => {
                      toast.info('Escalating Booking', `Escalating booking #${selectedBooking.id} to dispute resolution room.`);
                      setSelectedBooking(null);
                      setActiveTab('disputes');
                    }}
                    className="flex-1 border dark:border-slate-700 hover:bg-slate-500/10 text-slate-300 font-black py-3 rounded-xl uppercase text-[9px] tracking-widest"
                  >
                    Escalate Case
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSlideDrawer>
      {/* 3. Manual Bank Transfer Verification Drawer */}
      <AdminSlideDrawer
        isOpen={verifyingBooking !== null}
        onClose={() => setVerifyingBooking(null)}
        title={t.adminDashboard.paymentVerificationSheetTitle}
      >
        {verifyingBooking && (
          <div className="space-y-5 text-sm">
            <div className="p-4 bg-slate-500/5 rounded-2xl border dark:border-slate-850 space-y-3">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b dark:border-slate-800 pb-2">
                {t.adminDashboard.transactionVerificationSpecs}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black block">Mã đặt xe</span>
                  <span className="font-bold text-amber-500">{verifyingBooking.bookingCode}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black block">Tổng tiền</span>
                  <span className="font-bold text-blue-500">{formatCurrency(verifyingBooking.pricing?.total || 0)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 uppercase font-black block">Khách thuê</span>
                  <span className="font-bold text-foreground">{verifyingBooking.renter?.displayName || 'Customer'} ({verifyingBooking.renter?.email})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 uppercase font-black block">Lịch trình</span>
                  <span className="font-semibold text-slate-400">{formatDate(verifyingBooking.startDate)} - {formatDate(verifyingBooking.endDate)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 uppercase font-black block">Trạng thái hiện tại</span>
                  <span className="font-semibold"><StatusBadge status={verifyingBooking.status} label={formatStatusLabel(verifyingBooking.status)} /></span>
                </div>
              </div>
            </div>

            {verifyingBooking.status?.toLowerCase() === 'payment_pending' && (
              <div className="space-y-3 pt-2 border-t dark:border-slate-850">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  {t.adminDashboard.rejectionReasonLabel}
                </label>
                <textarea
                  placeholder={t.adminDashboard.rejectionPlaceholder}
                  value={paymentRejectionReason}
                  onChange={e => setPaymentRejectionReason(e.target.value)}
                  className={cn(
                    "w-full p-3.5 border rounded-xl text-xs outline-none resize-none h-20",
                    isDark ? "bg-slate-950/60 border-slate-850 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  )}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerifyPayment(verifyingBooking.id)} 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-emerald-500/10"
                  >
                    {t.adminDashboard.verifyAndApproveBtn}
                  </button>
                  <button 
                    onClick={() => handleRejectPayment(verifyingBooking.id, paymentRejectionReason)} 
                    className="flex-1 bg-red-500 hover:bg-red-650 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-md shadow-red-500/10"
                  >
                    {t.adminDashboard.declineAndRejectBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSlideDrawer>

    </div>
  );
};

// Simple PercentIcon SVG element since Lucide might not export LucidePercent directly in some old versions
const PercentIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export default AdminDashboard;
