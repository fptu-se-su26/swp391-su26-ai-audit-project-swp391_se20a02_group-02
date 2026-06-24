import { faker } from '@faker-js/faker';
import type { Booking, BookingStatus, Payment, PaymentStatus, Review, Notification, Message, Conversation, Business, AnalyticsData } from '@/types';

faker.seed(100);

const VEHICLE_IDS = Array.from({ length: 100 }, (_, i) => `vehicle-${String(i + 1).padStart(3, '0')}`);
const USER_IDS = ['customer-001', ...Array.from({ length: 26 }, (_, i) => `user-${String(i + 10).padStart(3, '0')}`)];
const OWNER_IDS = ['owner-001', 'business-owner-001'];

// ====== BOOKINGS ======
export function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  const statuses: BookingStatus[] = ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'];

  for (let i = 0; i < 300; i++) {
    const vehicleId = faker.helpers.arrayElement(VEHICLE_IDS);
    const renterId = faker.helpers.arrayElement(USER_IDS);
    const ownerId = faker.helpers.arrayElement(OWNER_IDS);
    const pricePerDay = faker.number.int({ min: 500, max: 5000 });
    const totalDays = faker.number.int({ min: 1, max: 14 });
    const basePrice = pricePerDay * totalDays;
    const addonsTotal = faker.number.int({ min: 0, max: 500 });
    const serviceFee = Math.round(basePrice * 0.12);
    const taxes = Math.round(basePrice * 0.08);
    const discount = faker.datatype.boolean({ probability: 0.2 }) ? faker.number.int({ min: 50, max: 300 }) : 0;
    const total = basePrice + addonsTotal + serviceFee + taxes - discount;

    const startDate = faker.date.between({ from: '2024-01-01', to: '2026-12-31' });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays);

    const status = faker.helpers.weightedArrayElement([
      { weight: 10, value: 'pending' },
      { weight: 15, value: 'confirmed' },
      { weight: 10, value: 'active' },
      { weight: 50, value: 'completed' },
      { weight: 12, value: 'cancelled' },
      { weight: 3, value: 'disputed' },
    ]) as BookingStatus;

    bookings.push({
      id: `booking-${String(i + 1).padStart(3, '0')}`,
      vehicleId,
      renterId,
      ownerId,
      status,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays,
      pricing: {
        basePrice,
        pricePerDay,
        addonsTotal,
        insuranceFee: faker.number.int({ min: 0, max: 200 }),
        deliveryFee: faker.datatype.boolean({ probability: 0.3 }) ? faker.number.int({ min: 50, max: 150 }) : 0,
        serviceFee,
        taxes,
        discount,
        total,
        deposit: Math.round(pricePerDay * 2),
        depositRefunded: status === 'completed' || status === 'cancelled',
      },
      selectedAddons: faker.helpers.arrayElements(['addon-gps', 'addon-wifi', 'addon-tollpass'], faker.number.int({ min: 0, max: 2 })),
      includeInsurance: faker.datatype.boolean({ probability: 0.7 }),
      includeDelivery: faker.datatype.boolean({ probability: 0.3 }),
      deliveryAddress: faker.datatype.boolean({ probability: 0.3 }) ? faker.location.streetAddress() : undefined,
      paymentId: status !== 'pending' ? `payment-${String(i + 1).padStart(3, '0')}` : undefined,
      couponCode: faker.datatype.boolean({ probability: 0.1 }) ? 'LUXE20' : undefined,
      notes: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.sentence() : '',
      ownerNotes: '',
      pickupLocation: faker.location.streetAddress(),
      createdAt: faker.date.recent({ days: 180 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
      cancelledAt: status === 'cancelled' ? faker.date.recent({ days: 60 }).toISOString() : undefined,
      cancellationReason: status === 'cancelled' ? faker.helpers.arrayElement(['Change of plans', 'Found better option', 'Emergency', 'Owner cancelled']) : undefined,
      reviewId: status === 'completed' && faker.datatype.boolean({ probability: 0.7 }) ? `review-${String(i + 1).padStart(3, '0')}` : undefined,
    });
  }

  return bookings;
}

