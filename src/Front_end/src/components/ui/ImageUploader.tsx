import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Image, Plus } from 'lucide-react';
import { imageService, validateImageFile, formatFileSize, getLocalPreviewUrl } from '@/services/imageService';

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface ImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  label = 'Upload Images',
}) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const remaining = maxFiles - (value.length + items.filter(i => i.status === 'done').length);
    const toAdd = files.slice(0, remaining);

    const newItems: FileItem[] = toAdd.map(file => {
      const validation = validateImageFile(file);
      return {
        id: `${Date.now()}_${Math.random()}`,
        file,
        preview: getLocalPreviewUrl(file),
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.valid ? undefined : validation.error,
      };
    });

    setItems(prev => [...prev, ...newItems]);

    // Auto-upload valid files
    newItems.forEach(item => {
      if (item.status === 'pending') {
        uploadItem(item);
      }
    });
  }, [items, value, maxFiles]);

  const uploadItem = async (item: FileItem) => {
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i
    ));

    try {
      const url = await imageService.upload(item.file, (pct) => {
        setItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, progress: pct } : i
        ));
      });

      setItems(prev => {
        const updated = prev.map(i =>
          i.id === item.id ? { ...i, status: 'done' as const, progress: 100, url } : i
        );
        // Notify parent with all completed URLs
        const doneUrls = updated.filter(i => i.status === 'done' && i.url).map(i => i.url!);
        onChange([...value, ...doneUrls]);
        return updated;
      });
    } catch (err: any) {
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: 'error', error: err.message } : i
      ));
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      const updated = prev.filter(i => i.id !== id);
      const doneUrls = updated.filter(i => i.status === 'done' && i.url).map(i => i.url!);
      onChange(doneUrls);
      return updated;
    });
  };

  const removeExistingUrl = (url: string) => {
    onChange(value.filter(u => u !== url));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
    e.target.value = '';
  };

  const canAddMore = (value.length + items.filter(i => i.status === 'done').length) < maxFiles;

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-[#0F172A]">{label}</p>}

      {/* Drop Zone */}
      {canAddMore && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-accent bg-blue-50 scale-[1.01]'
              : 'border-slate-200 hover:border-accent hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              dragging ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {dragging ? <Upload className="w-6 h-6" /> : <Image className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {dragging ? 'Drop to upload' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPG, PNG, WEBP · Max 5MB each · Up to {maxFiles} images
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing URLs (from saved data) */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map(url => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
              <img src={url} alt="Vehicle" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingUrl(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Upload Items */}
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              item.status === 'error' ? 'border-red-200 bg-red-50' :
              item.status === 'done' ? 'border-green-200 bg-green-50' :
              'border-slate-200 bg-white'
            }`}
          >
            {/* Preview */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{item.file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(item.file.size)}</p>

              {/* Progress bar */}
              {item.status === 'uploading' && (
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}

              {/* Error msg */}
              {item.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{item.error}</p>
              )}
            </div>

            {/* Status icon */}
            <div className="flex-shrink-0">
              {item.status === 'uploading' && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
              {item.status === 'done' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {item.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {item.status === 'pending' && (
                <div className="w-5 h-5 border-2 border-slate-300 rounded-full animate-pulse" />
              )}
            </div>

            {/* Remove */}
            {(item.status === 'done' || item.status === 'error') && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add more button */}
      {!canAddMore && (
        <p className="text-xs text-slate-400 text-center">Maximum {maxFiles} images reached</p>
      )}
    </div>
  );
};

export default ImageUploader;
