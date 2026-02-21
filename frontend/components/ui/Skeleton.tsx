import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Single shimmer block */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={['skeleton', className].join(' ')} aria-hidden="true" />;
}

/** Skeleton placeholder for a product or fabric card */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden flex flex-col h-full" aria-hidden="true">
      <Skeleton className="w-full h-48" />
      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  /** Number of placeholder cards to render */
  count?: number;
  columns?: string;
}

/** Grid of skeleton cards for product/fabric listing pages */
export function SkeletonGrid({ count = 8, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }: SkeletonGridProps) {
  return (
    <div className={['grid gap-6', columns].join(' ')} role="status" aria-label="Loading items">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