// ====== PAYMENTS ======
export function generatePayments(): Payment[] {
  const payments: Payment[] = [];
  const statuses: PaymentStatus[] = ['succeeded', 'succeeded', 'succeeded', 'pending', 'failed', 'refunded'];

  for (let i = 0; i < 300; i++) {
    const status = faker.helpers.arrayElement(statuses) as PaymentStatus;
    payments.push({
      id: `payment-${String(i + 1).padStart(3, '0')}`,
      bookingId: `booking-${String(i + 1).padStart(3, '0')}`,
      userId: faker.helpers.arrayElement(USER_IDS),
      amount: faker.number.int({ min: 500, max: 15000 }),
      currency: 'USD',
      status,
      method: faker.helpers.arrayElement(['stripe', 'vnpay', 'wallet', 'stripe', 'stripe']),
      stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
      transactionId: `txn_${faker.string.alphanumeric(20)}`,
      description: `Booking payment for vehicle rental`,
      metadata: { source: 'luxeway_web' },
      createdAt: faker.date.recent({ days: 180 }).toISOString(),
      processedAt: status !== 'pending' ? faker.date.recent({ days: 170 }).toISOString() : undefined,
      refundedAt: status === 'refunded' ? faker.date.recent({ days: 60 }).toISOString() : undefined,
      refundAmount: status === 'refunded' ? faker.number.int({ min: 200, max: 800 }) : undefined,
    });
  }

  return payments;
}

// ====== REVIEWS ======
const REVIEW_COMMENTS = [
  'Absolutely incredible experience! The car was in perfect condition and the owner was super communicative.',
  'Best rental experience I\'ve ever had. The vehicle exceeded all expectations.',
  'Smooth booking process, pristine vehicle, exactly as described. Will definitely rent again!',
  'Stunning car and flawless service. Highly recommended for anyone wanting a premium experience.',
  'Exceeded expectations in every way. The vehicle was immaculate and the pickup was seamless.',
  'Perfect condition, great communication from the owner, and an unforgettable driving experience.',
  'Everything was top-notch. The car, the service, and the overall experience were all exceptional.',
  'Truly a luxury experience from start to finish. The vehicle was breathtaking.',
  'Outstanding rental experience. Will definitely be my go-to for future rentals.',
  'Pure automotive bliss. The vehicle was even better in person than in the photos.',
];

