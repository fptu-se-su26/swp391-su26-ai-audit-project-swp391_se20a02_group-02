import React from 'react';
import { cn } from '@/utils';

// ====== SKELETON COMPONENT ======
interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'rounded-xl' }) => (
  <div className={cn('skeleton', rounded, className)} />
);

// ====== VEHICLE CARD SKELETON ======
export const VehicleCardSkeleton: React.FC = () => (
  <div className="luxury-card overflow-hidden">
    <Skeleton className="h-56 w-full" rounded="rounded-none" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-full" rounded="rounded-2xl" />
    </div>
  </div>
);

// ====== STAT CARD SKELETON ======
export const StatCardSkeleton: React.FC = () => (
  <div className="luxury-card p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// ====== TABLE SKELETON ======
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
        <Skeleton className="h-10 w-10" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24" rounded="rounded-xl" />
      </div>
    ))}
  </div>
);

// ====== PROFILE SKELETON ======
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20" rounded="rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" rounded="rounded-xl" />
      <Skeleton className="h-12 w-full" rounded="rounded-xl" />
      <Skeleton className="h-24 w-full" rounded="rounded-xl" />
    </div>
  </div>
);

// ====== REVIEWS SKELETON ======
export const ReviewsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="luxury-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" rounded="rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

// ====== CHAT SKELETON ======
export const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {[false, true, false, false, true].map((sent, i) => (
      <div key={i} className={cn('flex', sent ? 'justify-end' : 'justify-start')}>
        <Skeleton
          className={cn('h-10', sent ? 'w-48' : 'w-56')}
          rounded={sent ? 'rounded-3xl rounded-tr-sm' : 'rounded-3xl rounded-tl-sm'}
        />
      </div>
    ))}
  </div>
);

// ====== HERO SEARCH SKELETON ======
export const SearchSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-14" rounded="rounded-xl" />
    ))}
  </div>
);
