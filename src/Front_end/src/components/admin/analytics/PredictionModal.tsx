import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils';

export interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export const PredictionModal: React.FC<PredictionModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  children,
  footer,
  maxWidth = '3xl',
  className,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key listener & Body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Auto focus close button for focus trap initialization
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Simple Focus Trap within modal container
  const handleKeyDownFocusTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const firstElement = focusables[0];
    const lastElement = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onKeyDown={handleKeyDownFocusTrap}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'prediction-modal-title' : undefined}
            aria-describedby={subtitle ? 'prediction-modal-subtitle' : undefined}
            className={cn(
              'relative w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10',
              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
              maxWidthMap[maxWidth],
              className
            )}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 p-5 sm:p-6 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3.5 min-w-0">
                {icon && (
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {title && (
                      <h2
                        id="prediction-modal-title"
                        className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white truncate"
                      >
                        {title}
                      </h2>
                    )}
                    {badge}
                  </div>
                  {subtitle && (
                    <p
                      id="prediction-modal-subtitle"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate"
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Close Trigger Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close modal dialog"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 p-4 sm:p-5 border-t bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-slate-200 dark:border-slate-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
