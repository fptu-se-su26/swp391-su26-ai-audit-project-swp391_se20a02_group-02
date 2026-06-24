// ============================================================
// LUXEWAY — COMPLETE TYPE DEFINITIONS
// ============================================================

export type UserRole = 'customer' | 'owner' | 'business' | 'admin';
export type VehicleCategory = 'supercar' | 'suv' | 'luxury' | 'classic' | 'convertible' | 'electric' | 'van';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'pending_approval';
export type TransmissionType = 'automatic' | 'manual';
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type MessageType = 'text' | 'image' | 'booking_request' | 'system';
export type NotificationType = 'booking' | 'payment' | 'message' | 'review' | 'system' | 'promotion';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

// ====== USER ======
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  kycVerified: boolean;
  drivingLicenseVerified: boolean;
  rating: number;
  totalReviews: number;
  totalRentals: number;
  bio: string;
  location: string;
  joinedAt: string;
  lastActive: string;
  badges: string[];
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
  paymentMethods: PaymentMethod[];
  documents: UserDocument[];
  stripeCustomerId: string;
  isActive: boolean;
  businessId?: string;
}

// ====== VEHICLE ======
export interface Vehicle {
  id: string;
  ownerId: string;
  businessId?: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  description: string;
  images: string[];
  thumbnailUrl: string;
  pricePerDay: number;
  pricePerWeek?: number;
  deposit: number;
  location: {
    city: string;
    country: string;
    address: string;
    lat: number;
    lng: number;
    timezone: string;
  };
  specs: {
    horsepower: number;
    topSpeed: number;
    acceleration: number; // 0-100 km/h
    seats: number;
    doors: number;
    transmission: TransmissionType;
    fuelType: FuelType;
    range?: number; // km
    engineSize?: string;
    color: string;
    licensePlate: string;
  };
  features: string[];
  rules: string[];
  insurance: {
    included: boolean;
    provider: string;
    coverage: string;
  };
  availability: {
    blockedDates: string[];
    minRentalDays: number;
    maxRentalDays: number;
    advanceBookingDays: number;
  };
  status: VehicleStatus;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isVerified: boolean;
  isFeatured: boolean;
  wishlistedBy: string[];
  createdAt: string;
  updatedAt: string;
  addons: VehicleAddon[];
  instantBook: boolean;
  deliveryAvailable: boolean;
  deliveryFee: number;
}

// ====== VEHICLE ADDON ======
export interface VehicleAddon {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  icon: string;
}

// ====== BOOKING ======
export interface Booking {
  id: string;
  vehicleId: string;
  renterId: string;
  ownerId: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricing: {
    basePrice: number;
    pricePerDay: number;
    addonsTotal: number;
    insuranceFee: number;
    deliveryFee: number;
    serviceFee: number;
    taxes: number;
    discount: number;
    total: number;
    deposit: number;
    depositRefunded: boolean;
  };
  selectedAddons: string[];
  includeInsurance: boolean;
  includeDelivery: boolean;
  deliveryAddress?: string;
  paymentId?: string;
  couponCode?: string;
  notes: string;
  ownerNotes: string;
  pickupLocation: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  reviewId?: string;
  checkInOdometer?: number;
  checkOutOdometer?: number;
  damageReport?: string;
}

// ====== PAYMENT ======
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: 'stripe' | 'vnpay' | 'wallet' | 'bank_transfer';
  stripePaymentIntentId?: string;
  transactionId: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

// ====== PAYMENT METHOD ======
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// ====== USER DOCUMENT ======
export interface UserDocument {
  id: string;
  type: 'passport' | 'national_id' | 'driving_license' | 'insurance';
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  url: string;
}

// ====== MESSAGE ======
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  bookingId?: string;
  readAt?: string;
  createdAt: string;
  edited: boolean;
}

// ====== CONVERSATION ======
export interface Conversation {
  id: string;
  participants: string[];
  vehicleId?: string;
  bookingId?: string;
  lastMessage?: Message;
  lastActivity: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

// ====== NOTIFICATION ======
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, string>;
}

// ====== REVIEW ======
export interface Review {
  id: string;
  vehicleId: string;
  bookingId: string;
  reviewerId: string;
  ownerId: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  value: number;
  comment: string;
  ownerResponse?: string;
  photos: string[];
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// ====== BUSINESS ======
export interface Business {
  id: string;
  name: string;
  legalName: string;
  description: string;
  logo: string;
  coverImage: string;
  email: string;
  phone: string;
  website?: string;
  rating: number;
  totalReviews: number;
  totalVehicles: number;
  totalEmployees: number;
  verified: boolean;
  branches: BusinessBranch[];
  employees: string[];
  ownerId: string;
  createdAt: string;
  revenue: number;
  tier: 'basic' | 'premium' | 'enterprise';
}

// ====== BUSINESS BRANCH ======
export interface BusinessBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  isMain: boolean;
}

// ====== ANALYTICS ======
export interface AnalyticsData {
  id: string;
  vehicleId?: string;
  ownerId?: string;
  businessId?: string;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
  revenue: number;
  bookings: number;
  views: number;
  conversionRate: number;
  avgRentalDays: number;
  newCustomers: number;
  returningCustomers: number;
}

// ====== DISPUTE ======
export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: string;
  againstUser: string;
  status: DisputeStatus;
  type: 'damage' | 'payment' | 'cancellation' | 'behavior' | 'other';
  title: string;
  description: string;
  evidence: string[];
  resolution?: string;
  adminId?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ====== COUPON ======
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  expiresAt: string;
  validForFirstTime: boolean;
  validVehicleIds?: string[];
  isActive: boolean;
}

// ====== SEARCH FILTERS ======
export interface VehicleFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: VehicleCategory[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  maxSeats?: number;
  transmission?: TransmissionType[];
  fuelType?: FuelType[];
  minRating?: number;
  features?: string[];
  instantBook?: boolean;
  verified?: boolean;
  deliveryAvailable?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

// ====== STORE AUTH STATE ======
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateUser: (data: Partial<User>) => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

// ====== API RESPONSE ======
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ====== TOAST ======
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// ====== BOOKING WIZARD STATE ======
export interface BookingWizardState {
  vehicleId: string;
  step: number;
  startDate: string;
  endDate: string;
  selectedAddons: string[];
  includeInsurance: boolean;
  includeDelivery: boolean;
  deliveryAddress: string;
  couponCode: string;
  notes: string;
  paymentMethodId: string;
}
