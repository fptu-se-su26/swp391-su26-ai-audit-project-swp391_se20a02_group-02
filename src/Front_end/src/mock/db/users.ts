import { faker } from '@faker-js/faker';
import type { User, UserRole, PaymentMethod, UserDocument } from '@/types';

// Seed for consistent data
faker.seed(42);

const VN_LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const VN_FIRST_NAMES_MALE = ['Anh', 'Bảo', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Đức', 'Hải', 'Hiếu', 'Hoàng', 'Huy', 'Hùng', 'Khang', 'Khoa', 'Kiên', 'Lâm', 'Long', 'Minh', 'Nam', 'Phong', 'Phúc', 'Quân', 'Quang', 'Sơn', 'Thái', 'Thành', 'Thắng', 'Thiện', 'Thịnh', 'Trung', 'Tuấn', 'Tùng', 'Việt', 'Vinh'];
const VN_FIRST_NAMES_FEMALE = ['An', 'Anh', 'Châu', 'Chi', 'Diệp', 'Dung', 'Hà', 'Hân', 'Hằng', 'Hoa', 'Hồng', 'Hương', 'Huyền', 'Khanh', 'Lan', 'Linh', 'Mai', 'Ngọc', 'Nhi', 'Nhung', 'Oanh', 'Phương', 'Quyên', 'Quỳnh', 'Thảo', 'Thu', 'Thủy', 'Tiên', 'Trâm', 'Trang', 'Tú', 'Uyên', 'Vân', 'Yến'];

const VN_CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Đà Lạt', 'Huế', 'Vũng Tàu', 'Quy Nhơn'];

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

function generateVnPhone() {
  const prefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '086', '088', '089'];
  return `${faker.helpers.arrayElement(prefixes)}${faker.string.numeric(7)}`;
}

function generatePaymentMethods(): PaymentMethod[] {
  return [
    {
      id: faker.string.uuid(),
      type: 'card',
      last4: faker.finance.creditCardNumber('####'),
      brand: faker.helpers.arrayElement(['visa', 'mastercard', 'napas']),
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
      firstName: 'Minh',
      lastName: 'Nguyễn',
      displayName: 'Nguyễn Minh',
      avatar: LUXURY_AVATARS[0],
      phone: '0901234567',
      role: 'admin',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 5.0,
      totalReviews: 0,
      totalRentals: 0,
      bio: 'LuxeWay Platform Administrator',
      location: 'Hồ Chí Minh, VN',
      joinedAt: '2023-01-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['admin', 'founder'],
      preferences: { currency: 'VND', language: 'vi', notifications: true },
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
      firstName: 'Tuấn',
      lastName: 'Trần',
      displayName: 'Trần Tuấn',
      avatar: LUXURY_AVATARS[2],
      phone: '0987654321',
      role: 'owner',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.9,
      totalReviews: 87,
      totalRentals: 234,
      bio: 'Đam mê xe cộ, cung cấp dịch vụ thuê xe chất lượng và uy tín tại Hà Nội và các tỉnh lân cận.',
      location: 'Hà Nội, VN',
      joinedAt: '2023-03-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['superhost', 'verified', 'top_owner'],
      preferences: { currency: 'VND', language: 'vi', notifications: true },
      paymentMethods: generatePaymentMethods(),
      documents: generateDocuments(true),
      stripeCustomerId: 'cus_owner001',
      isActive: true,
      accountType: 'business',
    },
    // Demo customer
    {
      id: 'customer-001',
      email: 'user@luxeway.com',
      password: 'User@123',
      firstName: 'Linh',
      lastName: 'Lê',
      displayName: 'Lê Linh',
      avatar: LUXURY_AVATARS[3],
      phone: '0912345678',
      role: 'customer',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.8,
      totalReviews: 12,
      totalRentals: 18,
      bio: 'Thích trải nghiệm các dòng xe mới cho những chuyến du lịch cuối tuần cùng gia đình.',
      location: 'Đà Nẵng, VN',
      joinedAt: '2023-06-20T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['verified', 'trusted_renter'],
      preferences: { currency: 'VND', language: 'vi', notifications: true },
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
      firstName: 'Cường',
      lastName: 'Phạm',
      displayName: 'Phạm Cường',
      avatar: LUXURY_AVATARS[4],
      phone: '0933334444',
      role: 'owner',
      verified: true,
      kycVerified: true,
      drivingLicenseVerified: true,
      rating: 4.95,
      totalReviews: 312,
      totalRentals: 1240,
      bio: 'Giám đốc công ty cho thuê xe tự lái lớn nhất miền Nam. Đội xe trên 50 chiếc đa dạng.',
      location: 'Hồ Chí Minh, VN',
      joinedAt: '2022-11-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      badges: ['enterprise', 'verified', 'superhost', 'top_owner'],
      preferences: { currency: 'VND', language: 'vi', notifications: true },
      paymentMethods: generatePaymentMethods(),
      documents: generateDocuments(true),
      stripeCustomerId: 'cus_business001',
      isActive: true,
      accountType: 'business',
    },
  ];

  const roles: UserRole[] = ['customer', 'customer', 'customer', 'owner', 'customer'];

  // Generate 96 more users (for a total of 100 users)
  for (let i = 0; i < 96; i++) {
    const verified = faker.datatype.boolean({ probability: 0.8 });
    const isOwner = i < 48; // About 50 owners total
    const role = isOwner ? 'owner' : 'customer';
    
    const isMale = faker.datatype.boolean();
    const firstName = isMale ? faker.helpers.arrayElement(VN_FIRST_NAMES_MALE) : faker.helpers.arrayElement(VN_FIRST_NAMES_FEMALE);
    const lastName = faker.helpers.arrayElement(VN_LAST_NAMES);
    
    // Create an email without accents
    const emailPrefix = `${firstName}.${lastName}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

    users.push({
      id: `user-${String(i + 10).padStart(3, '0')}`,
      email: `${emailPrefix}${faker.number.int({min: 1, max: 999})}@gmail.com`,
      password: 'Password@123',
      firstName,
      lastName,
      displayName: `${lastName} ${firstName}`,
      avatar: faker.helpers.arrayElement(LUXURY_AVATARS),
      phone: generateVnPhone(),
      role,
      verified,
      kycVerified: verified,
      drivingLicenseVerified: verified,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      totalReviews: faker.number.int({ min: 0, max: 150 }),
      totalRentals: faker.number.int({ min: 0, max: 80 }),
      bio: faker.lorem.sentences(2),
      location: `${faker.helpers.arrayElement(VN_CITIES)}, VN`,
      joinedAt: faker.date.past({ years: 3 }).toISOString(),
      lastActive: faker.date.recent({ days: 30 }).toISOString(),
      badges: verified ? ['verified'] : [],
      preferences: { currency: 'VND', language: 'vi', notifications: faker.datatype.boolean() },
      paymentMethods: faker.datatype.boolean({ probability: 0.7 }) ? generatePaymentMethods() : [],
      documents: generateDocuments(verified),
      stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
      isActive: faker.datatype.boolean({ probability: 0.95 }),

    });
  }

  return users;
}
