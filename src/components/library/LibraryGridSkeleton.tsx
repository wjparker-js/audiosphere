'use client';

import { ViewMode } from '@/types/library';
import { cn } from '@/lib/utils';

interface LibraryGridSkeletonProps {
  viewMode: ViewMode;
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-square bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="animate-pulse bg-gray-800 rounded-lg p-4 flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-700 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-700 rounded w-1/4" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-700 rounded" />
        <div className="w-8 h-8 bg-gray-700 rounded" />
        <div className="w-8 h-8 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function LibraryGridSkeleton({ 
  viewMode, 
  count = 12 
}: LibraryGridSkeletonProps) {
  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
        : 'space-y-2'
    )}>
      {Array.from({ length: count }).map((_, i) => (
        viewMode === 'grid' ? (
          <SkeletonCard key={i} />
        ) : (
          <SkeletonListItem key={i} />
        )
      ))}
    </div>
  );
}