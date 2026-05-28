import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      const token = localStorage.getItem('luxeway_access_token');
      const response = await fetch('http://localhost:8080/api/v1/upload/vehicle-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group">
          <img
            src={preview}
            alt="Vehicle preview"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-white/90 text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-white transition-colors">
              <Upload className="w-4 h-4 inline mr-2" />
              Change
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
              className="px-4 py-2 bg-red-500/90 text-white text-sm font-semibold rounded-xl hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Remove
            </button>
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm font-medium text-[#0F172A] mb-2">Uploading...</p>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{uploadProgress}%</p>
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
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragging
              ? 'border-accent bg-blue-50 scale-[1.02]'
              : 'border-slate-300 hover:border-accent hover:bg-slate-50'
            }
          `}
        >
          <label className="cursor-pointer block">
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
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-accent font-semibold">Drop to upload!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-[#0F172A] font-semibold mb-1">
                    Drag & drop your image here
                  </p>
                  <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </span>
                  <p className="text-xs text-slate-400 mt-4">
                    JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
        </div>
      )}

      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </motion.div>
        )}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Image uploaded successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
