import apiClient from './api';

export interface OwnerApplicationDocumentResponse {
  id: string;
  documentType: string;
  fileReference: string;
  verificationStatus: string;
  rejectionReason: string;
  createdAt: string;
}

export interface OwnerApplicationResponse {
  id: string;
  userId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  currentStep: number;
  rejectionReason?: string;
  fullName?: string;
  dob?: string;
  phone?: string;
  address?: string;
  city?: string;
  displayName?: string;
  bio?: string;
  serviceArea?: string;
  bankName?: string;
  accountHolderName?: string;
  maskedAccountNumber?: string;
  termsAccepted?: boolean;
  termsVersion?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  documents?: OwnerApplicationDocumentResponse[];
}

export const ownerApplicationService = {
  getMyApplication: async (): Promise<OwnerApplicationResponse | null> => {
    try {
      const response = await apiClient.get('/owner-applications/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null; // Not found means no application
      }
      throw error;
    }
  },

  createDraft: async (): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.post('/owner-applications');
    return response.data;
  },

  updatePersonalInfo: async (id: string, data: any): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.put(`/owner-applications/${id}/personal-info`, data);
    return response.data;
  },

  updateOwnerProfile: async (id: string, data: any): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.put(`/owner-applications/${id}/owner-profile`, data);
    return response.data;
  },

  updatePayout: async (id: string, data: any): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.put(`/owner-applications/${id}/payout`, data);
    return response.data;
  },

  addDocument: async (id: string, documentType: string, fileReference: string): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.post(`/owner-applications/${id}/documents`, {
      documentType,
      fileReference
    });
    return response.data;
  },

  submitApplication: async (id: string, accepted: boolean, version: string = '1.0'): Promise<OwnerApplicationResponse> => {
    const response = await apiClient.post(`/owner-applications/${id}/submit`, {
      accepted,
      version
    });
    return response.data;
  }
};
