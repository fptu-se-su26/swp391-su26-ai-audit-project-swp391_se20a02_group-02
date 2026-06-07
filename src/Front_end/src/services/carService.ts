import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('/uploads') || url.startsWith('uploads')) {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${API_BASE}${cleanUrl}`;
  }
  return url;
};

const mapCar = (v: any): Vehicle => {
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

  const resolvedThumbnailUrl = v.images && v.images.length > 0 ? resolveImageUrl(v.images[0]) : '';
  const resolvedImages = (v.images || []).map((img: string) => resolveImageUrl(img));
  const resolvedOwner = v.owner ? {
    ...v.owner,
    avatar: resolveImageUrl(v.owner.avatar)
  } : undefined;

  return {
    ...v,
    vehicleType: 'car',
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
    hasChauffeur: v.hasChauffeur || false,
    airportDelivery: v.airportDelivery || false,
    weddingRental: v.weddingRental || false,
    businessRental: v.businessRental || false,
    deliveryAvailable: v.airportDelivery || false,
    deliveryFee: v.deliveryFee || 0,
  };
};

export const carService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: pageSize.toString()
      });
      
      if (filters) {
        if (filters.location) queryParams.append('city', filters.location);
        if (filters.minSeats) queryParams.append('seats', filters.minSeats.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0].toUpperCase());
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
          queryParams.append('fuelType', filters.fuelType[0].toUpperCase());
        }
        if (filters.hasChauffeur) queryParams.append('hasChauffeur', 'true');
        if (filters.airportDelivery) queryParams.append('airportDelivery', 'true');
        if (filters.electric) queryParams.append('electric', 'true');
        if (filters.hybrid) queryParams.append('hybrid', 'true');
      }
      
      const response = await apiClient.get<any>(`/cars?${queryParams.toString()}`);
      
      return {
        data: (response.vehicles || []).map(mapCar),
        meta: {
          total: response.totalItems || 0,
          page: (response.currentPage || 0) + 1,
          pageSize,
          totalPages: response.totalPages || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get cars', error);
      return { data: [], meta: { total: 0, page: 1, pageSize, totalPages: 0 } };
    }
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      const response = await apiClient.get<any>(`/cars/${id}`);
      return response.vehicle ? mapCar(response.vehicle) : null;
    } catch (error) {
      console.error(`Failed to get car ${id}`, error);
      return null;
    }
  },

  async create(ownerId: string, data: any): Promise<Vehicle> {
    const response = await apiClient.post<any>('/cars', data);
    return response.vehicle ? mapCar(response.vehicle) : response;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete<any>(`/cars/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
};
