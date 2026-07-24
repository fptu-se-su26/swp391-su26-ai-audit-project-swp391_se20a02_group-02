import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Scale, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '@/store';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types';
import { formatCurrency, resolveImageUrl } from '@/utils';
import { useT } from '@/i18n/translations';

export const CompareTray: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useVehicleStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all(compareList.map(id => vehicleService.getById(id))).then(items => {
      if (active) setVehicles(items.filter(Boolean) as Vehicle[]);
    });
    return () => { active = false; };
  }, [compareList]);

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.aside
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">{t.compare.title}</p>
              <p className="text-xs text-slate-500">{compareList.length}/3 {t.compare.vehiclesSelected}</p>
            </div>
            <button onClick={clearCompare} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title={t.compare.clearComparison}>
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
              disabled={compareList.length < 2}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.compare.compareNow} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {compareList.map((id, index) => {
              const vehicle = vehicles.find(item => item.id === id);
              const engine = vehicle?.engineCc
                ? `${vehicle.engineCc} cc`
                : vehicle?.specs?.engineSize || vehicle?.specs?.fuelType || '—';
              return (
                <div key={id} className="relative flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <img
                    src={resolveImageUrl(vehicle?.images?.[0] || vehicle?.thumbnailUrl || '')}
                    alt={vehicle?.name || `Vehicle ${index + 1}`}
                    className="h-11 w-14 shrink-0 rounded-xl bg-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{vehicle?.name || `Vehicle ${index + 1}`}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {vehicle ? formatCurrency(vehicle.pricePerDay) : '—'} · {engine}
                    </p>
                  </div>
                  <button onClick={() => removeFromCompare(id)} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove from comparison">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>          {compareList.length < 2 && <p className="mt-2 text-center text-[11px] text-slate-500">Select at least 2 vehicles to compare.</p>}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};