import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car, Search, Bell, MessageSquare, Menu, X,
  User, LogOut, LayoutDashboard, Heart, ChevronDown,
  Sparkles, Shield, Star, Sun, Moon, Globe, Check, Wallet
} from 'lucide-react';
import { useAuthStore, useUIStore, useNotificationStore } from '@/store';
import { cn, getInitials } from '@/utils';
import { notificationService } from '@/services/otherServices';
import { useT } from '@/i18n/translations';
import logoImage from '@/image/logo.png';


// ====== LANGUAGE LABELS ======
const LANGS = [
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
  { code: 'ko' as const, label: '한국어', flag: '🇰🇷' },
  { code: 'zh' as const, label: '中文', flag: '🇨🇳' },
];


// ====== THEME TOGGLE BUTTON ======
const ThemeToggle: React.FC = () => {
  const t = useT();
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDark ? t.nav.themeLight : t.nav.themeDark}
      className={cn(
        'relative p-2.5 rounded-xl transition-all duration-300',
        isDark
          ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ====== LANGUAGE SWITCHER ======
const LanguageSwitcher: React.FC = () => {
  const t = useT();
  const { language, setLanguage } = useUIStore();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGS.find(l => l.code === language) || LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 hover:text-slate-900 transition-colors duration-200"
        title={t.nav.changeLanguage}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase hidden sm:block">{current.code}</span>
        <span className="text-xs hidden sm:block">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-luxury overflow-hidden z-50"
          >
            {LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  language === lang.code
                    ? 'bg-blue-50 text-accent font-semibold dark:bg-blue-900/30'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && <Check className="w-3.5 h-3.5 ml-auto text-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ====== CURRENCY LABELS ======
const CURRENCIES = [
  { code: 'VND', label: 'VND', flag: '🇻🇳', symbol: '₫' },
  { code: 'USD', label: 'USD', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', label: 'EUR', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', label: 'JPY', flag: '🇯🇵', symbol: '¥' },
  { code: 'SGD', label: 'SGD', flag: '🇸🇬', symbol: 'S$' },
  { code: 'KRW', label: 'KRW', flag: '🇰🇷', symbol: '₩' },
];

// ====== CURRENCY SWITCHER ======
const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useUIStore();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 hover:text-slate-900 transition-colors duration-200"
        title="Change Currency"
      >
        <Globe className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase">{current.code}</span>
        <span className="text-xs">{current.symbol}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-luxury overflow-hidden z-50"
          >
            {CURRENCIES.map(curr => (
              <button
                key={curr.code}
                onClick={() => { setCurrency(curr.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  currency === curr.code
                    ? 'bg-blue-50 text-accent font-semibold dark:bg-blue-900/30'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                <span className="text-lg">{curr.flag}</span>
                <span className="font-semibold">{curr.code} ({curr.symbol})</span>
                {currency === curr.code && <Check className="w-3.5 h-3.5 ml-auto text-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ====== MAIN NAVBAR ======
export const Navbar: React.FC = () => {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isScrolled, setScrolled, mobileMenuOpen, setMobileMenuOpen, theme } = useUIStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrolled]);

  React.useEffect(() => {
    if (user) {
      const count = notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    }
  }, [user, setUnreadCount]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const navLinks = [
    { href: '/marketplace', label: t.nav.marketplace },
    { href: '/reviews', label: t.nav.reviews },
    { href: '/help', label: t.nav.help },
  ];

  const exploreLinks = [
    { href: '/marketplace?category=supercar', label: '🏎️ Supercars' },
    { href: '/marketplace?category=suv', label: '🚙 Luxury SUVs' },
    { href: '/marketplace?category=electric', label: '⚡ Electric' },
    { href: '/marketplace?category=convertible', label: '🌊 Convertibles' },
    { href: '/marketplace?category=classic', label: '🏺 Classics' },
    { href: '/marketplace', label: '✨ View All' },
  ];

  const [exploreOpen, setExploreOpen] = React.useState(false);
  const exploreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navBg = isDark
    ? isScrolled || mobileMenuOpen ? 'bg-slate-900/95 backdrop-blur-2xl border-b border-slate-700/50' : 'bg-transparent'
    : isScrolled || mobileMenuOpen ? 'glass-nav shadow-sm' : 'bg-transparent';

  const textColor = isDark ? 'text-slate-200' : 'text-slate-600';
  const hoverBg = isDark ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn('fixed top-0 w-full z-50 transition-all duration-300', navBg)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 logo-wrapper">
              <img src={logoImage} alt="LuxeWay" className="logo-effect h-16 md:h-20 lg:h-24 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(link.href)
                      ? 'bg-[#0F172A] text-white'
                      : cn(textColor, hoverBg)
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={() => navigate('/search')}
                className={cn('hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-200', textColor, hoverBg)}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dark Mode Toggle */}
              <ThemeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Currency Switcher */}
              <CurrencySwitcher />

              {isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => navigate('/notifications')}
                    className={cn('relative p-2.5 rounded-xl transition-colors duration-200', textColor, hoverBg)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Messages */}
                  <button
                    onClick={() => navigate('/messages')}
                    className={cn('p-2.5 rounded-xl transition-colors duration-200', textColor, hoverBg)}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={cn(
                        'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border transition-all duration-200',
                        isDark
                          ? 'border-slate-600 hover:border-slate-500 bg-slate-800 hover:bg-slate-700'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                      )}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.displayName} className="w-7 h-7 rounded-xl object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center">
                          {getInitials(user.displayName)}
                        </div>
                      )}
                      <span className={cn('hidden md:block text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-700')}>
                        {user.firstName}
                      </span>
                      <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'absolute right-0 mt-2 w-64 rounded-2xl border shadow-luxury overflow-hidden z-50',
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                          )}
                        >
                          {/* User Info */}
                          <div className={cn('p-4 border-b', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-100')}>
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover" />
                              ) : (
                                <div className="avatar w-10 h-10 rounded-xl text-sm">{getInitials(user.displayName)}</div>
                              )}
                              <div>
                                <p className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-[#0F172A]')}>{user.displayName}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                                {user.verified && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 mt-0.5">
                                    <Shield className="w-3 h-3" /> {t.nav.verified}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            {(() => {
                              const roleUpper = user.role?.toUpperCase();
                              const accTypeUpper = user.accountType?.toUpperCase();
                              const userIsBusiness = roleUpper === 'BUSINESS_OWNER' || (roleUpper === 'OWNER' && accTypeUpper === 'BUSINESS');

                              let menuItems: Array<{ icon: any; label: string; href: string }> = [];
                              if (roleUpper === 'CUSTOMER') {
                                menuItems = [
                                  { icon: LayoutDashboard, label: t.nav.dashboard, href: '/dashboard' },
                                  { icon: Wallet, label: t.nav.wallet, href: '/dashboard/wallet' },
                                  { icon: Heart, label: t.nav.wishlist, href: '/dashboard/wishlist' },
                                  { icon: User, label: t.nav.profile, href: '/dashboard/profile' },
                                  { icon: Bell, label: t.nav.notifications, href: '/dashboard/notifications' },
                                ];
                              } else if (userIsBusiness) {
                                menuItems = [
                                  { icon: LayoutDashboard, label: 'Business Panel', href: '/business' },
                                  { icon: User, label: t.nav.profile, href: '/dashboard/profile' },
                                ];
                              } else if (roleUpper === 'OWNER') {
                                menuItems = [
                                  { icon: LayoutDashboard, label: t.nav.ownerDashboardFull, href: '/owner' },
                                  { icon: User, label: t.nav.profile, href: '/dashboard/profile' },
                                ];
                              } else if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN') {
                                menuItems = [
                                  { icon: Shield, label: t.nav.adminPanel, href: '/admin' },
                                ];
                              }

                              return menuItems.map(item => (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  onClick={() => setUserMenuOpen(false)}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                                    isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  )}
                                >
                                  <item.icon className="w-4 h-4 text-slate-400" />
                                  {item.label}
                                </Link>
                              ));
                            })()}
                          </div>

                          <div className={cn('border-t p-2', isDark ? 'border-slate-700' : 'border-slate-100')}>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              {t.nav.logout}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login" className={cn('hidden sm:block text-sm font-medium px-3 py-2 rounded-xl transition-colors', textColor, hoverBg)}>
                    {t.nav.signIn}
                  </Link>
                  <Link to="/auth/register" className="btn-primary text-sm px-4 py-2">
                    {t.nav.signUp}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn('lg:hidden p-2.5 rounded-xl transition-colors', textColor, hoverBg)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={cn('lg:hidden border-t overflow-hidden', isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-white')}
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-[#0F172A] text-white'
                        : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="btn-outline w-full justify-center py-2.5">{t.nav.signIn}</Link>
                    <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center py-2.5">{t.nav.signUp}</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
