import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CreditCard, DollarSign, FileText, Landmark,
  Sparkles, ChevronRight, Send, HelpCircle, CheckCircle2,
  Clock, ArrowUpRight, BarChart3, Receipt
} from 'lucide-react';
import { ownerRequestService } from '@/services/helpService';
import { useT } from '@/i18n/translations';
import { useAuthStore } from '@/store';

export const OwnerSuccessHub: React.FC = () => {
  const t = useT();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'payouts' | 'claims' | 'tax' | 'tickets'>('payouts');
  
  // Submit ticket state
  const [requestType, setRequestType] = useState('PAYOUT');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch host requests
  const loadRequests = async () => {
    try {
      const res = await ownerRequestService.getMyOwnerRequests();
      setTickets(res);
    } catch (err) {
      console.error("Failed to load host requests:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await ownerRequestService.submitOwnerRequest({
        requestType,
        subject,
        details
      });
      if (res) {
        setSuccessMsg("Support request submitted to Host Relations. A manager will review your ticket within 12 hours.");
        setSubject('');
        setDetails('');
        loadRequests();
      }
    } catch (err) {
      console.error("Failed to submit host request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'payouts', label: t.help.payoutSettings || 'Payouts & Banking', icon: CreditCard },
    { id: 'claims', label: t.help.insuranceClaims || 'Allianz Claims', icon: Shield },
    { id: 'tax', label: t.help.taxInvoicing || 'Tax & Revenue', icon: FileText },
    { id: 'tickets', label: 'Host Relations Tickets', icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hub Header */}
        <div className="mb-10 text-center relative py-10 bg-gradient-to-b from-amber-950/20 to-transparent border border-amber-500/10 rounded-[35px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_60%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center border border-amber-400/40 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              {t.help.ownerSuccess || 'Host Success Hub'}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-2 px-4">
              {t.help.ownerSuccessSubtitle || 'Enterprise host operations panel. Configure bank withdrawals, audit payouts, download monthly invoices, or open high-priority support claims.'}
            </p>
          </div>
        </div>

        {/* Outer Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 whitespace-nowrap scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-550/20 to-amber-500/5 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-950/10'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Core Content Area */}
          <div className="flex-1 min-h-[400px]">
            {activeTab === 'payouts' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t.help.payoutSettings || 'Payout Settings & Configuration'}
                  </h3>
                  <p className="text-slate-500 text-xs">Configure your banking destination and audit platform commissions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-900 bg-slate-950/80 rounded-2xl p-5 flex items-start gap-4">
                    <Landmark className="w-10 h-10 text-amber-500/80" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Bank Payout Destination</h4>
                      <p className="text-slate-400 text-xs mt-1">Stripe Connected Express account: **Active**</p>
                      <button className="text-amber-500 hover:text-amber-400 text-[11px] font-bold uppercase tracking-wider mt-3 flex items-center gap-1 cursor-pointer">
                        Manage Stripe <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-900 bg-slate-950/80 rounded-2xl p-5 flex items-start gap-4">
                    <DollarSign className="w-10 h-10 text-amber-500/80" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.help.platformCommission || 'Platform Commission'}</h4>
                      <p className="text-slate-400 text-xs mt-1">LuxeWay standard host commission plan: **15%** flat fee per trip booking.</p>
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded mt-3 uppercase tracking-wider">
                        Premium Plan Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earnings card mockup */}
                <div className="border border-slate-900 bg-gradient-to-r from-slate-950/80 to-slate-900/40 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Host Revenue (June 2026)</span>
                    <h2 className="text-3xl font-black text-amber-400 mt-1">₫78,540,000</h2>
                    <p className="text-slate-500 text-xs mt-1">Next payout scheduled: **June 15, 2026**</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-tr from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-950/20 border border-amber-400/40 cursor-pointer">
                    Request Early Withdrawal
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'claims' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t.help.insuranceClaims || 'Allianz Protection & Damage Claims'}
                  </h3>
                  <p className="text-slate-500 text-xs">File post-trip insurance reports under the Allianz partnership plan.</p>
                </div>

                {/* Claims list mockup */}
                <div className="space-y-3">
                  <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs">
                        🛡️
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Claim: CLM-8921-X</h4>
                        <p className="text-slate-500 text-[10px] mt-0.5">Booking: #BK-7821 | BMW M4 (Minor scratches)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Under Audit
                      </span>
                      <span className="text-slate-500 text-[9px] block mt-1">Submitted 2 days ago</span>
                    </div>
                  </div>

                  <div className="border border-slate-900 bg-slate-950/60 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs">
                        🛡️
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Claim: CLM-7832-B</h4>
                        <p className="text-slate-500 text-[10px] mt-0.5">Booking: #BK-6211 | Ducati V4S (Bumper scratch)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Paid out
                      </span>
                      <span className="text-slate-500 text-[9px] block mt-1">₫14,200,000 paid</span>
                    </div>
                  </div>
                </div>

                <div className="border border-amber-500/15 bg-amber-500/5 rounded-2xl p-4 flex gap-3 text-amber-400/90 text-xs">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <p>
                    <strong>Host Protection Note:</strong> Allianz claims must be submitted within 24 hours of the trip termination. Please upload high-resolution checkout photos detailing vehicle conditions.
                  </p>
                </div>

                <button className="w-full py-3 border border-dashed border-amber-500/35 hover:border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                  + Launch New Damage Claim
                </button>
              </motion.div>
            )}

            {activeTab === 'tax' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t.help.taxInvoicing || 'Tax Invoices & Revenue Statements'}
                  </h3>
                  <p className="text-slate-500 text-xs">Download official platform statements and tax documentation.</p>
                </div>

                {/* Tax lists */}
                <div className="space-y-2">
                  {[
                    { month: "May 2026", revenue: "₫92,400,000", commission: "₫13,860,000", file: "INV-2026-05.pdf" },
                    { month: "April 2026", revenue: "₫61,200,000", commission: "₫9,180,000", file: "INV-2026-04.pdf" },
                    { month: "March 2026", revenue: "₫105,800,000", commission: "₫15,870,000", file: "INV-2026-03.pdf" }
                  ].map((inv, i) => (
                    <div key={i} className="border border-slate-900 bg-slate-950/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-slate-400" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{inv.month} Revenue Statement</h4>
                          <p className="text-slate-500 text-[10px] mt-0.5">Gross: {inv.revenue} | Commission Paid: {inv.commission}</p>
                        </div>
                      </div>
                      <button className="text-amber-500 hover:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer">
                        Download PDF <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tickets' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Host Relations Portal
                  </h3>
                  <p className="text-slate-500 text-xs">Direct support pipeline for payouts, payouts audits, commission tiers, and listing validation issues.</p>
                </div>

                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p>{successMsg}</p>
                  </div>
                )}

                {/* Submit Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Request Type</label>
                      <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="PAYOUT">Payout Audit & Status</option>
                        <option value="COMMISSION">Commission Tiers</option>
                        <option value="INSURANCE">Allianz Claims Disputes</option>
                        <option value="TAX">Tax Invoice & Reports</option>
                        <option value="LISTING">Listing Performance Audit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Briefly summarize your request..."
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Detailed Explanation</label>
                    <textarea
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Please clarify in details (booking references, payment dates, bank numbers etc.)..."
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Submit Host Request'}
                  </button>
                </form>

                {/* Ticket history */}
                <div className="border-t border-slate-900 pt-6">
                  <h4 className="text-sm font-bold text-white mb-4">Your Active Relations Tickets</h4>
                  {tickets.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No tickets found.</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((t: any) => (
                        <div key={t.id} className="border border-slate-900 bg-slate-950/80 rounded-2xl p-4 flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-amber-500 text-[8px] font-bold rounded">
                                {t.requestType}
                              </span>
                              <h5 className="text-white text-xs font-bold">{t.subject}</h5>
                            </div>
                            <p className="text-slate-500 text-[10px] mt-1">{t.details}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              t.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                              t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {t.status}
                            </span>
                            <span className="text-[9px] text-slate-500 block mt-1">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
