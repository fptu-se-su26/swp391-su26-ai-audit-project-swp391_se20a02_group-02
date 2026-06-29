import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, Heart, Shield, LogOut, ChevronRight,
  TrendingUp, Settings, Users, CheckSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store';
import { cn, getInitials } from '@/utils';
import Avatar from '@/components/ui/Avatar';

// Localized translation dictionaries for Dropdown UI elements to ensure 100% translation in all 8 languages.
const LOCALIZATION: Record<string, Record<string, string>> = {
  en: {
    roleCustomer: 'Customer',
    roleOwner: 'Vehicle Owner',
    roleAdmin: 'Admin',
    myBookings: 'My Bookings',
    favorites: 'Favorites',
    profile: 'Profile',
    ownerDashboard: 'Owner Dashboard',
    manageVehicles: 'Manage Vehicles',
    bookings: 'Bookings',
    earnings: 'Earnings',
    adminDashboard: 'Admin Dashboard',
    userManagement: 'User Management',
    vehicleApproval: 'Vehicle Approval',
    systemSettings: 'System Settings',
    logout: 'Logout'
  },
  vi: {
    roleCustomer: 'Khách hàng',
    roleOwner: 'Chủ xe',
    roleAdmin: 'Quản trị viên',
    myBookings: 'Chuyến đi của tôi',
    favorites: 'Yêu thích',
    profile: 'Hồ sơ',
    ownerDashboard: 'Kênh chủ xe',
    manageVehicles: 'Quản lý xe',
    bookings: 'Lượt thuê xe',
    earnings: 'Thu nhập',
    adminDashboard: 'Bảng quản trị',
    userManagement: 'Quản lý người dùng',
    vehicleApproval: 'Duyệt phương tiện',
    systemSettings: 'Cấu hình hệ thống',
    logout: 'Đăng xuất'
  },
  ja: {
    roleCustomer: '顧客',
    roleOwner: '車両オーナー',
    roleAdmin: '管理者',
    myBookings: 'マイブッキング',
    favorites: 'お気に入り',
    profile: 'プロフィール',
    ownerDashboard: 'オーナーダッシュボード',
    manageVehicles: '車両管理',
    bookings: '予約リスト',
    earnings: '売上・収益',
    adminDashboard: '管理者ダッシュボード',
    userManagement: 'ユーザー管理',
    vehicleApproval: '車両承認',
    systemSettings: 'システム設定',
    logout: 'ログアウト'
  },
  ko: {
    roleCustomer: '고객',
    roleOwner: '차량 소유자',
    roleAdmin: '관리자',
    myBookings: '내 예약',
    favorites: '즐겨찾기',
    profile: '프로필',
    ownerDashboard: '파트너 대시보드',
    manageVehicles: '차량 관리',
    bookings: '예약 목록',
    earnings: '수익 관리',
    adminDashboard: '관리 대시보드',
    userManagement: '회원 관리',
    vehicleApproval: '차량 승인',
    systemSettings: '시스템 설정',
    logout: '로그아웃'
  },
  zh: {
    roleCustomer: '客户',
    roleOwner: '车主',
    roleAdmin: '管理员',
    myBookings: '我的预订',
    favorites: '我的收藏',
    profile: '个人资料',
    ownerDashboard: '车主仪表盘',
    manageVehicles: '车辆管理',
    bookings: '预订列表',
    earnings: '我的收益',
    adminDashboard: '系统管理后台',
    userManagement: '用户管理',
    vehicleApproval: '车辆审核',
    systemSettings: '系统设置',
    logout: '退出登录'
  },
  fr: {
    roleCustomer: 'Client',
    roleOwner: 'Propriétaire',
    roleAdmin: 'Admin',
    myBookings: 'Mes Réservations',
    favorites: 'Favoris',
    profile: 'Profil',
    ownerDashboard: 'Tableau de Bord',
    manageVehicles: 'Gérer les Véhicules',
    bookings: 'Réservations',
    earnings: 'Revenus',
    adminDashboard: 'Tableau de Bord Admin',
    userManagement: 'Gestion des Utilisateurs',
    vehicleApproval: 'Approbation Véhicules',
    systemSettings: 'Paramètres Système',
    logout: 'Déconnexion'
  },
  de: {
    roleCustomer: 'Kunde',
    roleOwner: 'Fahrzeugbesitzer',
    roleAdmin: 'Administrator',
    myBookings: 'Meine Buchungen',
    favorites: 'Favoriten',
    profile: 'Profil',
    ownerDashboard: 'Eigentümer-Dashboard',
    manageVehicles: 'Fahrzeuge verwalten',
    bookings: 'Buchungen',
    earnings: 'Einnahmen',
    adminDashboard: 'Admin-Dashboard',
    userManagement: 'Benutzerverwaltung',
    vehicleApproval: 'Fahrzeugzulassung',
    systemSettings: 'Systemeinstellungen',
    logout: 'Abmelden'
  },
  es: {
    roleCustomer: 'Cliente',
    roleOwner: 'Propietario',
    roleAdmin: 'Admin',
    myBookings: 'Mis Reservas',
    favorites: 'Favoritos',
    profile: 'Perfil',
    ownerDashboard: 'Panel de Propietario',
    manageVehicles: 'Gestionar Vehículos',
    bookings: 'Reservas',
    earnings: 'Ganancias',
    adminDashboard: 'Panel de Admin',
    userManagement: 'Gestión de Usuarios',
    vehicleApproval: 'Aprobación de Vehículos',
    systemSettings: 'Ajustes del Sistema',
    logout: 'Cerrar Sesión'
  }
};

