import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, MessageSquare, Menu, X, ChevronDown,
  Sun, Moon, Globe, Check, LogOut, Calendar, Heart, User, Shield, HelpCircle, Star, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore, useNotificationStore } from '@/store';
import { cn, getInitials } from '@/utils';
import { useT } from '@/i18n/translations';
import NavbarDropdown from './NavbarDropdown';
import NotificationDropdown from './NotificationDropdown';
import MessageDropdown from './MessageDropdown';
import Avatar from '@/components/ui/Avatar';
import logoImage from '../../image/logo.png';
import { notificationService } from '@/services/otherServices';

const LANGS = [
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
  { code: 'ko' as const, label: '한국어', flag: '🇰🇷' },
  { code: 'zh' as const, label: '中文', flag: '🇨🇳' },
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
];

const CURRENCIES = [
  { code: 'VND', label: 'VND', flag: '🇻🇳', symbol: '₫' },
  { code: 'USD', label: 'USD', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', label: 'EUR', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', label: 'JPY', flag: '🇯🇵', symbol: '¥' },
  { code: 'SGD', label: 'SGD', flag: '🇸🇬', symbol: 'S$' },
  { code: 'KRW', label: 'KRW', flag: '🇰🇷', symbol: '₩' },
];

// Localized items for Global Navbar to guarantee no mixed languages
const NAV_LOCALIZATION: Record<string, Record<string, string>> = {
  en: {
    browseCars: 'Browse Cars',
    reviews: 'Reviews',
    help: 'Help',
    search: 'Search',
    language: 'Language',
    currency: 'Currency',
    account: 'Account',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    myBookings: 'My Bookings',
    favorites: 'Favorites',
    profile: 'Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    ownerDashboard: 'Owner Dashboard',
    adminDashboard: 'Admin Dashboard',
  },
  vi: {
    browseCars: 'Xem xe',
    reviews: 'Đánh giá',
    help: 'Hỗ trợ',
    search: 'Tìm kiếm',
    language: 'Ngôn ngữ',
    currency: 'Tiền tệ',
    account: 'Tài khoản',
    signIn: 'Đăng nhập',
    getStarted: 'Bắt đầu',
    myBookings: 'Chuyến đi của tôi',
    favorites: 'Yêu thích',
    profile: 'Hồ sơ',
    logout: 'Đăng xuất',
    dashboard: 'Bảng điều khiển',
    ownerDashboard: 'Kênh chủ xe',
    adminDashboard: 'Bảng quản trị',
  },
  ja: {
    browseCars: '車両を探す',
    reviews: 'レビュー',
    help: 'ヘルプ',
    search: '検索',
    language: '言語',
    currency: '通貨',
    account: 'アカウント',
    signIn: 'サインイン',
    getStarted: '新規登録',
    myBookings: 'マイブッキング',
    favorites: 'お気に入り',
    profile: 'プロフィール',
    logout: 'ログアウト',
    dashboard: 'ダッシュボード',
    ownerDashboard: 'オーナーパネル',
    adminDashboard: '管理パネル',
  },
  ko: {
    browseCars: '차량 찾기',
    reviews: '리뷰',
    help: '도움말',
    search: '검색',
    language: '언어',
    currency: '화폐',
    account: '계정',
    signIn: '로그인',
    getStarted: '시작하기',
    myBookings: '내 예약',
    favorites: '즐겨찾기',
    profile: '프로필',
    logout: '로그아웃',
    dashboard: '대시보드',
    ownerDashboard: '파트너 패널',
    adminDashboard: '관리 패널',
  },
  zh: {
    browseCars: '浏览车辆',
    reviews: '用户评价',
    help: '帮助中心',
    search: '搜索',
    language: '语言选择',
    currency: '结算币种',
    account: '账户信息',
    signIn: '登录',
    getStarted: '开启体验',
    myBookings: '我的行程',
    favorites: '我的收藏',
    profile: '个人主页',
    logout: '登出',
    dashboard: '控制台',
    ownerDashboard: '车主后台',
    adminDashboard: '系统后台',
  },
  fr: {
    browseCars: 'Parcourir',
    reviews: 'Avis',
    help: 'Aide',
    search: 'Recherche',
    language: 'Langue',
    currency: 'Devise',
    account: 'Compte',
    signIn: 'Connexion',
    getStarted: 'Créer un compte',
    myBookings: 'Réservations',
    favorites: 'Favoris',
    profile: 'Profil',
    logout: 'Déconnexion',
    dashboard: 'Tableau de Bord',
    ownerDashboard: 'Espace Propriétaire',
    adminDashboard: 'Espace Admin',
  },
  de: {
    browseCars: 'Fahrzeuge',
    reviews: 'Bewertungen',
    help: 'Hilfe',
    search: 'Suche',
    language: 'Sprache',
    currency: 'Währung',
    account: 'Konto',
    signIn: 'Anmelden',
    getStarted: 'Registrieren',
    myBookings: 'Buchungen',
    favorites: 'Favoriten',
    profile: 'Profil',
    logout: 'Abmelden',
    dashboard: 'Dashboard',
    ownerDashboard: 'Vermieter-Bereich',
    adminDashboard: 'Admin-Bereich',
  },
  es: {
    browseCars: 'Ver Autos',
    reviews: 'Reseñas',
    help: 'Ayuda',
    search: 'Buscar',
    language: 'Idioma',
    currency: 'Moneda',
    account: 'Cuenta',
    signIn: 'Iniciar Sesión',
    getStarted: 'Empezar',
    myBookings: 'Mis Reservas',
    favorites: 'Favoritos',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    dashboard: 'Panel de Control',
    ownerDashboard: 'Panel de Propietario',
    adminDashboard: 'Panel de Admin',
  }
};

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { user, isAuthenticated, isCustomer, isOwner, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotificationStore();

  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    currency,
    setCurrency,
    mobileMenuOpen,
    setMobileMenuOpen,
    isScrolled,
    setScrolled,
    sidebarOpen
  } = useUIStore();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [mobileCurrOpen, setMobileCurrOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const l = NAV_LOCALIZATION[language] || NAV_LOCALIZATION.en;

  // Handle sticky scroll animation trigger
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrolled]);

  // Click outside listener for Language & Currency dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (currRef.current && !currRef.current.contains(e.target as Node)) {
        setCurrDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch & poll unread notification count from the real backend
  const { setUnreadCount } = useNotificationStore();
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    // Fetch immediately on login/mount
    notificationService.getUnreadCount().then(setUnreadCount);
    // Poll every 60 seconds to stay in sync
    const timer = setInterval(() => {
      notificationService.getUnreadCount().then(setUnreadCount);
    }, 60_000);
    return () => clearInterval(timer);
  }, [isAuthenticated, setUnreadCount]);

  const isActive = (path: string) => {
    if (path === '/marketplace') {
      return location.pathname === '/marketplace' || location.pathname === '/vehicles' || location.pathname === '/search';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { href: '/marketplace', label: l.browseCars },
    { href: '/reviews', label: l.reviews },
    { href: '/help', label: l.help },
  ];

  const currentLang = LANGS.find(lang => lang.code === language) || LANGS[0];
  const currentCurr = CURRENCIES.find(curr => curr.code === currency) || CURRENCIES[0];

  // Navbar is ALWAYS full-width, fixed at top-0, left-0
  // Sidebar slides under the navbar using top: 64px

  // Always show glassmorphism on subpages/dashboards, dynamic trigger on home/landing page
  const isLandingPage = location.pathname === '/';
  const showGlassBg = !isLandingPage || isScrolled;

  const navBg = showGlassBg
    ? isDark
      ? 'bg-slate-950/95 backdrop-blur-xl border-slate-900/60 shadow-lg'
      : 'bg-white border-slate-100/80 shadow-sm'
    : 'bg-transparent border-transparent';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 flex items-center border-b h-16',
        navBg
      )}
    >
      {/* Full width container with large horizontal padding matching high-end layout standards */}
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* Left Side: Logo & Brand (ALWAYS visible on all pages) */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group transition-all duration-200"
        >
          <img
            src={logoImage}
            alt="LuxeWay"
            style={{ height: '60px', width: 'auto', display: 'block' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Center Side: Navigation Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-2.5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-5 py-2.5 rounded-2xl text-base font-bold transition-all duration-200 hover-lift',
                isActive(link.href)
                  ? isDark
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-slate-950 text-white shadow-md'
                  : isDark
                    ? 'text-slate-350 hover:text-white hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Global controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Search trigger */}
          <button
            onClick={() => navigate('/search')}
            className={cn(
              'p-2.5 sm:p-3 rounded-2xl transition-all hover-lift',
              isDark ? 'text-slate-350 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
            )}
            title={l.search}
          >
            <Search className="w-5.5 h-5.5" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'p-2.5 sm:p-3 rounded-2xl transition-all hover-lift',
              isDark ? 'text-yellow-400 hover:bg-slate-800/40' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
            )}
          >
            {isDark ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
          </button>

          {/* Language Dropdown Selector (Desktop) */}
          <div ref={langRef} className="relative hidden lg:block">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCurrDropdownOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover-lift',
                isDark ? 'text-slate-355 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="uppercase">{currentLang.code}</span>
              <span>{currentLang.flag}</span>
              <ChevronDown className={cn('w-4 h-4 opacity-60 transition-transform duration-200', langDropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 mt-2 w-52 rounded-[20px] border shadow-[0_15px_30px_rgba(0,0,0,0.1)] overflow-hidden z-50',
                    isDark ? 'bg-slate-900/95 border-slate-800/80' : 'bg-white/95 border-slate-100'
                  )}
                >
                  <div className="p-1.5 max-h-64 overflow-y-auto">
                    {LANGS.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                          language === lang.code
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'text-slate-655 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                        )}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="flex-1 text-left">{lang.label}</span>
                        {language === lang.code && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Currency Dropdown Selector (Desktop) */}
          <div ref={currRef} className="relative hidden lg:block">
            <button
              onClick={() => {
                setCurrDropdownOpen(!currDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover-lift',
                isDark ? 'text-slate-355 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <span>{currentCurr.flag}</span>
              <span className="uppercase">{currentCurr.code}</span>
              <span className="opacity-60">({currentCurr.symbol})</span>
              <ChevronDown className={cn('w-4 h-4 opacity-60 transition-transform duration-200', currDropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {currDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 mt-2 w-52 rounded-[20px] border shadow-[0_15px_30px_rgba(0,0,0,0.1)] overflow-hidden z-50',
                    isDark ? 'bg-slate-900/95 border-slate-800/80' : 'bg-white/95 border-slate-100'
                  )}
                >
                  <div className="p-1.5">
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code);
                          setCurrDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                          currency === curr.code
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'text-slate-655 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                        )}
                      >
                        <span className="text-base">{curr.flag}</span>
                        <span className="flex-1 text-left">{curr.code} ({curr.symbol})</span>
                        {currency === curr.code && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authed Message & Notifications Icons */}
          {isAuthenticated && (
            <>
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setMessageOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'relative p-2.5 sm:p-3 rounded-2xl transition-all hover-lift',
                    isDark ? 'text-slate-355 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
                  )}
                >
                  <Bell className="w-5.5 h-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setMessageOpen(!messageOpen);
                    setNotificationOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'p-2.5 sm:p-3 rounded-2xl transition-all hover-lift',
                    isDark ? 'text-slate-355 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
                  )}
                >
                  <MessageSquare className="w-5.5 h-5.5" />
                </button>
                <MessageDropdown isOpen={messageOpen} onClose={() => setMessageOpen(false)} />
              </div>
            </>
          )}

          {/* Auth Trigger Buttons (Avatar / Login options) */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationOpen(false);
                  setMessageOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 sm:gap-2.5 pl-2 pr-3.5 py-2 rounded-2xl border transition-all hover-lift',
                  isDark
                    ? 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800'
                    : 'border-slate-150 bg-white hover:bg-slate-50'
                )}
              >
                <Avatar src={user.avatar} name={user.displayName} className="w-9 h-9 sm:w-10 sm:h-10 ring-2 ring-indigo-500/10" />
                <span className="text-sm font-bold max-w-24 truncate hidden sm:block">
                  {user.firstName}
                </span>
                <ChevronDown className={cn('w-4 h-4 opacity-60 transition-transform duration-200', userDropdownOpen && 'rotate-180')} />
              </button>

              <NavbarDropdown isOpen={userDropdownOpen} onClose={() => setUserDropdownOpen(false)} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center">
              <Link
                to="/auth/login"
                className="btn-primary text-sm px-6 py-2.5 shadow-lg shadow-indigo-550/10 hover-lift bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-2xl"
              >
                {l.signIn}
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'p-2.5 sm:p-3 rounded-2xl md:hidden transition-all hover-lift',
              isDark ? 'text-slate-355 hover:bg-slate-800/40 hover:text-white' : 'text-slate-655 hover:bg-slate-50 hover:text-slate-950'
            )}
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Hamburger Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={cn(
              'absolute top-full left-0 w-full border-b overflow-hidden md:hidden shadow-luxury',
              isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'
            )}
          >
            <div className="px-4 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                      isActive(link.href)
                        ? isDark
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-900'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Account / Auth Links */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
                {isAuthenticated && user ? (
                  <div>
                    <button
                      onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Avatar src={user.avatar} name={user.displayName} size="sm" className="ring-1 ring-indigo-500/10" />
                        {l.account}
                      </span>
                      <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileAccountOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {mobileAccountOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-6 pr-2 space-y-1 overflow-hidden"
                        >
                          {/* Role Specific Shortcuts */}
                          {isAdmin ? (
                            <>
                              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.adminDashboard}</Link>
                              <Link to="/admin?tab=users" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.userManagement}</Link>
                              <Link to="/admin?tab=vehicles" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.vehicleApproval}</Link>
                            </>
                          ) : isOwner ? (
                            <>
                              <Link to="/owner" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.ownerDashboard}</Link>
                              <Link to="/owner/vehicles" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.manageVehicles}</Link>
                              <Link to="/owner/bookings" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.bookings}</Link>
                            </>
                          ) : (
                            <>
                              <Link to="/dashboard/bookings" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.myBookings}</Link>
                              <Link to="/dashboard/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.favorites}</Link>
                              <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-400">{l.profile}</Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              logout();
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{l.logout}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary w-full justify-center py-3 text-sm font-bold bg-indigo-600 text-white rounded-2xl flex items-center"
                    >
                      {l.signIn}
                    </Link>
                  </div>
                )}
              </div>

              {/* Language mobile selector */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <button
                  onClick={() => setMobileLangOpen(!mobileLangOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-left"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-slate-400" />
                    {l.language} ({currentLang.label})
                  </span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileLangOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {mobileLangOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-6 pr-2 py-1 max-h-48 overflow-y-auto space-y-1"
                    >
                      {LANGS.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold',
                            language === lang.code
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Currency mobile selector */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <button
                  onClick={() => setMobileCurrOpen(!mobileCurrOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-left"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-slate-400" />
                    {l.currency} ({currentCurr.code} - {currentCurr.symbol})
                  </span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileCurrOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {mobileCurrOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-6 pr-2 py-1 space-y-1"
                    >
                      {CURRENCIES.map(curr => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold',
                            currency === curr.code
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                          )}
                        >
                          <span>{curr.flag}</span>
                          <span>{curr.code} ({curr.symbol})</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default GlobalNavbar;
