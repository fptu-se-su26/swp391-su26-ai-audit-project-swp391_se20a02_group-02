import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { ownerApplicationService, OwnerApplicationResponse } from '@/services/ownerApplicationService';
import { Loader2, CheckCircle, ChevronRight, FileText, User, Camera, Building, AlertCircle } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Identity Verification', icon: Camera },
  { id: 3, title: 'Owner Profile', icon: Building },
  { id: 4, title: 'Payout Details', icon: FileText },
  { id: 5, title: 'Review & Submit', icon: CheckCircle }
];

export const OwnerApplicationPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<OwnerApplicationResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({ fullName: '', dob: '', phone: '', address: '', city: '' });
  const [ownerProfile, setOwnerProfile] = useState({ displayName: '', bio: '', serviceArea: '' });
  const [payoutInfo, setPayoutInfo] = useState({ bankName: '', accountHolderName: '', accountNumber: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/owner-application');
      return;
    }
    
    if (user?.role === 'owner') {
      navigate('/owner');
      return;
    }

    loadApplication();
  }, [isAuthenticated, user, navigate]);

  const loadApplication = async () => {
    try {
      const app = await ownerApplicationService.getMyApplication();
      if (app) {
        setApplication(app);
        setCurrentStep(app.currentStep || 1);
        if (app.fullName) {
          setPersonalInfo({
            fullName: app.fullName || '',
            dob: app.dob || '',
            phone: app.phone || '',
            address: app.address || '',
            city: app.city || ''
          });
        }
        if (app.displayName) {
          setOwnerProfile({
            displayName: app.displayName || '',
            bio: app.bio || '',
            serviceArea: app.serviceArea || ''
          });
        }
        if (app.bankName) {
          setPayoutInfo(prev => ({
            ...prev,
            bankName: app.bankName || '',
            accountHolderName: app.accountHolderName || ''
          }));
        }
      } else {
        // Create draft
        const newApp = await ownerApplicationService.createDraft();
        setApplication(newApp);
        setCurrentStep(1);
        setPersonalInfo(prev => ({
          ...prev,
          fullName: newApp.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''),
          phone: newApp.phone || user?.phone || ''
        }));
      }
    } catch (err: any) {
      toast.error('Error', 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!application) return;
    setSubmitting(true);
    try {
      if (currentStep === 1) {
        if (!personalInfo.fullName || !personalInfo.dob || !personalInfo.phone || !personalInfo.address || !personalInfo.city) {
          toast.error('Incomplete', 'Please fill all personal info fields');
          setSubmitting(false);
          return;
        }
        const updated = await ownerApplicationService.updatePersonalInfo(application.id, personalInfo);
        setApplication(updated);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Validation for documents can be complex, just move next
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!ownerProfile.displayName || !ownerProfile.bio || !ownerProfile.serviceArea) {
          toast.error('Incomplete', 'Please fill all owner profile fields');
          setSubmitting(false);
          return;
        }
        const updated = await ownerApplicationService.updateOwnerProfile(application.id, ownerProfile);
        setApplication(updated);
        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (!payoutInfo.bankName || !payoutInfo.accountHolderName || !payoutInfo.accountNumber) {
          toast.error('Incomplete', 'Please fill all payout fields');
          setSubmitting(false);
          return;
        }
        const updated = await ownerApplicationService.updatePayout(application.id, payoutInfo);
        setApplication(updated);
        setCurrentStep(5);
      }
    } catch (err: any) {
      toast.error('Error', err.response?.data?.message || 'Failed to save progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!application || !termsAccepted) {
      toast.error('Error', 'Please accept the terms and conditions');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await ownerApplicationService.submitApplication(application.id, termsAccepted, '1.0');
      setApplication(updated);
      toast.success('Success', 'Application submitted successfully!');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!application) return;
    try {
      const updated = await ownerApplicationService.addDocument(application.id, type, url);
      setApplication(updated);
      toast.success('Success', 'Document uploaded successfully');
    } catch (err: any) {
      toast.error('Error', 'Failed to save document reference');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] dark:bg-slate-950 pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (application?.status === 'SUBMITTED' || application?.status === 'UNDER_REVIEW') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-slate-950 pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto glass p-10 rounded-3xl text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-3xl font-display font-bold">Application Under Review</h2>
          <p className="text-slate-500">
            Thank you for applying to be a LuxeWay Host. Our team is currently reviewing your application and verifying your documents. We will notify you once the review is complete.
          </p>
        </div>
      </div>
    );
  }

  if (application?.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-slate-950 pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto glass p-10 rounded-3xl text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-3xl font-display font-bold">Action Required</h2>
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-left">
            <strong className="block mb-2">Rejection Reason:</strong>
            {application.rejectionReason}
          </div>
          <button 
            onClick={() => {
              setApplication({ ...application, status: 'DRAFT' });
              setCurrentStep(1);
            }}
            className="btn-gold px-8 py-3 rounded-xl font-bold"
          >
            Fix Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-display font-bold mb-8 dark:text-white">Become a Host</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 h-1 bg-amber-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPassed = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 
                  isPassed ? 'bg-amber-500 text-white' : 
                  'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold hidden md:block ${
                  isActive ? 'text-amber-500' : 
                  isPassed ? 'text-slate-700 dark:text-slate-300' : 
                  'text-slate-400'
                }`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="glass p-8 md:p-12 rounded-[2.5rem]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" className="input-field w-full" value={personalInfo.fullName} onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                  <input type="date" className="input-field w-full" value={personalInfo.dob} onChange={e => setPersonalInfo({...personalInfo, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input type="tel" className="input-field w-full" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
                  <input type="text" className="input-field w-full" value={personalInfo.city} onChange={e => setPersonalInfo({...personalInfo, city: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Address</label>
                  <input type="text" className="input-field w-full" value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Identity Verification</h2>
              <p className="text-sm text-slate-500 mb-6">Please upload clear photos of your government-issued ID.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ID Front</label>
                  <ImageUploader onChange={(url) => handleFileUpload(url, 'ID_FRONT')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ID Back</label>
                  <ImageUploader onChange={(url) => handleFileUpload(url, 'ID_BACK')} />
                </div>
              </div>
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
                  Note: Uploaded documents are automatically saved.
                  {application?.documents?.length ? ` (${application.documents.length} document(s) uploaded)` : ' (No documents uploaded yet)'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Owner Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                  <input type="text" className="input-field w-full" value={ownerProfile.displayName} onChange={e => setOwnerProfile({...ownerProfile, displayName: e.target.value})} placeholder="How you will appear to renters" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Service Area</label>
                  <input type="text" className="input-field w-full" value={ownerProfile.serviceArea} onChange={e => setOwnerProfile({...ownerProfile, serviceArea: e.target.value})} placeholder="e.g. Ho Chi Minh City, District 1" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                  <textarea className="input-field w-full h-32 py-3" value={ownerProfile.bio} onChange={e => setOwnerProfile({...ownerProfile, bio: e.target.value})} placeholder="Tell renters about yourself and your vehicles..." />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Payout Details</h2>
              <p className="text-sm text-slate-500 mb-6">Where should we send your earnings?</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bank Name</label>
                  <input type="text" className="input-field w-full" value={payoutInfo.bankName} onChange={e => setPayoutInfo({...payoutInfo, bankName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Holder Name</label>
                  <input type="text" className="input-field w-full" value={payoutInfo.accountHolderName} onChange={e => setPayoutInfo({...payoutInfo, accountHolderName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Number</label>
                  <input 
                    type="text" 
                    className="input-field w-full" 
                    value={payoutInfo.accountNumber} 
                    onChange={e => setPayoutInfo({...payoutInfo, accountNumber: e.target.value})} 
                    placeholder={application?.maskedAccountNumber || ''}
                  />
                  {application?.maskedAccountNumber && !payoutInfo.accountNumber && (
                    <p className="text-xs text-slate-500 mt-2">Saved: {application.maskedAccountNumber}. Enter new number to update.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Review & Submit</h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Please review your information before submitting. Once submitted, your application will be reviewed by our team.</p>
                <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 mt-6 h-64 overflow-y-auto text-xs leading-relaxed">
                  <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Host Terms and Conditions</h4>
                  <p className="mb-4">1. By submitting this application, you confirm that all information provided is accurate and true.</p>
                  <p className="mb-4">2. You agree to maintain your listed vehicles in safe, operable condition.</p>
                  <p className="mb-4">3. LuxeWay charges a 15% platform commission on all successful rentals.</p>
                  <p className="mb-4">4. You must maintain appropriate insurance coverage for peer-to-peer rentals.</p>
                  <p className="mb-4">5. LuxeWay reserves the right to suspend or terminate owner accounts that violate platform policies.</p>
                </div>
                <label className="flex items-center gap-3 mt-6 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">I have read and agree to the Host Terms and Conditions</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
            {currentStep > 1 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back
              </button>
            ) : <div />}
            
            {currentStep < STEPS.length ? (
              <button 
                onClick={handleNext}
                disabled={submitting}
                className="btn-gold px-8 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting || !termsAccepted}
                className="btn-gold px-10 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerApplicationPage;
