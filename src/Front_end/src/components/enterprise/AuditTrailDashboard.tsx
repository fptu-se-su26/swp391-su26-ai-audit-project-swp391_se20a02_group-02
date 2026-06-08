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
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6.5 h-6.5 text-red-500" />
            Security & Audit Ledger Trail
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Cryptographically signed transaction log ledger and admin audit details
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 border border-white/10 p-5 rounded-2xl">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Search User ID</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. usr_123..."
              value={userIdFilter}
              onChange={e => setUserIdFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-650"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filter Action</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. BOOKING_CREATE..."
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-650"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Resource</label>
          <div className="relative">
            <HardDrive className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. Booking, User, Vehicle..."
              value={targetTypeFilter}
              onChange={e => setTargetTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-650"
            />
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center items-center gap-3 text-indigo-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading trail ledger entries...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No matching trail entries found in system audit database table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/60 text-[9px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Action Target</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-550 flex-shrink-0" />
                      {formatDate(log.createdAt, 'long')}
                    </td>
                    <td className="p-4 font-bold text-white">{log.username || 'System'}</td>
                    <td className="p-4 text-slate-400 font-mono text-[10px]">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 truncate max-w-xs text-slate-400 font-medium">{log.details}</td>
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
          <div className="bg-slate-900 border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                Audit Record Details
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-white/5 border border-white/5"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-450 font-bold">Log Record ID</span>
                <span className="text-white font-mono">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-450 font-bold">Action Event</span>
                <span className="text-indigo-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-450 font-bold">Operator ID</span>
                <span className="text-white font-mono">{selectedLog.userId || 'system'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-450 font-bold">IP Source</span>
                <span className="text-white font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-450 font-bold">Resource Type</span>
                <span className="text-amber-400 font-bold">{selectedLog.targetType} ({selectedLog.targetId})</span>
              </div>
              <div className="space-y-1 py-1.5">
                <p className="text-slate-455 font-bold">Event Details</p>
                <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl font-mono text-[10px] text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
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
