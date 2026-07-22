import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CalendarDays, Car, CheckCircle2, CreditCard, ExternalLink, FileSignature, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { contractService, DigitalContract } from '@/services/contractService';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils';
import type { Booking } from '@/types';

const DigitalContractPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const { language, theme } = useUIStore();
  const isDark = theme === 'dark';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [contract, setContract] = useState<DigitalContract | null>(null);
  const [signature, setSignature] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role?.toLowerCase();
  const isOwner = role === 'owner';
  const activeSignerLabel = isOwner ? 'Owner signature' : 'Renter signature';
  const hasSigned = isOwner ? !!contract?.ownerSignedAt : !!contract?.renterSignedAt;
  const bookingStatus = String(booking?.status || '').toLowerCase();
  const renterCanPay = !isOwner && !!contract?.renterSignedAt && ['waiting_payment', 'payment_rejected'].includes(bookingStatus);
  const paymentMethod = searchParams.get('method') === 'bank_transfer' ? 'bank_transfer' : 'payos';
  const docusealEmbedUrl = contract?.currentSignerEmbedUrl || (isOwner ? contract?.docusealOwnerEmbedUrl : contract?.docusealRenterEmbedUrl);
  const docusealEnabled = !!docusealEmbedUrl;

  const statusText = useMemo(() => {
    if (!contract) return 'Preparing';
    if (contract.isFullySigned) return 'Fully signed';
    if (contract.renterSignedAt && !contract.ownerSignedAt) return 'Waiting for owner';
    if (contract.ownerSignedAt && !contract.renterSignedAt) return 'Waiting for renter';
    return 'Awaiting signatures';
  }, [contract]);

  const nextActionText = useMemo(() => {
    if (!contract) return '';
    if (isOwner) {
      if (!contract.renterSignedAt) return 'The renter has not signed yet. You can review this booking again after the renter signs.';
      if (!contract.ownerSignedAt) return 'The renter signature is recorded. Please sign as owner to complete the official rental contract.';
      return 'Owner signature is recorded. No further owner action is required for the contract.';
    }
    if (!contract.renterSignedAt) return 'Sign as renter first. After your renter signature is recorded, you can pay immediately.';
    if (renterCanPay) return 'Your signature is recorded. You can proceed to payment now; owner signature can be completed later from the owner portal.';
    if (!contract.ownerSignedAt) return 'Your signature is recorded. Waiting for the owner to sign the contract.';
    return 'Both signatures are recorded.';
  }, [contract, isOwner, renterCanPay]);

  useEffect(() => {
    if (!bookingId) return;

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const bookingData = await bookingService.getById(bookingId);
        if (!mounted) return;

        if (!bookingData) {
          toast.error('Booking not found', 'Please open the contract from a valid booking.');
          return;
        }

        setBooking(bookingData);
        const contractData = await contractService.ensureForBooking(bookingId);
        if (mounted) setContract(contractData);
        if (mounted && searchParams.get('signed') === 'docuseal') {
          toast.success('Signature submitted', 'DocuSeal returned to LuxeWay. Refreshing contract status.');
        }
      } catch (error: any) {
        toast.error('Contract unavailable', error?.message || 'Unable to prepare the digital contract.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [bookingId]);

  const refreshContract = async () => {
    if (!bookingId) return;
    setRefreshing(true);
    try {
      const updated = await contractService.getByBooking(bookingId);
      if (updated) {
        setContract(updated);
        const signedNow = isOwner ? !!updated.ownerSignedAt : !!updated.renterSignedAt;
        if (signedNow) {
          toast.success('Contract status updated', 'DocuSeal signature has been recorded in LuxeWay.');
        } else {
          toast.info('Still waiting', 'Complete the DocuSeal signing flow, then refresh again.');
        }
      }
    } catch (error: any) {
      toast.error('Refresh failed', error?.message || 'Unable to refresh DocuSeal status.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSign = async () => {
    if (!contract || !signature.trim()) {
      toast.error('Signature required', 'Enter your full name before signing.');
      return;
    }

    setSigning(true);
    try {
      const signed = await contractService.sign(contract.id, signature.trim());
      setContract(signed);
      toast.success('Contract signed', `${activeSignerLabel} has been recorded.`);
    } catch (error: any) {
      toast.error('Signing failed', error?.message || 'The contract could not be signed.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-28 flex items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Preparing digital contract...</p>
        </div>
      </div>
    );
  }

  if (!booking || !contract) {
    return (
      <div className={`min-h-screen pt-28 flex items-center justify-center px-4 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full rounded-2xl border border-red-200/40 bg-white dark:bg-slate-900 p-8 text-center shadow-xl">
          <FileSignature className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-black mb-2">Contract not available</h1>
          <p className="text-sm text-slate-500 mb-6">The booking could not be loaded for electronic signing.</p>
          <button onClick={() => navigate('/dashboard/bookings')} className="btn-primary w-full py-3 justify-center">
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Link to="/dashboard/bookings" className="text-xs font-black uppercase tracking-wider text-amber-600">
            My bookings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <FileSignature className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">LuxeWay electronic rental agreement</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">Digital Contract</h1>
                <p className="text-sm text-slate-500 mt-2">Booking {booking.bookingCode || booking.id}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                contract.isFullySigned
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
              }`}>
                {statusText}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <Car className="w-5 h-5 text-amber-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</p>
                  <p className="font-bold mt-1">{booking.vehicle?.brand} {booking.vehicle?.name}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <CalendarDays className="w-5 h-5 text-blue-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rental period</p>
                  <p className="font-bold mt-1">{booking.startDate} to {booking.endDate}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total payment</p>
                  <p className="font-bold mt-1">{formatCurrency(booking.pricing?.total || 0, language)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                <h2 className="font-display text-lg font-black mb-4">Agreement terms</h2>
                <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>1. The renter accepts responsibility for vehicle pickup, return timing, traffic penalties, and any damages not covered by the selected insurance package.</p>
                  <p>2. The owner confirms the vehicle is available, roadworthy, insured, and matches the listing details shown at the time of booking.</p>
                  <p>3. LuxeWay records both signatures with timestamp evidence. The contract becomes effective only after both renter and owner signatures are recorded.</p>
                  <p>4. Payment and deposit handling follow the booking record and platform payment verification status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SignatureStatus
                  title="Renter"
                  name={booking.renter?.displayName || booking.renter?.email || 'Renter account'}
                  signedAt={contract.renterSignedAt}
                  signature={contract.renterSignature}
                />
                <SignatureStatus
                  title="Owner"
                  name={(booking as any).owner?.displayName || (booking as any).owner?.email || 'Owner account'}
                  signedAt={contract.ownerSignedAt}
                  signature={contract.ownerSignature}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            {docusealEnabled && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden lg:hidden">
                <DocuSealFrame embedUrl={docusealEmbedUrl!} />
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-sm">Sign as {isOwner ? 'owner' : 'renter'}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {hasSigned ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-black text-sm">Your signature is recorded</p>
                    <p className="text-xs opacity-80 mt-1">
                      {nextActionText}
                    </p>
                  </div>
                </div>
                  {renterCanPay && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10 p-4 space-y-3">
                      <div>
                        <p className="text-sm font-black text-amber-800 dark:text-amber-200">Choose your payment timing</p>
                        <p className="text-xs text-amber-700/80 dark:text-amber-200/75 mt-1">
                          Your renter signature is recorded. Pay now to submit this booking for review, or pay later from My Bookings.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/booking/${booking.id}/payment?method=${paymentMethod}`)}
                        className="btn-primary w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay now
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Payment saved for later', 'This booking remains in Waiting Payment. You can pay from My Bookings anytime before it expires.');
                          navigate('/dashboard/bookings');
                        }}
                        className="btn-outline w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        Pay later - return to My Bookings
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {docusealEnabled ? (
                    <>
                      <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 p-4">
                        <p className="font-black text-sm">DocuSeal signing is ready</p>
                        <p className="text-xs mt-1 opacity-80">{nextActionText} After finishing in DocuSeal, refresh status here.</p>
                      </div>
                      <a
                        href={docusealEmbedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open DocuSeal in new tab
                      </a>
                      <button
                        onClick={refreshContract}
                        disabled={refreshing}
                        className="btn-primary w-full py-3 justify-center inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'I signed, refresh status'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 p-4">
                        <p className="font-black text-sm">
                          {contract.docusealStatus === 'configuration_error' ? 'DocuSeal template needs signing fields' : 'DocuSeal is not configured'}
                        </p>
                        <p className="text-xs mt-1 opacity-80">
                          {contract.docusealStatus === 'configuration_error'
                            ? 'The DocuSeal template/API is reachable, but no signer fields are available. Use LuxeWay local signing for this demo, then add fields in DocuSeal to enable embedded signing.'
                            : 'Using LuxeWay local signature until the DocuSeal token/template is available to the backend.'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                          Type full name
                        </label>
                        <input
                          value={signature}
                          onChange={(event) => setSignature(event.target.value)}
                          className="lux-input w-full"
                          placeholder="Full legal name"
                        />
                      </div>
                      <button
                        onClick={handleSign}
                        disabled={signing || !signature.trim()}
                        className="btn-primary w-full py-3 justify-center disabled:opacity-50"
                      >
                        {signing ? 'Signing...' : 'Sign contract'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-black text-sm mb-3">Audit evidence</h3>
              <div className="space-y-3 text-xs text-slate-500">
                <p>Contract ID: <span className="font-mono text-slate-800 dark:text-slate-200">#{contract.id}</span></p>
                {contract.docusealSubmissionId && (
                  <p>DocuSeal Submission: <span className="font-mono text-slate-800 dark:text-slate-200">#{contract.docusealSubmissionId}</span></p>
                )}
                <p>Created: <span className="font-mono text-slate-800 dark:text-slate-200">{contract.createdAt || 'N/A'}</span></p>
                <p>Status: <span className="font-black text-slate-800 dark:text-slate-200">{statusText}</span></p>
              </div>
            </div>
          </aside>
        </div>

        {docusealEnabled && (
          <section className="hidden lg:block mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <DocuSealFrame embedUrl={docusealEmbedUrl!} />
          </section>
        )}
      </div>
    </div>
  );
};

const DocuSealFrame: React.FC<{ embedUrl: string }> = ({ embedUrl }) => {
  useEffect(() => {
    const scriptId = 'docuseal-form-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.docuseal.com/js/form.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">DocuSeal embedded signing</p>
          <h2 className="font-display text-lg font-black mt-1">Sign the official rental contract</h2>
        </div>
        <a href={embedUrl} target="_blank" rel="noreferrer" className="btn-outline px-3 py-2 text-xs inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      </div>
      <div className="min-h-[760px] bg-white">
        {React.createElement('docuseal-form', {
          'data-src': embedUrl,
          style: { display: 'block', width: '100%', minHeight: '760px' },
        })}
      </div>
    </div>
  );
};

const SignatureStatus: React.FC<{
  title: string;
  name: string;
  signedAt?: string | null;
  signature?: string | null;
}> = ({ title, name, signedAt, signature }) => {
  const signed = !!signedAt;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="font-bold mt-1">{name}</p>
        </div>
        {signed ? <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <FileSignature className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </div>
      <div className={`mt-4 rounded-lg px-3 py-2 text-xs ${signed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-50 text-slate-500 dark:bg-slate-950'}`}>
        {signed ? (
          <>
            <p className="font-black">{signature}</p>
            <p className="mt-1 opacity-80">{signedAt}</p>
          </>
        ) : (
          <p className="font-bold">Signature pending</p>
        )}
      </div>
    </div>
  );
};

export default DigitalContractPage;
