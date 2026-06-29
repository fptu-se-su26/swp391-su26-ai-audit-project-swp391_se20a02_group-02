import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, RegisterData, Toast, BookingWizardState } from '@/types';
import { authService } from '@/services/authService';
import { apiClient } from '@/services/api';
import { faker } from '@faker-js/faker';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'vi' | 'ja' | 'ko' | 'zh' | 'fr' | 'de' | 'es';


// ====== AUTH STORE ======
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  loginWithGoogleToken: (idToken: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  initAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    const user = authService.getCurrentUser();
    const token = authService.getAccessToken();
    
    if (user && token) {
      // BUG-2/3 FIX: Immediately mark as authenticated with cached data.
      // This ensures the UI shows the correct state even before the backend call completes.
      set({ user, isAuthenticated: true });
      if (user.preferredLanguage) {
        useUIStore.getState().setLanguage(user.preferredLanguage as Language);
      }
      
      // Fetch fresh user data from backend (best-effort — NOT session-critical)
      try {
        const freshUser = await authService.fetchCurrentUser();
        if (freshUser) {
          set({ user: freshUser });
          if (freshUser.preferredLanguage) {
            useUIStore.getState().setLanguage(freshUser.preferredLanguage as Language);
          }
        }
        // If freshUser is null (backend blip), we keep the cached user — user stays logged in
      } catch (error) {
        // BUG-3 FIX: Backend unavailable ≠ invalid session. Keep cached credentials.
        console.warn('Backend refresh failed on init — using cached session:', error);
      }
    }
    // BUG-20 FIX: Use unconditional finally-equivalent — always set isInitialized:true
    set({ isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        if (user.preferredLanguage) {
          useUIStore.getState().setLanguage(user.preferredLanguage as Language);
        }
        return true;
      }
      set({ isLoading: false, error: 'Login failed' });
      return false;
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid email or password';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  logout: () => {
    // Clear other Zustand stores
    useVehicleStore.setState({ wishlist: [], compareList: [], recentlyViewed: [] });
    useBookingWizardStore.setState({
      step: 1,
      vehicleId: '',
      startDate: '',
      endDate: '',
      selectedAddons: [],
      includeInsurance: true,
      includeDelivery: false,
      deliveryAddress: '',
      couponCode: '',
      discount: 0,
      notes: '',
      paymentMethodId: '',
    });
    useNotificationStore.setState({ unreadCount: 0 });

    // Call authService logout
    authService.logout();

    // Clear browser storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear local/session storage:', e);
    }

    set({ user: null, isAuthenticated: false, error: null });

    // Force redirect to login page (not landing page)
    // BUG-13 FIX: Was redirecting to '/' — must redirect to '/auth/login'
    window.location.href = '/auth/login';
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(data);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        if (user.preferredLanguage) {
          useUIStore.getState().setLanguage(user.preferredLanguage as Language);
        }
        return true;
      }
      set({ isLoading: false, error: 'Registration failed' });
      return false;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Email may already exist.';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  loginWithGoogleToken: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.loginWithGoogle(idToken);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        if (user.preferredLanguage) {
          useUIStore.getState().setLanguage(user.preferredLanguage as Language);
        }
        return true;
      }
      set({ isLoading: false, error: 'Google login failed' });
      return false;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Google login failed' });
      return false;
    }
  },

  updateUser: async (data) => {
    const current = get().user;
    if (!current) return;
    
    try {
      const updated = await authService.updateProfile(current.id, data);
      if (updated) {
        set({ user: updated });
        if (updated.preferredLanguage) {
          useUIStore.getState().setLanguage(updated.preferredLanguage as Language);
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const user = await authService.fetchCurrentUser();
      if (user) {
        set({ user });
        if (user.preferredLanguage) {
          useUIStore.getState().setLanguage(user.preferredLanguage as Language);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

// Setup ApiClient onUnauthorized hook to clear session but only redirect on protected routes
apiClient.onUnauthorized = () => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
  useVehicleStore.setState({ wishlist: [], compareList: [], recentlyViewed: [] });
  useBookingWizardStore.setState({
    step: 1,
    vehicleId: '',
    startDate: '',
    endDate: '',
    selectedAddons: [],
    includeInsurance: true,
    includeDelivery: false,
    deliveryAddress: '',
    couponCode: '',
    discount: 0,
    notes: '',
    paymentMethodId: '',
  });
  useNotificationStore.setState({ unreadCount: 0 });

  const protectedPrefixes = ['/dashboard', '/admin', '/owner', '/booking', '/payment', '/messages', '/notifications'];
  const path = window.location.pathname;
  const isProtected = protectedPrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'));
  if (isProtected) {
    window.location.href = '/auth/login';
  }
};

// ====== UI STORE ======
interface UIStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toasts: Toast[];
  activeModal: string | null;
  isScrolled: boolean;
  theme: Theme;
  language: Language;
  currency: string;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setScrolled: (scrolled: boolean) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,
      toasts: [],
      activeModal: null,
      isScrolled: false,
      theme: 'light',
      language: (() => {
        try {
          const lang = localStorage.getItem('language');
          if (lang && ['en', 'vi', 'ja', 'ko', 'zh', 'fr', 'de', 'es'].includes(lang)) return lang as Language;
        } catch {}
        return 'en';
      })(),
      currency: (() => {
        try {
          const curr = localStorage.getItem('currency');
          if (curr && ['VND', 'USD', 'EUR', 'JPY', 'SGD', 'KRW'].includes(curr)) return curr;
        } catch {}
        return 'VND';
      })(),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      addToast: (toast) => {
        const id = faker.string.uuid();
        const newToast: Toast = { ...toast, id };
        set(state => ({ toasts: [...state.toasts, newToast] }));
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
          setTimeout(() => { get().removeToast(id); }, duration);
        }
      },

      removeToast: (id) => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      },

      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
      setScrolled: (scrolled) => set({ isScrolled: scrolled }),

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },

      setLanguage: (lang) => {
        const currentLang = get().language;
        if (currentLang === lang) return;

        set({ language: lang });
        try { localStorage.setItem('language', lang); } catch {}
        import('@/i18n/config').then(m => m.default.changeLanguage(lang));

        // Sync to backend user profile if logged in and language is different
        const authStore = useAuthStore.getState();
        if (authStore.user && authStore.user.preferredLanguage !== lang) {
          const updatedUser = { ...authStore.user, preferredLanguage: lang };
          useAuthStore.setState({ user: updatedUser });
          localStorage.setItem('luxeway_user', JSON.stringify(updatedUser));

          apiClient.put(`/users/${authStore.user.id}`, {
            firstName: authStore.user.firstName,
            lastName: authStore.user.lastName,
            phone: authStore.user.phone,
            bio: authStore.user.bio,
            location: authStore.user.location,
            avatar: authStore.user.avatar,
            preferredLanguage: lang,
            licenseClass: authStore.user.licenseClass,
            licenseNumber: authStore.user.licenseNumber
          }).catch(err => console.warn('Failed to sync language to backend', err));
        }
      },

      setCurrency: (curr) => {
        set({ currency: curr });
        try { localStorage.setItem('currency', curr); } catch {}
      },
    }),
    {
      name: 'luxeway_ui_prefs',
      partialize: (state) => ({ theme: state.theme, language: state.language, currency: state.currency }),
    }
  )
);


