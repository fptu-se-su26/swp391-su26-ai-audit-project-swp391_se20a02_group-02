import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';
import { carService } from './carService';
import { motorbikeService } from './motorbikeService';

// Storage key for wishlist fallback since backend may not have a dedicated endpoint yet
const WISHLIST_KEY = 'luxeway_wishlist';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('/uploads') || url.startsWith('uploads')) {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${API_BASE}${cleanUrl}`;
  }
  return url;
};

// Helper function to map flat backend vehicle DTO to nested frontend Vehicle type
const mapVehicle = (v: any): Vehicle => {
  if (!v) return v;
  
  const defaultLocation = {
    city: v.city || '',
    country: v.country || 'Vietnam',
    address: v.address || '',
    lat: v.latitude || 0,
    lng: v.longitude || 0,
    timezone: 'Asia/Ho_Chi_Minh'
  };
  
  const defaultSpecs = {
    horsepower: v.horsepower || 0,
    topSpeed: v.topSpeed || 0,
    acceleration: v.acceleration || 0,
    seats: v.seats || 0,
    doors: v.doors || 4,
    transmission: v.transmission || 'automatic',
    fuelType: v.fuelType || 'gasoline',
    range: v.rangeKm || 0,
    engineSize: v.engineSize || '',
    color: v.color || '',
    licensePlate: v.licensePlate || ''
  };

  const defaultInsurance = {
    included: true,
    provider: 'LuxeWay Shield',
    coverage: 'Premium protection'
  };

  const defaultAvailability = {
    blockedDates: [],
    minRentalDays: 1,
    maxRentalDays: 30,
    advanceBookingDays: 1
  };

  const resolvedThumbnailUrl = resolveImageUrl(v.thumbnailUrl);
  const resolvedImages = (v.images || []).map((img: string) => resolveImageUrl(img));
  const resolvedOwner = v.owner ? {
    ...v.owner,
    avatar: resolveImageUrl(v.owner.avatar)
  } : undefined;

  // Infer vehicleType from category if not explicitly set
  const motorbikeCategories = ['MOTORBIKE', 'SCOOTER', 'AUTOMATIC_SCOOTER', 'MANUAL_MOTORCYCLE',
    'SPORT_BIKE', 'TOURING_BIKE', 'ADVENTURE_BIKE', 'CLASSIC_BIKE', 'ELECTRIC_BIKE',
    'motorbike', 'scooter', 'automatic_scooter', 'manual_motorcycle',
    'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'];
  const inferredType = v.vehicleType?.toLowerCase() ||
    (motorbikeCategories.includes(v.category) ? 'motorbike' : 'car');

  return {
    ...v,
    vehicleType: inferredType,
    thumbnailUrl: resolvedThumbnailUrl,
    images: resolvedImages,
    owner: resolvedOwner,
    category: (v.category || 'economy').toLowerCase(),
    location: {
      ...defaultLocation,
      ...(v.location || {})
    },
    specs: {
      ...defaultSpecs,
      ...(v.specs || {})
    },
    insurance: {
      ...defaultInsurance,
      ...(v.insurance || {})
    },
    availability: {
      ...defaultAvailability,
      ...(v.availability || {})
    },
    rules: v.rules || [],
    features: v.features || [],
    addons: v.addons || [],
    rating: v.rating !== undefined && v.rating !== null ? v.rating : 5.0,
    totalReviews: v.totalReviews !== undefined && v.totalReviews !== null ? v.totalReviews : 0,
    instantBook: v.instantBook !== undefined && v.instantBook !== null ? v.instantBook : false,
    deposit: v.deposit !== undefined && v.deposit !== null ? v.deposit : 0,
    // Vietnam market fields
    engineCc: v.engineCc || null,
    hasHelmet: v.hasHelmet || false,
    hasPhoneHolder: v.hasPhoneHolder || false,
    hasRaincoat: v.hasRaincoat || false,
    hasTouringPackage: v.hasTouringPackage || false,
    hasChauffeur: v.hasChauffeur || false,
    airportDelivery: v.airportDelivery || false,
    weddingRental: v.weddingRental || false,
    businessRental: v.businessRental || false,
  };
};

export const vehicleService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(), // Spring Data JPA is 0-indexed
        size: pageSize.toString()
      });
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.location) queryParams.append('location', filters.location);
        // Vehicle type filter (CAR | MOTORBIKE)
        if (filters.vehicleType) queryParams.append('vehicleType', filters.vehicleType.toUpperCase());
        // Send ALL selected categories as repeated params: category=suv&category=economy
        if (filters.category && filters.category.length > 0) {
          filters.category.forEach(cat => queryParams.append('category', cat.toUpperCase()));
        }
        // Send ALL selected brands as repeated params: brand=toyota&brand=honda
        if (filters.brands && filters.brands.length > 0) {
          filters.brands.forEach(b => queryParams.append('brand', b.toLowerCase()));
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minSeats !== undefined) queryParams.append('minSeats', filters.minSeats.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0]);
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
          queryParams.append('fuelType', filters.fuelType[0]);
        }
        if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());
        if (filters.instantBook) queryParams.append('instantBook', 'true');
        if (filters.deliveryAvailable) queryParams.append('deliveryAvailable', 'true');
        if (filters.isFeatured) queryParams.append('isFeatured', 'true');
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        // Motorbike-specific filters
        if (filters.minEngineCc !== undefined) queryParams.append('minEngineCc', filters.minEngineCc.toString());
        if (filters.maxEngineCc !== undefined) queryParams.append('maxEngineCc', filters.maxEngineCc.toString());
        if (filters.hasHelmet) queryParams.append('hasHelmet', 'true');
        if (filters.hasPhoneHolder) queryParams.append('hasPhoneHolder', 'true');
        if (filters.hasRaincoat) queryParams.append('hasRaincoat', 'true');
        if (filters.hasTouringPackage) queryParams.append('hasTouringPackage', 'true');
        // Car-specific filters
        if (filters.hasChauffeur) queryParams.append('hasChauffeur', 'true');
        if (filters.airportDelivery) queryParams.append('airportDelivery', 'true');
        if (filters.weddingRental) queryParams.append('weddingRental', 'true');
        if (filters.businessRental) queryParams.append('businessRental', 'true');
      }
      
      const response = await apiClient.get<any>(`/vehicles?${queryParams.toString()}`);
      
      return {
        data: (response.vehicles || []).map(mapVehicle),
        meta: {
          total: response.totalItems || 0,
          page: (response.currentPage || 0) + 1,
          pageSize,
          totalPages: response.totalPages || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get vehicles', error);
      return { data: [], meta: { total: 0, page: 1, pageSize, totalPages: 0 } };
    }
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      if (id.startsWith('CAR-') || id.toLowerCase().includes('car')) {
        const car = await carService.getById(id);
        if (car) return car;
      }
      if (id.startsWith('BIKE-') || id.startsWith('VM-') || id.toLowerCase().includes('bike') || id.toLowerCase().includes('vm-')) {
        const bike = await motorbikeService.getById(id);
        if (bike) return bike;
      }
      
      // Fallbacks
      try {
        const response = await apiClient.get<any>(`/vehicles/${id}`);
        if (response.vehicle) return mapVehicle(response.vehicle);
      } catch (_) {}

      // Try carService as general fallback
      try {
        const car = await carService.getById(id);
        if (car) return car;
      } catch (_) {}

      // Try motorbikeService as general fallback
      try {
        const bike = await motorbikeService.getById(id);
        if (bike) return bike;
      } catch (_) {}

      return null;
    } catch (error) {
      console.error(`Failed to get vehicle ${id}`, error);
      return null;
    }
  },

  async getFeatured(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles?page=0&size=9&isFeatured=true`);
      const vehicles: any[] = response.vehicles || [];
      return vehicles.map(mapVehicle);
    } catch (error) {
      return [];
    }
  },

  async getFeaturedCars(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles?page=0&size=6&vehicleType=CAR&isFeatured=true`);
      return (response.vehicles || []).map(mapVehicle);
    } catch (error) {
      return [];
    }
  },

  async getFeaturedMotorbikes(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles?page=0&size=6&vehicleType=MOTORBIKE&isFeatured=true`);
      return (response.vehicles || []).map(mapVehicle);
    } catch (error) {
      return [];
    }
  },

  async getByOwner(ownerId: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles/owner/${ownerId}?page=0&size=50`);
      return (response.vehicles || []).map(mapVehicle);
    } catch (error) {
      return [];
    }
  },

  async search(query: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles/search?keyword=${encodeURIComponent(query)}`);
      return (response.vehicles || []).map(mapVehicle);
    } catch (error) {
      return [];
    }
  },

  async create(ownerId: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const payload = { ...data, ownerId };
    const response = await apiClient.post<any>('/vehicles', payload);
    return response.vehicle ? mapVehicle(response.vehicle) : (payload as Vehicle); 
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const response = await apiClient.put<any>(`/vehicles/${id}`, updates);
      return response.vehicle ? mapVehicle(response.vehicle) : null;
    } catch (error) {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete<any>(`/vehicles/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async toggleWishlist(vehicleId: string, userId: string): Promise<boolean> {
    const key = `${WISHLIST_KEY}_${userId}`;
    let wishlist: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    const isWishlisted = wishlist.includes(vehicleId);
    
    if (isWishlisted) {
      wishlist = wishlist.filter(id => id !== vehicleId);
    } else {
      wishlist.push(vehicleId);
    }
    
    localStorage.setItem(key, JSON.stringify(wishlist));
    return !isWishlisted;
  },

  async getWishlist(userId: string): Promise<Vehicle[]> {
    const key = `${WISHLIST_KEY}_${userId}`;
    const wishlist: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (wishlist.length === 0) return [];
    
    const vehicles: Vehicle[] = [];
    for (const id of wishlist) {
      const v = await this.getById(id);
      if (v) vehicles.push(v);
    }
    return vehicles;
  },

  async getAIRecommendations(userId: string): Promise<Vehicle[]> {
    return this.getFeatured();
  },

  getBrands(): string[] {
    return [...this.getCarBrands(), ...this.getMotorbikeBrands()].filter((v, i, a) => a.indexOf(v) === i);
  },

  getCarBrands(): string[] {
    return [
      'Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia',
      'Ford', 'Mitsubishi', 'VinFast', 'Mercedes-Benz',
      'BMW', 'Audi', 'Porsche', 'Lexus', 'Suzuki',
    ];
  },

  getMotorbikeBrands(): string[] {
    return [
      'Honda', 'Yamaha', 'Suzuki', 'VinFast',
      'Kawasaki', 'Piaggio', 'Vespa', 'SYM',
    ];
  },

  getCities(): string[] {
    return ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Phú Quốc', 'Huế', 'Hội An'];
  },
};


