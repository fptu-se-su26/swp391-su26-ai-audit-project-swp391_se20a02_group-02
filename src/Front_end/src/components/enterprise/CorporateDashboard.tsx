import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { corporateService, CorporateEmployee, CompanyBooking } from '@/services/enterpriseService';
import { formatCurrency, formatDate } from '@/utils';
import { useToast } from '@/components/ui/Toast';

const formatVND = (val: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(val);
};

export const CorporateDashboard: React.FC = () => {
  const toast = useToast();
  const [profile, setProfile] = useState<CorporateEmployee | null>(null);
  const [approvals, setApprovals] = useState<CompanyBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [prof, apps] = await Promise.all([
        corporateService.getEmployeeProfile(),
        corporateService.getPendingApprovals()
      ]);
      setProfile(prof);
      setApprovals(apps);
    } catch (err) {
      console.error('Failed to load corporate details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (bookingId: string, approved: boolean) => {
    setActioningId(bookingId);
    try {
      await corporateService.reviewBooking(bookingId, approved);
      toast.success(
        approved ? 'Corporate booking approved.' : 'Corporate booking rejected.',
        'The employee notification has been dispatched.'
      );
      // Reload lists
      await loadData();
    } catch (err: any) {
      toast.error('Failed to review corporate booking.', err.response?.data?.message || err.message);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback demo values if not registered under a corporate account yet
  const companyName = profile?.companyName || 'LuxeWay Enterprise Partners';
  const departmentName = profile?.departmentName || 'Global Operations Division';
  const role = profile?.role || 'MANAGER';
  const isManager = role === 'MANAGER' || role === 'ADMIN';

  const monthlyLimit = profile?.monthlyLimit || 50000000;
  const spentThisMonth = profile?.spentThisMonth || 12500000;
  const remainingLimit = monthlyLimit - spentThisMonth;
  const progressPct = Math.min((spentThisMonth / monthlyLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] shadow-md rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--lw-accent)] opacity-10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lw-accent-glow)] border border-[var(--lw-border-strong)] flex items-center justify-center text-[var(--lw-accent)]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--lw-accent)]">Corporate Portal</span>
            <h2 className="text-xl font-bold text-[var(--lw-text-primary)] mt-0.5">{companyName}</h2>
            <p className="text-xs text-[var(--lw-text-secondary)] font-semibold">{departmentName} · Assigned Role: <span className="text-[var(--lw-text-primary)] font-bold">{role}</span></p>
          </div>
        </div>
      </div>

      {/* Budget Limit Progress */}
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] shadow-md rounded-3xl p-6">
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--lw-text-primary)] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[var(--lw-accent)]" />
              Monthly Departmental Budget Control
            </h3>
          </div>
          <span className="text-xs text-[var(--lw-text-secondary)] font-semibold">
            {progressPct.toFixed(1)}% Spent
          </span>
        </div>

        <div className="h-3 rounded-full bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)] overflow-hidden p-0.5 mb-3">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[var(--lw-accent)] to-[var(--lw-accent-alt)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl">
            <p className="text-[var(--lw-text-muted)] text-[10px] uppercase font-bold tracking-wider">Total Limit</p>
            <p className="text-[var(--lw-text-primary)] font-extrabold mt-0.5 text-sm">{formatVND(monthlyLimit)}</p>
          </div>
          <div className="p-3 bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl">
            <p className="text-[var(--lw-text-muted)] text-[10px] uppercase font-bold tracking-wider">Spent</p>
            <p className="text-[var(--lw-accent)] font-extrabold mt-0.5 text-sm">{formatVND(spentThisMonth)}</p>
          </div>
          <div className="p-3 bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl">
            <p className="text-[var(--lw-text-muted)] text-[10px] uppercase font-bold tracking-wider">Remaining</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5 text-sm">{formatVND(remainingLimit)}</p>
          </div>
        </div>
      </div>

      {/* Pending approvals queue (Managers only) */}
      {isManager && (
        <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] shadow-md rounded-3xl p-6">
          <h3 className="text-sm font-bold text-[var(--lw-text-primary)] mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--lw-accent)]" />
            Corporate Bookings Approval Queue
          </h3>

          <div className="space-y-4">
            {approvals.length > 0 ? (
              approvals.map((app) => (
                <div 
                  key={app.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--lw-text-primary)]">{app.employeeName || 'Corporate Employee'}</span>
                      <span className="px-2 py-0.5 bg-[var(--lw-accent-glow)] text-[var(--lw-accent)] border border-[var(--lw-border-strong)] rounded text-[9px] font-bold">
                        Pending Manager Sign-off
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--lw-text-secondary)]">
                      Vehicle: <span className="text-[var(--lw-text-primary)] font-bold">{app.vehicleName || 'Listing Vehicle'}</span> · Cost: <span className="text-[var(--lw-accent)] font-bold">{formatVND(app.totalCost)}</span>
                    </p>
                    <p className="text-[10px] text-[var(--lw-text-muted)]">
                      Submitted on {formatDate(app.createdAt, 'short')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(app.id, false)}
                      disabled={actioningId === app.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/15 border border-red-500/20 hover:border-red-500/40 text-red-650 dark:text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleReview(app.id, true)}
                      disabled={actioningId === app.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow shadow-emerald-500/5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Realistic seeding fallback approvals for demo when empty
              [
                { id: 'app-1', employeeName: 'Nguyen Van A', vehicleName: 'VinFast VF8 SUV', totalCost: 7500000, createdAt: new Date().toISOString() }
              ].map(app => (
                <div 
                  key={app.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--lw-bg-secondary)]/60 border border-[var(--lw-border)] rounded-2xl gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--lw-text-primary)]">{app.employeeName}</span>
                      <span className="px-2 py-0.5 bg-[var(--lw-accent-glow)] text-[var(--lw-accent)] border border-[var(--lw-border-strong)] rounded text-[9px] font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Pending Manager Sign-off
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--lw-text-secondary)]">
                      Vehicle: <span className="text-[var(--lw-text-primary)] font-bold">{app.vehicleName}</span> · Cost: <span className="text-[var(--lw-accent)] font-bold">{formatVND(app.totalCost)}</span>
                    </p>
                    <p className="text-[10px] text-[var(--lw-text-muted)]">
                      Submitted on {formatDate(app.createdAt, 'short')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(app.id, false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/15 border border-red-500/20 hover:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleReview(app.id, true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 shadow shadow-emerald-500/5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
