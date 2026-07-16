import { getDb, dbUpdate, dbCreate, STORAGE_KEYS } from '@/mock/db';
import type { Booking, BookingStatus, BookingWizardState } from '@/types';
import { faker } from '@faker-js/faker';

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

export const bookingService = {
  async getByUser(userId: string): Promise<Booking[]> {
    await delay(300);
    const { bookings } = getDb();
    return bookings.filter(b => b.renterId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getByOwner(ownerId: string): Promise<Booking[]> {
    await delay(300);
    const { bookings } = getDb();
    return bookings.filter(b => b.ownerId === ownerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<Booking | null> {
    await delay(200);
    const { bookings } = getDb();
    return bookings.find(b => b.id === id) || null;
  },

<<<<<<< HEAD
  async create(wizardState: BookingWizardState, renterId: string): Promise<Booking> {
    await delay(800);
    const { bookings, vehicles } = getDb();

    const vehicle = vehicles.find(v => v.id === wizardState.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const startDate = new Date(wizardState.startDate);
    const endDate = new Date(wizardState.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = vehicle.pricePerDay * totalDays;
    const serviceFee = Math.round(basePrice * 0.12);
    const taxes = Math.round(basePrice * 0.08);
    const insuranceFee = wizardState.includeInsurance ? Math.round(totalDays * 45) : 0;
    const deliveryFee = wizardState.includeDelivery ? vehicle.deliveryFee : 0;
    const total = basePrice + serviceFee + taxes + insuranceFee + deliveryFee;

    const newBooking: Booking = {
      id: `booking-${faker.string.uuid()}`,
      vehicleId: wizardState.vehicleId,
      renterId,
      ownerId: vehicle.ownerId,
      status: vehicle.instantBook ? 'confirmed' : 'pending',
      startDate: wizardState.startDate,
      endDate: wizardState.endDate,
      totalDays,
      pricing: {
        basePrice,
        pricePerDay: vehicle.pricePerDay,
        addonsTotal: 0,
        insuranceFee,
        deliveryFee,
        serviceFee,
        taxes,
        discount: 0,
        total,
        deposit: vehicle.deposit,
        depositRefunded: false,
      },
      selectedAddons: wizardState.selectedAddons,
      includeInsurance: wizardState.includeInsurance,
      includeDelivery: wizardState.includeDelivery,
      deliveryAddress: wizardState.deliveryAddress || undefined,
      couponCode: wizardState.couponCode || undefined,
      notes: wizardState.notes,
      ownerNotes: '',
      pickupLocation: vehicle.location.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbCreate(STORAGE_KEYS.BOOKINGS, bookings, newBooking);
    return newBooking;
=======
  async create(wizardState: BookingWizardState, renterId: string, vehicleType?: 'car' | 'motorbike', extras?: any): Promise<Booking> {
    const isGeneralVehicle = wizardState.vehicleId?.startsWith('VM-') || wizardState.vehicleId?.startsWith('VC-');
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
      const response = await apiClient.post<any>('/cars/bookings', payload);
      const booking = response.booking || response.data || response;
      if (!booking || !booking.id) throw new Error(response.message || 'Failed to create car booking');
      return mapBooking(booking);
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
      const response = await apiClient.post<any>('/motorbikes/bookings', payload);
      const booking = response.booking || response.data || response;
      if (!booking || !booking.id) throw new Error(response.message || 'Failed to create motorbike booking');
      return mapBooking(booking);
    } else {
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
    }
>>>>>>> origin/main
  },

  async cancel(bookingId: string, reason: string): Promise<Booking | null> {
    await delay(500);
    const { bookings } = getDb();
    return dbUpdate(STORAGE_KEYS.BOOKINGS, bookings, bookingId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    } as Partial<Booking>);
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    await delay(400);
    const { bookings } = getDb();
    return dbUpdate(STORAGE_KEYS.BOOKINGS, bookings, bookingId, {
      status,
      updatedAt: new Date().toISOString(),
    } as Partial<Booking>);
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
    await delay(400);
    const { bookings } = getDb();
    return bookings;
  },

  async getStats(ownerId: string) {
    await delay(300);
    const { bookings } = getDb();
    const ownerBookings = bookings.filter(b => b.ownerId === ownerId);

    return {
      total: ownerBookings.length,
      pending: ownerBookings.filter(b => b.status === 'pending').length,
      confirmed: ownerBookings.filter(b => b.status === 'confirmed').length,
      active: ownerBookings.filter(b => b.status === 'active').length,
      completed: ownerBookings.filter(b => b.status === 'completed').length,
      cancelled: ownerBookings.filter(b => b.status === 'cancelled').length,
      revenue: ownerBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.pricing.total, 0),
    };
  },
};

export const paymentService = {
<<<<<<< HEAD
  async processPayment(bookingId: string, method: string, amount: number): Promise<{ success: boolean; transactionId: string }> {
    await delay(1500); // Simulate payment processing
    // 95% success rate
    const success = Math.random() > 0.05;
    return {
      success,
      transactionId: success ? `txn_${faker.string.alphanumeric(20)}` : '',
    };
=======
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
>>>>>>> origin/main
  },

  async getByUser(userId: string) {
    await delay(300);
    const { payments } = getDb();
    return payments.filter(p => p.userId === userId);
  },

  async refund(paymentId: string, amount: number): Promise<boolean> {
    await delay(800);
    return true; // Always succeeds in mock
  },

  async applyCoupon(code: string, total: number): Promise<{ valid: boolean; discount: number; message: string }> {
    await delay(300);
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

  async getPaymentSettings(): Promise<any> {
    const response = await apiClient.get<any>('/payment-settings');
    return response.data || response;
  },

  async updatePaymentSettings(settings: any): Promise<any> {
    const response = await apiClient.put<any>('/payment-settings', settings);
    return response.data || response;
  },
};
