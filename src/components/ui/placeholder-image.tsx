'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlaceholderImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export function PlaceholderImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fill = false,
  sizes 
}: PlaceholderImageProps) {
  const [imageError, setImageError] = useState(false);

  // Generate a gradient based on the alt text
  const generateGradient = (text: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (imageError || !src) {
    return (
      <div 
        className={`bg-gradient-to-br ${generateGradient(alt)} flex items-center justify-center text-white font-semibold ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-xs text-center p-2 opacity-75">
          {alt.split(' ').map(word => word[0]).join('').toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}