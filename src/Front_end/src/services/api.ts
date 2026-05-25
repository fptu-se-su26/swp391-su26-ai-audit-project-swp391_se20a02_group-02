// API Configuration for LuxeWay Backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

// API Client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = localStorage.getItem('luxeway_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

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
          localStorage.removeItem('luxeway_access_token');
          localStorage.removeItem('luxeway_user');
          window.location.href = '/auth/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
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
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  async put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
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