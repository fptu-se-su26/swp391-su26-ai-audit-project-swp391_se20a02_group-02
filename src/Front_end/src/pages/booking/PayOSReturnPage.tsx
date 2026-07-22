import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle, Home, Loader2, RotateCcw, Wallet, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/translations';

export const PayOSReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const t = useT();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [bookingId, setBookingId] = useState('');
  const [isTopUp, setIsTopUp] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');

  const isVi = t.common.loading.includes('Đang');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        const response = await apiClient.get<any>(`/payments/payos/return?${query}`);
        const paymentData = response.data || response;
        const isSuccess =
          response.success === true &&
          (paymentData?.status === 'succeeded' || paymentData?.status === 'SUCCEEDED');

        if (isSuccess) {
          const bId = paymentData.bookingId || paymentData.booking?.id || '';
          const topUpTx = !bId;
          setStatus('success');
          setIsTopUp(topUpTx);
          setBookingId(bId);
          setTransactionId(paymentData.transactionId || searchParams.get('orderCode') || '');
          setAmount(paymentData.amount ? String(paymentData.amount) : searchParams.get('amount') || '');
          toast.success(topUpTx
            ? (isVi ? 'Nạp tiền thành công!' : 'Wallet top-up successful!')
            : (isVi ? 'Thanh toán thành công!' : 'Payment successful!'));

          // --- Simulate Commission & Owner Revenue (90% to Owner) ---
          if (bId && !topUpTx) {
            try {
              // 1. Fetch booking to get Owner ID and Total Price
              const bookingRes = await apiClient.get<any>(`/bookings/${bId}`);
              const booking = bookingRes.data || bookingRes.booking || bookingRes;
              
              if (booking && booking.ownerId && booking.pricing?.total) {
                const ownerId = booking.ownerId;
                // Owner gets 90%
                const ownerRevenue = booking.pricing.total * 0.9;
                
                // 2. Fetch current owner balance
                const ownerRes = await apiClient.get<any>(`/users/${ownerId}`);
                const owner = ownerRes.data || ownerRes.user || ownerRes;
                
                const currentBalance = owner?.walletBalance || 0;
                const newBalance = currentBalance + ownerRevenue;
                
                // 3. Update owner balance
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

          // AUTO REDIRECT: 3s countdown then navigate
          setTimeout(() => {
            if (topUpTx) {
              navigate('/dashboard/wallet');
            } else if (bId) {
              navigate(`/dashboard/bookings/${bId}`);
            } else {
              navigate('/dashboard/bookings');
            }
          }, 3000);

        } else {
          setStatus('failed');
          toast.error(
            isVi ? 'Thanh toán chưa hoàn tất' : 'Payment not completed',
            response.message || (isVi ? 'PayOS chưa xác nhận giao dịch này.' : 'PayOS has not confirmed this transaction.')
          );
        }
      } catch (err: any) {
        // Fallback: check PayOS status param from URL
        const payosStatus = searchParams.get('status');
        const orderCode = searchParams.get('orderCode') || '';
        if (payosStatus === 'PAID') {
          const topUpTx = orderCode.startsWith('TOPUP');
          setStatus('success');
          setIsTopUp(topUpTx);
          setTransactionId(orderCode);
          setAmount(searchParams.get('amount') || '');
          toast.success(isVi ? 'Thanh toán thành công!' : 'Payment successful!');
          setTimeout(() => navigate(topUpTx ? '/dashboard/wallet' : '/dashboard/bookings'), 3000);
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
  }, [searchParams, navigate]);

  const payosStatus = searchParams.get('status');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full relative"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-sky-100 shadow-2xl shadow-sky-900/10 overflow-hidden">
          <div className={`h-1.5 w-full ${
            status === 'loading'
              ? 'bg-sky-500'
              : status === 'success'
              ? 'bg-emerald-500'
              : 'bg-red-500'
          }`} />

          <div className="p-10 text-center space-y-6">
            {status === 'loading' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 border-sky-100 border-t-sky-500"
                >
                  <Loader2 className="w-8 h-8 text-sky-600" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {isVi ? 'Đang xác nhận giao dịch...' : 'Verifying transaction...'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isVi ? 'Chúng tôi đang kiểm tra trạng thái thanh toán với PayOS.' : 'We are checking the payment status with PayOS.'}
                  </p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-emerald-100">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {isTopUp ? (isVi ? 'Nạp tiền thành công!' : 'Top-up Successful!') : (isVi ? 'Thanh toán thành công!' : 'Payment Successful!')}
                  </h2>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-2">
                    {isVi ? 'Tự động chuyển hướng sau 3 giây...' : 'Redirecting in 3 seconds...'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {isTopUp
                      ? (isVi ? 'Số dư ví LuxeWay của bạn đã được cộng.' : 'Your LuxeWay wallet has been credited.')
                      : (isVi ? 'Đặt xe của bạn đã được xác nhận thành công.' : 'Your booking has been confirmed successfully.')}
                  </p>
                </div>

                {transactionId && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{isVi ? 'Mã giao dịch' : 'Transaction ID'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">{transactionId}</span>
                    </div>
                    {bookingId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isVi ? 'Mã đặt xe' : 'Booking ID'}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">#{bookingId.slice(-8).toUpperCase()}</span>
                      </div>
                    )}
                    {amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isVi ? 'Số tiền' : 'Amount'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{amount}</span>
                      </div>
                    )}
                  </div>
                )}

              <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(isTopUp ? '/dashboard/wallet' : (bookingId ? `/dashboard/bookings/${bookingId}` : '/dashboard/bookings'))}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-lg hover:bg-sky-700 transition-colors"
                  >
                    {isTopUp ? <><Wallet className="w-4 h-4" /> {isVi ? 'Đến ví ngay' : 'Go to Wallet Now'}</> : <>{isVi ? 'Xem đơn đặt xe' : 'View Booking'} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    {isVi ? 'Về trang chủ' : 'Back to Home'}
                  </button>
                </div>
              </>
            )}

            {status === 'failed' && (
              <>
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-red-100">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {isVi ? 'Thanh toán thất bại' : 'Payment Failed'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isVi ? 'Giao dịch PayOS của bạn chưa được hoàn tất.' : 'Your PayOS transaction was not completed.'}
                  </p>
                  {payosStatus && (
                    <p className="text-xs text-slate-400 mt-2">PayOS status: {payosStatus}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-lg"
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
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> {isVi ? 'Bảo mật bởi PayOS' : 'Secured by PayOS'}
        </p>
      </motion.div>
    </div>
  );
};

export default PayOSReturnPage;
