import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store';
import { SERVER_BASE } from '@/utils';

interface ImageUploaderProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = '.jpg, .jpeg, .png, .webp';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onError,
  className = '',
}) => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXT}`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max size: ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      onError?.(error);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 12, 90));
      }, 200);

      const token = localStorage.getItem('luxeway_access_token');
      const response = await fetch(`${SERVER_BASE}/upload/vehicle-image`, {
        method: 'POST',
        headers: {
          ...(SERVER_BASE.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.imageUrl || data.url || data.filePath;

      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      onChange(imageUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.message || 'Upload failed. Please try again.';
      setUploadError(msg);
      onError?.(msg);
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    setUploadError('');
    setUploadSuccess(false);
  };

  return (
    <div className={`relative font-sans ${className}`}>
      {preview ? (
        <div className="relative rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-2xl group transition-all duration-300">
          <img
            src={preview}
            alt="Vehicle preview"
            className="w-full h-64 object-cover filter brightness-[0.98] group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {/* Dark Glass Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
            <label className="cursor-pointer px-6 py-3.5 bg-white text-indigo-950 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover-lift flex items-center gap-2 border-0">
              <Upload className="w-4 h-4" />
              Change Photo
              <input
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="px-6 py-3.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl hover-lift flex items-center gap-2 border-0"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>

          {/* Loader Overlay */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-10"
              >
                <div className="relative flex items-center justify-center mb-5">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                  <Loader2 className="w-6 h-6 animate-pulse text-indigo-550 absolute" />
                </div>
                <p className="text-xs font-black tracking-widest uppercase text-white mb-2.5">Uploading File...</p>
                
                {/* Progress bar */}
                <div className="w-56 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] font-black text-indigo-400 mt-2">{uploadProgress}%</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all duration-500 shadow-xl overflow-hidden
            ${isDragging
              ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[1.03] shadow-2xl ring-4 ring-indigo-500/5'
              : isDark
                ? 'border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 hover:bg-slate-900/60 hover:shadow-2xl'
                : 'border-slate-250 bg-white/70 backdrop-blur-md hover:border-indigo-500/40 hover:bg-white hover:shadow-2xl'
            }
          `}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

          <label className="cursor-pointer block relative z-10">
            <input
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {isDragging ? (
                <motion.div
                  key="dragging"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20 animate-pulse">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-indigo-500 dark:text-indigo-400 text-sm font-black uppercase tracking-widest animate-pulse">Drop files to upload!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-650 to-violet-650 text-white rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-slate-800 dark:text-white font-black text-sm uppercase tracking-wider mb-1.5">
                    Upload Luxury Vehicle Media
                  </h4>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-5">
                    Drag and drop your asset files here
                  </p>
                  
                  <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover-lift border-0">
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </span>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-6">
                    JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB Limit
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
        </div>
      )}

      {/* Floating Status Alerts */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 mt-3 p-4 bg-red-500/5 dark:bg-red-950/20 border border-red-500/15 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400 shadow-md"
          >
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </motion.div>
        )}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 mt-3 p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 rounded-2xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-md"
          >
            <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 text-emerald-505" />
            <span>Asset uploaded and secured successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
