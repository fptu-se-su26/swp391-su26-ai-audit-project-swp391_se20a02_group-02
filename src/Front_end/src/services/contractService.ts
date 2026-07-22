import apiClient from './api';

export interface DigitalContract {
  id: number;
  documentUrl: string;
  ownerSignature?: string | null;
  renterSignature?: string | null;
  ownerSignedAt?: string | null;
  renterSignedAt?: string | null;
  isFullySigned?: boolean;
  createdAt?: string;
  docusealSubmissionId?: number | null;
  docusealRenterSubmitterId?: number | null;
  docusealOwnerSubmitterId?: number | null;
  docusealRenterEmbedUrl?: string | null;
  docusealOwnerEmbedUrl?: string | null;
  docusealStatus?: string | null;
  docusealCompletedDocumentUrl?: string | null;
  currentSignerEmbedUrl?: string | null;
}

export const contractService = {
  async ensureForBooking(bookingId: string): Promise<DigitalContract> {
    return withContractRetry(async () => {
      const response = await apiClient.post<any>(`/contracts/booking/${bookingId}/ensure`, {
        documentUrl: `${window.location.origin}/booking/${bookingId}/contract`,
      });
      return response.data || response;
    });
  },

  async getByBooking(bookingId: string): Promise<DigitalContract | null> {
    try {
      const response = await apiClient.get<any>(`/contracts/booking/${bookingId}`);
      return response.data || response || null;
    } catch {
      return null;
    }
  },

  async sign(contractId: number, signature: string): Promise<DigitalContract> {
    const response = await apiClient.put<any>(`/contracts/${contractId}/sign`, { signature });
    return response.data || response;
  },
};

const withContractRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const message = String(error?.message || error?.response?.data?.message || '');
    const status = error?.response?.status;
    const retryable = status >= 500 || /unique|duplicate|constraint|digital_contracts/i.test(message);
    if (!retryable) {
      throw error;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return operation();
  }
};
