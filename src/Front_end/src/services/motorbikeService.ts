import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';
import { resolveImageUrl } from '@/utils';

const mapMotorbike = (v: any): Vehicle => {
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
    seats: 2,
    doors: 0,
    transmission: v.transmission || 'automatic',
    fuelType: 'gasoline',
    range: 0,
    engineSize: v.engineCc ? `${v.engineCc}cc` : '',
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
    vehicleType: 'motorbike',
    thumbnailUrl: resolvedThumbnailUrl,
    images: resolvedImages,
    owner: resolvedOwner,
    category: (v.category || 'scooter').toLowerCase(),
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
    engineCc: v.engineCc || null,
    hasHelmet: v.helmetIncluded || v.hasHelmet || false,
    hasPhoneHolder: v.phoneHolder || v.hasPhoneHolder || false,
    hasRaincoat: v.raincoatIncluded || v.hasRaincoat || false,
    hasTouringPackage: v.luggageRack || v.hasTouringPackage || false,
    deliveryAvailable: v.deliveryAvailable !== undefined ? v.deliveryAvailable : true,
    deliveryFee: v.deliveryFee || 100000,
  };
};

export const motorbikeService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: pageSize.toString()
      });
      
      if (filters) {
        if (filters.location) queryParams.append('city', filters.location);
        if (filters.minEngineCc) queryParams.append('engineCc', filters.minEngineCc.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0].toUpperCase());
        }
        if (filters.hasHelmet) queryParams.append('helmetIncluded', 'true');
        if (filters.hasRaincoat) queryParams.append('raincoatIncluded', 'true');
        if (filters.hasPhoneHolder) queryParams.append('phoneHolder', 'true');
        if (filters.hasTouringPackage) queryParams.append('luggageRack', 'true');
      }
      
      const response = await apiClient.get<any>(`/motorbikes?${queryParams.toString()}`);
      
      return {
        data: (response.vehicles || []).map(mapMotorbike),
        meta: {
          total: response.totalItems || 0,
          page: (response.currentPage || 0) + 1,
          pageSize,
          totalPages: response.totalPages || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get motorbikes', error);
      return { data: [], meta: { total: 0, page: 1, pageSize, totalPages: 0 } };
    }
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      const endpoint = id.startsWith('VM-') || id.startsWith('V-') ? `/vehicles/${id}` : `/motorbikes/${id}`;
      const response = await apiClient.get<any>(endpoint);
      return response.vehicle ? mapMotorbike(response.vehicle) : null;
    } catch (error) {
      console.error(`Failed to get motorbike ${id}`, error);
      return null;
    }
  },

  async create(ownerId: string, data: any): Promise<Vehicle> {
    const response = await apiClient.post<any>('/motorbikes', data);
    return response.vehicle ? mapMotorbike(response.vehicle) : response;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete<any>(`/motorbikes/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
};
