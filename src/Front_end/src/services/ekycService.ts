import apiClient from './api';

export interface EkycScanResponse {
  success: boolean;
  message: string;
  documentId: string;
  data: {
    idNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    placeOfOrigin: string;
    placeOfResidence: string;
    expiryDate: string;
    documentType: string;
    issueDate: string;
    personalIdentification: string;
    side: string;
  };
  errorCode?: string;
}

export interface EkycStatusResponse {
  kycVerified: boolean;
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  verifiedAt?: string;
  frontDocumentId?: string;
  backDocumentId?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
}

export const ekycService = {
  async scanFrontId(file: File): Promise<EkycScanResponse> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.postForm<EkycScanResponse>('/ekyc/scan/front', formData);
    return response as any;
  },

  async scanBackId(file: File): Promise<EkycScanResponse> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.postForm<EkycScanResponse>('/ekyc/scan/back', formData);
    return response as any;
  },

  async verifyEkyc(frontDocumentId: string, backDocumentId: string): Promise<EkycScanResponse> {
    const response = await apiClient.post<EkycScanResponse>('/ekyc/verify', {
      frontDocumentId,
      backDocumentId,
    });
    return response as any;
  },

  async getStatus(): Promise<EkycStatusResponse> {
    const response = await apiClient.get<EkycStatusResponse>('/ekyc/status');
    return response as any;
  },
};
