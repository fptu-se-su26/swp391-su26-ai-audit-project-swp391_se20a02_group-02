import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'bordered' | 'gradient';
  hoverEffect?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = true,
  children,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-3xl p-6 transition-all duration-300 relative overflow-hidden';
  
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-slate-900 dark:text-white',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 shadow-2xl text-slate-900 dark:text-white',
    bordered: 'bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
    gradient: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
