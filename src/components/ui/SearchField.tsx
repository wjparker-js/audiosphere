'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchField({ value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-gray-200 text-gray-900 placeholder-gray-500 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200"
      />
    </div>
  );
}