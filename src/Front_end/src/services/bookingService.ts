import apiClient from './api';
import type { Booking, BookingStatus, BookingWizardState } from '@/types';
import { faker } from '@faker-js/faker';

export const bookingService = {
  async getByUser(userId: string): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>('/bookings?page=0&size=50');
      return response.data?.content || [];
    } catch (error) {
      console.error('Failed to fetch user bookings', error);
      return [];
    }
  },

  async getByOwner(ownerId: string): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>('/bookings/owner?page=0&size=50');
      return response.data?.content || [];
    } catch (error) {
      console.error('Failed to fetch owner bookings', error);
      return [];
    }
  },

  async getById(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<any>(`/bookings/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  async create(wizardState: BookingWizardState, renterId: string): Promise<Booking> {
    const payload = {
      vehicleId: wizardState.vehicleId,
      startDate: wizardState.startDate,
      endDate: wizardState.endDate,
      includeInsurance: wizardState.includeInsurance,
      includeDelivery: wizardState.includeDelivery,
      deliveryAddress: wizardState.deliveryAddress,
      couponCode: wizardState.couponCode,
      notes: wizardState.notes,
      selectedAddons: wizardState.selectedAddons,
    };
    
    const response = await apiClient.post<any>('/bookings', payload);
    if (!response.data) throw new Error('Failed to create booking');
    return response.data;
  },

  async cancel(bookingId: string, reason: string): Promise<Booking | null> {
    try {
      const response = await apiClient.put<any>(`/bookings/${bookingId}/cancel`, { reason });
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const response = await apiClient.put<any>(`/bookings/${bookingId}/status`, { status: status.toUpperCase() });
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  async getAll(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>('/admin/bookings?page=0&size=100');
      return response.data?.content || [];
    } catch (error) {
      return [];
    }
  },

  async getStats(ownerId: string) {
    try {
      // Backend may not have a dedicated stats endpoint for owner, so we fetch all and calculate
      const bookings = await this.getByOwner(ownerId);
      return {
        total: bookings.length,
        pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
        confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
        active: bookings.filter(b => b.status?.toLowerCase() === 'active').length,
        completed: bookings.filter(b => b.status?.toLowerCase() === 'completed').length,
        cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
        revenue: bookings
          .filter(b => b.status?.toLowerCase() === 'completed')
          .reduce((sum, b) => sum + (b.pricing?.total || 0), 0),
      };
    } catch (error) {
      return { total: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0, revenue: 0 };
    }
  },
};

export const paymentService = {
  async processPayment(bookingId: string, method: string, amount: number, returnUrl?: string): Promise<{ success: boolean; transactionId: string; paymentUrl?: string }> {
    try {
      const payload = {
        bookingId,
        method: method.toUpperCase(),
        amount,
        returnUrl
      };
      const response = await apiClient.post<any>('/payments', payload);
      
      return {
        success: response.success !== false,
        transactionId: response.data?.transactionId || '',
        paymentUrl: response.data?.paymentUrl
      };
    } catch (error) {
      console.error('Payment processing failed', error);
      return { success: false, transactionId: '' };
    }
  },

  async topUpWallet(amount: number, method: string, returnUrl?: string): Promise<{ success: boolean; paymentUrl?: string }> {
    try {
      const payload = {
        amount,
        method: method.toUpperCase(),
        returnUrl
      };
      const response = await apiClient.post<any>('/payments/wallet/topup', payload);
      return {
        success: response.success !== false,
        paymentUrl: response.data?.paymentUrl
      };
    } catch (error) {
      console.error('Wallet top-up failed', error);
      return { success: false };
    }
  },

  async getByUser(userId: string) {
    try {
      const response = await apiClient.get<any>('/payments/my');
      return response.data?.content || [];
    } catch (error) {
      return [];
    }
  },

  async refund(paymentId: string, amount: number): Promise<boolean> {
    try {
      await apiClient.post<any>(`/admin/payments/${paymentId}/refund`, { amount });
      return true;
    } catch (error) {
      return false;
    }
  },

  async applyCoupon(code: string, total: number): Promise<{ valid: boolean; discount: number; message: string }> {
    // Currently mock logic as backend doesn't have a dedicated coupon endpoint
    const coupons: Record<string, { type: string; value: number }> = {
      'LUXE20': { type: 'percentage', value: 20 },
      'WELCOME15': { type: 'percentage', value: 15 },
      'FLAT100': { type: 'fixed', value: 100 },
      'VIP25': { type: 'percentage', value: 25 },
    };

    const coupon = coupons[code.toUpperCase()];
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };

    const discount = coupon.type === 'percentage'
      ? Math.round((total * coupon.value) / 100)
      : coupon.value;

    return { valid: true, discount, message: `${coupon.value}${coupon.type === 'percentage' ? '%' : '$'} discount applied!` };
  },
};
