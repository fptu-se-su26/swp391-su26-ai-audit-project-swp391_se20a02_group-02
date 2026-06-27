import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '@/store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertCurrency(amount: number, from = 'VND', to = 'VND'): number {
  if (from === to) return amount;
  
  // Current approximate exchange rates relative to VND (base rates)
  const ratesToVND: Record<string, number> = {
    VND: 1,
    USD: 25400,
    EUR: 27500,
    JPY: 162,
    SGD: 18800,
    CAD: 18500,
    AUD: 16850,
    GBP: 32300,
    KRW: 18.5,
  };
  
  const amountInVND = amount * (ratesToVND[from] || 1);
  return amountInVND / (ratesToVND[to] || 1);
}

export function formatCurrency(amount: number, currency?: string): string {
  let activeCurrency = 'VND';
  let activeLang = 'en';
  try {
    const uiState = useUIStore.getState();
    activeCurrency = uiState.currency || 'VND';
    activeLang = uiState.language || 'en';
  } catch {}
  
  const targetCurrency = currency || activeCurrency;
  
  // Assumes database amount is always in VND base currency
  const convertedAmount = convertCurrency(amount, 'VND', targetCurrency);
  
  const langLocaleMap: Record<string, string> = {
    en: 'en-US',
    vi: 'vi-VN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    fr: 'fr-FR',
    de: 'de-DE',
  };
  const locale = langLocaleMap[activeLang] || 'en-US';
  const isZeroDecimal = ['VND', 'JPY', 'KRW'].includes(targetCurrency.toUpperCase());
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(convertedAmount);
}

