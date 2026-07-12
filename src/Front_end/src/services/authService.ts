import apiClient, { ApiResponse } from './api';
import type { User, RegisterData } from '@/types';
import { resolveImageUrl } from '@/utils';

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
  },

  /**
   * Logout - Clear tokens and user data
   */
  logout(): void {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage in authService:', e);
    }
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
          avatar: resolveImageUrl(userInfo.avatar || userInfo.profilePicture),
          preferredLanguage: userInfo.preferredLanguage || 'en',
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
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP. Check your email address.');
    }
  },

  /**
   * Verify OTP - REAL BACKEND returning transient reset token
   */
  async verifyOTP(email: string, otp: string): Promise<string | null> {
    try {
      const res = await apiClient.post<any>('/auth/verify-otp', { email, otp });
      const response = res.data || res;
      const token = response?.token || response?.data?.token || response;
      if (typeof token === 'string') {
        return token;
      }
      if (response?.data && typeof response.data === 'object' && response.data.token) {
        return response.data.token;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      throw new Error(error.response?.data?.message || 'Invalid or expired OTP code');
    }
  },

  /**
   * Reset password with transient token - REAL BACKEND
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword: newPassword,
      });
      return true;
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password. Token may be expired.');
    }
  },

  /**
   * Login/Register with Google OAuth Token - REAL BACKEND
   */
  async loginWithGoogle(idToken: string): Promise<User | null> {
    try {
      const res = await apiClient.post<any>('/auth/google', { idToken });
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
          verified: userInfo.verified || false,
          rating: userInfo.rating || 5.0,
          totalReviews: userInfo.totalReviews || 0,
          joinedAt: userInfo.joinedAt || new Date().toISOString(),
          location: userInfo.location || '',
          bio: userInfo.bio || '',
          badges: userInfo.badges || [],
          accountType: userInfo.accountType || 'INDIVIDUAL',
          preferredLanguage: userInfo.preferredLanguage || 'en',
        } as unknown as User;
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      console.error('Google login failed:', error);
      throw new Error(error.response?.data?.message || 'Google authentication failed');
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
