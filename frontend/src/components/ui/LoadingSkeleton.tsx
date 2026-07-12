import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 bg-muted rounded-md animate-pulse"
      style={{ width }}
    />
  );
}

export function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonLine width="200px" />
        <SkeletonLine width="120px" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="60%" />
            <SkeletonLine width="40%" />
          </div>
          <SkeletonLine width="80px" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3 animate-pulse">
          <div className="flex justify-between">
            <SkeletonLine width="60%" />
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
          <div className="h-8 bg-muted rounded-md w-24" />
          <SkeletonLine width="40%" />
        </div>
      ))}
    </div>
  );
}
