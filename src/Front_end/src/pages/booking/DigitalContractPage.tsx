import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Shield, Pencil, Key, ArrowRight } from 'lucide-react';
import { contractService, DigitalContract } from '@/services/contractService';
import { bookingService } from '@/services/bookingService';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';

const DigitalContractPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const isVi = language === 'vi';
  const toast = useToast();

  const [contract, setContract] = useState<DigitalContract | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!bookingId || !user) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load booking details first
        const bookingData = await bookingService.getById(bookingId);
        setBooking(bookingData);

        // Then load contract
        let contractData = await contractService.getContractByBooking(bookingId);
        
        // Auto-create for demo purposes if not found
        if (!contractData) {
          contractData = await contractService.createContract(bookingId, `https://luxeway.io.vn/contracts/${bookingId}.pdf`);
        }
        setContract(contractData);
      } catch (error) {
        console.error(error);
        // Fallback for demo
        try {
           const newData = await contractService.createContract(bookingId!, `https://luxeway.io.vn/contracts/${bookingId}.pdf`);
           setContract(newData);
        } catch (innerError) {
           toast.error(isVi ? 'Không thể tải hợp đồng số' : 'Failed to load digital contract');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [bookingId, user, isVi, toast]);

  const handleSign = async () => {
    if (!signature.trim()) {
      toast.error(isVi ? 'Vui lòng nhập chữ ký' : 'Please enter your signature');
      return;
    }
    if (!contract || !bookingId) return;
    
    setIsSubmitting(true);
    try {
      await contractService.signContract(contract.id, signature);
      toast.success(isVi ? 'Đã ký hợp đồng thành công!' : 'Contract signed successfully!');
      
      // Navigate to Payment immediately
      navigate(`/booking/${bookingId}/payment`);
    } catch (error) {
      toast.error(isVi ? 'Lỗi khi ký hợp đồng' : 'Failed to sign contract');
      setIsSubmitting(false); // Only set false on error, if success we are navigating away
    }
  };

  const isOwner = user?.role === 'owner';
  const hasSigned = isOwner ? !!contract?.ownerSignature : !!contract?.renterSignature;

  // Use either booking vehicle info or fallback
  const vehicleName = booking?.vehicle?.brand && booking?.vehicle?.model 
    ? `${booking.vehicle.brand} ${booking.vehicle.model}` 
    : 'Selected Vehicle';
    
  const customerName = user?.displayName || user?.firstName + ' ' + user?.lastName || 'Customer';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E17] py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-200" />
              <span className="text-blue-100 font-medium text-sm tracking-wider uppercase">LuxeWay Secure Gateway</span>
            </div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" />
              {isVi ? 'Hợp Đồng Thuê Xe Điện Tử' : 'Digital Rental Agreement'}
            </h2>
            <p className="text-blue-100 mt-2 opacity-90 text-lg">
              Booking ID: <span className="font-mono bg-black/20 px-2 py-1 rounded">#{bookingId?.slice(-6).toUpperCase()}</span>
            </p>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Contract Content */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 mb-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-6 text-center">
                    {isVi ? 'HỢP ĐỒNG THUÊ XE' : 'VEHICLE RENTAL AGREEMENT'}
                  </h3>
                  
                  <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                      {isVi 
                        ? <>Hợp đồng thuê xe này ("Hợp đồng") được lập giữa Chủ xe và Người thuê (<strong>{customerName}</strong>) về việc thuê phương tiện: <strong>{vehicleName}</strong>.</>
                        : <>This Vehicle Rental Agreement (the "Agreement") is entered into by and between the Vehicle Owner and the Renter (<strong>{customerName}</strong>) for the rental of the vehicle: <strong>{vehicleName}</strong>.</>}
                    </p>
                    
                    <div className="space-y-4">
                      <p>
                        <strong>1. {isVi ? 'Điều khoản thuê' : 'Rental Terms'}:</strong> {isVi ? 'Người thuê đồng ý thuê xe trong thời gian đã chỉ định và hoàn trả xe trong cùng tình trạng như khi nhận. Mọi hư hỏng phát sinh trong thời gian thuê sẽ do Người thuê chịu trách nhiệm.' : 'The Renter agrees to rent the vehicle for the specified duration and return it in the same condition as received. Any damages incurred during the rental period will be the Renter\'s liability.'}
                      </p>
                      
                      <p>
                        <strong>2. {isVi ? 'Thanh toán' : 'Payments'}:</strong> {isVi ? 'Người thuê đồng ý thanh toán tất cả các khoản phí liên quan đến việc thuê xe như hiển thị lúc thanh toán.' : 'The Renter agrees to pay all fees associated with the rental as displayed at checkout.'}
                      </p>
                      
                      <p>
                        <strong>3. {isVi ? 'Bảo hiểm & Trách nhiệm' : 'Insurance & Liability'}:</strong> {isVi ? 'Xe được bảo hiểm theo chính sách tiêu chuẩn của LuxeWay. Người thuê chịu trách nhiệm về bất kỳ khoản khấu trừ hoặc thiệt hại nào không được bảo hiểm chi trả.' : 'The vehicle is covered by LuxeWay\'s standard insurance policy. The Renter is responsible for any deductible or damages not covered by insurance.'}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
                      <p className="italic text-sm">
                        {isVi 
                          ? 'Bằng việc cung cấp chữ ký điện tử dưới đây, bạn ràng buộc về mặt pháp lý với các điều khoản của hợp đồng này theo Luật Giao dịch Điện tử.' 
                          : 'By providing your digital signature below, you legally bind yourself to the terms of this agreement pursuant to the Electronic Transactions Act.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                {hasSigned ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
                          {isVi ? 'Hợp đồng đã được ký' : 'Contract Signed Successfully'}
                        </h4>
                        <p className="text-emerald-600 dark:text-emerald-400/80 mt-1">
                          {isVi ? 'Người ký:' : 'Signed by:'} <span className="font-mono bg-white dark:bg-slate-900 px-3 py-1 rounded-lg font-bold shadow-sm text-emerald-700 dark:text-emerald-200 ml-2">{isOwner ? contract?.ownerSignature : contract?.renterSignature}</span>
                        </p>
                      </div>
                    </div>
                    
                    {!isOwner && (
                      <button
                        onClick={() => navigate(`/booking/${bookingId}/payment`)}
                        className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        {isVi ? 'Tiếp tục thanh toán' : 'Proceed to Payment'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                    <div className="mb-6">
                      <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-blue-600" />
                        {isVi ? 'Chữ ký điện tử' : 'Digital Signature'}
                      </label>
                      <input
                        type="text"
                        placeholder={isVi ? 'Nhập họ và tên hợp pháp của bạn để ký' : 'Type your full legal name to sign'}
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 transition-all text-xl font-medium text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    
                    <button
                      onClick={handleSign}
                      disabled={isSubmitting || !signature.trim()}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Key className="w-6 h-6" />
                          {isVi ? 'Tôi Đồng Ý và Ký Hợp Đồng' : 'I Agree and Sign Contract'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DigitalContractPage;
