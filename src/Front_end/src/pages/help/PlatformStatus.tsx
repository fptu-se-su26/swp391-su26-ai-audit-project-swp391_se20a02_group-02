import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, AlertTriangle, Settings, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { platformStatusService } from '@/services/helpService';
import { useT } from '@/i18n/translations';

interface ServiceStatus {
  id: number;
  serviceName: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE';
  description: string;
  lastUpdated: string;
}

export const PlatformStatus: React.FC = () => {
  const t = useT();
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformStatusService.getStatus();
      setStatuses(res);
    } catch (err) {
      console.error("Failed to fetch service status:", err);
      setError("Unable to read service status from the network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusConfig = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'OPERATIONAL':
        return {
          label: t.help.serviceOperational || 'Operational',
          color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5',
          icon: ShieldCheck
        };
      case 'DEGRADED':
        return {
          label: t.help.serviceDegraded || 'Degraded Performance',
          color: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
          icon: AlertTriangle
        };
      case 'OUTAGE':
        return {
          label: t.help.serviceOutage || 'Outage',
          color: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
          icon: AlertCircle
        };
      case 'MAINTENANCE':
        return {
          label: t.help.serviceMaintenance || 'Maintenance',
          color: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
          icon: Settings
        };
      default:
        return {
          label: status,
          color: 'text-slate-400 border-slate-500/25 bg-slate-500/5',
          icon: ShieldCheck
        };
    }
  };

  // Mocked historical incidents matching luxury design rules
  const incidents = [
    {
      date: "June 08, 2026",
      title: "Completed Maintenance: Payment Gateways Update",
      description: "VNPay and Stripe connection channels updated successfully. Platform is fully active.",
      status: "COMPLETED"
    },
    {
      date: "May 24, 2026",
      title: "Resolved: Goong Maps Live GPS coordinates latency",
      description: "Resolved coordinate synchronization delay. Tracking telemetry refreshed in real-time.",
      status: "RESOLVED"
    },
    {
      date: "May 10, 2026",
      title: "Completed Maintenance: Live Chat WebSocket upgrades",
      description: "Enhanced real-time support message delivery brokers to reduce latency to < 100ms.",
      status: "COMPLETED"
    }
  ];

  // Global platform state indicator
  const hasOutage = statuses.some(s => s.status === 'OUTAGE');
  const hasDegraded = statuses.some(s => s.status === 'DEGRADED');
  const overallStatus = hasOutage
    ? { text: t.help.serviceOutage || 'Outage Detected', color: 'text-rose-400 border-rose-500/25 bg-rose-500/5' }
    : hasDegraded
      ? { text: t.help.serviceDegraded || 'Degraded Performance', color: 'text-amber-400 border-amber-500/25 bg-amber-500/5' }
      : { text: 'All Systems Operational', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' };

  return (
    <div className="min-h-screen bg-[#070708] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">Service Health Monitor</span>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
            {t.help.platformStatus || 'System Status'}
          </h1>
          <p className="text-slate-400 text-xs mt-2">
            {t.help.platformStatusSubtitle || 'LuxeWay active service health indices, latency rates, and scheduled maintenance bulletins.'}
          </p>
        </div>

        {/* Overall Indicator bar */}
        <div className={`border rounded-2xl p-5 flex items-center justify-between shadow-lg ${overallStatus.color}`}>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-current animate-pulse" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">{overallStatus.text}</h3>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-slate-900 flex items-center justify-center text-slate-350 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Services Status Grid */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-2xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statuses.map((s) => {
            const config = getStatusConfig(s.status);
            const Icon = config.icon;
            return (
              <div key={s.id} className="border border-slate-900 bg-slate-950/40 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">{s.serviceName} SERVICE</h4>
                    <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">{s.description}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${config.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-[9px] text-slate-500">
                  <span className="font-semibold">{config.label}</span>
                  <span className="font-mono">Updated: {new Date(s.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incident History Timeline */}
        <div className="border border-slate-900 bg-slate-950/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-amber-500" /> Historical Incidents
          </h3>

          <div className="relative border-l border-slate-900 ml-3.5 pl-6 space-y-6">
            {incidents.map((inc, i) => (
              <div key={i} className="relative">
                {/* Dotted indicator */}
                <div className="absolute top-1 -left-[30px] w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-500/50" />
                <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider block">{inc.date}</span>
                <h4 className="text-xs font-bold text-white mt-1">{inc.title}</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{inc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
