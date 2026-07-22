import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/store';
import { useT } from '@/i18n/translations';
import api from '@/services/api';

export const TestBackendPage: React.FC = () => {
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  
  const [healthStatus, setHealthStatus] = useState<string>('Loading...');
  const [dbStatus, setDbStatus] = useState<string>('Loading...');
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Checking Health API (Assuming /api/v1/health exists, or fallback to something)
        try {
          const healthRes = await api.get<{ status: number; data?: { totalElements?: number } }>('/vehicles?page=0&size=1');
          if (healthRes.status === 200) {
            setHealthStatus('OK - Backend is running');
            setDbStatus('OK - Database is connected');
            setVehiclesCount(healthRes.data?.totalElements || 0);
          }
        } catch (e: any) {
          setError(e.message || 'Failed to connect to backend');
          setHealthStatus('Failed');
          setDbStatus('Failed');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      }
    };
    checkBackend();
  }, []);

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold font-display text-center mb-8">Backend System Status</h1>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="luxury-card p-6 rounded-2xl border border-[var(--lw-border)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔌</span> Backend Connection
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--lw-border)] pb-2">
                <span className="text-slate-500">API Health</span>
                <span className={`font-semibold ${healthStatus.includes('OK') ? 'text-green-500' : 'text-yellow-500'}`}>
                  {healthStatus}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-500">Database Connection</span>
                <span className={`font-semibold ${dbStatus.includes('OK') ? 'text-green-500' : 'text-yellow-500'}`}>
                  {dbStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="luxury-card p-6 rounded-2xl border border-[var(--lw-border)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Data Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--lw-border)] pb-2">
                <span className="text-slate-500">Total Vehicles</span>
                <span className="font-semibold">{vehiclesCount !== null ? vehiclesCount : 'Loading...'}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-500">Total Users</span>
                <span className="font-semibold">Mocked / Hidden for Security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This page is intended for demonstration and verification purposes only.</p>
        </div>
      </div>
    </div>
  );
};
