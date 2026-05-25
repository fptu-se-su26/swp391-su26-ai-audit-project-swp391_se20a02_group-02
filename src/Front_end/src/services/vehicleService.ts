import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';

// Storage key for wishlist fallback since backend may not have a dedicated endpoint yet
const WISHLIST_KEY = 'luxeway_wishlist';

// Helper function to map flat backend vehicle DTO to nested frontend Vehicle type
const mapVehicle = (v: any): Vehicle => {
  if (!v) return v;
  return {
    ...v,
    location: v.location || {
      city: v.city || '',
      country: v.country || 'Vietnam',
      address: v.address || '',
      lat: v.latitude || 0,
      lng: v.longitude || 0,
      timezone: 'Asia/Ho_Chi_Minh'
    },
    specs: v.specs || {
      horsepower: v.horsepower || 0,
      topSpeed: v.topSpeed || 0,
      acceleration: v.acceleration || 0,
      seats: v.seats || 0,
      doors: v.doors || 4,
      transmission: v.transmission || 'automatic',
      fuelType: v.fuelType || 'gasoline',
      range: v.rangeKm,
      engineSize: v.engineSize,
      color: v.color || '',
      licensePlate: v.licensePlate || ''
    }
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
        if (filters.category && filters.category.length > 0) {
          queryParams.append('category', filters.category[0]);
        }
        if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minSeats !== undefined) queryParams.append('minSeats', filters.minSeats.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0]);
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
          queryParams.append('fuelType', filters.fuelType[0]);
        }
        if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());
        if (filters.instantBook !== undefined) queryParams.append('instantBook', filters.instantBook.toString());
        if (filters.deliveryAvailable !== undefined) queryParams.append('deliveryAvailable', filters.deliveryAvailable.toString());
        if (filters.isFeatured !== undefined) queryParams.append('isFeatured', filters.isFeatured.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
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
      const response = await apiClient.get<any>(`/vehicles/${id}`);
      return response.vehicle ? mapVehicle(response.vehicle) : null;
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
    return ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Tesla', 'Lamborghini', 'Ferrari', 'Range Rover'];
  },

  getCities(): string[] {
    return ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Phú Quốc'];
  },
};
