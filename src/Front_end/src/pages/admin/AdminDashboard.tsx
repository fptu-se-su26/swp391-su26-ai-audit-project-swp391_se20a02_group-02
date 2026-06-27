import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Car, Calendar, DollarSign, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, Search, BarChart2, Globe, Loader2,
  Settings, HelpCircle, Edit2, Plus, Trash2, Activity, LogOut, Clock, Menu, X,
  ArrowUpRight, ArrowDownRight, Scale, Ban, RefreshCw, Download, FileText, Check, Lock,
  Cpu, HardDrive, Bell, ShieldAlert, Wifi, Terminal, Mail, Send, Share2, FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatDate, cn, convertCurrency } from '@/utils';
import { staggerContainer, staggerItem, fadeUp } from '@/animations/variants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import { adminService, AdminStats } from '@/services/adminService';
import { paymentService } from '@/services/bookingService';
import { useToast } from '@/components/ui/Toast';
import { useUIStore, useAuthStore } from '@/store';
import { useT } from '@/i18n/translations';
import { AuditTrailDashboard } from '@/components/enterprise/AuditTrailDashboard';
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
  const { theme, currency } = useUIStore();
  const { user, logout } = useAuthStore();
  const isDark = theme === 'dark';
  const t = useT();
  const location = useLocation();

  const queryTab = new URLSearchParams(location.search).get('tab');
  const validTabs = ['overview', 'marketplace', 'vehicles', 'kyc', 'bookings', 'payments', 'disputes', 'users', 'fraud', 'analytics', 'notifications', 'logs', 'health', 'settings'];
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'vehicles' | 'kyc' | 'bookings' | 'payments' | 'disputes' | 'users' | 'fraud' | 'analytics' | 'notifications' | 'logs' | 'health' | 'settings'>(
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

  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userKycStatusFilter, setUserKycStatusFilter] = useState('ALL');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('PENDING_APPROVAL');
  
  // KYC specific states
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [kycSearch, setKycSearch] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('PENDING');

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
      const res = await adminService.listAllVehicles(
        status === 'ALL' ? undefined : status,
        keyword || undefined,
        0,
        100
      );
      if (res && res.content) {
        setVehicles(res.content);
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

  // Trigger fetch KYC users when filters change
  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchKycUsers(kycStatusFilter, debouncedKycSearch);
    }
  }, [kycStatusFilter, debouncedKycSearch, activeTab]);

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
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 'FR-101', name: 'John Doe', score: 87, level: 'CRITICAL', indicators: 'VPN detected, IP reputation blacklisted, device fingerprint mismatch', time: '2026-06-02T19:12:00Z', status: 'pending' },
    { id: 'FR-102', name: 'Jane Smith', score: 68, level: 'HIGH', indicators: 'Multiple duplicate account logs with identical canvas fingerprint', time: '2026-06-02T18:44:00Z', status: 'pending' },
    { id: 'FR-103', name: 'David Lee', score: 45, level: 'MEDIUM', indicators: 'Mismatching billing and identity passport name card data', time: '2026-06-02T15:30:00Z', status: 'investigating' },
    { id: 'FR-104', name: 'Alex Wong', score: 22, level: 'LOW', indicators: 'Rapid session jumps across different regional networks', time: '2026-06-02T11:15:00Z', status: 'ignored' }
  ]);

  // Suspicious bookings
  const [suspiciousBookings, setSuspiciousBookings] = useState([
    { id: 'SB-30291', customer: 'John Doe', vehicle: 'Ferrari F8 Tributo', amount: 35000000, score: 92, reason: 'Instant booking high-value supercar using freshly verified account from VPN network', status: 'flagged' },
    { id: 'SB-30292', customer: 'Jane Smith', vehicle: 'Porsche 911 GT3', amount: 28000000, score: 74, reason: 'Overlapping bookings: booking multiple luxury vehicles on identical dates', status: 'flagged' }
  ]);

  // Chargebacks monitoring
  const [chargebacks, setChargebacks] = useState([
    { id: 'CB-9302', transactionId: 'TX-VN-920492', provider: 'VNPay', amount: 15500000, customer: 'Michael Johnson', status: 'disputed_evidence_submitted', date: '2026-05-30T10:00:00Z' },
    { id: 'CB-9303', transactionId: 'TX-ST-183921', provider: 'Stripe', amount: 24000000, customer: 'Emily Watson', status: 'chargeback_reversed', date: '2026-05-25T14:20:00Z' }
  ]);

  // Device fingerprint sharing
  const [fingerprints, setFingerprints] = useState([
    { hardwareHash: 'CNV-88A92B10', linkedAccounts: ['John Doe', 'Johny Boy', 'J.D. Rentals'], riskScore: 89, lastActive: '2026-06-02T20:30:00Z' },
    { hardwareHash: 'CNV-2193BF8C', linkedAccounts: ['Jane Smith', 'Smith Rentals'], riskScore: 65, lastActive: '2026-06-02T19:50:00Z' }
  ]);

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

  // Fetch Dashboard Stats & Primary Data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, userList, vehList, bookList, disputeList, payList, settingList, analyticsOverviewRes, analyticsHistoryRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.listUsers(undefined, undefined, undefined, 0, 100),
        adminService.listAllVehicles(undefined, undefined, 0, 100),
        adminService.listAllBookings(undefined, 0, 100),
        adminService.listAllDisputes(),
        adminService.listAllPayments(0, 100),
        adminService.listSettings(),
        adminService.getAnalyticsOverview(),
        adminService.getHistoricalAnalytics(30)
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
  const activeListingsCount = vehicles.filter(v => v.status === 'available').length;
  const pendingApprovalsCount = vehicles.filter(v => v.status === 'pending_approval').length;
  const pendingKycCount = users.filter(u => !u.kycVerified && u.role === 'customer').length;
  const openDisputesCount = disputes.filter(d => d.status === 'PENDING').length;
  const failedPaymentsCount = payments.filter(p => p.status === 'failed').length;
  const activeFraudAlertsCount = fraudAlerts.filter(f => f.status === 'pending').length;

  const menuItems = [
    { id: 'overview', label: t.adminDashboard.overview, icon: BarChart2, badge: 0 },
    { id: 'marketplace', label: t.adminDashboard.marketplace, icon: Globe, badge: 0 },
    { id: 'vehicles', label: t.adminDashboard.vehicles, icon: Car, badge: pendingApprovalsCount },
    { id: 'kyc', label: t.adminDashboard.kyc, icon: Shield, badge: pendingKycCount },
    { id: 'bookings', label: t.adminDashboard.bookings, icon: Calendar, badge: 0 },
    { id: 'payments', label: t.adminDashboard.payments, icon: DollarSign, badge: failedPaymentsCount },
    { id: 'disputes', label: t.adminDashboard.disputes, icon: Scale, badge: openDisputesCount },
    { id: 'users', label: t.adminDashboard.users, icon: Users, badge: 0 },
    { id: 'fraud', label: t.adminDashboard.fraud, icon: ShieldAlert, badge: activeFraudAlertsCount },
    { id: 'analytics', label: t.adminDashboard.analytics, icon: TrendingUp, badge: 0 },
    { id: 'notifications', label: t.adminDashboard.notifications, icon: Bell, badge: 0 },
    { id: 'logs', label: t.adminDashboard.logs, icon: FileText, badge: 0 },
    { id: 'health', label: t.adminDashboard.health, icon: Activity, badge: 0 },
    { id: 'settings', label: t.adminDashboard.settings, icon: Settings, badge: 0 },
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
    { name: 'Ô Tô (Cars)', value: vehicles.filter(v => v.vehicleType === 'car' || v.vehicleType === 'CAR' || (!v.vehicleType && v.category?.toLowerCase() !== 'motorbike')).length || 20 },
    { name: 'Xe Máy (Motorbikes)', value: vehicles.filter(v => v.vehicleType === 'motorbike' || v.vehicleType === 'MOTORBIKE').length || 15 }
  ];  return (
    <div className="theme-admin min-h-screen transition-colors duration-300 bg-[var(--lw-bg-primary)] text-[var(--lw-text-primary)]">

      <div style={{ display: 'flex' }}>
        
        {/* ============ SIDEBAR ============ */}
        <aside className="lw-sidebar hidden lg:flex bg-[var(--lw-sidebar-bg)] border-r border-[var(--lw-border)]">
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            {/* Role Badge only, no double logo on desktop */}
            <div className="px-5 py-4 border-b border-[var(--lw-border)]">
              <div className="lw-sidebar-role-badge bg-rose-500/10 text-rose-600 border border-rose-500/20 m-0 w-full flex items-center justify-center py-2.5">
                ✨ ADMIN
              </div>
            </div>

            {/* Sidebar Navigation items */}
            <div className="lw-sidebar-nav space-y-0.5">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-[var(--lw-text-secondary)] hover:bg-[var(--lw-bg-card-hover)] hover:text-[var(--lw-text-primary)]"
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
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group lw-sidebar-nav-item",
                      active && "active"
                    )}
                  >
                    <TabIcon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    {tab.badge > 0 && (
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
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--lw-border)] bg-[var(--lw-bg-secondary)] shadow-inner">
              <Avatar src={user?.avatar} name={user?.displayName || 'Test Admin'} size="md" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-[var(--lw-text-primary)]">{user?.displayName || 'Test Admin'}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-rose-500 mt-0.5">{t.adminDashboard.superAdmin}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-450 hover:text-red-500 transition-colors flex-shrink-0" title={t.adminDashboard.signOut}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
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
                      items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: t.adminDashboard.overview }]} 
                    />
                    {/* Executive KPI Grid - Standardized to 8 Cards in a 4x2 desktop grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Gross Booking Value', value: formatCurrency(totalGBV), icon: DollarSign, change: '+14% last month', style: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' },
                        { label: 'Platform Revenue', value: formatCurrency(platformRevenue), icon: Activity, change: '12% Fee base', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
                        { label: 'Owner Payouts', value: formatCurrency(ownerPayouts), icon: Users, change: '88% of total GBV', style: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
                        { label: 'Active Listings', value: activeListingsCount, icon: Car, change: 'Approved vehicles', style: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
                        { label: 'Pending Listings', value: pendingApprovalsCount, icon: AlertTriangle, change: 'Requires review', style: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
                        { label: 'Pending KYC Reviews', value: pendingKycCount, icon: Shield, change: 'Identity verification', style: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' },
                        { label: 'Open Disputes', value: openDisputesCount, icon: Scale, change: 'Arbitration cases', style: 'bg-red-500/10 border-red-500/20 text-red-500' },
                        { label: 'Fraud Alerts', value: activeFraudAlertsCount, icon: ShieldAlert, change: 'Critical attention', style: 'bg-rose-500/10 border-rose-500/20 text-rose-500' },
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
                        <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--lw-text-secondary)]">Marketplace Volume trends</h3>
                        <span className="text-[8px] font-black text-[var(--lw-accent)] bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">Daily Revenue Stream</span>
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
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-450">Fleet Split</h3>
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
                                Phân Loại
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
                                Phân Khúc
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
                              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Vehicles</span>
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
                    title="Vehicle Approval Roster" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Vehicles" }]} 
                  />
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verify dynamic vehicle spec requirements and accept registrations</p>
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
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
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
                                <StatusBadge status={v.approvalStatus || v.status} label={(v.approvalStatus || v.status)?.replace(/_/g, ' ').toUpperCase()} />
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

              {/* ============ TABS: KYC REVIEWS ============ */}
              {activeTab === 'kyc' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="KYC Verification Hub" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "KYC" }]} 
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
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
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
                                <StatusBadge status={u.kycVerified ? 'active' : 'pending'} label={u.kycVerified ? 'VERIFIED' : 'PENDING'} />
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
                    title="Marketplace Booking Ledger" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Bookings" }]} 
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Audit guest bookings, schedules, and active rental status states</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        placeholder="Search Renter, Owner, or ID..."
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
                              <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
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
                                  <StatusBadge status={b.status} label={b.status?.toUpperCase()} />
                                </td>
                                <td className="py-4 px-6">
                                  <StatusBadge status={b.paymentStatus === 'paid' ? 'active' : 'inactive'} label={(b.paymentStatus || 'unpaid').toUpperCase()} />
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
                    title="Financial Operations" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Payments" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stripe-style transaction ledger, payouts splits, and failed payments</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Gross Volume', value: formatCurrency(totalGBV), icon: DollarSign, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/20' },
                      { label: 'Refunds Processed', value: formatCurrency(payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0)), icon: RefreshCw, color: 'text-rose-500 bg-rose-500/5 border-rose-500/20' },
                      { label: 'Platform Commission', value: formatCurrency(platformRevenue), icon: Activity, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' },
                      { label: 'Successful Payouts', value: formatCurrency(ownerPayouts), icon: CheckCircle, color: 'text-blue-500 bg-blue-500/5 border-blue-500/20' },
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

                  {/* Payment Table */}
                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Transaction Reference ID', 'Guest Renter', 'Amount', 'Currency', 'Gateway Method', 'Creation Date', 'State Status'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDark ? "divide-slate-850" : "divide-slate-100")}>
                        {filteredPayments.length === 0 ? (
                          <tr><td colSpan={7} className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-20">No transaction parameters cataloged.</td></tr>
                        ) : (
                          filteredPayments.map(p => (
                            <tr key={p.id} className={cn("transition-colors duration-200", isDark ? "hover:bg-slate-900/30" : "hover:bg-slate-50/20")}>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-slate-450 dark:text-indigo-400">{p.transactionId}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-450 dark:text-slate-400">{p.userId || 'Guest'}</td>
                              <td className="px-6 py-4 text-xs font-black text-emerald-500">{formatCurrency(p.amount)}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.currency || 'VND'}</td>
                              <td className="px-6 py-4">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-slate-500/10 rounded-lg uppercase tracking-wider">{p.method}</span>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-455">{formatDate(p.createdAt || new Date().toISOString())}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={p.status === 'succeeded' || p.status === 'success' ? 'active' : p.status === 'pending' ? 'pending' : 'failed'} label={p.status?.toUpperCase()} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ TABS: DISPUTES HUB ============ */}
              {activeTab === 'disputes' && (
                <div className="space-y-6">
                  <Breadcrumbs 
                    title="Dispute Resolution Room" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Disputes" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Review customer evidence documents and resolve transaction conflicts</p>
                  </div>

                  <div className={cn(
                    "border rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 w-full",
                    isDark ? "bg-slate-900/60 border-slate-800/80 shadow-slate-950/40" : "bg-white border-slate-200/60"
                  )}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={cn("border-b", isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-150")}>
                          {['Dispute ID', 'Booking Reference', 'Conflict Reason', 'Current State', 'Creation Date'].map(h => (
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
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
                                <StatusBadge status={d.status === 'RESOLVED' ? 'active' : d.status === 'PENDING' ? 'pending' : 'inactive'} label={d.status} />
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
                    title="Platform Accounts Directory" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Users" }]} 
                  />
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Audit user access, verify customer/owner profiles, and manage status logs</p>
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
                        <option value="ALL">All Roles</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <select
                        value={userKycStatusFilter}
                        onChange={e => setUserKycStatusFilter(e.target.value)}
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
                          placeholder="Search by name or email..."
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
                            <th key={h} className="text-left px-6 py-4.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
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
                                  )}>{u.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={u.kycVerified ? 'active' : 'pending'} label={u.kycVerified ? 'VERIFIED' : 'PENDING'} />
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={isUserActive ? 'active' : 'inactive'} label={isUserActive ? 'ACTIVE' : 'BLOCKED'} />
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
                    title="Fraud & Risk Control Center" 
                    items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Fraud Center" }]} 
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real-time risk scoring, device fingerprint verification, and VPN block lists</p>
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
                                <th key={h} className="text-left py-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-450">{h}</th>
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
                  const dlFront = kycUserDocs.find(d => d.documentType === 'DRIVER_LICENSE_FRONT');
                  const dlBack = kycUserDocs.find(d => d.documentType === 'DRIVER_LICENSE_BACK');
                  const selfie = kycUserDocs.find(d => d.documentType === 'SELFIE');

                  if (!cccdFront && !cccdBack && !dlFront && !dlBack && !selfie) {
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

                          {/* DL Front */}
                          <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">DL Front</span>
                            {dlFront ? (
                              <img src={resolveDocUrl(dlFront.url)} className="w-full h-32 object-cover" alt="Driver License Front" />
                            ) : (
                              <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No DL Front Image</div>
                            )}
                          </div>

                          {/* DL Back */}
                          <div className="border dark:border-slate-850 rounded-xl overflow-hidden bg-slate-500/5 relative">
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">DL Back</span>
                            {dlBack ? (
                              <img src={resolveDocUrl(dlBack.url)} className="w-full h-32 object-cover" alt="Driver License Back" />
                            ) : (
                              <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No DL Back Image</div>
                            )}
                          </div>
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

                        {/* Driver License OCR */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">DRIVING LICENSE OCR DATA</span>
                          <div className="p-3.5 bg-slate-500/5 rounded-xl border dark:border-slate-850 text-xs space-y-1.5 font-semibold text-slate-400">
                            <div className="flex justify-between">
                              <span>License Name:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{dlFront?.licenseFullName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>License Number:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{dlFront?.licenseNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>License Class:</span>
                              <span className="font-black text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded font-extrabold">{dlFront?.licenseClass || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

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
                {(selectedKycUser.kycStatus === 'PENDING' || !selectedKycUser.kycVerified) && (
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