// ====== VEHICLE STORE ======
interface VehicleStore {
  wishlist: string[]; // vehicle IDs
  compareList: string[]; // vehicle IDs (max 3)
  recentlyViewed: string[];
  addToWishlist: (vehicleId: string) => void;
  removeFromWishlist: (vehicleId: string) => void;
  isWishlisted: (vehicleId: string) => boolean;
  addToCompare: (vehicleId: string) => void;
  removeFromCompare: (vehicleId: string) => void;
  clearCompare: () => void;
  addRecentlyViewed: (vehicleId: string) => void;
}

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compareList: [],
      recentlyViewed: [],

      addToWishlist: (vehicleId) => {
        set(state => ({ wishlist: [...new Set([...state.wishlist, vehicleId])] }));
      },

      removeFromWishlist: (vehicleId) => {
        set(state => ({ wishlist: state.wishlist.filter(id => id !== vehicleId) }));
      },

      isWishlisted: (vehicleId) => get().wishlist.includes(vehicleId),

      addToCompare: (vehicleId) => {
        const { compareList } = get();
        if (compareList.length >= 3) return;
        if (compareList.includes(vehicleId)) return;
        set({ compareList: [...compareList, vehicleId] });
      },

      removeFromCompare: (vehicleId) => {
        set(state => ({ compareList: state.compareList.filter(id => id !== vehicleId) }));
      },

      clearCompare: () => set({ compareList: [] }),

      addRecentlyViewed: (vehicleId) => {
        set(state => {
          const filtered = state.recentlyViewed.filter(id => id !== vehicleId);
          return { recentlyViewed: [vehicleId, ...filtered].slice(0, 10) };
        });
      },
    }),
    { name: 'luxeway_vehicle_store' }
  )
);

