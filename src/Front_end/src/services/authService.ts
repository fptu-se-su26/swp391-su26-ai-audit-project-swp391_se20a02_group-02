<<<<<<< HEAD
import { getDb, dbUpdate, dbCreate, STORAGE_KEYS } from '@/mock/db';
import type { User, AuthState, RegisterData } from '@/types';
import { faker } from '@faker-js/faker';
=======
import apiClient, { ApiResponse } from './api';
import type { User, RegisterData } from '@/types';
import { resolveImageUrl } from '@/utils';
>>>>>>> origin/main

const DELAY = 600; // ms

<<<<<<< HEAD
function delay(ms: number = DELAY): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== AUTH SERVICE ======
=======
// ====== REAL BACKEND AUTH SERVICE ======
>>>>>>> origin/main
export const authService = {
  async login(email: string, password: string): Promise<User | null> {
<<<<<<< HEAD
    await delay();
    const { users } = getDb();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      // Update last active
      dbUpdate(STORAGE_KEYS.USERS, users, user.id, { lastActive: new Date().toISOString() } as Partial<User>);
=======
    try {
      const res = await apiClient.post<any>('/auth/login', { 
        email, 
        password 
      });
      const response = res.data || res;
      
      // Backend returns: { accessToken, refreshToken, user }
      if (response.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        }
        
        const userInfo = response.user;
        const user = {
          id: userInfo.id?.toString() || userInfo.userId?.toString(),
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
          role: userInfo.role?.toLowerCase() || 'customer',
          phone: userInfo.phone || '',
          avatar: resolveImageUrl(userInfo.avatar),
          verified: userInfo.verified || false,
          rating: userInfo.rating || 5.0,
          totalReviews: userInfo.totalReviews || 0,
          joinedAt: userInfo.joinedAt || new Date().toISOString(),
          location: userInfo.location || '',
          bio: userInfo.bio || '',
          badges: userInfo.badges || [],
          accountType: userInfo.accountType || 'INDIVIDUAL',
          preferredLanguage: userInfo.preferredLanguage || 'en',
          kycStatus: userInfo.kycStatus || 'NOT_UPLOADED',
          driverLicenseStatus: userInfo.driverLicenseStatus || 'NOT_UPLOADED',
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Invalid email or password');
>>>>>>> origin/main
    }
    return user || null;
  },

  async register(data: RegisterData): Promise<User | null> {
<<<<<<< HEAD
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
=======
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        role: (data.role || 'customer').toUpperCase(),
        accountType: data.accountType || 'INDIVIDUAL',
      };
      
      const res = await apiClient.post<any>('/auth/register', payload);
      const response = res.data || res;
      
      if (response.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        }
        
        const userInfo = response.user;
        const user = {
          id: userInfo.id?.toString() || userInfo.userId?.toString(),
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
          role: userInfo.role?.toLowerCase() || 'customer',
          phone: userInfo.phone || '',
          avatar: resolveImageUrl(userInfo.avatar),
          verified: false,
          rating: 0,
          totalReviews: 0,
          joinedAt: new Date().toISOString(),
          location: '',
          bio: '',
          badges: [],
           accountType: payload.accountType as any,
          preferredLanguage: userInfo.preferredLanguage || 'en',
          kycStatus: 'NOT_UPLOADED',
          driverLicenseStatus: 'NOT_UPLOADED',
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed. Email may already exist.');
    }
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Fetch current user from backend - REAL
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient.get<any>('/auth/me');
      // BUG-15 FIX: /auth/me returns ApiResponse<UserInfo> = { success, data: { id, email, role, ... } }
      // The data field contains the user info directly (not nested under 'user')
      const userInfo = res?.data || res;

      if (!userInfo?.id && !userInfo?.email) return null;

      const user = {
        id: userInfo.id?.toString() || userInfo.userId?.toString(),
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
        role: userInfo.role?.toLowerCase() || 'customer',
        phone: userInfo.phone || '',
        avatar: resolveImageUrl(userInfo.avatar || userInfo.profilePicture),
        verified: userInfo.verified || userInfo.isVerified || false,
        rating: userInfo.rating || 0,
        totalReviews: userInfo.totalReviews || 0,
        joinedAt: userInfo.joinedAt || userInfo.createdAt || '2024-01-15T09:00:00Z',
        location: userInfo.location || userInfo.city || '',
        bio: userInfo.bio || '',
        badges: userInfo.badges || [],
        accountType: userInfo.accountType || 'INDIVIDUAL',
        preferredLanguage: userInfo.preferredLanguage || 'en',
        kycStatus: userInfo.kycStatus || 'NOT_UPLOADED',
        driverLicenseStatus: userInfo.driverLicenseStatus || 'NOT_UPLOADED',
      } as unknown as User;
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      // BUG-10 FIX: Do NOT call this.logout() here.
      // A backend blip or network error should NOT log the user out.
      // Return null and let the store decide what to do with cached credentials.
      console.warn('Failed to fetch current user from backend (keeping cached session):', error);
      return null;
    }
  },

  /**
   * Update user profile - REAL BACKEND
   */
>>>>>>> origin/main
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
