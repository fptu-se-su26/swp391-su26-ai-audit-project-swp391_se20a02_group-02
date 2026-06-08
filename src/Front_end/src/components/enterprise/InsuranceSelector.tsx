import React from 'react';
import { Shield, Check, X, HelpCircle } from 'lucide-react';
import { InsurancePackage } from '@/services/enterpriseService';

// Standard fallback coverage metadata
interface CoverageFeature {
  name: string;
  basic: boolean;
  premium: boolean;
  enterprise: boolean;
}

const COVERAGE_FEATURES: CoverageFeature[] = [
  { name: 'Third Party Liability', basic: true, premium: true, enterprise: true },
  { name: 'Roadside Emergency Towing', basic: true, premium: true, enterprise: true },
  { name: 'Collision Damage Waiver (CDW)', basic: false, premium: true, enterprise: true },
  { name: 'Theft & Vandalism Protection', basic: false, premium: true, enterprise: true },
  { name: 'Personal Accident Coverage', basic: false, premium: false, enterprise: true },
  { name: 'Zero Excess Liability', basic: false, premium: false, enterprise: true },
];

interface InsuranceSelectorProps {
  packages: InsurancePackage[];
  selectedId: string;
  onChange: (id: string) => void;
}

export const InsuranceSelector: React.FC<InsuranceSelectorProps> = ({
  packages,
  selectedId,
  onChange,
}) => {
  // If packages are not loaded yet or empty, provide visual empty skeleton
  if (!packages || packages.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center text-slate-400">
        Loading coverage packages...
      </div>
    );
  }

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400" />
        Choose Collision & Damage Protection
      </h3>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {packages.map((pkg) => {
          const isSelected = selectedId === pkg.id;
          const isPremium = pkg.name.toLowerCase().includes('premium');
          const isEnterprise = pkg.name.toLowerCase().includes('enterprise') || pkg.name.toLowerCase().includes('business') || pkg.name.toLowerCase().includes('gold') || pkg.name.toLowerCase().includes('platinum');

          // Categorize for features grid
          let type: 'basic' | 'premium' | 'enterprise' = 'basic';
          if (isPremium) type = 'premium';
          else if (isEnterprise) type = 'enterprise';

          return (
            <div
              key={pkg.id}
              onClick={() => onChange(pkg.id)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden h-full ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                  : 'border-white/10 bg-slate-950/20 text-slate-300 hover:border-white/20'
              }`}
            >
              {isPremium && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Popular
                </span>
              )}
              {isEnterprise && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Max Safety
                </span>
              )}

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Tier Protection</span>
                <h4 className="text-lg font-bold mt-1 text-white">{pkg.name}</h4>
                <p className="text-xs text-slate-400 mt-2 min-h-10 leading-relaxed">{pkg.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-slate-400">Coverage Limit</span>
                  <span className="text-xs font-bold text-white">{formatVND(pkg.coverageLimit)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Price Per Day</span>
                  <span className="text-base font-extrabold text-indigo-400">+{formatVND(pkg.costPerDay)}</span>
                </div>
              </div>

              {/* Selection Indicator */}
              <div className={`mt-4 w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                isSelected 
                  ? 'bg-indigo-500 text-white shadow' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}>
                {isSelected ? '✓ Selected Plan' : 'Select Plan'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Features Table (Desktop only) */}
      <div className="hidden sm:block border border-white/5 rounded-2xl overflow-hidden bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-400">
          <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
            <tr>
              <th className="p-4 font-semibold">Coverage Benefits</th>
              <th className="p-4 text-center font-semibold">Basic Coverage</th>
              <th className="p-4 text-center font-semibold">Premium Shield</th>
              <th className="p-4 text-center font-semibold">Enterprise Elite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {COVERAGE_FEATURES.map((feat, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium text-slate-300 flex items-center gap-1.5">
                  {feat.name}
                  <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
                </td>
                <td className="p-4 text-center">
                  {feat.basic ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {feat.premium ? (
                    <Check className="w-4 h-4 text-indigo-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {feat.enterprise ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
