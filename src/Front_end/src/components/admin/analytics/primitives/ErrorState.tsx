import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Predictive Insights',
  message = 'An unexpected network or model error occurred. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <Card
      hoverEffect={false}
      variant="default"
      className={cn('p-6 border-rose-200 dark:border-rose-500/30 bg-rose-500/5 flex flex-col items-center justify-center text-center gap-3', className)}
      role="alert"
    >
      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
        {title}
      </h4>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      )}
    </Card>
  );
};
