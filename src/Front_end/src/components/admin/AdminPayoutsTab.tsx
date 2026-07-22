import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Eye, Wallet, RefreshCw } from 'lucide-react';
import { withdrawalService, WithdrawalRequest } from '@/services/withdrawalService';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useT } from '@/i18n/translations';

export const AdminPayoutsTab: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const toast = useToast();
  const t = useT();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // withdrawalService fetches from localStorage mock DB since backend doesn't support it yet
      const reqs = await withdrawalService.getAllRequests();
      setRequests(reqs.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
    } catch (err) {
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      // 1. Mark as approved in service
      await withdrawalService.updateRequestStatus(selectedRequest.id, 'APPROVED');
      
      // 2. Actually deduct money from user wallet via backend
      const userRes = await apiClient.get<any>(`/users/${selectedRequest.ownerId}`);
      const user = userRes.data || userRes.user || userRes;
      
      const newBalance = Math.max(0, (user.walletBalance || 0) - selectedRequest.amount);
      await apiClient.put(`/users/${selectedRequest.ownerId}`, {
        ...user,
        walletBalance: newBalance
      });
      
      toast.success('Withdrawal request approved and balance deducted.');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Error approving request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await withdrawalService.updateRequestStatus(selectedRequest.id, 'REJECTED', rejectReason);
      toast.success('Withdrawal request rejected.');
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Error rejecting request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesSearch = search === '' || 
      req.ownerId.toLowerCase().includes(search.toLowerCase()) || 
      req.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs 
        title="Owner Payouts & Withdrawals" 
        items={[{ label: "LuxeWay", href: "/" }, { label: "Admin" }, { label: "Payouts" }]} 
      />

      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-[2rem] shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 bg-slate-500/5 p-1 rounded-2xl overflow-x-auto w-full md:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-500/10'
                }`}
              >
                {status}
                <span className="ml-1.5 text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-md text-slate-500">
                  {status === 'ALL' ? requests.length : requests.filter(r => r.status === status).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--lw-border)] bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button onClick={fetchRequests} className="p-2.5 rounded-xl border border-[var(--lw-border)] hover:bg-slate-500/5 text-slate-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-500/5 border-b border-[var(--lw-border)]">
              <tr>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider first:pl-6">Req ID</th>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider">Owner ID</th>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider">Amount</th>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider">Bank Info</th>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-left text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider">Date</th>
                <th className="py-4 px-4 text-right text-xs font-extrabold text-[var(--lw-text-secondary)] uppercase tracking-wider last:pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lw-border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-500/3 transition-colors">
                    <td className="py-4 px-4 pl-6 font-mono text-xs text-slate-500">{req.id.substring(0, 8)}...</td>
                    <td className="py-4 px-4 text-sm font-semibold text-[var(--lw-text-primary)]">{req.ownerId.substring(0, 8)}...</td>
                    <td className="py-4 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(req.amount)}</td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-bold">{req.bankName}</p>
                      <p className="text-xs text-slate-500">{req.accountNumber} - {req.accountName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={req.status === 'PENDING' ? 'PENDING' : req.status === 'APPROVED' ? 'ACTIVE' : 'REJECTED'} />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">{formatDate(req.requestDate)}</td>
                    <td className="py-4 px-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-transparent hover:border-emerald-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Withdrawal</h3>
                <p className="text-xs text-slate-500">{selectedRequest.id}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Amount Requested</p>
                  <p className="font-extrabold text-emerald-600 text-lg">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                  <StatusBadge status={selectedRequest.status === 'PENDING' ? 'PENDING' : selectedRequest.status === 'APPROVED' ? 'ACTIVE' : 'REJECTED'} />
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bank Information</h4>
                <div>
                  <p className="text-xs text-slate-500">Bank Name</p>
                  <p className="font-bold text-sm text-[var(--lw-text-primary)]">{selectedRequest.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Account Number</p>
                  <p className="font-bold text-sm text-[var(--lw-text-primary)]">{selectedRequest.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Account Name</p>
                  <p className="font-bold text-sm text-[var(--lw-text-primary)]">{selectedRequest.accountName}</p>
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    rows={2}
                  />
                </div>
              )}
              
              {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-colors"
                >
                  Close
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-bold transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 px-4 py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Approve Payout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