// ====== BOOKING WIZARD STORE ======
interface BookingWizardStore {
  step: number;
  vehicleId: string;
  startDate: string;
  endDate: string;
  selectedAddons: string[];
  includeInsurance: boolean;
  includeDelivery: boolean;
  deliveryAddress: string;
  couponCode: string;
  discount: number;
  notes: string;
  paymentMethodId: string;
  setStep: (step: number) => void;
  setDates: (startDate: string, endDate: string) => void;
  toggleAddon: (addonId: string) => void;
  setInsurance: (include: boolean) => void;
  setDelivery: (include: boolean, address?: string) => void;
  setCoupon: (code: string, discount: number) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (id: string) => void;
  initWizard: (vehicleId: string) => void;
  reset: () => void;
  toWizardState: () => BookingWizardState;
}

export const useBookingWizardStore = create<BookingWizardStore>((set, get) => ({
  step: 1,
  vehicleId: '',
  startDate: '',
  endDate: '',
  selectedAddons: [],
  includeInsurance: true,
  includeDelivery: false,
  deliveryAddress: '',
  couponCode: '',
  discount: 0,
  notes: '',
  paymentMethodId: '',

  setStep: (step) => set({ step }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  toggleAddon: (addonId) => {
    const { selectedAddons } = get();
    const exists = selectedAddons.includes(addonId);
    set({ selectedAddons: exists ? selectedAddons.filter(id => id !== addonId) : [...selectedAddons, addonId] });
  },
  setInsurance: (include) => set({ includeInsurance: include }),
  setDelivery: (include, address) => set({ includeDelivery: include, deliveryAddress: address || '' }),
  setCoupon: (code, discount) => set({ couponCode: code, discount }),
  setNotes: (notes) => set({ notes }),
  setPaymentMethod: (id) => set({ paymentMethodId: id }),
  initWizard: (vehicleId) => set({ vehicleId, step: 1, startDate: '', endDate: '', selectedAddons: [], includeInsurance: true }),
  reset: () => set({ step: 1, vehicleId: '', startDate: '', endDate: '', selectedAddons: [], includeInsurance: true, includeDelivery: false, couponCode: '', discount: 0 }),

  toWizardState: () => {
    const s = get();
    return {
      vehicleId: s.vehicleId,
      step: s.step,
      startDate: s.startDate,
      endDate: s.endDate,
      selectedAddons: s.selectedAddons,
      includeInsurance: s.includeInsurance,
      includeDelivery: s.includeDelivery,
      deliveryAddress: s.deliveryAddress,
      couponCode: s.couponCode,
      notes: s.notes,
      paymentMethodId: s.paymentMethodId,
    };
  },
}));

// ====== NOTIFICATION STORE ======
interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
