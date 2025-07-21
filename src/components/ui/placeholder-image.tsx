'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
    <div className={cn("relative w-full h-full", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-semibold animate-pulse"
          style={{ backgroundColor }}
        >
          <span className="text-sm">Loading...</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{ objectPosition: 'center' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${backgroundColor}"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="14">${displayText}</text>
          </svg>`
        ).toString('base64')}`}
      />
    </div>
  );
}