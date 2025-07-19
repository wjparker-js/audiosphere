'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  width?: number;
  height?: number;
}

export function PlaceholderImage({
  src,
  alt,
  className,
  fallbackText,
  width = 300,
  height = 300
}: PlaceholderImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a color based on the text
  const generateColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const displayText = fallbackText || alt || 'No Image';
  const backgroundColor = generateColor(displayText);

  if (!src || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-white font-semibold text-center p-4",
          className
        )}
        style={{
          backgroundColor,
          width: width,
          height: height,
          minHeight: height
        }}
      >
        <span className="text-sm leading-tight break-words">
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-semibold animate-pulse"
          style={{ backgroundColor }}
        >
          <span className="text-sm">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        style={{ width, height }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}