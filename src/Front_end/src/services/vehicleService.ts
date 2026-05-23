import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';

// Storage key for wishlist fallback since backend may not have a dedicated endpoint yet
const WISHLIST_KEY = 'luxeway_wishlist';

export const vehicleService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(), // Spring Data JPA is 0-indexed
        size: pageSize.toString()
      });
      
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      
      const response = await apiClient.get<any>(`/vehicles?${queryParams.toString()}`);
      
      return {
        data: response.vehicles || [],
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
      return response.vehicle || null;
    } catch (error) {
      console.error(`Failed to get vehicle ${id}`, error);
      return null;
    }
  },

  async getFeatured(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles?page=0&size=9`);
      const vehicles: Vehicle[] = response.vehicles || [];
      return vehicles.filter(v => v.isFeatured);
    } catch (error) {
      return [];
    }
  },

  async getByOwner(ownerId: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles/owner/${ownerId}?page=0&size=50`);
      return response.vehicles || [];
    } catch (error) {
      return [];
    }
  },

  async search(query: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>(`/vehicles/search?keyword=${encodeURIComponent(query)}`);
      return response.vehicles || [];
    } catch (error) {
      return [];
    }
  },

  async create(ownerId: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const payload = { ...data, ownerId };
    const response = await apiClient.post<any>('/vehicles', payload);
    return response.vehicle || payload; 
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const response = await apiClient.put<any>(`/vehicles/${id}`, updates);
      return response.vehicle || null;
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