export function formatDate(dateStr: string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateStr);
  let activeLang = 'en';
  try {
    activeLang = useUIStore.getState().language || 'en';
  } catch {}

  const localeMap: Record<string, string> = {
    en: 'en-US',
    vi: 'vi-VN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    fr: 'fr-FR',
    de: 'de-DE',
  };
  const targetLocale = localeMap[activeLang] || 'en-US';

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      if (activeLang === 'vi') return 'Vừa xong';
      if (activeLang === 'ja') return 'たった今';
      if (activeLang === 'ko') return '방금 전';
      if (activeLang === 'zh') return '刚刚';
      if (activeLang === 'fr') return 'À l\'instant';
      if (activeLang === 'de') return 'Gerade eben';
      return 'Just now';
    }
    if (diffMins < 60) {
      if (activeLang === 'vi') return `${diffMins} phút trước`;
      if (activeLang === 'ja') return `${diffMins}分前`;
      if (activeLang === 'ko') return `${diffMins}분 전`;
      if (activeLang === 'zh') return `${diffMins}分钟前`;
      if (activeLang === 'fr') return `Il y a ${diffMins} min`;
      if (activeLang === 'de') return `Vor ${diffMins} Min.`;
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      if (activeLang === 'vi') return `${diffHours} giờ trước`;
      if (activeLang === 'ja') return `${diffHours}時間前`;
      if (activeLang === 'ko') return `${diffHours}시간 전`;
      if (activeLang === 'zh') return `${diffHours}小时前`;
      if (activeLang === 'fr') return `Il y a ${diffHours} h`;
      if (activeLang === 'de') return `Vor ${diffHours} Std.`;
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      if (activeLang === 'vi') return `${diffDays} ngày trước`;
      if (activeLang === 'ja') return `${diffDays}日前`;
      if (activeLang === 'ko') return `${diffDays}일 전`;
      if (activeLang === 'zh') return `${diffDays}天前`;
      if (activeLang === 'fr') return `Il y a ${diffDays} j`;
      if (activeLang === 'de') return `Vor ${diffDays} Tg.`;
      return `${diffDays}d ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      if (activeLang === 'vi') return `${weeks} tuần trước`;
      if (activeLang === 'ja') return `${weeks}週間前`;
      if (activeLang === 'ko') return `${weeks}주 전`;
      if (activeLang === 'zh') return `${weeks}周前`;
      if (activeLang === 'fr') return `Il y a ${weeks} sem`;
      if (activeLang === 'de') return `Vor ${weeks} Woc.`;
      return `${weeks}w ago`;
    }
    return date.toLocaleDateString(targetLocale, { month: 'short', day: 'numeric' });
  }

  // Exact custom format layouts as requested
  if (activeLang === 'vi') {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (activeLang === 'ja' || activeLang === 'zh') {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}年${m}月${d}日`;
  }

  if (activeLang === 'ko') {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}년 ${m}월 ${d}일`;
  }

  if (activeLang === 'de') {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }

  if (activeLang === 'fr') {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (format === 'long') {
    return date.toLocaleDateString(targetLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return date.toLocaleDateString(targetLocale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.9) return 'Exceptional';
  if (rating >= 4.7) return 'Outstanding';
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Great';
  if (rating >= 3.5) return 'Good';
  return 'Fair';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'LW-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function getStatusColor(status: string): string {
  const normalized = status?.toLowerCase() || '';
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    disputed: 'bg-orange-50 text-orange-700 border-orange-200',
    available: 'bg-green-50 text-green-700 border-green-200',
    rented: 'bg-blue-50 text-blue-700 border-blue-200',
    maintenance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    pending_approval: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-300',
    blocked: 'bg-red-100 text-red-800 border-red-300',
    succeeded: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';
}

export function getStatusIcon(status: string): string {
  const normalized = status?.toLowerCase() || '';
  const icons: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    active: '🚗',
    completed: '🏁',
    cancelled: '❌',
    disputed: '⚠️',
    available: '✅',
    rented: '🚗',
    maintenance: '🔧',
    pending_approval: '⏳',
    approved: '✅',
    rejected: '❌',
    draft: '📝',
    blocked: '🚫',
    succeeded: '💰',
    failed: '❌',
    refunded: '↩️',
  };
  return icons[normalized] || '•';
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    return { ...result, [group]: [...(result[group] || []), item] };
  }, {} as Record<string, T[]>);
}

export function sortByDate<T extends { createdAt: string }>(array: T[], order: 'asc' | 'desc' = 'desc'): T[] {
  return [...array].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return order === 'desc' ? -diff : diff;
  });
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): { valid: boolean; strength: number; message: string } {
  let strength = 0;
  const checks = [
    { test: /.{8,}/, message: 'At least 8 characters' },
    { test: /[A-Z]/, message: 'One uppercase letter' },
    { test: /[a-z]/, message: 'One lowercase letter' },
    { test: /[0-9]/, message: 'One number' },
    { test: /[^A-Za-z0-9]/, message: 'One special character' },
  ];

  checks.forEach(check => {
    if (check.test.test(password)) strength++;
  });

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const message = strengthLabels[strength] || 'Very Weak';

  return {
    valid: strength >= 3,
    strength,
    message
  };
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
const SERVER_BASE = API_BASE.replace('/api/v1', '');

export function getVehicleFallbackImage(url: string | null | undefined): string {
  if (!url) return '';
  const lower = url.toLowerCase();
  if (lower.includes('honda_city')) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('toyota_vios')) return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('honda_airblade')) return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('mercedes_c200')) return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('bmw_x3')) return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('toyota_camry')) return 'https://images.unsplash.com/photo-1621007947382-cc34aa864ee3?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('honda_crv')) return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('vinfast_vf8')) return 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('mazda_cx5')) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('hyundai_tucson')) return 'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('kia_morning')) return 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80';
  if (lower.includes('ford_everest')) return 'https://images.unsplash.com/photo-1533513780-f38b4d4f0f00?w=800&auto=format&fit=crop&q=80';
  return '';
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Normalize backslashes to forward slashes
  let normalizedUrl = url.replace(/\\/g, '/').trim();
  
  // Check for fallbacks first
  const fallback = getVehicleFallbackImage(normalizedUrl);
  if (fallback) return fallback;
  
  // Handle absolute URLs
  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
    return normalizedUrl.replace(/ /g, '%20');
  }
  
  // Handle backend uploads (starts with /uploads, uploads, or contains /uploads/)
  const isUpload = normalizedUrl.startsWith('/uploads') || normalizedUrl.startsWith('uploads') || normalizedUrl.includes('/uploads/');
  if (isUpload) {
    let cleanUrl = normalizedUrl;
    const uploadsIndex = normalizedUrl.indexOf('uploads');
    if (uploadsIndex !== -1) {
      cleanUrl = '/' + normalizedUrl.substring(uploadsIndex);
    } else {
      cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : '/' + normalizedUrl;
    }
    const parts = cleanUrl.split('/');
    const encodedParts = parts.map((p, i) => i === parts.length - 1 ? encodeURIComponent(p) : p);
    return `${SERVER_BASE}${encodedParts.join('/')}`;
  }
  
  // Handle local public folder assets (starts with /images, images, or contains /images/)
  const isLocalImage = normalizedUrl.startsWith('/images') || normalizedUrl.startsWith('images') || normalizedUrl.includes('/images/');
  if (isLocalImage) {
    let cleanUrl = normalizedUrl;
    const imagesIndex = normalizedUrl.indexOf('images');
    if (imagesIndex !== -1) {
      cleanUrl = '/' + normalizedUrl.substring(imagesIndex);
    } else {
      cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : '/' + normalizedUrl;
    }
    
    // Split to encode ONLY the filename (last segment), to avoid breaking spaces
    const parts = cleanUrl.split('/');
    const encodedParts = parts.map((p, i) => i === parts.length - 1 ? encodeURIComponent(p) : p);
    return encodedParts.join('/');
  }
  
  return normalizedUrl.replace(/ /g, '%20');
}

