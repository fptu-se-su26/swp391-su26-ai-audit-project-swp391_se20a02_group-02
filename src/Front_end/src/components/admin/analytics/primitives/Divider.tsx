import React from 'react';
import { cn } from '@/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
  ...props
}) => {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-slate-200 dark:bg-slate-800 transition-colors',
        orientation === 'horizontal' ? 'h-px w-full my-4' : 'w-px h-full mx-4 inline-block',
        className
      )}
      {...props}
    />
  );
};
