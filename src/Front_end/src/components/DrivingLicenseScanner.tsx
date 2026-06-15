import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Loader2, AlertCircle, Car, FileText } from 'lucide-react';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';

interface DrivingLicenseScannerProps {
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'front' | 'back' | 'confirm' | 'success';

interface DlData {
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  expiryDate?: string;
  issueDate?: string;
  documentType?: string;      // Hạng GPLX (B1, B2, C...)
  placeOfOrigin?: string;     // Nơi cư trú
  nationality?: string;
  personalIdentification?: string;
}

export const DrivingLicenseScanner: React.FC<DrivingLicenseScannerProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>('front');
  const [loading, setLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontData, setFrontData] = useState<DlData | null>(null);
  const [backData, setBackData] = useState<DlData | null>(null);
  const [frontDocId, setFrontDocId] = useState<string | null>(null);
  const [backDocId, setBackDocId] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const steps = [
    { key: 'front', label: 'MẶT TRƯỚC' },
    { key: 'back',  label: 'MẶT SAU'  },
    { key: 'confirm', label: 'XÁC NHẬN' },
    { key: 'success', label: 'HOÀN TẤT' },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === step);

  const handleImageSelect = (side: 'front' | 'back', file: File) => {
    const url = URL.createObjectURL(file);
    if (side === 'front') { setFrontFile(file); setFrontPreview(url); }
    else                  { setBackFile(file);  setBackPreview(url);  }
  };

  const scanFront = async () => {
    if (!frontFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', frontFile);
      // Use postForm so browser auto-sets multipart/form-data boundary
      const res = await apiClient.postForm<any>('/ekyc/driving-license/scan/front', formData);
      setFrontData(res?.data || res || {});
      setFrontDocId(res?.documentId || null);
      setStep('back');
    } catch (err: any) {
      toast.error('Quét thất bại', err?.response?.data?.message || err?.message || 'Không thể quét mặt trước GPLX.');
    } finally {
      setLoading(false);
    }
  };

  const scanBack = async () => {
    if (!backFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', backFile);
      const res = await apiClient.postForm<any>('/ekyc/driving-license/scan/back', formData);
      setBackData(res?.data || res || {});
      setBackDocId(res?.documentId || null);
      setStep('confirm');
    } catch (err: any) {
      toast.error('Quét thất bại', err?.response?.data?.message || err?.message || 'Không thể quét mặt sau GPLX.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    // Small delay to show loading state, then move to success
    await new Promise(r => setTimeout(r, 500));
    setStep('success');
    setLoading(false);
  };

  const DropZone = ({ side, preview, inputRef }: {
    side: 'front' | 'back';
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div
      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all group"
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageSelect(side, file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(side, f); }}
      />
      {preview ? (
        <div className="space-y-3">
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain shadow" />
          <p className="text-xs text-green-600 dark:text-green-400 font-bold">✓ Đã chọn ảnh — nhấn để đổi</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              Tải ảnh {side === 'front' ? 'mặt trước' : 'mặt sau'} GPLX
            </p>
            <p className="text-xs text-slate-400 mt-1">Kéo thả hoặc nhấn để chọn · JPG, PNG, WEBP</p>
          </div>
        </div>
      )}
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    value ? (
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</span>
        <p className="font-bold text-slate-800 dark:text-white text-sm">{value}</p>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                idx < currentStepIdx  ? 'bg-green-500 text-white' :
                idx === currentStepIdx ? 'bg-accent text-white ring-4 ring-accent/20' :
                'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {idx < currentStepIdx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${idx < currentStepIdx ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* FRONT STEP */}
        {step === 'front' && (
          <motion.div key="front" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Car className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Quét mặt trước GPLX</h3>
              <p className="text-xs text-slate-500">Chụp rõ mặt trước Giấy Phép Lái Xe — hệ thống sẽ tự động đọc thông tin</p>
            </div>
            <DropZone side="front" preview={frontPreview} inputRef={frontInputRef} />
            <div className="flex justify-between items-center pt-2">
              <button onClick={onCancel} className="btn-ghost px-6 py-3 rounded-xl font-bold text-sm">Hủy</button>
              <button
                onClick={scanFront}
                disabled={!frontFile || loading}
                className="btn-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang quét...</> : 'Quét & Tiếp tục →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* BACK STEP */}
        {step === 'back' && (
          <motion.div key="back" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Show front scan result */}
            {frontData && (frontData.fullName || frontData.idNumber) && (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">✓ Mặt trước đã quét thành công</p>
                <div className="grid grid-cols-2 gap-2">
                  {frontData.fullName && <InfoRow label="Họ tên" value={frontData.fullName} />}
                  {frontData.idNumber && <InfoRow label="Số GPLX" value={frontData.idNumber} />}
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Quét mặt sau GPLX</h3>
              <p className="text-xs text-slate-500">Tiếp theo chụp mặt sau Giấy Phép Lái Xe</p>
            </div>
            <DropZone side="back" preview={backPreview} inputRef={backInputRef} />
            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setStep('front')} className="btn-ghost px-6 py-3 rounded-xl font-bold text-sm">← Quay lại</button>
              <button
                onClick={scanBack}
                disabled={!backFile || loading}
                className="btn-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang quét...</> : 'Quét & Tiếp tục →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* CONFIRM STEP */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Xác nhận thông tin GPLX</h3>
              <p className="text-xs text-slate-500">Kiểm tra kỹ thông tin trước khi gửi đi xét duyệt</p>
            </div>

            {/* Image previews */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mặt trước</p>
                {frontPreview && <img src={frontPreview} alt="Front" className="w-full rounded-xl object-contain border border-slate-200 dark:border-slate-700 max-h-32" />}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mặt sau</p>
                {backPreview && <img src={backPreview} alt="Back" className="w-full rounded-xl object-contain border border-slate-200 dark:border-slate-700 max-h-32" />}
              </div>
            </div>

            {/* Extracted info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <InfoRow label="Họ tên / Full Name" value={frontData?.fullName} />
                <InfoRow label="Số GPLX / License ID" value={frontData?.idNumber} />
                <InfoRow label="Ngày sinh / Date of Birth" value={frontData?.dateOfBirth} />
                <InfoRow label="Giới tính / Gender" value={frontData?.gender} />
                <InfoRow label="Hạng / License Class" value={frontData?.documentType} />
                <InfoRow label="Ngày hết hạn / Expiry" value={frontData?.expiryDate} />
                <InfoRow label="Ngày cấp / Issue Date" value={backData?.issueDate || frontData?.issueDate} />
                <InfoRow label="Quốc tịch / Nationality" value={frontData?.nationality} />
                {(frontData?.placeOfOrigin) && (
                  <div className="md:col-span-2">
                    <InfoRow label="Nơi cư trú / Address" value={frontData.placeOfOrigin} />
                  </div>
                )}
              </div>
              {!frontData?.fullName && !frontData?.idNumber && (
                <p className="text-xs text-slate-400 text-center py-2">Không đọc được thông tin — ảnh sẽ được admin xét duyệt thủ công</p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                GPLX sẽ được đội ngũ xét duyệt trong vòng 24 giờ. Bạn sẽ nhận thông báo khi hoàn tất.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setStep('back')} className="btn-ghost px-6 py-3 rounded-xl font-bold text-sm">← Quay lại</button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</> : 'Gửi xét duyệt'}
              </button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">Gửi thành công!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              GPLX của bạn đã được gửi đi xét duyệt. Đội ngũ sẽ xác minh trong vòng 24 giờ.
            </p>
            <button onClick={onComplete} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
              Về trang Documents
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
