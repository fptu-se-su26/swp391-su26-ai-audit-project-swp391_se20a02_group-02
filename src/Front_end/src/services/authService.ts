import apiClient, { ApiResponse } from './api';
import type { User, RegisterData } from '@/types';

// Storage keys
const TOKEN_KEY = 'luxeway_access_token';
const USER_KEY = 'luxeway_user';

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/login', { email, password });
      if (response.data?.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
        
        const userInfo = response.data.user;
        const user: User = {
          ...userInfo,
          id: userInfo.id.toString(),
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login failed', error);
      return null;
    }
  },

  async register(data: RegisterData): Promise<User | null> {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        role: (data.role || 'customer').toUpperCase(),
        accountType: 'INDIVIDUAL',
      };
      const response = await apiClient.post<ApiResponse<any>>('/auth/register', payload);
      if (response.data?.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
        const userInfo = response.data.user;
        const user: User = {
          ...userInfo,
          id: userInfo.id.toString(),
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Registration failed', error);
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      if (response.data) {
        const userInfo = response.data;
        const user: User = {
          ...userInfo,
          id: userInfo.id.toString(),
          displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(`/users/${userId}`, updates);
      if (response.data) {
        const updatedUser = response.data;
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Failed to update profile', error);
      return null;
    }
  },

  async sendOTP(email: string): Promise<boolean> {
    return true; 
  },

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    return otp === '123456'; 
  },

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    return true;
  },
};
