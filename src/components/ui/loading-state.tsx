'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  count?: number;
  type?: 'card' | 'list' | 'blog';
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
        <div className="h-3 bg-gray-700/50 rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-700/50 rounded w-1/4" />
          <div className="h-3 bg-gray-700/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-700/50 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700/50 rounded w-3/4" />
              <div className="h-3 bg-gray-700/50 rounded w-1/2" />
            </div>
            <div className="h-3 bg-gray-700/50 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonBlog() {
  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-700/50 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-700/50 rounded w-full" />
          <div className="h-3 bg-gray-700/50 rounded w-2/3" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-700/50 rounded w-1/4" />
          <div className="h-3 bg-gray-700/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ 
  count = 6, 
  type = 'card',
  className 
}: LoadingStateProps) {
  const SkeletonComponent = {
    card: SkeletonCard,
    list: SkeletonList,
    blog: SkeletonBlog
  }[type];

  if (type === 'list') {
    return (
      <div className={cn("w-full", className)}>
        <SkeletonComponent />
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      type === 'card' && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      type === 'blog' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}