export function generateReviews(): Review[] {
  const reviews: Review[] = [];

  for (let i = 0; i < 200; i++) {
    const rating = parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1));
    reviews.push({
      id: `review-${String(i + 1).padStart(3, '0')}`,
      vehicleId: faker.helpers.arrayElement(VEHICLE_IDS),
      bookingId: `booking-${String(i + 1).padStart(3, '0')}`,
      reviewerId: faker.helpers.arrayElement(USER_IDS),
      ownerId: faker.helpers.arrayElement(OWNER_IDS),
      rating,
      cleanliness: parseFloat(faker.number.float({ min: rating - 0.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      accuracy: parseFloat(faker.number.float({ min: rating - 0.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      communication: parseFloat(faker.number.float({ min: rating - 0.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      value: parseFloat(faker.number.float({ min: rating - 1.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      comment: faker.helpers.arrayElement(REVIEW_COMMENTS),
      ownerResponse: faker.datatype.boolean({ probability: 0.4 }) ? 'Thank you so much for your wonderful review! We are thrilled you enjoyed the experience.' : undefined,
      photos: faker.datatype.boolean({ probability: 0.3 }) ? [
        `https://images.unsplash.com/photo-${faker.number.int({ min: 1000000000, max: 1999999999 })}?w=400&auto=format&fit=crop`,
      ] : [],
      helpful: faker.number.int({ min: 0, max: 50 }),
      createdAt: faker.date.recent({ days: 365 }).toISOString(),
      updatedAt: faker.date.recent({ days: 365 }).toISOString(),
    });
  }

  return reviews;
}

// ====== NOTIFICATIONS ======
const NOTIFICATION_TEMPLATES = [
  { type: 'booking', title: 'Booking Confirmed!', body: 'Your booking has been confirmed. Get ready for an amazing experience!' },
  { type: 'payment', title: 'Payment Successful', body: 'Your payment of $1,200 has been processed successfully.' },
  { type: 'message', title: 'New Message', body: 'You have a new message from your vehicle owner.' },
  { type: 'review', title: 'Review Received', body: 'You received a 5-star review for your recent rental!' },
  { type: 'system', title: 'Identity Verified', body: 'Your identity has been successfully verified. You can now book premium vehicles.' },
  { type: 'promotion', title: 'Exclusive Offer', body: 'Use code LUXE20 for 20% off your next booking. Valid for 48 hours!' },
  { type: 'booking', title: 'Booking Request', body: 'You have a new booking request for your Ferrari 488.' },
];

export function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  const allUserIds = [...USER_IDS, ...OWNER_IDS, 'admin-001'];

  for (let i = 0; i < 150; i++) {
    const template = faker.helpers.arrayElement(NOTIFICATION_TEMPLATES);
    notifications.push({
      id: `notification-${String(i + 1).padStart(3, '0')}`,
      userId: faker.helpers.arrayElement(allUserIds),
      type: template.type as Notification['type'],
      title: template.title,
      body: template.body,
      icon: template.type,
      link: `/dashboard`,
      read: faker.datatype.boolean({ probability: 0.6 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    });
  }

  return notifications;
}

// ====== MESSAGES & CONVERSATIONS ======
const MESSAGE_TEXTS = [
  'Hi! I\'m interested in renting your vehicle. Is it available?',
  'When can I pick up the car? I\'ll be arriving at 10 AM.',
  'The car is in perfect condition, you\'ll love it!',
  'Can I extend the rental by 2 more days?',
  'Absolutely! The car is available for your dates.',
  'Please confirm your payment and I\'ll send you the pickup details.',
  'Thank you for the amazing experience! The car was incredible.',
  'I\'ll need the full tank upon return, as agreed.',
  'Great news! Your booking has been confirmed.',
  'Do you offer airport delivery?',
];

export function generateConversations(): Conversation[] {
  const conversations: Conversation[] = [];
  for (let i = 0; i < 50; i++) {
    const user1 = faker.helpers.arrayElement(USER_IDS);
    const user2 = faker.helpers.arrayElement(OWNER_IDS);
    const lastActivity = faker.date.recent({ days: 14 }).toISOString();

    conversations.push({
      id: `conv-${String(i + 1).padStart(3, '0')}`,
      participants: [user1, user2],
      vehicleId: faker.helpers.arrayElement(VEHICLE_IDS),
      bookingId: faker.datatype.boolean({ probability: 0.6 }) ? `booking-${String(faker.number.int({ min: 1, max: 300 })).padStart(3, '0')}` : undefined,
      lastActivity,
      unreadCount: { [user1]: faker.number.int({ min: 0, max: 5 }), [user2]: faker.number.int({ min: 0, max: 3 }) },
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    });
  }
  return conversations;
}

export function generateMessages(): Message[] {
  const messages: Message[] = [];
  for (let i = 0; i < 200; i++) {
    const senderId = faker.helpers.arrayElement([...USER_IDS, ...OWNER_IDS]);
    const receiverId = faker.helpers.arrayElement([...USER_IDS, ...OWNER_IDS].filter(id => id !== senderId));

    messages.push({
      id: `msg-${String(i + 1).padStart(3, '0')}`,
      conversationId: `conv-${String(faker.number.int({ min: 1, max: 50 })).padStart(3, '0')}`,
      senderId,
      receiverId,
      type: 'text',
      content: faker.helpers.arrayElement(MESSAGE_TEXTS),
      readAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 7 }).toISOString() : undefined,
      createdAt: faker.date.recent({ days: 14 }).toISOString(),
      edited: false,
    });
  }
  return messages;
}

// ====== BUSINESSES ======
export function generateBusinesses(): Business[] {
  return [
    {
      id: 'business-001',
      name: 'Aura Prestige Motors',
      legalName: 'Aura Prestige Motors LLC',
      description: 'Premier luxury vehicle rental company with 15+ years of excellence.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&auto=format&fit=crop',
      email: 'contact@auraprestige.com',
      phone: '+1-310-555-0100',
      website: 'https://auraprestige.com',
      rating: 4.9,
      totalReviews: 312,
      totalVehicles: 28,
      totalEmployees: 15,
      verified: true,
      branches: [
        { id: 'branch-001', name: 'Beverly Hills HQ', address: '400 N. Rodeo Drive', city: 'Beverly Hills', lat: 34.0697, lng: -118.3986, phone: '+1-310-555-0101', isMain: true },
        { id: 'branch-002', name: 'LAX Airport', address: 'LAX Terminal 5', city: 'Los Angeles', lat: 33.9425, lng: -118.4081, phone: '+1-310-555-0102', isMain: false },
      ],
      employees: ['owner-001'],
      ownerId: 'owner-001',
      createdAt: '2022-01-15T00:00:00Z',
      revenue: 2450000,
      tier: 'enterprise',
    },
    {
      id: 'business-002',
      name: 'Prestige Fleet International',
      legalName: 'Prestige Fleet International Inc.',
      description: 'Global luxury vehicle marketplace with locations in 15 countries.',
      logo: 'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop',
      email: 'contact@prestigefleet.com',
      phone: '+1-305-555-0200',
      website: 'https://prestigefleet.com',
      rating: 4.95,
      totalReviews: 892,
      totalVehicles: 67,
      totalEmployees: 48,
      verified: true,
      branches: [
        { id: 'branch-003', name: 'Miami Beach', address: '1500 Ocean Drive', city: 'Miami', lat: 25.7825, lng: -80.1303, phone: '+1-305-555-0201', isMain: true },
        { id: 'branch-004', name: 'New York Midtown', address: '455 Park Ave', city: 'New York', lat: 40.7580, lng: -73.9855, phone: '+1-212-555-0202', isMain: false },
        { id: 'branch-005', name: 'Las Vegas Strip', address: '3600 Las Vegas Blvd', city: 'Las Vegas', lat: 36.1147, lng: -115.1728, phone: '+1-702-555-0203', isMain: false },
      ],
      employees: ['business-owner-001'],
      ownerId: 'business-owner-001',
      createdAt: '2021-06-01T00:00:00Z',
      revenue: 8900000,
      tier: 'enterprise',
    },
  ];
}

// ====== ANALYTICS ======
export function generateAnalytics(): AnalyticsData[] {
  const analytics: AnalyticsData[] = [];
  const months = 12;

  for (let m = 0; m < months; m++) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);

    analytics.push({
      id: `analytics-month-${m}`,
      period: 'month',
      date: date.toISOString().slice(0, 7),
      revenue: faker.number.int({ min: 150000, max: 450000 }),
      bookings: faker.number.int({ min: 80, max: 250 }),
      views: faker.number.int({ min: 5000, max: 25000 }),
      conversionRate: parseFloat(faker.number.float({ min: 2.5, max: 8.5, fractionDigits: 1 }).toFixed(1)),
      avgRentalDays: parseFloat(faker.number.float({ min: 2.5, max: 7.5, fractionDigits: 1 }).toFixed(1)),
      newCustomers: faker.number.int({ min: 30, max: 120 }),
      returningCustomers: faker.number.int({ min: 20, max: 80 }),
    });

    // Daily data for last 30 days
    if (m === 0) {
      for (let d = 0; d < 30; d++) {
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - d);
        analytics.push({
          id: `analytics-day-${d}`,
          period: 'day',
          date: dayDate.toISOString().slice(0, 10),
          revenue: faker.number.int({ min: 3000, max: 18000 }),
          bookings: faker.number.int({ min: 2, max: 15 }),
          views: faker.number.int({ min: 150, max: 900 }),
          conversionRate: parseFloat(faker.number.float({ min: 2.0, max: 10.0, fractionDigits: 1 }).toFixed(1)),
          avgRentalDays: parseFloat(faker.number.float({ min: 2.0, max: 8.0, fractionDigits: 1 }).toFixed(1)),
          newCustomers: faker.number.int({ min: 1, max: 15 }),
          returningCustomers: faker.number.int({ min: 1, max: 8 }),
        });
      }
    }
  }

  return analytics;
}
