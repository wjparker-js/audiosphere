'use client';

import { motion } from 'framer-motion';
import { BlogViewMode } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogGridSkeletonProps {
  viewMode: BlogViewMode;
}

export function BlogGridSkeleton({ viewMode }: BlogGridSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30 animate-pulse max-h-[120px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Thumbnail skeleton */}
            <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
            
            {/* Stats skeleton - hidden on mobile */}
            <div className="hidden md:flex gap-4 flex-shrink-0">
              <div className="h-3 bg-gray-700 rounded w-8" />
              <div className="h-3 bg-gray-700 rounded w-8" />
            </div>
            
            {/* Date skeleton - hidden on mobile */}
            <div className="hidden md:block w-24">
              <div className="h-3 bg-gray-700 rounded w-full" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid view skeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "bg-gray-800/30 rounded-2xl overflow-hidden animate-pulse",
            // First item is double-wide
            i === 0 && "md:col-span-2 lg:col-span-2"
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {/* Image skeleton */}
          <div className={cn(
            "bg-gray-700",
            i === 0 ? "aspect-[2/1]" : "aspect-square"
          )} />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className={cn(
                "bg-gray-700 rounded",
                i === 0 ? "h-5 w-3/4" : "h-4 w-3/4"
              )} />
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
            </div>
            
            {/* Metadata skeleton */}
            <div className="flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-24" />
              <div className="flex gap-4">
                <div className="h-3 bg-gray-700 rounded w-8" />
                <div className="h-3 bg-gray-700 rounded w-8" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}