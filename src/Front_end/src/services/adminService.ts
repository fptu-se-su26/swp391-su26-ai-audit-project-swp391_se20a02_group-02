import apiClient from './api';

// ============================================================
// AI Predictive Analytics TypeScript Interfaces
// ============================================================

export interface ForecastPoint {
  date: string;
  predicted_revenue?: number | null;
  predicted_bookings?: number | null;
  lower_bound: number;
  upper_bound: number;
  predicted?: number | null;
}

export interface RevenueForecastDTO {
  predictions: ForecastPoint[];
  r2_score: number;
  trend_slope: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  warning_flag: boolean;
}

export interface BookingDemandDTO {
  daily_forecasts: ForecastPoint[];
  dow_distribution: Record<string, number>;
  peak_day: string;
  avg_daily_demand: number;
  warning_flag: boolean;
}

export interface VehicleUtilizationDTO {
  by_category: Record<string, ForecastPoint[]>;
  current_rates: Record<string, number>;
  lowest_category: string;
  highest_category: string;
  warning_flag: boolean;
}

export interface ChurnRiskDTO {
  user_id: string;
  display_name: string;
  email: string;
  churn_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recency_days: number;
  total_bookings: number;
  total_spend: number;
  days_since_last_booking: number;
}

export interface AnomalyDTO {
  date: string;
  metric: string;
  actual_value: number;
  expected_value: number;
  z_score: number;
  severity: 'CRITICAL' | 'WARNING';
}

export interface InsightDTO {
  type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  confidence: number;
  actionLabel?: string | null;
}

export interface AIPredictiveDashboardDTO {
  revenueForecast?: RevenueForecastDTO | null;
  bookingDemand?: BookingDemandDTO | null;
  vehicleUtilization?: VehicleUtilizationDTO | null;
  churnRisks?: ChurnRiskDTO[];
  anomalies?: AnomalyDTO[];
  insights?: InsightDTO[];
  generatedAt?: string;
  sidecarWarning?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalOwners: number;
  totalAdmins: number;
  verifiedUsers: number;
  totalVehicles: number;
  availableVehicles: number;
  pendingApprovalVehicles: number;
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

export const adminService = {
  /**
   * Fetch platform-wide dashboard statistics
   */
  async getDashboardStats(): Promise<AdminStats | null> {
    try {
      const response = await apiClient.get<any>('/admin/dashboard');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return null;
    }
  },

  /**
   * List all platform users (paginated)
   */
  async listUsers(role?: string, keyword?: string, page = 0, size = 50): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (role) params.append('role', role);
      if (keyword) params.append('keyword', keyword);

      const response = await apiClient.get<any>(`/admin/users?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list users:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  /**
   * Update account status of a user (activation/verification)
   */
  async updateUserStatus(id: string, payload: { active: boolean; verified: boolean; kycVerified: boolean }): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/admin/users/${id}/status`, payload);
      return response.data || response;
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  },

  /**
   * List all platform vehicles (paginated)
   */
  async listAllVehicles(status?: string, page = 0, size = 50): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (status) params.append('status', status);

