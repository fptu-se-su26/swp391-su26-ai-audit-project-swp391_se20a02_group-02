import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/store';
import { cn } from '@/utils';
import type { Toast } from '@/types';

const toastConfig = {
  success: { icon: CheckCircle, colors: 'bg-white border-green-200 text-green-700', iconColor: 'text-success', bar: 'bg-success' },
  error: { icon: AlertCircle, colors: 'bg-white border-red-200 text-red-700', iconColor: 'text-danger', bar: 'bg-danger' },
  warning: { icon: AlertTriangle, colors: 'bg-white border-yellow-200 text-yellow-700', iconColor: 'text-gold', bar: 'bg-gold' },
  info: { icon: Info, colors: 'bg-white border-blue-200 text-blue-700', iconColor: 'text-accent', bar: 'bg-accent' },
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useUIStore();
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className={cn(
        'relative flex items-start gap-3 p-4 pr-10 rounded-2xl border shadow-luxury max-w-sm w-full overflow-hidden',
        config.colors
      )}
    >
      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration ?? 4000) / 1000, ease: 'linear' }}
        className={cn('absolute bottom-0 left-0 h-0.5 origin-left', config.bar)}
        style={{ width: '100%' }}
      />

      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F172A]">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-500 mt-0.5">{toast.description}</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook to use toast
export const useToast = () => {
  const { addToast } = useUIStore();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
    toast: addToast,
  };
};
