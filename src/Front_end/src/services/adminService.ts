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

// ─── Unified PredictionDashboardDTO matching Backend ───────────────────────

export interface SummaryPayload {
  title?: string;
  summaryText?: string;
  urgency?: 'IMMEDIATE' | 'SEASONAL' | 'ROUTINE';
  keyTakeaways?: string[];
}

export interface BusinessImpactPayload {
  revenueOpportunity?: number;
  occupancyRate?: number;
  bookingsDelta?: number;
  roiPercentage?: number;
  trendDirection?: 'UP' | 'DOWN' | 'STABLE';
  impactText?: string;
}

export interface ForecastPointPayload {
  date: string;
  actual?: number | null;
  predicted?: number | null;
  lowerBound?: number | null;
  upperBound?: number | null;
}

export interface ConfidencePayload {
  score: number;
  rating: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TelemetryPayload {
  inferenceTimeMs?: number;
  trainingWindowDays?: number;
  mape?: number;
  r2Score?: number;
}

export interface FeatureImportancePayload {
  key: string;
  label: string;
  importancePercentage: number;
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  description: string;
}

export interface RecommendationPayload {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
  description?: string;
  impact?: string;
  expectedImpact?: string;
  action?: string;
  actionLabel?: string;
  actionType?: 'PRICING' | 'MARKETING' | 'FLEET' | 'SYSTEM';
  source?: string;
}

export interface ModelInformationPayload {
  modelName: string;
  version?: string;
  algorithm?: string;
  processing?: string;
  input?: string;
  output?: string;
  confidence?: number;
  trainingWindow?: number;
}

export interface HistoricalDataPayload {
  date: string;
  value: number;
}

export interface ConfidenceIntervalPayload {
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
}

export interface PredictionDashboardDTO {
  summary?: SummaryPayload;
  businessImpact?: BusinessImpactPayload;
  forecast?: ForecastPointPayload[];
  forecastChart?: ForecastPointPayload[];
  confidence?: ConfidencePayload;
  telemetry?: TelemetryPayload;
  featureImportance?: FeatureImportancePayload[];
  recommendations?: RecommendationPayload[];
  modelInformation?: ModelInformationPayload;
  modelInfo?: ModelInformationPayload;
  historicalData?: HistoricalDataPayload[];
  confidenceInterval?: ConfidenceIntervalPayload;
}

export interface InsightDTO {
  type?: string;
  title: string;
  description: string;
  severity: string;
  confidence?: number;
  actionLabel?: string;
  detail?: PredictionDashboardDTO;
}

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
  async getDashboardStats(): Promise<AdminStats | null> {
    try {
      const response = await apiClient.get<any>('/admin/dashboard');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return null;
    }
  },

  async listUsers(role?: string, kycStatus?: string, keyword?: string, page = 0, size = 50): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (role) params.append('role', role);
      if (kycStatus) params.append('kycStatus', kycStatus);
      if (keyword) params.append('keyword', keyword);

      const response = await apiClient.get<any>(`/admin/users?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list users:', error);
      return null;
    }
  },

  async getAIPredictiveDashboard(): Promise<AIPredictiveDashboardDTO | null> {
    try {
      const response = await apiClient.get<any>('/admin/ai/dashboard');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get AI Predictive Dashboard:', error);
      return null;
    }
  },

  async refreshRevenueForecast(horizon = 14): Promise<RevenueForecastDTO | null> {
    try {
      const response = await apiClient.get<any>(`/admin/ai/revenue/forecast?horizon=${horizon}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to refresh revenue forecast:', error);
      return null;
    }
  },

  async refreshBookingDemand(horizon = 14): Promise<BookingDemandDTO | null> {
    try {
      const response = await apiClient.get<any>(`/admin/ai/bookings/demand?horizon=${horizon}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to refresh booking demand:', error);
      return null;
    }
  },

  async getVehicleUtilization(forecastDays = 7): Promise<VehicleUtilizationDTO | null> {
    try {
      const response = await apiClient.post<any>('/admin/ai/vehicles/utilization', { forecastDays });
      return response.data || response;
    } catch (error) {
      console.error('Failed to get vehicle utilization:', error);
      return null;
    }
  },

  async getChurnRisks(): Promise<ChurnRiskDTO[] | null> {
    try {
      const response = await apiClient.get<any>('/admin/ai/users/churn');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get churn risks:', error);
      return null;
    }
  },

  async getAnomalies(): Promise<AnomalyDTO[] | null> {
    try {
      const response = await apiClient.get<any>('/admin/ai/anomalies');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get anomalies:', error);
      return null;
    }
  },

  async listAllVehicles(status?: string, type?: string, page = 0, size = 100): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const response = await apiClient.get<any>(`/admin/vehicles?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list vehicles:', error);
      return { content: [] };
    }
  },

  async listAllBookings(status?: string, page = 0, size = 100): Promise<any> {
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
      return { content: [] };
    }
  },

  async listAllDisputes(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/admin/disputes');
      return response.data?.content || response.content || response.data || response || [];
    } catch (error) {
      console.error('Failed to list disputes:', error);
      return [];
    }
  },

  async listAllPayments(page = 0, size = 100): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get<any>(`/admin/payments?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to list payments:', error);
      return { content: [] };
    }
  },

  async listSettings(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/admin/settings');
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to list settings:', error);
      return [];
    }
  },

  async getAnalyticsOverview(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/admin/analytics/overview');
      return response.data || response;
    } catch (error) {
      console.error('Failed to get analytics overview:', error);
      return null;
    }
  },

  async getHistoricalAnalytics(days = 30): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/admin/analytics/historical?days=${days}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to get historical analytics:', error);
      return null;
    }
  },
};
