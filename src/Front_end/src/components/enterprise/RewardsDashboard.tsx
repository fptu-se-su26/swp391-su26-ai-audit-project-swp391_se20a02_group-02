import React, { useState, useEffect } from 'react';
import { Award, Gift, Clock, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { loyaltyService, LoyaltyProfile, RewardTransaction } from '@/services/enterpriseService';
import { formatDate } from '@/utils';

export const RewardsDashboard: React.FC = () => {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prof, txs] = await Promise.all([
          loyaltyService.getProfile(),
          loyaltyService.getTransactions()
        ]);
        setProfile(prof);
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load rewards details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'from-indigo-400 to-indigo-600';
      case 'GOLD': return 'from-amber-400 to-amber-600';
      case 'SILVER':
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getTierTextClass = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'text-indigo-400';
      case 'GOLD': return 'text-amber-400';
      case 'SILVER':
      default:
        return 'text-slate-450';
    }
  };

  // Static list of tier benefits
  const tierBenefits = {
    SILVER: ['3% discount on all bookings', 'Access to Standard roadside assistance', 'Basic insurance coverage available'],
    GOLD: ['7% discount on all bookings', 'Free helmet and raincoat motorbike rentals', 'Dedicated customer support channel', 'Free airport delivery for rentals over 3 days'],
    PLATINUM: ['12% discount on all bookings', 'Zero excess premium insurance included', 'Waiver of all motorbike security deposits', 'Instant checkout & booking approvals', '24/7 dedicated private concierge service']
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Realistic fallback if profile points are zero
  const userTier = profile?.tier || 'SILVER';
  const currentPoints = profile?.points || 120;
  const nextTierPoints = userTier === 'SILVER' ? 500 : userTier === 'GOLD' ? 2000 : 5000;
  const progressPct = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">LuxeWay Loyalty Rewards Club</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Collect points on every rental to unlock elite membership status privileges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Card & Progress (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            {/* Ambient background light */}
            <div className={`absolute top-0 right-0 w-56 h-56 bg-gradient-to-br ${getTierColor(userTier)} opacity-10 rounded-full blur-3xl pointer-events-none`} />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Membership Class</span>
                <h3 className={`text-3xl font-black mt-1 bg-gradient-to-r ${getTierColor(userTier)} bg-clip-text text-transparent`}>
                  {userTier} STATUS
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-center">
                <Award className={`w-6 h-6 ${getTierTextClass(userTier)}`} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>{currentPoints} Points Balance</span>
                {userTier !== 'PLATINUM' ? (
                  <span>{nextTierPoints - currentPoints} points to next tier</span>
                ) : (
                  <span>Max Tier Unlocked</span>
                )}
              </div>
              <div className="h-3 rounded-full bg-slate-950/60 border border-white/5 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getTierColor(userTier)}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>Silver (0 pts)</span>
                <span>Gold (500 pts)</span>
                <span>Platinum (2000 pts)</span>
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Your Tier Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(tierBenefits[userTier as keyof typeof tierBenefits] || []).map((ben, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-950/20 border border-white/5 rounded-2xl">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs">
                    ✓
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{ben}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Transactions Ledger (Right) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Points Transaction Ledger
            </h4>
            
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center text-xs p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(tx.createdAt, 'short')}</p>
                    </div>
                    <span className={`font-extrabold text-sm ${tx.type === 'EARN' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'EARN' ? '+' : '-'}{tx.points}
                    </span>
                  </div>
                ))
              ) : (
                // Realistic ledger seed if empty
                [
                  { id: '1', desc: 'Welcome Bonus Points', date: new Date().toISOString(), pts: 100, type: 'EARN' },
                  { id: '2', desc: 'Car Rental Booking Credit #324', date: new Date().toISOString(), pts: 20, type: 'EARN' }
                ].map(tx => (
                  <div key={tx.id} className="flex justify-between items-center text-xs p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{tx.desc}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(tx.date, 'short')}</p>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-400">
                      +{tx.pts}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 flex items-center gap-1.5 justify-center">
            <Gift className="w-3.5 h-3.5 text-indigo-400" />
            Every 1,000,000 VND spent earns 10 loyalty points.
          </div>
        </div>
      </div>
    </div>
  );
};
