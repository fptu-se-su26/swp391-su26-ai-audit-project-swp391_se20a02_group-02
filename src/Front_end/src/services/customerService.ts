import apiClient from './api';
import type { Booking, Vehicle, Payment, Review, User } from '@/types';
import { extractArray } from '@/utils';

export interface CustomerDashboardOverview {
  totalBookings: number;
  upcomingBookingsCount: number;
  pastBookingsCount: number;
  totalSpent: number;
  savedVehiclesCount: number;
  unreadNotificationsCount: number;
  kycStatus: string;
  kycVerified: boolean;
  isOwner: boolean;
  ownerApplicationStatus: string;
  recommendedVehicle?: any;
  recentBookings: any[];
}

export const customerService = {
  async getOverview(): Promise<CustomerDashboardOverview | null> {
    try {
      const response = await apiClient.get<any>('/customer/dashboard/overview');
      return response.data || response;
    } catch (error) {
      console.error('Failed to load customer overview', error);
      return null;
    }
  },

  async getBookings(status?: string, page = 0, size = 20): Promise<{ data: any[]; total: number }> {
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (status) params.append('status', status);
      const response = await apiClient.get<any>(`/customer/bookings?${params.toString()}`);
      const list = extractArray(response);
      const total = response.data?.totalElements || response.totalElements || list.length;
      return { data: list, total };
    } catch (error) {
      console.error('Failed to load customer bookings', error);
      return { data: [], total: 0 };
    }
  },

  async getUpcomingBookings(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/customer/bookings/upcoming');
      return extractArray(response);
    } catch (error) {
      console.error('Failed to load upcoming bookings', error);
      return [];
    }
  },

  async getPastBookings(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/customer/bookings/history');
      return extractArray(response);
    } catch (error) {
      console.error('Failed to load booking history', error);
      return [];
    }
  },

  async getSavedVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get<any>('/customer/saved-vehicles');
      return extractArray(response);
    } catch (error) {
      console.error('Failed to load saved vehicles', error);
      return [];
    }
  },

  async getPayments(page = 0, size = 20): Promise<{ data: any[]; total: number }> {
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      const response = await apiClient.get<any>(`/customer/payments?${params.toString()}`);
      const list = extractArray(response);
      const total = response.data?.totalElements || response.totalElements || list.length;
      return { data: list, total };
    } catch (error) {
      console.error('Failed to load customer payments', error);
      return { data: [], total: 0 };
    }
  },

  async getReviews(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/customer/reviews');
      return extractArray(response);
    } catch (error) {
      console.error('Failed to load customer reviews', error);
      return [];
    }
  },

  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/customer/profile');
      return response.data || response;
    } catch (error) {
      console.error('Failed to load customer profile', error);
      return null;
    }
  }
};
