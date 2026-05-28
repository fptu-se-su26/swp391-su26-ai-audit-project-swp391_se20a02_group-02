import apiClient, { ApiResponse } from './api';
import type { User, RegisterData } from '@/types';

// Storage keys
const TOKEN_KEY = 'luxeway_access_token';
const REFRESH_TOKEN_KEY = 'luxeway_refresh_token';
const USER_KEY = 'luxeway_user';

// ====== REAL BACKEND AUTH SERVICE ======
export const authService = {
  /**
   * Login with email and password - REAL BACKEND
   */
  async login(email: string, password: string): Promise<User | null> {
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
          avatar: userInfo.avatar || '',
          verified: userInfo.verified || false,
          rating: userInfo.rating || 5.0,
          totalReviews: userInfo.totalReviews || 0,
          joinedAt: userInfo.joinedAt || new Date().toISOString(),
          location: userInfo.location || '',
          bio: userInfo.bio || '',
          badges: userInfo.badges || [],
          accountType: userInfo.accountType || 'INDIVIDUAL',
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  },

  /**
   * Register new user - REAL BACKEND
   */
  async register(data: RegisterData): Promise<User | null> {
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
          avatar: userInfo.avatar || '',
          verified: false,
          rating: 0,
          totalReviews: 0,
          joinedAt: new Date().toISOString(),
          location: '',
          bio: '',
          badges: [],
          accountType: payload.accountType as any,
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed. Email may already exist.');
    }
  },

  /**
   * Logout - Clear tokens and user data
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

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
      const response = res.data || res;
      
      if (response.user || response) {
        const userInfo = response.user || response;
        const user = {
          id: userInfo.id?.toString() || userInfo.userId?.toString(),
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
          role: userInfo.role?.toLowerCase() || 'customer',
          phone: userInfo.phone || '',
          avatar: userInfo.avatar || userInfo.profilePicture || null,
          verified: userInfo.verified || userInfo.isVerified || false,
          rating: userInfo.rating || 0,
          totalReviews: userInfo.totalReviews || 0,
          joinedAt: userInfo.joinedAt || userInfo.createdAt,
          location: userInfo.location || userInfo.city || '',
          bio: userInfo.bio || '',
          badges: userInfo.badges || [],
          accountType: userInfo.accountType || 'INDIVIDUAL',
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this.logout();
      return null;
    }
  },

  /**
   * Update user profile - REAL BACKEND
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const res = await apiClient.put<any>(`/users/${userId}`, updates);
      const response = res.data || res;
      
      if (response.user || response) {
        const userInfo = response.user || response;
        const updatedUser: User = {
          ...this.getCurrentUser()!,
          ...userInfo,
          id: userInfo.id?.toString() || userId,
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
        } as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  /**
   * Change password - REAL BACKEND
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error('Failed to change password. Check your current password.');
    }
  },

  /**
   * Send OTP for password reset - REAL BACKEND
   */
  async sendOTP(email: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP. Check your email address.');
    }
  },

  /**
   * Verify OTP - REAL BACKEND
   */
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/auth/verify-otp', { email, otp });
      return response.valid || response.success || false;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return false;
    }
  },

  /**
   * Reset password with OTP - REAL BACKEND
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw new Error('Failed to reset password. Invalid OTP or expired.');
    }
  },

  /**
   * Refresh access token - REAL BACKEND
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const res = await apiClient.post<any>('/auth/refresh', { refreshToken });
      const response = res.data || res;
      
      if (response.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        return response.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.logout();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  },
};