interface NavbarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavbarDropdown: React.FC<NavbarDropdownProps> = ({ isOpen, onClose }) => {
  const { user, isCustomer, isOwner, isAdmin, logout } = useAuth();
  const { theme, language } = useUIStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const l = LOCALIZATION[language] || LOCALIZATION.en;

  // Handle close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!user) return null;

  // Get active menu items and role label based on role flags
  let menuItems: Array<{ icon: React.ComponentType<any>; label: string; href: string }> = [];
  let roleLabel = l.roleCustomer;
  let roleColorClass = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';

  if (isAdmin) {
    roleLabel = l.roleAdmin;
    roleColorClass = 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    menuItems = [
      { icon: Shield, label: l.adminDashboard, href: '/admin' },
      { icon: Users, label: l.userManagement, href: '/admin?tab=users' },
      { icon: CheckSquare, label: l.vehicleApproval, href: '/admin?tab=vehicles' },
      { icon: Settings, label: l.systemSettings, href: '/admin?tab=settings' },
    ];
  } else if (isOwner) {
    roleLabel = l.roleOwner;
    roleColorClass = 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    menuItems = [
      { icon: Shield, label: l.ownerDashboard, href: '/owner' },
      { icon: CheckSquare, label: l.manageVehicles, href: '/owner/vehicles' },
      { icon: Calendar, label: l.bookings, href: '/owner/bookings' },
      { icon: TrendingUp, label: l.earnings, href: '/owner/revenue' },
    ];
  } else {
    // Customer
    menuItems = [
      { icon: Calendar, label: 'Dashboard', href: '/dashboard' },
      { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ];
  }

  const handleLogoutClick = () => {
    onClose();
    logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute right-0 mt-3.5 w-76 rounded-[28px] border shadow-2xl overflow-hidden z-50 transition-colors duration-300',
            isDark
              ? 'bg-slate-950/95 border-slate-800/80 backdrop-blur-xl text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
              : 'bg-white/95 border-slate-100 backdrop-blur-xl text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
          )}
        >
          {/* Top Gradient bar for a premium automotive feeling */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-650 w-full" />

          {/* User Info & Header */}
          <div
            className={cn(
              'p-6 border-b transition-colors duration-300',
              isDark ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
            )}
          >
            <div className="flex items-center gap-3.5">
              <Avatar src={user.avatar} name={user.displayName} size="lg" className="ring-2 ring-indigo-500/10" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm truncate leading-tight">{user.displayName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest mt-2', roleColorClass)}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Links */}
          <div className="p-3 space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group hover:translate-x-1.5',
                  isDark
                    ? 'text-slate-350 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
                )}
              >
                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-550 transition-colors" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className={cn('border-t p-3', isDark ? 'border-slate-800/80' : 'border-slate-100')}>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavbarDropdown;