      const response = await apiClient.get<any>(`/admin/vehicles?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list vehicles:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  /**
   * List pending vehicles for approval
   */
  async listPendingVehicles(page = 0, size = 50): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/admin/vehicles/pending?page=${page}&size=${size}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list pending vehicles:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  /**
   * Approve a vehicle listing
   */
  async approveVehicle(id: string): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/admin/vehicles/${id}/approve`, {});
      return response.data || response;
    } catch (error) {
      console.error('Failed to approve vehicle:', error);
      throw error;
    }
  },

  /**
   * Reject a vehicle listing with a reason
   */
  async rejectVehicle(id: string, reason: string): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/admin/vehicles/${id}/reject`, { reason, approved: false });
      return response.data || response;
    } catch (error) {
      console.error('Failed to reject vehicle:', error);
      throw error;
    }
  },

  /**
   * List all bookings (paginated)
   */
  async listAllBookings(status?: string, page = 0, size = 50): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (status) params.append('status', status);

      const response = await apiClient.get<any>(`/admin/bookings?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list bookings:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  /**
   * List all payments (paginated)
   */
  async listAllPayments(page = 0, size = 50): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/admin/payments?page=${page}&size=${size}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list payments:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  /**
   * List all platform disputes
   */
  async listAllDisputes(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/admin/disputes');
      return response.data || response;
    } catch (error) {
      console.error('Failed to list disputes:', error);
      return [];
    }
  },

  /**
   * Update dispute status & decision
   */
  async updateDisputeStatus(id: number | string, status: string, adminDecision?: string): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/disputes/${id}/status`, { status, adminDecision });
      return response.data || response;
    } catch (error) {
      console.error('Failed to update dispute status:', error);
      throw error;
    }
  },

  /**
   * Fetch all system settings
   */
  async listSettings(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/admin/settings');
      return response.data || response;
    } catch (error) {
      console.error('Failed to list system settings:', error);
      return [];
    }
  },

  /**
   * Update a system setting key/value pair
   */
  async updateSetting(settingKey: string, settingValue: string): Promise<any> {
    try {
      const response = await apiClient.put<any>('/admin/settings', { settingKey, settingValue });
      return response.data || response;
    } catch (error) {
      console.error('Failed to update system setting:', error);
      throw error;
    }
  },

  /**
   * List all platform FAQs (both active and inactive)
   */
  async listAllFAQs(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/admin/faqs');
      return response.data || response;
    } catch (error) {
      console.error('Failed to list FAQs:', error);
      return [];
    }
  },

  /**
   * Create a new FAQ resource
   */
  async createFAQ(faq: { question: String; answer: String; displayOrder: number; isActive: boolean }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/admin/faqs', faq);
      return response.data || response;
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      throw error;
    }
  },

  /**
   * Update an existing FAQ entry
   */
  async updateFAQ(id: number, faq: { question: String; answer: String; displayOrder: number; isActive: boolean }): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/admin/faqs/${id}`, faq);
      return response.data || response;
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      throw error;
    }
  },

  /**
   * Delete an FAQ entry
   */
  async deleteFAQ(id: number): Promise<any> {
    try {
      const response = await apiClient.delete<any>(`/admin/faqs/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      throw error;
    }
  },

  /**
   * Fetch platform-wide cumulative summary analytics
   */
  async getAnalyticsOverview(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/admin/analytics/overview');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get analytics overview:', error);
      return null;
    }
  },

  /**
   * Fetch historical daily statistics records
   */
  async getHistoricalAnalytics(days = 30): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(`/admin/analytics/historical?days=${days}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch historical analytics:', error);
      return [];
    }
  },

  /**
   * Manually trigger daily metrics aggregation for a specific date
   */
  async triggerAnalyticsAggregation(date: string): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/admin/analytics/trigger?date=${date}`, {});
      return response.data || response;
    } catch (error) {
      console.error('Failed to trigger aggregation:', error);
      throw error;
    }
  },

  // ============================================================
  // AI Predictive Analytics API Methods
  // ============================================================

  /**
   * Fetch the cached AI predictive dashboard snapshot.
   * Returns null if cache is warming up (HTTP 202) or on error.
   */
  async getAIPredictiveDashboard(): Promise<AIPredictiveDashboardDTO | null> {
    try {
      return await apiClient.get<AIPredictiveDashboardDTO>('/admin/ai/dashboard');
    } catch (error) {
      console.error('Failed to get AI predictive dashboard:', error);
      return null;
    }
  },

  /**
   * Trigger a fresh revenue forecast for the given horizon (1–30 days).
   */
  async refreshRevenueForecast(horizon: number): Promise<RevenueForecastDTO | null> {
    try {
      return await apiClient.post<RevenueForecastDTO>(`/admin/ai/revenue/forecast?horizon=${horizon}`, {});
    } catch (error) {
      console.error('Failed to refresh revenue forecast:', error);
      return null;
    }
  },

  /**
   * Trigger a fresh booking demand forecast for the given horizon (1–30 days).
   */
  async refreshBookingDemand(horizon: number): Promise<BookingDemandDTO | null> {
    try {
      return await apiClient.post<BookingDemandDTO>(`/admin/ai/bookings/demand?horizon=${horizon}`, {});
    } catch (error) {
      console.error('Failed to refresh booking demand:', error);
      return null;
    }
  },

  /**
   * Trigger a fresh vehicle utilization forecast.
   */
  async getVehicleUtilization(days = 7): Promise<VehicleUtilizationDTO | null> {
    try {
      return await apiClient.post<VehicleUtilizationDTO>(`/admin/ai/vehicles/utilization?days=${days}`, {});
    } catch (error) {
      console.error('Failed to get vehicle utilization:', error);
      return null;
    }
  },

  /**
   * Fetch churn risk scores for all customers.
   */
  async getChurnRisks(): Promise<ChurnRiskDTO[]> {
    try {
      return await apiClient.get<ChurnRiskDTO[]>('/admin/ai/users/churn') ?? [];
    } catch (error) {
      console.error('Failed to get churn risks:', error);
      return [];
    }
  },

  /**
   * Fetch detected anomalies from 90-day analytics data.
   */
  async getAnomalies(): Promise<AnomalyDTO[]> {
    try {
      return await apiClient.get<AnomalyDTO[]>('/admin/ai/anomalies') ?? [];
    } catch (error) {
      console.error('Failed to get anomalies:', error);
      return [];
    }
  },

  /**
   * Fetch AI-generated insights from the cached dashboard.
   */
  async getAIInsights(): Promise<InsightDTO[]> {
    try {
      return await apiClient.get<InsightDTO[]>('/admin/ai/insights') ?? [];
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      return [];
    }
  },
};

