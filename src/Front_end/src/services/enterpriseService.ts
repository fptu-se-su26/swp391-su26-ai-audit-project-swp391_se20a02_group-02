import apiClient from './api';

export interface PricingRule {
  id: string;
  name: string;
  ruleType: string; // WEEKEND, SEASONAL, CUSTOM, HOLIDAY
  multiplier: number;
  startDate: string;
  endDate: string;
  vehicleId?: string;
}

export interface PricingBreakdown {
  vehicleId: string;
  vehicleType: string;
  totalDays: number;
  basePricePerDay: number;
  baseTotalPrice: number;
  dailyBreakdown: Array<{
    date: string;
    basePrice: number;
    multiplier: number;
    appliedRules: string[];
    finalPrice: number;
  }>;
  addonsTotal: number;
  insuranceTotal: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  loyaltyDiscount: number;
  loyaltyTier: string;
  finalTotal: number;
  deposit: number;
}

export interface LoyaltyProfile {
  id: string;
  userId: string;
  points: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpent: number;
  updatedAt: string;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'EARN' | 'REDEEM' | 'REFUND';
  description: string;
  createdAt: string;
}

export interface CorporateEmployee {
  id: string;
  userId: string;
  departmentId: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  departmentName?: string;
  companyName?: string;
  monthlyLimit?: number;
  spentThisMonth?: number;
}

export interface CompanyBooking {
  id: string;
  bookingId: string;
  employeeId: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalCost: number;
  createdAt: string;
  approvedAt?: string;
  employeeName?: string;
  vehicleName?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface InsurancePackage {
  id: string;
  name: string;
  description: string;
  costPerDay: number;
  coverageLimit: number;
  isActive: boolean;
}

export interface MotorbikeDeposit {
  id: string;
  motorbikeId: string;
  amount: number;
  description: string;
  isActive: boolean;
}

export const pricingService = {
  async calculatePrice(params: {
    vehicleId: string;
    vehicleType: string;
    startDate: string;
    endDate: string;
    addonIds?: string[];
    insuranceId?: string;
  }): Promise<PricingBreakdown> {
    const response = await apiClient.post<any>('/pricing/calculate', params);
    return response.data?.data || response.data;
  },

  async getRules(vehicleId: string): Promise<PricingRule[]> {
    const response = await apiClient.get<any>(`/pricing/rules/${vehicleId}`);
    return response.data?.data || [];
  },

  async createRule(rule: Partial<PricingRule>): Promise<PricingRule> {
    const response = await apiClient.post<any>('/pricing/rules', rule);
    return response.data?.data;
  },

  async deleteRule(id: string): Promise<void> {
    await apiClient.delete(`/pricing/rules/${id}`);
  }
};

export const loyaltyService = {
  async getProfile(): Promise<LoyaltyProfile | null> {
    try {
      const response = await apiClient.get<any>('/rewards/profile');
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  async getTransactions(): Promise<RewardTransaction[]> {
    try {
      const response = await apiClient.get<any>('/rewards/transactions');
      return response.data?.data || [];
    } catch {
      return [];
    }
  }
};

export const corporateService = {
  async getEmployeeProfile(): Promise<CorporateEmployee | null> {
    try {
      const response = await apiClient.get<any>('/corporate/employee/profile');
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  async submitBookingRequest(bookingId: string, totalCost: number): Promise<CompanyBooking> {
    const response = await apiClient.post<any>('/corporate/bookings', { bookingId, totalCost });
    return response.data?.data;
  },

  async getPendingApprovals(): Promise<CompanyBooking[]> {
    const response = await apiClient.get<any>('/corporate/approvals');
    return response.data?.data || [];
  },

  async reviewBooking(bookingId: string, approved: boolean): Promise<CompanyBooking> {
    const response = await apiClient.post<any>(`/corporate/bookings/${bookingId}/review?approved=${approved}`, {});
    return response.data?.data;
  }
};

export const recommendationService = {
  async getSimilarCars(carId: string, limit = 6): Promise<any[]> {
    const response = await apiClient.get<any>(`/recommendations/cars/similar/${carId}?limit=${limit}`);
    return response.data?.data || [];
  },

  async getSimilarMotorbikes(bikeId: string, limit = 6): Promise<any[]> {
    const response = await apiClient.get<any>(`/recommendations/motorbikes/similar/${bikeId}?limit=${limit}`);
    return response.data?.data || [];
  },

  async getPersonalCars(limit = 6): Promise<any[]> {
    const response = await apiClient.get<any>(`/recommendations/cars/personal?limit=${limit}`);
    return response.data?.data || [];
  },

  async getPersonalMotorbikes(limit = 6): Promise<any[]> {
    const response = await apiClient.get<any>(`/recommendations/motorbikes/personal?limit=${limit}`);
    return response.data?.data || [];
  }
};

export const auditService = {
  async getLogs(userId?: string, action?: string, targetType?: string): Promise<AuditLog[]> {
    let url = '/admin/audit/logs?';
    if (userId) url += `userId=${userId}&`;
    if (action) url += `action=${action}&`;
    if (targetType) url += `targetType=${targetType}&`;
    const response = await apiClient.get<any>(url);
    return response.data?.data || [];
  },

  async exportCsvUrl(userId?: string, action?: string, targetType?: string): Promise<string> {
    let url = `${apiClient.baseURL}/admin/audit/export?`;
    const token = localStorage.getItem('token'); // get token for security
    if (token) url += `access_token=${token}&`;
    if (userId) url += `userId=${userId}&`;
    if (action) url += `action=${action}&`;
    if (targetType) url += `targetType=${targetType}&`;
    return url;
  }
};

export const insuranceService = {
  async getCarInsurances(carId: string): Promise<InsurancePackage[]> {
    const response = await apiClient.get<any>(`/insurance/car/${carId}`);
    return response.data?.data || [];
  },

  async getMotorbikeDeposits(bikeId: string): Promise<MotorbikeDeposit[]> {
    const response = await apiClient.get<any>(`/insurance/motorbike/${bikeId}`);
    return response.data?.data || [];
  },

  async getGlobalInsurancePackages(): Promise<InsurancePackage[]> {
    const response = await apiClient.get<any>('/insurance/global');
    return response.data?.data || [];
  }
};

export const ownerAnalyticsService = {
  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get<any>('/owner/analytics/dashboard');
    return response.data?.data;
  },

  async getPdfReportUrl(): Promise<string> {
    return `${apiClient.baseURL}/owner/analytics/report/pdf`;
  },

  async getExcelReportUrl(): Promise<string> {
    return `${apiClient.baseURL}/owner/analytics/report/excel`;
  }
};
