import { getDb, dbUpdate, dbCreate, STORAGE_KEYS } from '@/mock/db';
import type { User, AuthState, RegisterData } from '@/types';
import { faker } from '@faker-js/faker';

const DELAY = 600; // ms

function delay(ms: number = DELAY): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== AUTH SERVICE ======
export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    await delay();
    const { users } = getDb();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      // Update last active
      dbUpdate(STORAGE_KEYS.USERS, users, user.id, { lastActive: new Date().toISOString() } as Partial<User>);
    }
    return user || null;
  },

  async register(data: RegisterData): Promise<User | null> {
    await delay(800);
    const { users } = getDb();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return null;

    const newUser: User = {
      id: `user-${faker.string.uuid()}`,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=0F172A&color=fff&size=200`,
      phone: data.phone || '',
      role: data.role || 'customer',
      verified: false,
      kycVerified: false,
      drivingLicenseVerified: false,
      rating: 0,
      totalReviews: 0,
      totalRentals: 0,
      bio: '',
      location: '',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      badges: [],
      preferences: { currency: 'USD', language: 'en', notifications: true },
      paymentMethods: [],
      documents: [],
      stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
      isActive: true,
    };

    dbCreate(STORAGE_KEYS.USERS, users, newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    await delay(400);
    const { users } = getDb();
    const updated = dbUpdate(STORAGE_KEYS.USERS, users, userId, { ...updates, updatedAt: new Date().toISOString() } as Partial<User>);
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    }
    return updated;
  },

  async sendOTP(email: string): Promise<boolean> {
    await delay(600);
    return true; // Always succeeds in mock
  },

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    await delay(500);
    return otp === '123456'; // Mock OTP
  },

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    await delay(600);
    const { users } = getDb();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    dbUpdate(STORAGE_KEYS.USERS, users, user.id, { password: newPassword } as Partial<User>);
    return true;
  },
};
