// ====== HOME SERVICE – Landing Page API Client ======
import apiClient from './api';

const BASE = '/home';

export interface HomeStats {
  totalVehicles: number;
  totalCustomers: number;
  totalBookings: number;
  averageRating: number;
  qualityVehicles: number;
  provinces: number;
  happyClients: number;
  categoryCounts: Record<string, number>;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  badgeText: string;
  ctaText: string;
  ctaUrl: string;
  endDate?: string;
}

export interface TrendingVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  thumbnailUrl: string;
  pricePerDay: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isVerified: boolean;
  instantBook: boolean;
  city: string;
  isOwnerVerified: boolean;
}

export interface CategoryData {
  cars: Record<string, number>;
  motorbikes: Record<string, number>;
  total: number;
}

export interface Destination {
  city: string;
  imageUrl: string;
  vehicleCount: number;
  averagePrice: number;
  topCategory: string;
}

export interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
  avatar?: string;
  rentedVehicle: string;
  vehicleCategory: string;
}

export interface TestimonialsData {
  reviews: Testimonial[];
  averageRating: number;
  totalReviews: number;
}

export interface OwnerStats {
  averageMonthlyRevenue: number;
  vehicleUtilization: number;
  completedBookings: number;
  averageRating: number;
  totalOwners: number;
}

export interface FAQ {
  id: number;
  q: string;
  a: string;
}


// ======= Diagnostic fetcher — NEVER hides errors as fake zeros =======
/**
 * fetchWithDiagnostics:
 *  - Returns the raw API response on success.
 *  - Returns null on any failure and logs the full error to the console.
 *  - Callers MUST handle null by showing an error or retry state.
 *  - DO NOT use a fallback that returns fake zeros — that masks backend bugs.
 */
async function fetchWithDiagnostics<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await apiClient.get<T>(endpoint);
    if (res === undefined || res === null) {
      console.error(`[homeService] ${endpoint} returned empty body`);
      return null;
    }
    return res;
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status ?? 'network-error';
    const message = err?.message ?? String(err);
    console.error(`[homeService] FAILED ${endpoint} — HTTP ${status}: ${message}`);
    return null;
  }
}

// ======= Service methods — return null on failure (no fake zeros) =======
export const homeService = {
  getStats: (): Promise<HomeStats | null> =>
    fetchWithDiagnostics<HomeStats>(`${BASE}/stats`),

  getPromotions: (): Promise<Promotion[] | null> =>
    fetchWithDiagnostics<Promotion[]>(`${BASE}/promotions`),

  getTrending: (): Promise<TrendingVehicle[] | null> =>
    fetchWithDiagnostics<TrendingVehicle[]>(`${BASE}/trending`),

  getCategories: (): Promise<CategoryData | null> =>
    fetchWithDiagnostics<CategoryData>(`${BASE}/categories`),

  getDestinations: (): Promise<Destination[] | null> =>
    fetchWithDiagnostics<Destination[]>(`${BASE}/destinations`),

  getTestimonials: (): Promise<TestimonialsData | null> =>
    fetchWithDiagnostics<TestimonialsData>(`${BASE}/testimonials`),

  getOwnerStats: (): Promise<OwnerStats | null> =>
    fetchWithDiagnostics<OwnerStats>(`${BASE}/owner-stats`),

  getFaqs: (): Promise<FAQ[] | null> =>
    fetchWithDiagnostics<FAQ[]>(`${BASE}/faqs`),
};

export default homeService;
