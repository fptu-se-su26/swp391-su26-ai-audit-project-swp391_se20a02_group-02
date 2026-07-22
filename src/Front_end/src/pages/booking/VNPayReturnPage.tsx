import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Wallet, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';

export const VNPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const t = useT();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [bookingId, setBookingId] = useState<string>('');
  const [isTopUp, setIsTopUp] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        const response = await apiClient.get<any>(`/payments/vnpay/return?${query}`);

        // Backend returns ApiResponse<PaymentResponse>
        const paymentData = response.data || response;
        const isSuccess =
          response.success === true &&
          (paymentData?.status === 'succeeded' || paymentData?.status === 'SUCCEEDED');

        if (isSuccess) {
          setStatus('success');
          const bId = paymentData.bookingId || paymentData.booking?.id || '';
          const isTopUpTx = !bId || paymentData.transactionId?.startsWith('TOPUP');
          setIsTopUp(isTopUpTx);
          setBookingId(bId);
          setTransactionId(paymentData.transactionId || '');
          setAmount(paymentData.amount ? String(paymentData.amount) : '');
          toast.success(
            isTopUpTx ? t.paymentReturn.toastTopUpSuccess : t.paymentReturn.toastPaymentSuccess
          );
          // BUG-5 FIX: Auto-redirect 3s after success
          
          // --- Simulate Commission & Owner Revenue (90% to Owner) ---
          if (bId && !isTopUpTx) {
            try {
              const bookingRes = await apiClient.get<any>(`/bookings/${bId}`);
              const booking = bookingRes.data || bookingRes.booking || bookingRes;
              
              if (booking && booking.ownerId && booking.pricing?.total) {
                const ownerId = booking.ownerId;
                const ownerRevenue = booking.pricing.total * 0.9;
                
                const ownerRes = await apiClient.get<any>(`/users/${ownerId}`);
                const owner = ownerRes.data || ownerRes.user || ownerRes;
                
                const newBalance = (owner?.walletBalance || 0) + ownerRevenue;
                
                await apiClient.put(`/users/${ownerId}`, {
                  ...owner,
                  walletBalance: newBalance
                });
                console.log(`Successfully credited ${ownerRevenue} to owner ${ownerId}.`);
              }
            } catch (err) {
              console.error('Failed to credit owner revenue:', err);
            }
          }
          // --------------------------------------------------------

          setTimeout(() => {
            navigate(isTopUpTx ? '/dashboard/wallet' : (bId ? `/dashboard/bookings/${bId}` : '/dashboard/bookings'));
          }, 3000);
        } else {
          setStatus('failed');
          toast.error(
            t.paymentReturn.toastPaymentFailed,
            response.message || t.paymentReturn.toastPaymentFailedDesc
          );
        }
      } catch (err: any) {
        // Check if it's actually a success based on vnp_ResponseCode param
        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
          // VNPay says success but backend verification had issue
          setStatus('success');
          const txnRef = searchParams.get('vnp_TxnRef') || '';
          const isTopUpTx = txnRef.startsWith('TOPUP');
          setIsTopUp(isTopUpTx);
          setTransactionId(txnRef);
          toast.success(t.paymentReturn.toastPaymentSuccess);
          setTimeout(() => navigate(isTopUpTx ? '/dashboard/wallet' : '/dashboard/bookings'), 3000);
        } else {
          setStatus('failed');
          toast.error(t.paymentReturn.toastVerifyFailed, t.paymentReturn.toastVerifyFailedDesc);
        }
      }
    };

    verifyPayment();
  }, [searchParams, t]);

  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const isVi = t.common.loading.includes('Đang');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 50%, #F8FAFF 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full relative"
      >
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Top gradient line */}
          <div className="h-1.5 w-full"
            style={{
              background: status === 'loading'
                ? 'linear-gradient(90deg, #6366F1, #8B5CF6)'
                : status === 'success'
                ? 'linear-gradient(90deg, #10B981, #059669, #6366F1)'
                : 'linear-gradient(90deg, #EF4444, #DC2626)'
            }} />

          <div className="p-10 text-center space-y-6">
            {/* Loading state */}
            {status === 'loading' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{ border: '3px solid #EEF2FF', borderTopColor: '#6366F1' }}
                >
                  <Loader2 className="w-8 h-8 text-indigo-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.paymentReturn.verifying}</h2>
                  <p className="text-slate-500 text-sm">{t.paymentReturn.verifyingDesc}</p>
                </div>
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  ))}
                </div>
              </>
            )}

            {/* Success state */}
            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 180, delay: 0.1 }}
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' }}
                >
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-2xl font-bold mb-2"
                    style={{ background: 'linear-gradient(135deg, #1E293B, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {isTopUp ? t.paymentReturn.topUpSuccess : t.paymentReturn.paymentSuccess}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isTopUp ? t.paymentReturn.topUpSuccessDesc : t.paymentReturn.paymentSuccessDesc}
                  </p>
                </motion.div>

                {/* Transaction details */}
                {transactionId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 rounded-2xl p-4 text-left space-y-2"
                  >
                    {transactionId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isVi ? 'Mã giao dịch' : 'Transaction ID'}</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{transactionId.slice(-12).toUpperCase()}</span>
                      </div>
                    )}
                    {bookingId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isVi ? 'Mã đặt xe' : 'Booking ID'}</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">#{bookingId.slice(-8).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{isVi ? 'Trạng thái' : 'Status'}</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {isVi ? 'Thành công' : 'Confirmed'}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3"
                >
                  <button
                    onClick={() => navigate(isTopUp ? '/dashboard/wallet' : (bookingId ? `/dashboard/bookings/${bookingId}` : '/dashboard/bookings'))}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                  >
                    {isTopUp ? (
                      <><Wallet className="w-4 h-4" /> {t.paymentReturn.btnWallet}</>
                    ) : (
                      <>{t.paymentReturn.btnBookings} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    {isVi ? 'Về trang chủ' : 'Back to Home'}
                  </button>
                </motion.div>
              </>
            )}

            {/* Failed state */}
            {status === 'failed' && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 180, delay: 0.1 }}
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FEE2E2, #FECACA)' }}
                >
                  <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.paymentReturn.failed}</h2>
                  <p className="text-slate-500 text-sm">{t.paymentReturn.failedDesc}</p>
                  {vnpResponseCode && vnpResponseCode !== '00' && (
                    <p className="text-xs text-slate-400 mt-2">
                      {isVi ? `Mã lỗi VNPay: ${vnpResponseCode}` : `VNPay error code: ${vnpResponseCode}`}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isVi ? 'Thử lại thanh toán' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
                  >
                    {isVi ? 'Quay lại Marketplace' : 'Browse Vehicles'}
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* VNPay logo below card */}
        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          🔒 {isVi ? 'Bảo mật bởi VNPay · SSL 256-bit' : 'Secured by VNPay · 256-bit SSL'}
        </p>
      </motion.div>
    </div>
  );
};

export default VNPayReturnPage;
