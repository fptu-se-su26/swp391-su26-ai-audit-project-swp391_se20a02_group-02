import apiClient from './api';

export interface WithdrawalRequest {
  id: string;
  ownerId: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
}

const STORAGE_KEY = 'luxeway_withdrawals';

export const withdrawalService = {
  getWithdrawals(): WithdrawalRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWithdrawals(withdrawals: WithdrawalRequest[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withdrawals));
  },

  async requestWithdrawal(
    ownerId: string, 
    amount: number, 
    bankName: string, 
    accountName: string, 
    accountNumber: string
  ): Promise<WithdrawalRequest> {
    // Note: Since backend lacks a dedicated withdrawal API, we simulate the request here
    // But we still validate against the real user wallet balance
    
    // Fetch user to check balance
    const response = await apiClient.get<any>(`/users/${ownerId}`);
    const user = response.data || response.user || response;
    
    if (!user || (user.walletBalance || 0) < amount) {
      throw new Error('Số dư không đủ để thực hiện giao dịch này.');
    }

    const request: WithdrawalRequest = {
      id: `WDR-${Date.now()}`,
      ownerId,
      amount,
      bankName,
      accountName,
      accountNumber,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const withdrawals = this.getWithdrawals();
    withdrawals.push(request);
    this.saveWithdrawals(withdrawals);

    return request;
  },

  getWithdrawalsByOwner(ownerId: string): WithdrawalRequest[] {
    return this.getWithdrawals().filter(w => w.ownerId === ownerId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAllPendingWithdrawals(): WithdrawalRequest[] {
    return this.getWithdrawals().filter(w => w.status === 'PENDING').sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  async approveWithdrawal(requestId: string): Promise<boolean> {
    const withdrawals = this.getWithdrawals();
    const reqIndex = withdrawals.findIndex(w => w.id === requestId);
    if (reqIndex === -1) throw new Error('Không tìm thấy yêu cầu rút tiền.');
    
    const req = withdrawals[reqIndex];
    if (req.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý.');

    // Reduce balance on backend
    try {
      // First, get the current balance
      const response = await apiClient.get<any>(`/users/${req.ownerId}`);
      const user = response.data || response.user || response;
      
      const newBalance = (user.walletBalance || 0) - req.amount;
      
      if (newBalance < 0) {
          throw new Error('Số dư Owner hiện tại không đủ.');
      }
      
      // Update backend user balance using PUT /users/{id}
      await apiClient.put(`/users/${req.ownerId}`, {
        ...user,
        walletBalance: newBalance
      });
      
      // Mark as approved locally
      withdrawals[reqIndex] = {
        ...req,
        status: 'APPROVED',
        processedAt: new Date().toISOString()
      };
      this.saveWithdrawals(withdrawals);
      return true;
    } catch (error) {
      console.error('Failed to deduct balance for withdrawal:', error);
      throw new Error('Lỗi khi cập nhật số dư trên hệ thống.');
    }
  },

  rejectWithdrawal(requestId: string): boolean {
    const withdrawals = this.getWithdrawals();
    const reqIndex = withdrawals.findIndex(w => w.id === requestId);
    if (reqIndex === -1) throw new Error('Không tìm thấy yêu cầu rút tiền.');
    
    const req = withdrawals[reqIndex];
    if (req.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý.');

    withdrawals[reqIndex] = {
      ...req,
      status: 'REJECTED',
      processedAt: new Date().toISOString()
    };
    this.saveWithdrawals(withdrawals);
    return true;
  }
};
