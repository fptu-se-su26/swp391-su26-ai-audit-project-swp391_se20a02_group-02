import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, CheckCircle, AlertCircle, Loader2, X, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ekycService, EkycScanResponse } from '@/services/ekycService';
import { useAuthStore } from '@/store';

interface EkycScannerProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const EkycScanner: React.FC<EkycScannerProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'front' | 'back' | 'verify' | 'success'>('front');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  const [frontData, setFrontData] = useState<EkycScanResponse | null>(null);
  const [backData, setBackData] = useState<EkycScanResponse | null>(null);
  
  const [loading, setLoading] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const handleImageChange = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please select an image file.');
      return;
    }

    const preview = URL.createObjectURL(file);

    if (side === 'front') {
      setFrontImage(file);
      setFrontPreview(preview);
    } else {
      setBackImage(file);
      setBackPreview(preview);
    }
  };

  const handleScanFront = async () => {
    if (!frontImage) return;
    setLoading(true);
    try {
      const response = await ekycService.scanFrontId(frontImage);
      if (response && response.success) {
        setFrontData(response);
        setStep('back');
        toast.success('Front side scanned successfully');
      } else {
        toast.error('Scan failed', response?.message || 'Could not extract information from the front side.');
      }
    } catch (error: any) {
      toast.error('Scan failed', error.message || 'An error occurred during scanning.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBack = async () => {
    if (!backImage) return;
    setLoading(true);
    try {
      const response = await ekycService.scanBackId(backImage);
      if (response && response.success) {
        setBackData(response);
        setStep('verify');
        toast.success('Back side scanned successfully');
      } else {
        toast.error('Scan failed', response?.message || 'Could not extract information from the back side.');
      }
    } catch (error: any) {
      toast.error('Scan failed', error.message || 'An error occurred during scanning.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!frontData?.documentId || !backData?.documentId) return;
    setLoading(true);
    try {
      const response = await ekycService.verifyEkyc(frontData.documentId, backData.documentId);
      if (response && response.success) {
        setStep('success');
        await refreshUser(); // Refresh user state to get updated KYC status
        toast.success('Identity Verified', 'Your CCCD has been successfully verified.');
      } else {
        toast.error('Verification failed', response?.message || 'Could not verify your identity.');
      }
    } catch (error: any) {
      toast.error('Verification failed', error.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#131F35] border border-slate-200 dark:border-[#1E2D45] rounded-md p-6 lg:p-8 shadow-sm max-w-3xl mx-auto w-full relative overflow-hidden font-sans">
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 rounded-md hover:bg-slate-500/10 transition-colors"
      >
        <X className="w-5 h-5 text-slate-500" />
      </button>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 display-font">
          eKYC Identity Verification
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We use VNPT eKYC IDCheck to verify your Vietnamese Citizen Identity Card (CCCD) quickly and securely.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-700 z-0">
          <div 
            className="h-full bg-[#D4AF37] transition-all duration-500"
            style={{ 
              width: step === 'front' ? '0%' : step === 'back' ? '33%' : step === 'verify' ? '66%' : '100%' 
            }}
          />
        </div>
        
        {[
          { id: 'front', label: 'Front Side', num: 1 },
          { id: 'back', label: 'Back Side', num: 2 },
          { id: 'verify', label: 'Confirm', num: 3 },
          { id: 'success', label: 'Complete', num: 4 }
        ].map((s, i) => {
          const isActive = step === s.id;
          const isPassed = ['front', 'back', 'verify', 'success'].indexOf(step) > i;
          
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                isActive || isPassed 
                  ? 'bg-[#D4AF37] text-[#0B1221]' 
                  : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
              }`}>
                {isPassed ? <CheckCircle className="w-4 h-4 text-[#0B1221]" /> : s.num}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 ${
                isActive || isPassed ? 'text-slate-850 dark:text-white' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 'front' && (
          <motion.div
            key="front"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Upload CCCD Front Side</h3>
              <p className="text-[11px] text-slate-500">Please make sure the image is clear and all text is readable.</p>
            </div>

            <input 
              type="file" 
              ref={frontInputRef} 
              onChange={(e) => handleImageChange('front', e)} 
              accept="image/*" 
              className="hidden" 
            />

            {!frontPreview ? (
              <div 
                onClick={() => frontInputRef.current?.click()}
                className="border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all group"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-[#1E2D45] rounded-md flex items-center justify-center mb-4 transition-transform">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#D4AF37]" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Click to upload or drag and drop</p>
                <p className="text-[10px] text-slate-500">SVG, PNG, JPG or GIF (max. 10MB)</p>
              </div>
            ) : (
              <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-[#1E2D45] aspect-[1.6]">
                <img src={frontPreview} alt="CCCD Front" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => frontInputRef.current?.click()}
                    className="bg-white/90 text-black rounded-md px-4 py-2 text-xs uppercase tracking-wider font-bold"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onCancel} className="px-6 py-3 border border-slate-200 dark:border-[#1E2D45] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-xs uppercase tracking-wider transition-all">
                Cancel
              </button>
              <button 
                onClick={handleScanFront} 
                disabled={!frontImage || loading}
                className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221] px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#0B1221]" /> : 'Scan Front Side'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'back' && (
          <motion.div
            key="back"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Upload CCCD Back Side</h3>
              <p className="text-[11px] text-slate-500">Please provide the back side of the same identity card.</p>
            </div>

            <input 
              type="file" 
              ref={backInputRef} 
              onChange={(e) => handleImageChange('back', e)} 
              accept="image/*" 
              className="hidden" 
            />

            {!backPreview ? (
              <div 
                onClick={() => backInputRef.current?.click()}
                className="border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all group"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-[#1E2D45] rounded-md flex items-center justify-center mb-4 transition-transform">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#D4AF37]" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Click to upload or drag and drop</p>
                <p className="text-[10px] text-slate-500">SVG, PNG, JPG or GIF (max. 10MB)</p>
              </div>
            ) : (
              <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-[#1E2D45] aspect-[1.6]">
                <img src={backPreview} alt="CCCD Back" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => backInputRef.current?.click()}
                    className="bg-white/90 text-black rounded-md px-4 py-2 text-xs uppercase tracking-wider font-bold"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep('front')} className="px-6 py-3 border border-slate-200 dark:border-[#1E2D45] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-xs uppercase tracking-wider transition-all">
                Back
              </button>
              <button 
                onClick={handleScanBack} 
                disabled={!backImage || loading}
                className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221] px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#0B1221]" /> : 'Scan Back Side'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'verify' && frontData?.data && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Confirm Information</h3>
              <p className="text-[11px] text-slate-500">Please review the extracted information carefully before submitting.</p>
            </div>

            <div className="bg-slate-50/50 dark:bg-[#1E2D45]/30 rounded-md p-6 border border-slate-200 dark:border-[#1E2D45]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Họ và tên / Full Name</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.fullName || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số CCCD / ID Number</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.idNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày sinh / Date of Birth</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.dateOfBirth || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giới tính / Gender</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.gender || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quốc tịch / Nationality</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.nationality || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày hết hạn / Expiry Date</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.expiryDate || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quê quán / Place of Origin</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.placeOfOrigin || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày cấp / Issue Date</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{(backData?.data?.issueDate) || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nơi thường trú / Place of Residence</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{frontData.data.placeOfResidence || '-'}</p>
                </div>
                {(backData?.data?.personalIdentification) && (
                  <div className="md:col-span-2">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Đặc điểm nhận dạng / Features</span>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{backData.data.personalIdentification}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#1E2D45]/30 border border-slate-200 dark:border-[#1E2D45] rounded-md p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                By clicking "Verify & Complete", you confirm that the information above is accurate and belongs to you.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep('back')} className="px-6 py-3 border border-slate-200 dark:border-[#1E2D45] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-xs uppercase tracking-wider transition-all">
                Go Back
              </button>
              <button 
                onClick={handleVerify} 
                disabled={loading}
                className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221] px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#0B1221]" />}
                {loading ? 'Verifying...' : 'Verify & Complete'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-14 h-14 bg-emerald-500/10 rounded-md flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 display-font">
              Verification Successful!
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm mx-auto mb-8">
              Your identity has been verified through VNPT eKYC. Your account is now fully active for all services.
            </p>
            <button 
              onClick={onComplete}
              className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1221] px-8 py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-all"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
