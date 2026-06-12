import React from 'react';
import { cn, getInitials } from '@/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const getHashedColor = (userName: string) => {
    if (!userName) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'bg-sky-500/10 text-sky-500 border-sky-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = getHashedColor(name);
  const initials = getInitials(name || 'U');

  return src ? (
    <img
      src={src}
      alt={name}
      className={cn(
        'rounded-full object-cover border-2 border-[var(--lw-border,rgba(0,0,0,0.1))]',
        sizeClasses[size],
        className
      )}
    />
  ) : (
    <div
      className={cn(
        'rounded-full font-bold flex items-center justify-center border-2 uppercase tracking-wide',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

export default Avatar;
