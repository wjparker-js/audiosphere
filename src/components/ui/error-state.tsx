'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  showIcon?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try again",
  className,
  showIcon = true
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )}>
      {showIcon && (
        <div className="w-16 h-16 mb-4 text-red-400">
          <AlertCircle className="w-full h-full" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
}