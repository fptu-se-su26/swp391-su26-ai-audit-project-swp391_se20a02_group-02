// ============================================================
// LUXEWAY — COMPLETE TYPE DEFINITIONS
// ============================================================

<<<<<<< HEAD
export type UserRole = 'customer' | 'owner' | 'business' | 'admin';
export type VehicleCategory = 'supercar' | 'suv' | 'luxury' | 'classic' | 'convertible' | 'electric' | 'van';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';
=======
export type UserRole = 'customer' | 'owner' | 'admin' | 'super_admin';

// Top-level vehicle type discriminator
export type VehicleType = 'car' | 'motorbike';

// Car categories
export type CarCategory = 'economy' | 'sedan' | 'suv' | 'mpv' | 'luxury' | 'business' | 'electric_car' | 'sports' | 'pickup' | 'family' | 'electric' | 'city_car' | 'tourism';

// Motorbike categories
export type MotorbikeCategory = 'scooter' | 'automatic_scooter' | 'manual_motorcycle' | 'sport_bike' | 'touring_bike' | 'adventure_bike' | 'classic_bike' | 'electric_bike' | 'motorbike';

// Combined (all categories in the system)
export type VehicleCategory = CarCategory | MotorbikeCategory;

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'picking_up' | 'in_progress' | 'waiting_payment' | 'payment_pending' | 'payment_verified' | 'payment_rejected' | 'payment_expired' | 'owner_approved' | 'ready_for_pickup' | 'checked_out' | 'in_rental' | 'return_pending' | 'return_completed' | 'customer_cancelled' | 'owner_cancelled' | 'system_cancelled';
>>>>>>> origin/main
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'draft' | 'approved' | 'rejected' | 'blocked';
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
  kycStatus?: 'PENDING' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED' | 'FAILED';
  driverLicenseStatus?: 'NONE' | 'PENDING' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED' | 'FAILED';
  licenseClass?: string;
  licenseNumber?: string;
  rating: number;
  totalReviews: number;
  totalRentals: number;
  totalTrips?: number;
  responseRate?: number;
  responseTime?: number;
  approvalBadge?: boolean;
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
<<<<<<< HEAD
  businessId?: string;
=======
  owner?: User;
  vin?: string;
  isLocked?: boolean;
>>>>>>> origin/main
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
  approvalStatus?: VehicleStatus;
  approvalNote?: string;
  approvedBy?: string;
  approvedAt?: string;
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
  
  // Custom detailed fields for detail views and checkout
  discount?: number;
  finalPrice?: number;
  primaryImage?: string;
  galleryImages?: string[];
  vehicleImages?: string[];
  requiredDocuments?: string;
  basicInsurance?: string;
  extraInsurance?: string;
  cancellationPolicy?: string;
  depositPolicy?: string;
  rentalRules?: string;
  seatNumber?: number;
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
  bookingCode?: string;
  vehicleId: string;
  vehicle?: any;
  renterId: string;
  renter?: any;
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
    cleaningFee?: number;
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
  licenseClass?: string;
  licenseNumber?: string;
  licenseFullName?: string;
  licenseDateOfBirth?: string;
  licenseResidence?: string;
  licenseNationality?: string;
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
<<<<<<< HEAD
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
=======
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular' | 'nearest';
  status?: VehicleStatus;
  isFeatured?: boolean;
  userLat?: number;
  userLng?: number;
  keyword?: string;
  // Motorbike-specific
  minEngineCc?: number;
  maxEngineCc?: number;
  hasHelmet?: boolean;
  hasPhoneHolder?: boolean;
  hasRaincoat?: boolean;
  hasTouringPackage?: boolean;
  // Car-specific
  hasChauffeur?: boolean;
  airportDelivery?: boolean;
  weddingRental?: boolean;
  businessRental?: boolean;
  electric?: boolean;
  hybrid?: boolean;
}

// ====== VEHICLE BRAND ======
export interface VehicleBrand {
  id: string;
  name: string;
  country: string;
  vehicleType: 'car' | 'motorbike' | 'both';
  logoUrl?: string;
  isActive: boolean;
}

// ====== VEHICLE MODEL ======
export interface VehicleModel {
  id: string;
  brandId: string;
  brandName: string;
  modelName: string;
  vehicleType: VehicleType;
  category: VehicleCategory;
  engineCc?: number;           // motorbikes
  seats?: number;              // cars
  basePriceMin: number;        // VND/day
  basePriceMax: number;        // VND/day
  isActive: boolean;
>>>>>>> origin/main
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

export interface VehicleLocationResponse {
  id: string;
  name: string;
  brand: string;
  type: 'CAR' | 'MOTORBIKE' | string;
  thumbnail: string;
  pricePerDay: number;
  discount: number;
  finalPrice: number;
  rating: number;
  totalTrips: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  available: boolean;
  ownerName: string;
  distanceKm?: number;
  transmission?: string;
  seats?: number;
  instantBook?: boolean;
  deliveryAvailable?: boolean;
}

