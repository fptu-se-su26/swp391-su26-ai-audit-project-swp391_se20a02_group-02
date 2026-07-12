import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Download, Clock, User, HardDrive, Info } from 'lucide-react';
import { auditService, AuditLog } from '@/services/enterpriseService';
import { formatDate } from '@/utils';
import { useToast } from '@/components/ui/Toast';

export const AuditTrailDashboard: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getLogs(
        userIdFilter || undefined,
        actionFilter || undefined,
        targetTypeFilter || undefined
      );
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      toast.error('Failed to fetch security audit trails ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userIdFilter, actionFilter, targetTypeFilter]);

  const handleExportCsv = async () => {
    try {
      const url = await auditService.exportCsvUrl(
        userIdFilter || undefined,
        actionFilter || undefined,
        targetTypeFilter || undefined
      );
      // Create a transient link to download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'luxeway-audit-trail-ledger.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Audit trails CSV report download triggered.');
    } catch (err) {
      toast.error('Failed to download CSV ledger.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Description & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-2">
        <div>
          <p className="text-[11px] font-medium text-[var(--lw-text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Cryptographically signed transaction log ledger and admin audit details
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 bg-[var(--lw-accent)] hover:bg-[var(--lw-accent-alt)] text-white font-bold text-[10px] uppercase tracking-widest px-4.5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--lw-bg-card)] border border-[var(--lw-border)] p-5 rounded-2xl shadow-sm">
        <div>
          <label className="block text-[10px] font-bold text-[var(--lw-text-secondary)] uppercase tracking-wider mb-2">Search User ID</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--lw-text-muted)]" />
            <input
              type="text"
              placeholder="e.g. usr_123..."
              value={userIdFilter}
              onChange={e => setUserIdFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--lw-bg-secondary)]/50 border border-[var(--lw-border)] rounded-xl text-xs text-[var(--lw-text-primary)] placeholder:text-[var(--lw-text-muted)] focus:outline-none focus:border-[var(--lw-accent)] focus:bg-[var(--lw-bg-card)] transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--lw-text-secondary)] uppercase tracking-wider mb-2">Filter Action</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--lw-text-muted)]" />
            <input
              type="text"
              placeholder="e.g. BOOKING_CREATE..."
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--lw-bg-secondary)]/50 border border-[var(--lw-border)] rounded-xl text-xs text-[var(--lw-text-primary)] placeholder:text-[var(--lw-text-muted)] focus:outline-none focus:border-[var(--lw-accent)] focus:bg-[var(--lw-bg-card)] transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--lw-text-secondary)] uppercase tracking-wider mb-2">Target Resource</label>
          <div className="relative">
            <HardDrive className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--lw-text-muted)]" />
            <input
              type="text"
              placeholder="e.g. Booking, User, Vehicle..."
              value={targetTypeFilter}
              onChange={e => setTargetTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--lw-bg-secondary)]/50 border border-[var(--lw-border)] rounded-xl text-xs text-[var(--lw-text-primary)] placeholder:text-[var(--lw-text-muted)] focus:outline-none focus:border-[var(--lw-accent)] focus:bg-[var(--lw-bg-card)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3 text-[var(--lw-accent)]">
            <div className="w-8 h-8 border-2 border-[var(--lw-accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--lw-text-secondary)]">Loading trail ledger entries...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-[var(--lw-text-secondary)] font-medium text-xs">
            No matching trail entries found in system audit database table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--lw-bg-secondary)]/50 text-[10px] font-bold uppercase tracking-wider text-[var(--lw-text-secondary)] border-b border-[var(--lw-border)]">
                <tr>
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Operator</th>
                  <th className="py-4 px-5">IP Address</th>
                  <th className="py-4 px-5">Action Target</th>
                  <th className="py-4 px-5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lw-border)] text-[var(--lw-text-secondary)]">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[var(--lw-bg-card-hover)] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-[var(--lw-text-secondary)] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--lw-text-muted)] flex-shrink-0" />
                      {formatDate(log.createdAt, 'long')}
                    </td>
                    <td className="py-4 px-5 font-bold text-[var(--lw-text-primary)]">{log.username || 'System'}</td>
                    <td className="py-4 px-5 text-[var(--lw-text-muted)] font-mono text-[10px]">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 bg-[var(--lw-accent-glow)] border border-[var(--lw-border-strong)] text-[var(--lw-accent)] rounded text-[9px] font-bold uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 truncate max-w-xs text-[var(--lw-text-secondary)] font-medium">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded Modal view */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--lw-bg-card)] border border-[var(--lw-border)] max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--lw-text-primary)] flex items-center gap-2">
                <Info className="w-5 h-5 text-[var(--lw-accent)]" />
                Audit Record Details
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-[var(--lw-text-secondary)] hover:bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)] rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[var(--lw-border)]">
                <span className="text-[var(--lw-text-secondary)] font-bold">Log Record ID</span>
                <span className="text-[var(--lw-text-primary)] font-mono">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lw-border)]">
                <span className="text-[var(--lw-text-secondary)] font-bold">Action Event</span>
                <span className="text-[var(--lw-accent)] font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lw-border)]">
                <span className="text-[var(--lw-text-secondary)] font-bold">Operator ID</span>
                <span className="text-[var(--lw-text-primary)] font-mono">{selectedLog.userId || 'system'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lw-border)]">
                <span className="text-[var(--lw-text-secondary)] font-bold">IP Source</span>
                <span className="text-[var(--lw-text-primary)] font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lw-border)]">
                <span className="text-[var(--lw-text-secondary)] font-bold">Resource Type</span>
                <span className="text-amber-600 font-bold">{selectedLog.targetType} ({selectedLog.targetId})</span>
              </div>
              <div className="space-y-1.5 py-1.5">
                <p className="text-[var(--lw-text-secondary)] font-bold">Event Details</p>
                <div className="p-3 bg-[var(--lw-bg-secondary)] border border-[var(--lw-border)] rounded-xl font-mono text-[10px] text-[var(--lw-text-primary)] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
