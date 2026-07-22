import apiClient from './api';
import type { Booking, BookingStatus, BookingWizardState } from '@/types';

// Helper to map backend booking structure to frontend Booking model
const mapBooking = (b: any): Booking => {
  if (!b) return b;
  const bookingKind = b.bookingKind || (b.car ? 'car' : b.motorbike ? 'motorbike' : 'general');
  const vehicle = b.vehicle || b.car || b.motorbike || null;
  return {
    ...b,
    bookingKind,
    vehicle,
    status: String(b.status || '').toLowerCase(),
    vehicleId: b.vehicleId || vehicle?.id || '',
    renterId: b.renterId || b.renter?.id || '',
    ownerId: b.ownerId || b.owner?.id || vehicle?.owner?.id || '',
    owner: b.owner || vehicle?.owner,
    pricing: b.pricing ? {
      basePrice: b.pricing.basePrice || 0,
      pricePerDay: b.pricing.pricePerDay || 0,
      addonsTotal: b.pricing.addonsTotal || 0,
      insuranceFee: b.pricing.insuranceFee || 0,
      deliveryFee: b.pricing.deliveryFee || 0,
      serviceFee: b.pricing.serviceFee || 0,
      taxes: b.pricing.taxes || 0,
      discount: b.pricing.discount || 0,
      total: b.pricing.total || 0,
      deposit: b.pricing.deposit || 0,
      depositRefunded: b.pricing.depositRefunded || false
    } : {
      basePrice: b.basePrice || 0,
      pricePerDay: b.pricePerDay || 0,
      addonsTotal: b.addonsTotal || 0,
      insuranceFee: b.insuranceFee || 0,
      deliveryFee: b.deliveryFee || 0,
      serviceFee: b.serviceFee || 0,
      taxes: b.taxes || 0,
      discount: b.discount || 0,
      total: b.total || b.totalAmount || 0,
      deposit: b.deposit || b.refundableDeposit || 0,
      depositRefunded: false
    }
  };
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUnifiedVehicleId = (id?: string): boolean => {
  if (!id) return false;
  return id.startsWith('VM-') || id.startsWith('VC-') || id.startsWith('featured-') || uuidPattern.test(id);
};

export const bookingService = {
  async getByUser(userId: string): Promise<Booking[]> {
    try {
      const [carRes, motoRes, genRes] = await Promise.all([
        apiClient.get<any>('/cars/bookings').catch(() => ({ bookings: [] })),
        apiClient.get<any>('/motorbikes/bookings').catch(() => ({ bookings: [] })),
        apiClient.get<any>('/bookings').catch(() => ({ data: { content: [] } }))
      ]);
      
      const carList = carRes.bookings || carRes.content || [];
      const motoList = motoRes.bookings || motoRes.content || [];
      const genList = genRes.bookings || genRes.content || genRes.data?.content || [];
      
      const combined = [...carList, ...motoList, ...genList];
      combined.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return combined.map(mapBooking);
    } catch (error) {
      console.error('Failed to fetch user bookings', error);
      return [];
    }
  },

  async getByOwner(ownerId: string): Promise<Booking[]> {
    try {
      const [carRes, motoRes, genRes] = await Promise.all([
        apiClient.get<any>('/cars/bookings/owner').catch(() => ({ bookings: [] })),
        apiClient.get<any>('/motorbikes/bookings/owner').catch(() => ({ bookings: [] })),
        apiClient.get<any>('/bookings/owner').catch(() => ({ data: { content: [] } }))
      ]);
      
      const carList = carRes.bookings || carRes.content || [];
      const motoList = motoRes.bookings || motoRes.content || [];
      const genList = genRes.bookings || genRes.content || genRes.data?.content || [];
      
      const combined = [...carList, ...motoList, ...genList];
      combined.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return combined.map(mapBooking);
    } catch (error) {
      console.error('Failed to fetch owner bookings', error);
      return [];
    }
  },

  async getById(id: string): Promise<Booking | null> {
    try {
      try {
        const response = await apiClient.get<any>(`/bookings/${id}`);
        const booking = response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (_) {}

      try {
        const carRes = await apiClient.get<any>(`/cars/bookings/${id}`);
        const booking = carRes.booking || carRes.data || carRes || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (_) {}
      
      try {
        const motoRes = await apiClient.get<any>(`/motorbikes/bookings/${id}`);
        const booking = motoRes.booking || motoRes.data || motoRes || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (_) {}
      
      return null;
    } catch (error) {
      return null;
    }
  },

  async create(wizardState: BookingWizardState, renterId: string, vehicleType?: 'car' | 'motorbike', extras?: any): Promise<Booking> {
    const createGeneralBooking = async (): Promise<Booking> => {
      const payload = {
        vehicleId: wizardState.vehicleId,
        startDate: wizardState.startDate,
        endDate: wizardState.endDate,
        includeInsurance: wizardState.includeInsurance,
        includeDelivery: wizardState.includeDelivery,
        deliveryAddress: wizardState.deliveryAddress,
        couponCode: wizardState.couponCode,
        notes: wizardState.notes,
        addonIds: wizardState.selectedAddons,
      };
      const response = await apiClient.post<any>('/bookings', payload);
      const booking = response.data || response;
      if (!booking || !booking.id) throw new Error(response.message || 'Failed to create booking');
      return mapBooking(booking);
    };

    const isGeneralVehicle = isUnifiedVehicleId(wizardState.vehicleId);
    if (vehicleType === 'car' && !isGeneralVehicle) {
      const payload = {
        carId: wizardState.vehicleId,
        startDate: wizardState.startDate,
        endDate: wizardState.endDate,
        includeInsurance: wizardState.includeInsurance,
        insuranceTier: extras?.insuranceTier || 'premium',
        hasChauffeur: !!extras?.hasChauffeur,
        airportDelivery: wizardState.includeDelivery,
        weddingPackage: !!extras?.weddingPackage,
        businessPackage: !!extras?.businessPackage,
        deliveryAddress: wizardState.deliveryAddress,
        notes: wizardState.notes,
        couponCode: wizardState.couponCode,
      };
      try {
        const response = await apiClient.post<any>('/cars/bookings', payload);
        const booking = response.booking || response.data || response;
        if (!booking || !booking.id) throw new Error(response.message || 'Failed to create car booking');
        return mapBooking(booking);
      } catch (error: any) {
        if (String(error?.message || '').toLowerCase().includes('car not found')) {
          return createGeneralBooking();
        }
        throw error;
      }
    } else if (vehicleType === 'motorbike' && !isGeneralVehicle) {
      const payload = {
        motorbikeId: wizardState.vehicleId,
        startDate: wizardState.startDate,
        endDate: wizardState.endDate,
        includeInsurance: wizardState.includeInsurance,
        hasHelmet: !!extras?.hasHelmet,
        hasRaincoat: !!extras?.hasRaincoat,
        hasPhoneHolder: !!extras?.hasPhoneHolder,
        hasTouringPackage: !!extras?.hasTouringPackage,
        notes: wizardState.notes,
        couponCode: wizardState.couponCode,
      };
      try {
        const response = await apiClient.post<any>('/motorbikes/bookings', payload);
        const booking = response.booking || response.data || response;
        if (!booking || !booking.id) throw new Error(response.message || 'Failed to create motorbike booking');
        return mapBooking(booking);
      } catch (error: any) {
        if (String(error?.message || '').toLowerCase().includes('motorbike not found')) {
          return createGeneralBooking();
        }
        throw error;
      }
    } else {
      return createGeneralBooking();
    }
  },

  async cancel(bookingId: string, reason: string): Promise<Booking | null> {
    const attempts = [
      () => apiClient.post<any>(`/bookings/${bookingId}/cancel-request`, { reason }),
      () => apiClient.put<any>(`/cars/bookings/${bookingId}/status?status=CANCELLATION_REQUESTED`, {}),
      () => apiClient.put<any>(`/motorbikes/bookings/${bookingId}/status?status=CANCELLATION_REQUESTED`, {}),
    ];

    let lastError: any;
    for (const attempt of attempts) {
      try {
        const response = await attempt();
        const booking = response.booking || response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (error: any) {
        lastError = error;
      }
    }

    console.error('Failed to request booking cancellation', lastError);
    const message = lastError?.response?.data?.message || lastError?.message || 'The cancellation request could not be sent.';
    throw new Error(message);
  },

  async approveCancellation(bookingId: string, reason = 'Approved by owner'): Promise<Booking | null> {
    const attempts = [
      () => apiClient.post<any>(`/bookings/${bookingId}/cancel-request/approve`, { reason }),
      () => apiClient.put<any>(`/cars/bookings/${bookingId}/status?status=CANCELLED`, {}),
      () => apiClient.put<any>(`/motorbikes/bookings/${bookingId}/status?status=CANCELLED`, {}),
    ];

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        const booking = response.booking || response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (error) {
        console.error('Cancellation approval endpoint failed', error);
      }
    }
    return null;
  },

  async rejectCancellation(bookingId: string, reason = 'Rejected by owner after policy review'): Promise<Booking | null> {
    const attempts = [
      () => apiClient.post<any>(`/bookings/${bookingId}/cancel-request/reject`, { reason }),
      () => apiClient.put<any>(`/cars/bookings/${bookingId}/status?status=CONFIRMED`, {}),
      () => apiClient.put<any>(`/motorbikes/bookings/${bookingId}/status?status=CONFIRMED`, {}),
    ];

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        const booking = response.booking || response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (error) {
        console.error('Cancellation rejection endpoint failed', error);
      }
    }
    return null;
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    try {
      try {
        const response = await apiClient.put<any>(`/cars/bookings/${bookingId}/status?status=${status.toUpperCase()}`, {});
        const booking = response.booking || response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (_) {}

      try {
        const response = await apiClient.put<any>(`/motorbikes/bookings/${bookingId}/status?status=${status.toUpperCase()}`, {});
        const booking = response.booking || response.data || response || null;
        if (booking && booking.id) return mapBooking(booking);
      } catch (_) {}

      const response = await apiClient.put<any>(`/bookings/${bookingId}/status`, { status: status.toUpperCase() });
      const booking = response.data || response || null;
      return booking ? mapBooking(booking) : null;
    } catch (error) {
      return null;
    }
  },

  async confirmTransfer(bookingId: string): Promise<any> {
    const response = await apiClient.post<any>(`/bookings/${bookingId}/confirm-transfer`, {});
    return response.data || response;
  },

  async verifyPayment(bookingId: string): Promise<any> {
    const response = await apiClient.post<any>(`/bookings/${bookingId}/verify-payment`, {});
    return response.data || response;
  },

  async rejectPayment(bookingId: string, reason: string): Promise<any> {
    const response = await apiClient.post<any>(`/bookings/${bookingId}/reject-payment?reason=${encodeURIComponent(reason)}`, {});
    return response.data || response;
  },

  async getAll(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>('/admin/bookings?page=0&size=100');
      const list = response.data?.content || response.content || [];
      return list.map(mapBooking);
    } catch (error) {
      return [];
    }
  },

  async getStats(ownerId: string) {
    try {
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
  /**
   * Process payment for a booking.
   * Backend endpoint: POST /payments
   * Returns ApiResponse<PaymentResponse> = { success, message, data: { id, transactionId, paymentUrl?, ... } }
   */
  async processPayment(
    bookingId: string,
    method: string,
    amount: number,
    returnUrl?: string
  ): Promise<{ success: boolean; transactionId: string; paymentUrl?: string; errorMessage?: string }> {
    try {
      const payload = {
        bookingId,
        method: method.toUpperCase(),
        amount,
        currency: 'VND',
        returnUrl: returnUrl || `${window.location.origin}/payment/${method.toLowerCase() === 'payos' ? 'payos' : 'momo'}/return`,
        description: `Payment for booking ${bookingId}`,
      };
      // apiClient.post returns the full response body from backend
      // Backend: ResponseEntity<ApiResponse<PaymentResponse>>
      // So response here IS the ApiResponse object: { success, message, data }
      const response = await apiClient.post<any>('/payments', payload);

      const isSuccess = response.success === true || response.status === 'ok';
      const paymentData = response.data;
      const gatewayRequiresRedirect = ['momo', 'payos'].includes(method.toLowerCase());
      const missingGatewayUrl = isSuccess && gatewayRequiresRedirect && !paymentData?.paymentUrl;

      return {
        success: isSuccess && !missingGatewayUrl,
        transactionId: paymentData?.transactionId || '',
        paymentUrl: paymentData?.paymentUrl || undefined,
        errorMessage: missingGatewayUrl
          ? `${method.toUpperCase()} checkout URL was not returned by backend`
          : (!isSuccess ? (response.message || 'Payment failed') : undefined),
      };
    } catch (error: any) {
      console.error('Payment processing failed', error);
      const msg = error?.message || 'Payment processing failed. Please try again.';
      return { success: false, transactionId: '', errorMessage: msg };
    }
  },

  /**
   * Top up LuxeWallet.
   * Backend endpoint: POST /payments/wallet/topup
   */
  async topUpWallet(
    amount: number,
    method: string,
    returnUrl?: string
  ): Promise<{ success: boolean; paymentUrl?: string; errorMessage?: string }> {
    try {
      const payload = {
        amount,
        method: method.toUpperCase(),
        currency: 'VND',
        returnUrl: returnUrl || `${window.location.origin}/payment/${method.toLowerCase() === 'payos' ? 'payos' : 'momo'}/return`,
      };
      const response = await apiClient.post<any>('/payments/wallet/topup', payload);
      const isSuccess = response.success === true;
      const gatewayRequiresRedirect = ['momo', 'payos'].includes(method.toLowerCase());
      const missingGatewayUrl = isSuccess && gatewayRequiresRedirect && !response.data?.paymentUrl;
      return {
        success: isSuccess && !missingGatewayUrl,
        paymentUrl: response.data?.paymentUrl || undefined,
        errorMessage: missingGatewayUrl
          ? `${method.toUpperCase()} checkout URL was not returned by backend`
          : (!isSuccess ? (response.message || 'Top up failed') : undefined),
      };
    } catch (error: any) {
      console.error('Wallet top-up failed', error);
      return { success: false, errorMessage: error?.message || 'Top up failed' };
    }
  },

  async getByUser(userId: string) {
    try {
      const response = await apiClient.get<any>('/payments/my');
      return response.data?.content || response.content || [];
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

  async applyCoupon(
    code: string,
    total: number
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    try {
      const response = await apiClient.get<any>(`/coupons/validate?code=${encodeURIComponent(code)}&amount=${total}`);
      if (response.success && response.data) {
        return {
          valid: true,
          discount: response.data.discountAmount || 0,
          message: response.data.message || `Coupon applied!`,
        };
      }
    } catch (_) {
      // Fall through to mock
    }

    // Mock fallback coupons
    const coupons: Record<string, { type: string; value: number }> = {
      'LUXE20': { type: 'percentage', value: 20 },
      'WELCOME15': { type: 'percentage', value: 15 },
      'FLAT100': { type: 'fixed', value: 100 },
      'VIP25': { type: 'percentage', value: 25 },
      'SUMMER10': { type: 'percentage', value: 10 },
    };

    const coupon = coupons[code.toUpperCase()];
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };

    const discount =
      coupon.type === 'percentage'
        ? Math.round((total * coupon.value) / 100)
        : coupon.value;

    return {
      valid: true,
      discount,
      message: `${coupon.value}${coupon.type === 'percentage' ? '%' : '$'} discount applied!`,
    };
  },

  async getPaymentSettings(): Promise<any> {
    const response = await apiClient.get<any>('/payment-settings');
    return response.data || response;
  },

  async updatePaymentSettings(settings: any): Promise<any> {
    const response = await apiClient.put<any>('/payment-settings', settings);
    return response.data || response;
  },
};

// ====== PAYMENT METHOD SERVICE ======
export const paymentMethodService = {
  async getMyCards(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/payment-methods');
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
      return [];
    }
  },

  async addCard(cardDetails: any): Promise<any> {
    const response = await apiClient.post<any>('/payment-methods', cardDetails);
    return response.data?.data;
  },

  async setDefaultCard(id: string): Promise<any> {
    const response = await apiClient.put<any>(`/payment-methods/${id}`, {});
    return response.data?.data;
  },

  async removeCard(id: string): Promise<any> {
    const response = await apiClient.delete<any>(`/payment-methods/${id}`);
    return response.data?.data;
  }
};
