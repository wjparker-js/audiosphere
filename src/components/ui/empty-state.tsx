'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 mb-4 text-gray-400">
          <Icon className="w-full h-full" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}