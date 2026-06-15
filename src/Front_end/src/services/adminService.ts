import apiClient from './api';

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

// ─── AI Predictive Analytics DTOs ─────────────────────────────────────────
export interface RevenueForecastDTO {
  trend_direction?: string;
  r2_score: number;
  predictions?: Array<{ date: string; predicted_revenue?: number; upper_bound?: number; lower_bound?: number }>;
}

export interface BookingDemandDTO {
  peak_day?: string;
  daily_forecasts?: Array<{ date: string; predicted_bookings?: number; upper_bound?: number; lower_bound?: number }>;
  dow_distribution?: Record<string, number>;
}

export interface VehicleUtilizationDTO {
  by_category?: Record<string, Array<{ predicted?: number }>>;
  current_rates?: Record<string, number>;
}

export interface ChurnRiskDTO {
  user_id: string;
  display_name: string;
  email: string;
  churn_score: number;
  risk_level: string;
  total_bookings: number;
  days_since_last_booking: number;
}

export interface AnomalyDTO {
  date: string;
  metric: string;
  actual_value: number;
  expected_value: number;
  z_score: number;
  severity: string;
}

export interface InsightDTO {
  title: string;
  description: string;
  severity: string;
  actionLabel?: string;
}

export interface AIPredictiveDashboardDTO {
  sidecarWarning?: boolean;
  revenueForecast?: RevenueForecastDTO;
  bookingDemand?: BookingDemandDTO;
  vehicleUtilization?: VehicleUtilizationDTO;
  churnRisks?: ChurnRiskDTO[];
  anomalies?: AnomalyDTO[];
  insights?: InsightDTO[];
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

  // ─── AI Predictive Analytics API ─────────────────────────────────────────

  async getAIPredictiveDashboard(): Promise<AIPredictiveDashboardDTO | null> {
    try {
      const response = await apiClient.get<any>('/admin/ai/dashboard');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get AI predictive dashboard:', error);
      return null;
    }
  },

  async refreshRevenueForecast(days = 14): Promise<RevenueForecastDTO | null> {
    try {
      const response = await apiClient.post<any>(`/admin/ai/revenue-forecast?days=${days}`, {});
      return response.data || response;
    } catch (error) {
      console.error('Failed to refresh revenue forecast:', error);
      return null;
    }
  },

  async refreshBookingDemand(days = 14): Promise<BookingDemandDTO | null> {
    try {
      const response = await apiClient.post<any>(`/admin/ai/booking-demand?days=${days}`, {});
      return response.data || response;
    } catch (error) {
      console.error('Failed to refresh booking demand:', error);
      return null;
    }
  },

  async getVehicleUtilization(days = 7): Promise<VehicleUtilizationDTO | null> {
    try {
      const response = await apiClient.get<any>(`/admin/ai/vehicle-utilization?days=${days}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to get vehicle utilization:', error);
      return null;
    }
  },

  async getChurnRisks(): Promise<ChurnRiskDTO[]> {
    try {
      const response = await apiClient.get<any>('/admin/ai/churn-risks');
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to get churn risks:', error);
      return [];
    }
  },

  async getAnomalies(): Promise<AnomalyDTO[]> {
    try {
      const response = await apiClient.get<any>('/admin/ai/anomalies');
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to get anomalies:', error);
      return [];
    }
  },

  async getAIInsights(): Promise<InsightDTO[]> {
    try {
      const response = await apiClient.get<any>('/admin/ai/insights');
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      return [];
    }
  },
};

