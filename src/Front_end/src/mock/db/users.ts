import { faker } from '@faker-js/faker';
import type { User, UserRole, PaymentMethod, UserDocument } from '@/types';

// Seed for consistent data
faker.seed(42);

const LUXURY_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
];

function generatePaymentMethods(): PaymentMethod[] {
  return [
    {
      id: faker.string.uuid(),
      type: 'card',
      last4: faker.finance.creditCardNumber('####'),
      brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
      expiryMonth: faker.number.int({ min: 1, max: 12 }),
      expiryYear: faker.number.int({ min: 2025, max: 2030 }),
      isDefault: true,
    },
  ];
}

function generateDocuments(verified: boolean): UserDocument[] {
  return [
    {
      id: faker.string.uuid(),
      type: 'driving_license',
      status: verified ? 'verified' : 'pending',
      uploadedAt: faker.date.past({ years: 2 }).toISOString(),
      verifiedAt: verified ? faker.date.past({ years: 1 }).toISOString() : undefined,
      url: `https://example.com/docs/${faker.string.uuid()}.pdf`,
    },
    {
      id: faker.string.uuid(),
      type: 'national_id',
      status: verified ? 'verified' : 'pending',
      uploadedAt: faker.date.past({ years: 2 }).toISOString(),
      verifiedAt: verified ? faker.date.past({ years: 1 }).toISOString() : undefined,
      url: `https://example.com/docs/${faker.string.uuid()}.pdf`,
    },
  ];
}

export function generateUsers(): User[] {
  const users: User[] = [
    // Admin account
    {
      id: 'admin-001',
      email: 'admin@luxeway.com',
      password: 'Admin@123',
      firstName: 'Alex',
      lastName: 'Morgan',
      displayName: 'Alex Morgan',
      avatar: LUXURY_AVATARS[0],
      phone: '+1-555-0100',
      role: 'admin',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 5.0,
      totalReviews: 0,
      totalRentals: 0,
      bio: 'LuxeWay Platform Administrator',
      location: 'San Francisco, CA',
      joinedAt: '2023-01-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['admin', 'founder'],
      preferences: { currency: 'USD', language: 'en', notifications: true },
      paymentMethods: [],
      documents: [],
      stripeCustomerId: 'cus_admin001',
      isActive: true,
    },
    // Demo owner
    {
      id: 'owner-001',
      email: 'owner@luxeway.com',
      password: 'Owner@123',
      firstName: 'James',
      lastName: 'Whitmore',
      displayName: 'James Whitmore',
      avatar: LUXURY_AVATARS[2],
      phone: '+1-555-0200',
      role: 'owner',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.9,
      totalReviews: 87,
      totalRentals: 234,
      bio: 'Passionate car collector with 15 years in luxury automotive. I ensure every car is perfectly maintained.',
      location: 'Beverly Hills, CA',
      joinedAt: '2023-03-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['superhost', 'verified', 'top_owner'],
      preferences: { currency: 'USD', language: 'en', notifications: true },
      paymentMethods: generatePaymentMethods(),
      documents: generateDocuments(true),
      stripeCustomerId: 'cus_owner001',
      isActive: true,
      businessId: 'business-001',
    },
    // Demo customer
    {
      id: 'customer-001',
      email: 'user@luxeway.com',
      password: 'User@123',
      firstName: 'Sofia',
      lastName: 'Chen',
      displayName: 'Sofia Chen',
      avatar: LUXURY_AVATARS[3],
      phone: '+1-555-0300',
      role: 'customer',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.8,
      totalReviews: 12,
      totalRentals: 18,
      bio: 'Car enthusiast who loves experiencing different driving experiences around the world.',
      location: 'New York, NY',
      joinedAt: '2023-06-20T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['verified', 'trusted_renter'],
      preferences: { currency: 'USD', language: 'en', notifications: true },
      paymentMethods: generatePaymentMethods(),
      documents: generateDocuments(true),
      stripeCustomerId: 'cus_customer001',
      isActive: true,
    },
    // Demo business
    {
      id: 'business-owner-001',
      email: 'business@luxeway.com',
      password: 'Business@123',
      firstName: 'Marcus',
      lastName: 'Reynolds',
      displayName: 'Marcus Reynolds',
      avatar: LUXURY_AVATARS[4],
      phone: '+1-555-0400',
      role: 'business',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.95,
      totalReviews: 312,
      totalRentals: 1240,
      bio: 'CEO of Prestige Fleet — the world\'s premier luxury vehicle rental company.',
      location: 'Miami, FL',
      joinedAt: '2022-11-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['enterprise', 'verified', 'superhost', 'top_owner'],
      preferences: { currency: 'USD', language: 'en', notifications: true },
      paymentMethods: generatePaymentMethods(),
      documents: generateDocuments(true),
      stripeCustomerId: 'cus_business001',
      isActive: true,
      businessId: 'business-002',
    },
  ];

  const roles: UserRole[] = ['customer', 'customer', 'customer', 'owner', 'customer'];

  // Generate 26 more users
  for (let i = 0; i < 26; i++) {
    const verified = faker.datatype.boolean({ probability: 0.8 });
    const role = faker.helpers.arrayElement(roles);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    users.push({
      id: `user-${String(i + 10).padStart(3, '0')}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: 'Password@123',
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      avatar: faker.helpers.arrayElement(LUXURY_AVATARS),
      phone: faker.phone.number(),
      role,
      verified,
      kycVerified: verified,
      drivingLicenseVerified: verified,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      totalReviews: faker.number.int({ min: 0, max: 150 }),
      totalRentals: faker.number.int({ min: 0, max: 80 }),
      bio: faker.lorem.sentences(2),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      joinedAt: faker.date.past({ years: 3 }).toISOString(),
      lastActive: faker.date.recent({ days: 30 }).toISOString(),
      badges: verified ? ['verified'] : [],
      preferences: { currency: 'USD', language: 'en', notifications: faker.datatype.boolean() },
      paymentMethods: faker.datatype.boolean({ probability: 0.7 }) ? generatePaymentMethods() : [],
      documents: generateDocuments(verified),
      stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
      isActive: faker.datatype.boolean({ probability: 0.95 }),
      businessId: role === 'business' ? `business-${faker.string.uuid()}` : undefined,
    });
  }

  return users;
}
