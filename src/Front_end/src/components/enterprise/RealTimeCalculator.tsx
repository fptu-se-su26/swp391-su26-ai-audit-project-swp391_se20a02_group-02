import React, { useState, useEffect } from 'react';
import { Calendar, Shield, Package, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { pricingService, insuranceService, PricingBreakdown, InsurancePackage } from '@/services/enterpriseService';
import { formatCurrency, calculateDays } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Helper for VND format (since LuxeWay default is VND)
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface RealTimeCalculatorProps {
  vehicleId: string;
  vehicleType: 'car' | 'motorbike';
  basePricePerDay: number;
  onPricingChange?: (
    breakdown: PricingBreakdown | null,
    selections: {
      startDate: string;
      endDate: string;
      insuranceId: string;
      addonIds: string[];
    }
  ) => void;
  selectedInsuranceId?: string;
  onInsuranceChange?: (id: string) => void;
}

export const RealTimeCalculator: React.FC<RealTimeCalculatorProps> = ({
  vehicleId,
  vehicleType,
  basePricePerDay,
  onPricingChange,
  selectedInsuranceId: selectedInsuranceIdProp,
  onInsuranceChange: onInsuranceChangeProp
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [insurances, setInsurances] = useState<InsurancePackage[]>([]);
  const [selectedInsuranceIdState, setSelectedInsuranceIdState] = useState<string>('');
  
  const selectedInsuranceId = selectedInsuranceIdProp !== undefined ? selectedInsuranceIdProp : selectedInsuranceIdState;
  const setSelectedInsuranceId = onInsuranceChangeProp !== undefined ? onInsuranceChangeProp : setSelectedInsuranceIdState;

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available addons based on vehicle type
  const availableAddons = vehicleType === 'car' 
    ? [
        { id: 'ADDON_CHAUFFEUR', name: 'Professional Chauffeur', price: 500000, desc: 'English-speaking experienced driver' },
        { id: 'ADDON_AIRPORT', name: 'Airport Delivery', price: 200000, desc: 'Deliver/pickup at the terminal' },
        { id: 'ADDON_WEDDING', name: 'Wedding Decoration Decor', price: 1500000, desc: 'Premium floral wedding wrap decoration' }
      ]
    : [
        { id: 'ADDON_HELMET', name: 'Dual Safety Helmets', price: 20000, desc: 'High-quality certified rental helmets' },
        { id: 'ADDON_RAINCOAT', name: 'Premium Raincoats', price: 10000, desc: 'Waterproof protective outerwear' },
        { id: 'ADDON_PHONE', name: 'Mobile Phone Holder', price: 10000, desc: 'Sturdy handlebar navigation mount' },
        { id: 'ADDON_TOURING', name: 'Touring Luggage Rack', price: 100000, desc: 'Heavy duty rear storage rack & cases' }
      ];

  // Fetch insurances at mount
  useEffect(() => {
    const loadInsurances = async () => {
      try {
        if (vehicleType === 'car') {
          const res = await insuranceService.getCarInsurances(vehicleId);
          setInsurances(res);
          if (res.length > 0) setSelectedInsuranceId(res[0].id);
        } else {
          const res = await insuranceService.getGlobalInsurancePackages();
          setInsurances(res);
          if (res.length > 0) setSelectedInsuranceId(res[0].id);
        }
      } catch (err) {
        console.error('Failed to load insurances', err);
      }
    };
    loadInsurances();
  }, [vehicleId, vehicleType]);

  // Trigger calculation when input state changes
  useEffect(() => {
    if (!startDate || !endDate || startDate >= endDate) {
      setBreakdown(null);
      if (onPricingChange) {
        onPricingChange(null, {
          startDate: '',
          endDate: '',
          insuranceId: '',
          addonIds: []
        });
      }
      return;
    }

    const calculate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await pricingService.calculatePrice({
          vehicleId,
          vehicleType,
          startDate,
          endDate,
          addonIds: selectedAddonIds,
          insuranceId: selectedInsuranceId || undefined
        });
        setBreakdown(res);
        if (onPricingChange) {
          onPricingChange(res, {
            startDate,
            endDate,
            insuranceId: selectedInsuranceId,
            addonIds: selectedAddonIds
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to calculate pricing breakdown.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      calculate();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [startDate, endDate, selectedInsuranceId, selectedAddonIds, vehicleId, vehicleType]);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-400" />
        Real-Time Price Calculator
      </h3>

      <div className="space-y-6">
        {/* Date Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pickup Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Return Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Insurance Tier Selection */}
        {insurances.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Insurance Protection Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insurances.map(ins => {
                const isSelected = selectedInsuranceId === ins.id;
                return (
                  <button
                    key={ins.id}
                    onClick={() => setSelectedInsuranceId(ins.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                        : 'border-white/10 bg-slate-950/20 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm">{ins.name}</span>
                      <span className="text-xs font-extrabold text-indigo-400">+{formatVND(ins.costPerDay)}/day</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{ins.description}</p>
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Addon Extras Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            Ecosystem Addons & Services
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableAddons.map(addon => {
              const isSelected = selectedAddonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                      : 'border-white/10 bg-slate-950/20 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-white/20 bg-slate-900'
                  }`}>
                    {isSelected && <span className="text-xs">✓</span>}
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-0.5 gap-2">
                      <span className="font-bold text-xs">{addon.name}</span>
                      <span className="text-[10px] font-bold text-indigo-400 flex-shrink-0">
                        +{formatVND(addon.price)}{vehicleType === 'motorbike' || addon.id === 'ADDON_CHAUFFEUR' ? '/day' : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{addon.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Results Breakdown */}
        <AnimatePresence>
          {loading && (
            <div className="py-8 flex justify-center items-center gap-2 text-indigo-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Recalculating real-time dynamic pricing breakdown...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && breakdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border-t border-white/10 pt-5 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Breakdown</h4>
              
              {/* Daily breakdown list */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {breakdown.dailyBreakdown.map((day, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span>Day {idx + 1}: {day.date}</span>
                      {day.appliedRules.map((rule, ri) => (
                        <span key={ri} className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-medium" title="Applied dynamic pricing multiplier">
                          {rule} ({day.multiplier}x)
                        </span>
                      ))}
                    </span>
                    <span className="text-white font-medium">{formatVND(day.finalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/5 my-2" />

              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Total ({days} Days)</span>
                <span className="text-white font-medium">{formatVND(breakdown.baseTotalPrice)}</span>
              </div>

              {breakdown.addonsTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Addon Extras Total</span>
                  <span className="text-indigo-400 font-medium">+{formatVND(breakdown.addonsTotal)}</span>
                </div>
              )}

              {breakdown.insuranceTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Insurance Coverage Total</span>
                  <span className="text-indigo-400 font-medium">+{formatVND(breakdown.insuranceTotal)}</span>
                </div>
              )}

              {breakdown.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    🎉 Loyalty Reward Discount ({breakdown.loyaltyTier})
                  </span>
                  <span>-{formatVND(breakdown.loyaltyDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-400">
                <span>Platform Service Fee (12%)</span>
                <span className="text-white">{formatVND(breakdown.serviceFee)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Government Taxes (8%)</span>
                <span className="text-white">{formatVND(breakdown.taxes)}</span>
              </div>

              <div className="h-px bg-white/10 my-2" />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Payout</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-indigo-400">{formatVND(breakdown.finalTotal)}</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    + {formatVND(breakdown.deposit)} refundable deposit
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!breakdown && !loading && !error && (
            <div className="py-6 text-center text-xs text-slate-500">
              Select pickup and return dates to inspect invoice price breakdown.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
