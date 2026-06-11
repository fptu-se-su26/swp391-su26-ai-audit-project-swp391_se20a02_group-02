// API Configuration for LuxeWay Backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

// Token storage keys (must match authService.ts)
const TOKEN_KEY = 'luxeway_access_token';
const REFRESH_TOKEN_KEY = 'luxeway_refresh_token';

// API Client with error handling and automatic token refresh
class ApiClient {
  public baseURL: string;
  public onUnauthorized?: () => void;
  // Flag to prevent infinite refresh loops
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private subscribeToRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  private async tryRefreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const newAccessToken = data?.data?.accessToken || data?.accessToken;
      if (newAccessToken) {
        localStorage.setItem(TOKEN_KEY, newAccessToken);
        // Also store new refresh token if provided
        const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = localStorage.getItem(TOKEN_KEY);
    const lang = localStorage.getItem('language') || 'en';
    const headers: Record<string, string> = {
      'Accept-Language': lang,
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else {
      // Let browser set Content-Type and boundary automatically for FormData
      delete headers['Content-Type'];
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // BUG-12 FIX: Try to refresh the token before giving up
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            const newToken = await this.tryRefreshToken();
            this.isRefreshing = false;

            if (newToken) {
              // Token refreshed — retry the original request with the new token
              this.notifyRefreshSubscribers(newToken);
              const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
              const retryResponse = await fetch(url, { ...config, headers: retryHeaders });
              if (retryResponse.ok) {
                const retryContentType = retryResponse.headers.get('content-type');
                if (retryContentType && retryContentType.includes('application/json')) {
                  return await retryResponse.json();
                }
                return (await retryResponse.text()) as any;
              }
            }

            // BUG-11 FIX: Do NOT clear localStorage here.
            // Let the store's onUnauthorized handler decide what to do based on the route.
            if (this.onUnauthorized) {
              this.onUnauthorized();
            } else {
              // Only redirect if we're on a protected page and have no auth handler wired
              const protectedPrefixes = ['/dashboard', '/admin', '/owner', '/business', '/booking', '/payment', '/messages', '/notifications'];
              const path = window.location.pathname;
              const isProtected = protectedPrefixes.some(p => path === p || path.startsWith(p + '/'));
              if (isProtected) {
                window.location.href = '/auth/login';
              }
            }
          } else {
            // Already refreshing — queue this request
            return new Promise((resolve, reject) => {
              this.subscribeToRefresh(async (newToken) => {
                try {
                  const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
                  const retryResponse = await fetch(url, { ...config, headers: retryHeaders });
                  const ct = retryResponse.headers.get('content-type');
                  if (ct && ct.includes('application/json')) {
                    resolve(await retryResponse.json());
                  } else {
                    resolve((await retryResponse.text()) as any);
                  }
                } catch (e) {
                  reject(e);
                }
              });
            });
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return (await response.text()) as any;
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // --- Common HTTP Methods ---
  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, { ...options, method: 'POST', body: isFormData ? body : JSON.stringify(body) });
  }

  async put<T>(endpoint: string, body: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: isFormData ? body : JSON.stringify(body) });
  }

  async patch<T>(endpoint: string, body: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: isFormData ? body : JSON.stringify(body) });
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Health Check
  async healthCheck() {
    return this.request('/test/health');
  }

  // Database Info
  async getDatabaseInfo() {
    return this.request('/test/db-info');
  }

  // Users API
  async getUsers(page = 0, size = 10) {
    return this.request(`/users?page=${page}&size=${size}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async searchUsers(keyword: string, page = 0, size = 10) {
    return this.request(`/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  // Vehicles API
  async getVehicles(page = 0, size = 12, status?: string) {
    const statusParam = status ? `&status=${status}` : '';
    return this.request(`/vehicles?page=${page}&size=${size}${statusParam}`);
  }

  async getVehicleById(id: string) {
    return this.request(`/vehicles/${id}`);
  }

  async searchVehicles(keyword: string, page = 0, size = 12) {
    return this.request(`/vehicles/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  async getVehiclesByOwner(ownerId: string, page = 0, size = 12) {
    return this.request(`/vehicles/owner/${ownerId}?page=${page}&size=${size}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Backend connection status
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    await apiClient.healthCheck();
    return true;
  } catch (error) {
    console.warn('Backend not available:', error);
    return false;
  }
};

export default apiClient;