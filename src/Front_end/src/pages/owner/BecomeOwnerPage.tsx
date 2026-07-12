import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sparkles, TrendingUp, BarChart3, Star, CheckCircle, ArrowRight, UserCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils';

export const BecomeOwnerPage: React.FC = () => {
  const { user, isAuthenticated, initAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(15);
  const [pricePerDay, setPricePerDay] = useState(800000);

  const estimatedRevenue = Math.round(days * pricePerDay * 0.8);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      toast.error('Authentication Required', 'Please log in or sign up first to register as an owner.');
      navigate('/auth/login?redirect=/owner/register');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<any>('/users/become-owner', {});
      const updatedProfile = response.data || response;

      // Update local storage session values
      const stored = JSON.parse(localStorage.getItem('luxeway_user') || '{}');
      const updatedUser = {
        ...stored,
        role: 'owner'
      };
      localStorage.setItem('luxeway_user', JSON.stringify(updatedUser));

      // Re-initialize auth store to sync global state
      initAuth();

      toast.success('Registration Successful!', 'Congratulations, you are now a registered LuxeWay Host.');
      navigate('/owner', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error('Upgrade Failed', err.response?.data?.error || 'Could not upgrade your profile role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Banner */}
        <div className="rounded-[2.5rem] overflow-hidden bg-[#0B1120] text-white flex flex-col lg:flex-row border border-white/5 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Left panel info */}
          <div className="lg:w-7/12 p-10 lg:p-14 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> LuxeWay for Owners
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
                Share Your Luxury Fleet &<br />Start Earning High Yields
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                Join our premium community of hosts. List your supercar, executive SUV, or classic masterpiece on LuxeWay and turn your idle asset into consistent monthly revenue.
              </p>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Avg Monthly Revenue', value: '₫18.5M', icon: TrendingUp },
                  { label: 'Platform Commission', value: '15%', icon: BarChart3 },
                  { label: 'Owner Satisfaction', value: '4.9/5', icon: Star },
                  { label: 'Fully Insured Policy', value: 'Coverage', icon: Shield },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white leading-none">{item.value}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right panel CTA / Onboarding form */}
          <div className="lg:w-5/12 bg-white/5 border-l border-white/5 p-10 lg:p-14 flex flex-col justify-center">
            <div className="glass dark:glass-dark border border-white/10 p-8 rounded-3xl space-y-6">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" /> Host Registration
              </h3>
              
              <div className="space-y-4">
                {isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-355 leading-relaxed">
                    <p className="font-bold text-white text-sm mb-1.5">Verification Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Authenticated as <strong className="text-white">{user?.displayName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Email linked: <strong className="text-white">{user?.email}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    You are not logged in. You will be redirected to complete account authentication first.
                  </div>
                )}

                <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                  <p className="font-bold text-slate-300">By upgrading your account, you agree to:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Provide accurate registration & vehicle titles</li>
                    <li>Accept LuxeWay vehicle safety checklists</li>
                    <li>Keep schedule availability updated</li>
                  </ul>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full btn-gold py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-gold/25 hover:shadow-gold/35 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Upgrading...
                    </>
                  ) : (
                    <>
                      Upgrade to Host <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Calculator Section */}
        <div className="mt-12 glass border border-slate-200/50 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm bg-white dark:bg-slate-900">
          <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-2">Earnings Calculator</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">See how much you could earn by hosting your luxury vehicle</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Days Rented / Month</span>
                  <span className="text-amber-500 font-extrabold text-sm">{days} Days</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={28} 
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Price Per Day (₫)</span>
                  <span className="text-amber-500 font-extrabold text-sm">{formatCurrency(pricePerDay)}</span>
                </div>
                <input 
                  type="range" 
                  min={500000} 
                  max={5000000} 
                  step={100000}
                  value={pricePerDay}
                  onChange={e => setPricePerDay(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-250 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-center bg-[#0B1120] text-white p-6 rounded-3xl border border-white/5 text-center shadow-lg">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Estimated Monthly Earnings</span>
              <span className="text-4xl md:text-5xl font-black text-amber-500 tracking-tight mt-2">{formatCurrency(estimatedRevenue)}</span>
              <p className="text-[10px] text-slate-550 font-semibold mt-2">*Calculation based on typical occupancy and platform insurance split.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BecomeOwnerPage;
