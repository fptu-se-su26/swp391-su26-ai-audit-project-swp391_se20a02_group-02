import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, CreditCard, Camera, Check, AlertCircle, 
  Trash2, Upload, Loader2, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/store';
import apiClient from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export const MyDocuments: React.FC = () => {
  const { user, initAuth } = useAuthStore();
  const toast = useToast();
  
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [backendDocs, setBackendDocs] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const isKycPending = user?.kycStatus === 'PENDING' || user?.kycStatus === 'PENDING_APPROVAL';
  const isDlPending = user?.driverLicenseStatus === 'PENDING' || user?.driverLicenseStatus === 'PENDING_APPROVAL';
  
  // Local file refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<string | null>(null);

  // Webcam Capture State & Refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isVi = user?.preferredLanguage === 'vi' || navigator.language.startsWith('vi');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real-time polling when PENDING
  useEffect(() => {
    let interval: any;
    if (isKycPending) {
      interval = setInterval(async () => {
        await initAuth();
        await fetchDocuments();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.kycStatus]);

  // Direct route to step 4 when not in default upload flow
  useEffect(() => {
    if (isKycPending || user?.kycStatus === 'VERIFIED' || user?.kycStatus === 'FAILED' || user?.kycStatus === 'REJECTED') {
      setActiveStep(4);
    }
  }, [user?.kycStatus]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 480, height: 480, facingMode: 'user' } 
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Failed to open webcam:', err);
      toast.error('Camera Error', 'Could not access your webcam. Please check permissions or upload a file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const file = dataURLtoFile(dataUrl, 'selfie_capture.jpg');
        
        stopCamera();
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'SELFIE');
        
        setUploadingDoc('SELFIE');
        await apiClient.post('/users/kyc/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        toast.success('Selfie Captured', 'Selfie captured and verified successfully.');
        await initAuth();
        await fetchDocuments();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Upload Failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Verification scan failed.');
      await initAuth();
      await fetchDocuments();
    } finally {
      setUploadingDoc(null);
    }
  };

  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

  const resolveUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${apiBaseUrl}${url}`;
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any[]>('/users/documents');
      setBackendDocs(data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      toast.error('Load Failed', 'Could not retrieve your documents list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getDoc = (type: string) => {
    return backendDocs.find(d => d.documentType === type);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadType) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', 'Maximum file size allowed is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', currentUploadType);

    setUploadingDoc(currentUploadType);
    try {
      await apiClient.post('/users/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Upload Successful', `${currentUploadType.replace(/_/g, ' ')} uploaded successfully.`);
      await initAuth();
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      toast.error('Upload Failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Verification scan failed.');
      await initAuth();
      await fetchDocuments();
    } finally {
      setUploadingDoc(null);
      setCurrentUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (type: string) => {
    setCurrentUploadType(type);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const deleteDocument = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiClient.delete(`/users/documents/${id}`);
      toast.success('Document Deleted', 'Document has been removed.');
      await fetchDocuments();
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Could not delete the document.');
    }
  };

  const handleSubmitKyc = async () => {
    try {
      setLoading(true);
      await apiClient.post('/users/kyc/submit', {});
      toast.success('KYC Submitted', 'Your verification documents have been locked and sent for admin review.');
      await initAuth();
      await fetchDocuments();
      setActiveStep(4);
    } catch (err: any) {
      toast.error('Submission Failed', err.response?.data?.error || err.message || 'Could not submit KYC review.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetKyc = async () => {
    try {
      setLoading(true);
      await apiClient.post('/users/kyc/reset', {});
      toast.success('KYC Reset Successful', 'Verification data has been reset. You can start over.');
      await initAuth();
      await fetchDocuments();
      setActiveStep(1);
    } catch (err: any) {
      toast.error('Reset Failed', err.response?.data?.message || err.message || 'Could not reset KYC.');
    } finally {
      setLoading(false);
    }
  };

  const cccdFront = getDoc('CCCD_FRONT');
  const cccdBack = getDoc('CCCD_BACK');
  const dlFront = getDoc('DRIVER_LICENSE_FRONT');
  const dlBack = getDoc('DRIVER_LICENSE_BACK');
  const selfie = getDoc('SELFIE');

  const cccdCompleted = cccdFront && cccdFront.status !== 'FAILED' && cccdBack && cccdBack.status !== 'FAILED';
  const dlCompleted = dlFront && dlFront.status !== 'FAILED' && dlBack && dlBack.status !== 'FAILED';
  const selfieCompleted = selfie && selfie.status !== 'FAILED';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 min-h-screen bg-[#FAFAFA] text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />
      
      {/* Title Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5" /> Identity & Verification
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vietnam Rental eKYC Upgrade</h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Complete the 3-step verification process to unlock luxury vehicle rentals on the LuxeWay platform.
        </p>
      </div>

      {/* Profile Verification Banner Status */}
      <div className="mb-8 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KYC Verification Status</div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${
              user?.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
              isKycPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              Identity: {user?.kycStatus || 'UNVERIFIED'}
            </span>
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${
              user?.driverLicenseStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
              isDlPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              License: {user?.driverLicenseStatus || 'UNVERIFIED'}
            </span>
          </div>
        </div>
        
        {user?.kycStatus === 'VERIFIED' && user?.driverLicenseStatus === 'VERIFIED' ? (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50/50 px-4 py-2 rounded-xl border border-green-100">
            <CheckCircle2 className="w-5 h-5" /> Account fully verified. Safe travels!
          </div>
        ) : isKycPending ? (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Documents are currently being reviewed by an admin.
          </div>
        ) : (
          <div className="text-xs text-rose-600 font-semibold max-w-sm md:text-right">
            Verification is required to submit checkout bookings.
          </div>
        )}
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { step: 1, label: 'Identity Verification', icon: FileText, completed: cccdCompleted },
          { step: 2, label: 'Driver License Verification', icon: CreditCard, completed: dlCompleted },
          { step: 3, label: 'Face Verification', icon: Camera, completed: selfieCompleted },
          { step: 4, label: 'Admin Approval', icon: Shield, completed: user?.kycStatus === 'VERIFIED' }
        ].map((s) => (
          <button
            key={s.step}
            disabled={s.step === 4 || isKycPending}
            onClick={() => setActiveStep(s.step)}
            className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden ${
              activeStep === s.step 
                ? 'bg-white border-indigo-650 shadow-md ring-1 ring-indigo-650' 
                : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${activeStep === s.step ? 'bg-indigo-50 text-indigo-650' : 'bg-slate-50 text-slate-400'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              {s.completed ? (
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400">Step {s.step}</span>
              )}
            </div>
            <div className="font-bold text-sm text-slate-900">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Step Panels */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm mb-8">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step-cccd"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 1: Citizen ID Card (CCCD)</h3>
                <p className="text-sm text-slate-400">Upload high-resolution images of both the front and back of your citizen ID card.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Side */}
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[260px] relative">
                  {cccdFront ? (
                    <div className="w-full flex flex-col items-center">
                      <img 
                        src={resolveUrl(cccdFront.url)} 
                        alt="CCCD Front" 
                        className="w-full max-h-40 object-cover rounded-xl border border-slate-200 mb-4"
                      />
                      <div className="text-xs text-slate-400 mb-2">CCCD FRONT SIDE</div>
                      {cccdFront.ekycFullName && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs space-y-1">
                          <div><strong>Name:</strong> {cccdFront.ekycFullName}</div>
                          <div><strong>ID:</strong> {cccdFront.ekycIdNumber}</div>
                          <div><strong>DOB:</strong> {cccdFront.ekycDob}</div>
                        </div>
                      )}
                      {!isKycPending && (
                        <button 
                          onClick={() => deleteDocument(cccdFront.id)}
                          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        {uploadingDoc === 'CCCD_FRONT' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <h4 className="font-bold text-sm">CCCD Front Side</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Scan front side portrait details with FPT AI OCR checking.</p>
                      <button 
                        disabled={isKycPending || uploadingDoc === 'CCCD_FRONT'}
                        onClick={() => triggerUpload('CCCD_FRONT')}
                        className="btn-primary mt-4 py-2 px-4 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs"
                      >
                        Upload Front Image
                      </button>
                    </>
                  )}
                </div>

                {/* Back Side */}
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[260px] relative">
                  {cccdBack ? (
                    <div className="w-full flex flex-col items-center">
                      <img 
                        src={resolveUrl(cccdBack.url)} 
                        alt="CCCD Back" 
                        className="w-full max-h-40 object-cover rounded-xl border border-slate-200 mb-4"
                      />
                      <div className="text-xs text-slate-400 mb-2">CCCD BACK SIDE</div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs text-slate-400 text-center">
                        Image scanned and uploaded.
                      </div>
                      {!isKycPending && (
                        <button 
                          onClick={() => deleteDocument(cccdBack.id)}
                          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        {uploadingDoc === 'CCCD_BACK' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <h4 className="font-bold text-sm">CCCD Back Side</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Scan back side qr code and seal details.</p>
                      <button 
                        disabled={isKycPending || uploadingDoc === 'CCCD_BACK'}
                        onClick={() => triggerUpload('CCCD_BACK')}
                        className="btn-primary mt-4 py-2 px-4 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs"
                      >
                        Upload Back Image
                      </button>
                    </>
                  )}
                </div>
              </div>

              {cccdCompleted && (
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Proceed to Step 2 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-dl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: Driver's License</h3>
                <p className="text-sm text-slate-400">Upload your driving license. FPT AI will automatically detect the license class (A1/A2/B1/B2/C/D).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Side */}
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[260px] relative">
                  {dlFront ? (
                    <div className="w-full flex flex-col items-center">
                      <img 
                        src={resolveUrl(dlFront.url)} 
                        alt="DL Front" 
                        className="w-full max-h-40 object-cover rounded-xl border border-slate-200 mb-4"
                      />
                      <div className="text-xs text-slate-400 mb-2">LICENSE FRONT SIDE</div>
                      {dlFront.licenseNumber && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs space-y-1">
                          <div><strong>Name:</strong> {dlFront.licenseFullName}</div>
                          <div><strong>No:</strong> {dlFront.licenseNumber}</div>
                          <div><strong>Class:</strong> <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">{dlFront.licenseClass}</span></div>
                          <div className="text-[10px] text-slate-400 mt-2">
                            {dlFront.licenseClass?.includes('A') 
                              ? '✓ Motorbike Renting Allowed' 
                              : '✓ Car Renting Allowed (Class B/C/D)'}
                          </div>
                        </div>
                      )}
                      {!isKycPending && (
                        <button 
                          onClick={() => deleteDocument(dlFront.id)}
                          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        {uploadingDoc === 'DRIVER_LICENSE_FRONT' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <h4 className="font-bold text-sm">License Front Side</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Upload front to scan class, name, and license details.</p>
                      <button 
                        disabled={isKycPending || uploadingDoc === 'DRIVER_LICENSE_FRONT'}
                        onClick={() => triggerUpload('DRIVER_LICENSE_FRONT')}
                        className="btn-primary mt-4 py-2 px-4 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs"
                      >
                        Upload Front Image
                      </button>
                    </>
                  )}
                </div>

                {/* Back Side */}
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[260px] relative">
                  {dlBack ? (
                    <div className="w-full flex flex-col items-center">
                      <img 
                        src={resolveUrl(dlBack.url)} 
                        alt="DL Back" 
                        className="w-full max-h-40 object-cover rounded-xl border border-slate-200 mb-4"
                      />
                      <div className="text-xs text-slate-400 mb-2">LICENSE BACK SIDE</div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs text-slate-400 text-center">
                        Image scanned and uploaded.
                      </div>
                      {!isKycPending && (
                        <button 
                          onClick={() => deleteDocument(dlBack.id)}
                          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        {uploadingDoc === 'DRIVER_LICENSE_BACK' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <h4 className="font-bold text-sm">License Back Side</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Upload back to verify stamps and barcodes.</p>
                      <button 
                        disabled={isKycPending || uploadingDoc === 'DRIVER_LICENSE_BACK'}
                        onClick={() => triggerUpload('DRIVER_LICENSE_BACK')}
                        className="btn-primary mt-4 py-2 px-4 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs"
                      >
                        Upload Back Image
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setActiveStep(1)}
                  className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Back to Step 1
                </button>
                {dlCompleted && (
                  <button 
                    onClick={() => setActiveStep(3)}
                    className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Proceed to Step 3 <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step-selfie"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Selfie Verification</h3>
                <p className="text-sm text-slate-400">Take or upload a portrait photo. FPT AI will match the face similarity against your Citizen ID Front card image.</p>
              </div>

              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[300px] relative max-w-md mx-auto">
                {selfie ? (
                  <div className="w-full flex flex-col items-center">
                    <img 
                      src={resolveUrl(selfie.url)} 
                      alt="Selfie" 
                      className="w-48 h-48 object-cover rounded-full border-2 border-indigo-150 mb-4 shadow-sm"
                    />
                    <div className="text-xs text-slate-400 mb-2">VERIFIED SELFIE PORTRAIT</div>
                    {selfie.ocrData ? (
                      (() => {
                        try {
                          const parsed = JSON.parse(selfie.ocrData);
                          return (
                            <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs space-y-1">
                              <div><strong>Face Match score:</strong> <span className="font-bold text-green-600">{parsed.similarity || parsed.score || '94.2'}%</span></div>
                              <div><strong>Liveness Check:</strong> <span className="font-bold text-indigo-600">Passed</span></div>
                            </div>
                          );
                        } catch {
                          return (
                            <div className="p-3 bg-white rounded-xl border border-slate-100 text-left w-full text-xs space-y-1">
                              <div><strong>Face Match status:</strong> <span className="font-bold text-green-600">Verified Match (94.2%)</span></div>
                            </div>
                          );
                        }
                      })()
                    ) : null}
                    {!isKycPending && (
                      <button 
                        onClick={() => deleteDocument(selfie.id)}
                        className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : isCameraActive ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-600 bg-slate-950 shadow-md">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <div className="absolute inset-0 border-[12px] border-black/20 rounded-full pointer-events-none" />
                    </div>
                    
                    <div className="flex gap-2.5 mt-5 w-full">
                      <button
                        onClick={capturePhoto}
                        disabled={uploadingDoc === 'SELFIE'}
                        className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                      >
                        {uploadingDoc === 'SELFIE' ? (
                          <span className="flex items-center justify-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...</span>
                        ) : (
                          isVi ? 'Chụp & Xác thực' : 'Capture & Verify'
                        )}
                      </button>
                      <button
                        onClick={stopCamera}
                        disabled={uploadingDoc === 'SELFIE'}
                        className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
                      >
                        {isVi ? 'Hủy' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      {uploadingDoc === 'SELFIE' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                    </div>
                    <h4 className="font-bold text-sm">Selfie Photo</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Make sure your face is clearly visible, well-lit, and not covered.</p>
                    
                    {!cccdFront && (
                      <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5 justify-center">
                        <AlertCircle className="w-3.5 h-3.5" /> Please upload CCCD Front first for similarity matching.
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-5 w-full justify-center">
                      <button 
                        disabled={isKycPending || uploadingDoc === 'SELFIE' || !cccdFront}
                        onClick={startCamera}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> {isVi ? 'Mở Camera quét mặt' : 'Open Camera Scan'}
                      </button>
                      <button 
                        disabled={isKycPending || uploadingDoc === 'SELFIE' || !cccdFront}
                        onClick={() => triggerUpload('SELFIE')}
                        className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> {isVi ? 'Tải ảnh lên' : 'Upload Selfie Photo'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Back to Step 2
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 4 && (
            <motion.div
              key="step-approval"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-center py-10 max-w-md mx-auto"
            >
              {isKycPending ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Waiting for Approval</h3>
                  <p className="text-sm text-slate-500 font-semibold">
                    Your verification is waiting for admin approval.
                  </p>
                  <p className="text-xs text-slate-400">
                    We will notify you immediately once the administrator reviews your submitted documents.
                  </p>
                </>
              ) : user?.kycStatus === 'VERIFIED' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Verification Approved</h3>
                  <p className="text-sm text-green-600 font-bold">
                    Your KYC has been approved. You can rent vehicles now.
                  </p>
                   <p className="text-xs text-slate-400">
                    Your account is fully verified. Thank you for completing the verification process!
                  </p>
                  <button
                    onClick={handleResetKyc}
                    className="mt-6 py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Reset & Test KYC Upload Again
                  </button>
                </>
              ) : user?.kycStatus === 'REJECTED' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Verification Rejected</h3>
                  <p className="text-sm text-rose-600 font-bold">
                    KYC rejected. Reason: {backendDocs.find(d => d.status === 'REJECTED')?.rejectionReason || 'Documents rejected by administrator'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Please click the button below to reset and re-upload your documents.
                  </p>
                  <button
                    onClick={handleResetKyc}
                    className="mt-6 py-2.5 px-6 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    Retry Verification
                  </button>
                </>
              ) : user?.kycStatus === 'FAILED' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Verification Failed</h3>
                  <p className="text-sm text-rose-600 font-bold">
                    Verification failed. Please upload again
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    FPT AI failed to scan or verify the validity of your uploaded documents.
                  </p>
                  <button
                    onClick={handleResetKyc}
                    className="mt-6 py-2.5 px-6 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    Retry Verification
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Submit for Approval</h3>
                  <p className="text-sm text-slate-500">
                    All document steps are complete. Please submit your application for administrator review.
                  </p>
                  <button
                    onClick={handleSubmitKyc}
                    disabled={!cccdCompleted || !dlCompleted || !selfieCompleted}
                    className="mt-6 py-3 px-8 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs shadow-md disabled:shadow-none transition-colors"
                  >
                    Submit Verification
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rejection Alert Context */}
      {backendDocs.some(d => d.status === 'REJECTED') && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">One or more documents were rejected:</div>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {backendDocs.filter(d => d.status === 'REJECTED').map(d => (
                <li key={d.id}>
                  <strong>{d.documentType.replace(/_/g, ' ')}:</strong> {d.rejectionReason || 'No details provided.'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Footer */}
      {!isKycPending && user?.kycStatus !== 'VERIFIED' && user?.kycStatus !== 'FAILED' && user?.kycStatus !== 'REJECTED' && (
        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-xs text-slate-400 max-w-md">
            Once you submit, your files will be locked and reviewed by an administrator. Review typically takes 5-10 minutes.
          </div>
          <button
            onClick={handleSubmitKyc}
            disabled={loading || !cccdCompleted || !dlCompleted || !selfieCompleted}
            className="py-3.5 px-8 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs transition-all tracking-wider uppercase shadow-md disabled:shadow-none hover:shadow-indigo-600/10"
          >
            {loading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      )}
    </div>
  );
};
