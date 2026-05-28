import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        const response = await apiClient.get<any>(`/payments/vnpay/return?${query}`);
        
        if (response.success && response.data?.status === 'succeeded') {
          setStatus('success');
          const isTopUpTx = !response.data.bookingId || response.data.transactionId?.startsWith('TOPUP');
          setIsTopUp(isTopUpTx);
          setBookingId(response.data.bookingId || '');
          toast.success(
            isTopUpTx ? t.paymentReturn.toastTopUpSuccess : t.paymentReturn.toastPaymentSuccess
          );
        } else {
          setStatus('failed');
          toast.error(
            t.paymentReturn.toastPaymentFailed,
            t.paymentReturn.toastPaymentFailedDesc
          );
        }
      } catch (err) {
        setStatus('failed');
        toast.error(
          t.paymentReturn.toastVerifyFailed,
          t.paymentReturn.toastVerifyFailedDesc
        );
      }
    };

    verifyPayment();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full luxury-card p-8 text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-[#0F172A]">{t.paymentReturn.verifying}</h2>
            <p className="text-slate-500">{t.paymentReturn.verifyingDesc}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-success">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {isTopUp ? t.paymentReturn.topUpSuccess : t.paymentReturn.paymentSuccess}
            </h2>
            <p className="text-slate-500">
              {isTopUp ? t.paymentReturn.topUpSuccessDesc : t.paymentReturn.paymentSuccessDesc}
            </p>
            <button
              onClick={() => navigate(isTopUp ? '/dashboard/wallet' : '/dashboard/bookings')}
              className="btn-primary w-full py-3"
            >
              {isTopUp ? t.paymentReturn.btnWallet : t.paymentReturn.btnBookings}
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-danger">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">{t.paymentReturn.failed}</h2>
            <p className="text-slate-500">{t.paymentReturn.failedDesc}</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="btn-primary w-full py-3"
            >
              {t.paymentReturn.btnMarketplace}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VNPayReturnPage;
