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
};
