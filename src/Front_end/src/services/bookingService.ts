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
  async processPayment(bookingId: string, method: string, amount: number): Promise<{ success: boolean; transactionId: string }> {
    await delay(1500); // Simulate payment processing
    // 95% success rate
    const success = Math.random() > 0.05;
    return {
      success,
      transactionId: success ? `txn_${faker.string.alphanumeric(20)}` : '',
    };
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
};
