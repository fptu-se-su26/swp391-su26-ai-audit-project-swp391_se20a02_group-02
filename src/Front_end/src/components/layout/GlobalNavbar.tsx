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
  { code: 'USD', label: 'USD', flag: '🇺🇸', symbol: '$' },
  { code: 'JPY', label: 'JPY', flag: '🇯🇵', symbol: '¥' },
  { code: 'VND', label: 'VND', flag: '🇻🇳', symbol: '₫' },
  { code: 'KRW', label: 'KRW', flag: '🇰🇷', symbol: '₩' },
  { code: 'CNY', label: 'CNY', flag: '🇨🇳', symbol: '¥' },
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
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/map', label: 'Map' },
    { href: '/dashboard/bookings', label: 'Trips' },
    { href: '/owner/register', label: 'Become Owner' },
  ];

  const currentLang = LANGS.find(lang => lang.code === language) || LANGS[0];
  const currentCurr = CURRENCIES.find(curr => curr.code === currency) || CURRENCIES[0];

  const isLandingPage = location.pathname === '/';
  const showGlassBg = !isLandingPage || isScrolled;

  const navBg = showGlassBg
    ? isDark
      ? 'bg-[#0B1221] border-b border-slate-800 shadow-sm'
      : 'bg-white border-b border-slate-100 shadow-sm'
    : 'bg-transparent border-transparent';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 flex items-center h-16',
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
            className="transition-transform duration-300"
          />
        </Link>

        {/* Center Side: Navigation Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-2 font-sans">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-4 py-2 rounded-md text-xs uppercase tracking-widest font-bold transition-all duration-200',
                isActive(link.href)
                  ? showGlassBg
                    ? 'bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221]'
                    : 'bg-white text-[#0B1221]'
                  : showGlassBg
                    ? 'text-slate-600 hover:text-[#0B1221] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Global controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search trigger */}
          <button
            onClick={() => navigate('/search')}
            className={cn(
              'p-2.5 rounded-md transition-all',
              showGlassBg
                ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                : 'text-white/85 hover:bg-white/10'
            )}
            title={l.search}
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Language Selector Dropdown */}
          <div ref={langRef} className="relative font-sans">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCurrDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={cn(
                'flex items-center gap-1.5 p-2 rounded-md transition-all text-xs font-bold',
                showGlassBg
                  ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  : 'text-white/85 hover:bg-white/10'
              )}
              title="Change Language"
            >
              <span>{currentLang.flag}</span>
              <span className="uppercase">{currentLang.code}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            
            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-xl py-1.5 z-50 overflow-hidden"
                >
                  {LANGS.filter(l => ['en', 'vi', 'ja', 'ko', 'zh'].map(x => x.toLowerCase()).includes(l.code)).map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left',
                        language === lang.code ? 'text-amber-500 bg-amber-500/5' : 'text-slate-700 dark:text-slate-250'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {language === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Currency Selector Dropdown */}
          <div ref={currRef} className="relative font-sans">
            <button
              onClick={() => {
                setCurrDropdownOpen(!currDropdownOpen);
                setLangDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={cn(
                'flex items-center gap-1.5 p-2 rounded-md transition-all text-xs font-bold',
                showGlassBg
                  ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  : 'text-white/85 hover:bg-white/10'
              )}
              title="Change Currency"
            >
              <span className="text-[10px] bg-slate-500/10 dark:bg-white/10 px-1 py-0.5 rounded text-amber-500 font-bold">{currentCurr.symbol}</span>
              <span className="uppercase">{currentCurr.code}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            
            <AnimatePresence>
              {currDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-xl py-1.5 z-50 overflow-hidden"
                >
                  {CURRENCIES.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setCurrDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left',
                        currency === curr.code ? 'text-amber-500 bg-amber-500/5' : 'text-slate-700 dark:text-slate-250'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] w-5 text-center bg-slate-500/10 dark:bg-white/10 py-0.5 rounded text-amber-500 font-bold">{curr.symbol}</span>
                        <span>{curr.label}</span>
                      </span>
                      {currency === curr.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'p-2.5 rounded-md transition-all',
              showGlassBg
                ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800'
                : 'text-white/85 hover:bg-white/10'
            )}
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>


          {/* Authed Message & Notifications Icons */}
          {isAuthenticated && (
            <>
              <div className="relative font-sans">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setMessageOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'relative p-2.5 rounded-md transition-all',
                    showGlassBg
                      ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'text-white/85 hover:bg-white/10'
                  )}
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-550 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
              </div>

              <div className="relative font-sans">
                <button
                  onClick={() => {
                    setMessageOpen(!messageOpen);
                    setNotificationOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'p-2.5 rounded-md transition-all',
                    showGlassBg
                      ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'text-white/85 hover:bg-white/10'
                  )}
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
                <MessageDropdown isOpen={messageOpen} onClose={() => setMessageOpen(false)} />
              </div>
            </>
          )}

          {/* Auth Trigger Buttons (Avatar / Login options) */}
          {isAuthenticated && user ? (
            <div className="relative font-sans">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationOpen(false);
                  setMessageOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border transition-all text-xs font-bold',
                  showGlassBg
                    ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0B1221]'
                    : 'border-white/15 bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                <Avatar src={user.avatar} name={user.displayName} className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-xs font-bold max-w-24 truncate hidden sm:block">
                  {user.firstName}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 opacity-60 transition-transform duration-200', userDropdownOpen && 'rotate-180')} />
              </button>

              <NavbarDropdown isOpen={userDropdownOpen} onClose={() => setUserDropdownOpen(false)} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center font-sans">
              <Link
                to="/auth/login"
                className="text-xs uppercase tracking-widest font-bold px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221] rounded-md transition-all duration-200"
              >
                Login
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'p-2.5 rounded-md md:hidden transition-all',
              showGlassBg
                ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                : 'text-white/85 hover:bg-white/10'
            )}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default GlobalNavbar;
