// ====== HOME SERVICE – Landing Page API Client ======
import apiClient from './api';
import { resolveImageUrl } from '@/utils';

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
  vehicleType?: string;
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

  getPromotions: async (): Promise<Promotion[] | null> => {
    const data = await fetchWithDiagnostics<Promotion[]>(`${BASE}/promotions`);
    if (!data) return null;
    return data.map(p => ({
      ...p,
      imageUrl: resolveImageUrl(p.imageUrl)
    }));
  },

  getTrending: async (): Promise<TrendingVehicle[] | null> => {
    const data = await fetchWithDiagnostics<TrendingVehicle[]>(`${BASE}/trending`);
    if (!data) return null;
    const motorbikeCategories = [
      'MOTORBIKE', 'SCOOTER', 'AUTOMATIC_SCOOTER', 'MANUAL_MOTORCYCLE',
      'SPORT_BIKE', 'TOURING_BIKE', 'ADVENTURE_BIKE', 'CLASSIC_BIKE', 'ELECTRIC_BIKE',
      'motorbike', 'scooter', 'automatic_scooter', 'manual_motorcycle',
      'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'
    ];
    return data.map(v => {
      const inferredType = v.vehicleType?.toLowerCase() ||
        (motorbikeCategories.includes(v.category) ? 'motorbike' : 'car');
      return {
        ...v,
        vehicleType: inferredType,
        thumbnailUrl: resolveImageUrl(v.thumbnailUrl)
      };
    });
  },

  getCategories: (): Promise<CategoryData | null> =>
    fetchWithDiagnostics<CategoryData>(`${BASE}/categories`),

  getDestinations: async (): Promise<Destination[] | null> => {
    const data = await fetchWithDiagnostics<Destination[]>(`${BASE}/destinations`);
    if (!data) return null;
    return data.map(d => ({
      ...d,
      imageUrl: resolveImageUrl(d.imageUrl)
    }));
  },

  getTestimonials: async (): Promise<TestimonialsData | null> => {
    const data = await fetchWithDiagnostics<TestimonialsData>(`${BASE}/testimonials`);
    if (!data) return null;
    return {
      ...data,
      reviews: (data.reviews || []).map(r => ({
        ...r,
        avatar: resolveImageUrl(r.avatar)
      }))
    };
  },

  getOwnerStats: (): Promise<OwnerStats | null> =>
    fetchWithDiagnostics<OwnerStats>(`${BASE}/owner-stats`),

  getFaqs: (): Promise<FAQ[] | null> =>
    fetchWithDiagnostics<FAQ[]>(`${BASE}/faqs`),

  getHomeVehicles: async (): Promise<{ popular: TrendingVehicle[]; latest: TrendingVehicle[] } | null> => {
    const data = await fetchWithDiagnostics<{ popular: TrendingVehicle[]; latest: TrendingVehicle[] }>(`${BASE}/vehicles`);
    if (!data) return null;
    return {
      popular: (data.popular || []).map(v => ({
        ...v,
        thumbnailUrl: resolveImageUrl(v.thumbnailUrl)
      })),
      latest: (data.latest || []).map(v => ({
        ...v,
        thumbnailUrl: resolveImageUrl(v.thumbnailUrl)
      }))
    };
  },
};

export default homeService;
