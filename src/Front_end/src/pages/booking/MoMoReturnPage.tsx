import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Wallet, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';

export const MoMoReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const t = useT();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [bookingId, setBookingId] = useState<string>('');
  const [isTopUp, setIsTopUp] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        // Call backend to verify and finalize the payment
        const response = await apiClient.get<any>(`/payments/momo/return?${query}`);

        const paymentData = response.data || response;
        const isSuccess =
          response.success === true &&
          (paymentData?.status === 'succeeded' || paymentData?.status === 'SUCCEEDED');

        if (isSuccess) {
          setStatus('success');
          const isTopUpTx = !paymentData.bookingId || paymentData.transactionId?.startsWith('TOPUP');
          setIsTopUp(isTopUpTx);
          setBookingId(paymentData.bookingId || '');
          setTransactionId(paymentData.transactionId || searchParams.get('orderId') || '');
          setAmount(paymentData.amount || searchParams.get('amount') || '');
          toast.success(isTopUpTx
            ? (isVi ? 'Nạp tiền thành công!' : 'Wallet top-up successful!')
            : (isVi ? 'Thanh toán thành công!' : 'Payment successful!'));
        } else {
          setStatus('failed');
          toast.error(
            isVi ? 'Thanh toán thất bại' : 'Payment failed',
            response.message || (isVi ? 'Giao dịch không được hoàn thành.' : 'Transaction was not completed.')
          );
        }
      } catch (err: any) {
        // Fallback: check resultCode from MoMo redirect params
        const resultCode = searchParams.get('resultCode');
        if (resultCode === '0') {
          setStatus('success');
          const orderId = searchParams.get('orderId') || '';
          const isTopUpTx = orderId.startsWith('TOPUP');
          setIsTopUp(isTopUpTx);
          setTransactionId(orderId);
          setAmount(searchParams.get('amount') || '');
          toast.success(isVi ? 'Thanh toán thành công!' : 'Payment successful!');
        } else {
          setStatus('failed');
          toast.error(
            isVi ? 'Không thể xác minh giao dịch' : 'Cannot verify transaction',
            isVi ? 'Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.' : 'Please contact support if money was deducted.'
          );
        }
      }
    };

    verifyPayment();
  }, [searchParams]);

  const momoResultCode = searchParams.get('resultCode');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF0F6 0%, #FCE4F0 50%, #FFF0F6 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #E91E8C 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full relative"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-pink-100 shadow-2xl shadow-pink-900/10 overflow-hidden">
          {/* Top gradient line */}
          <div className="h-1.5 w-full"
            style={{
              background: status === 'loading'
                ? 'linear-gradient(90deg, #E91E8C, #C2185B)'
                : status === 'success'
                ? 'linear-gradient(90deg, #10B981, #059669, #E91E8C)'
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
                  style={{ border: '3px solid #FCE4F0', borderTopColor: '#E91E8C' }}
                >
                  <Loader2 className="w-8 h-8" style={{ color: '#E91E8C' }} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {isVi ? 'Đang xác nhận giao dịch...' : 'Verifying transaction...'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isVi
                      ? 'Vui lòng chờ trong giây lát khi chúng tôi xác nhận giao dịch với MoMo.'
                      : 'Please wait while we confirm your payment with MoMo.'}
                  </p>
                </div>
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#E91E8C' }}
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
                    style={{ background: 'linear-gradient(135deg, #1E293B, #E91E8C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {isTopUp
                      ? (isVi ? 'Nạp tiền thành công!' : 'Top-up Successful!')
                      : (isVi ? 'Thanh toán thành công!' : 'Payment Successful!')}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isTopUp
                      ? (isVi ? 'Số dư ví LuxeWay của bạn đã được cộng.' : 'Your LuxeWay wallet has been credited.')
                      : (isVi ? 'Đặt xe của bạn đã được xác nhận thành công.' : 'Your booking has been confirmed successfully.')}
                  </p>
                </motion.div>

                {/* Transaction details */}
                {transactionId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-left space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{isVi ? 'Mã giao dịch' : 'Transaction ID'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">{transactionId.slice(-12).toUpperCase()}</span>
                    </div>
                    {bookingId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isVi ? 'Mã đặt xe' : 'Booking ID'}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">#{bookingId.slice(-8).toUpperCase()}</span>
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
                    onClick={() => navigate(isTopUp ? '/dashboard/wallet' : '/dashboard/bookings')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                  >
                    {isTopUp ? (
                      <><Wallet className="w-4 h-4" /> {isVi ? 'Xem ví' : 'View Wallet'}</>
                    ) : (
                      <>{isVi ? 'Xem đặt xe của tôi' : 'My Bookings'} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
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
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {isVi ? 'Thanh toán thất bại' : 'Payment Failed'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isVi ? 'Giao dịch MoMo của bạn không được hoàn thành.' : 'Your MoMo transaction was not completed.'}
                  </p>
                  {momoResultCode && momoResultCode !== '0' && (
                    <p className="text-xs text-slate-400 mt-2">
                      {isVi ? `Mã lỗi MoMo: ${momoResultCode}` : `MoMo error code: ${momoResultCode}`}
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
                    style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isVi ? 'Thử lại thanh toán' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
                  >
                    {isVi ? 'Quay lại Marketplace' : 'Browse Vehicles'}
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* MoMo branding below card */}
        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          🔒 {isVi ? 'Bảo mật bởi MoMo · SSL 256-bit' : 'Secured by MoMo · 256-bit SSL'}
        </p>
      </motion.div>
    </div>
  );
};

export default MoMoReturnPage;
