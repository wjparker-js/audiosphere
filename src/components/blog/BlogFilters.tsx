'use client';

import { useState } from 'react';
import { BlogFilterType } from '@/types/blog';
import { SearchField } from '@/components/ui/SearchField';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Edit, Clock } from 'lucide-react';

// Filter button component
function FilterButton({ 
  label, 
  count, 
  active, 
  onClick, 
  icon: Icon 
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-[70px] h-7",
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500"
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{label}</span>
      <span className={cn(
        "text-xs flex-shrink-0",
        active ? "text-orange-100" : "text-gray-500"
      )}>
        {count}
      </span>
    </motion.button>
  );
}

interface BlogFiltersProps {
  activeFilter: BlogFilterType;
  onFilterChange: (filter: BlogFilterType) => void;
  counts: {
    all: number;
    published: number;
    drafts: number;
    scheduled: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export function BlogFilters({
  activeFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  loading = false
}: BlogFiltersProps) {
  const filters = [
    { 
      key: 'all' as BlogFilterType, 
      label: 'All Posts', 
      count: counts.all,
      icon: Sparkles
    },
    { 
      key: 'published' as BlogFilterType, 
      label: 'Published', 
      count: counts.published,
      icon: CheckCircle
    },
    { 
      key: 'drafts' as BlogFilterType, 
      label: 'Drafts', 
      count: counts.drafts,
      icon: Edit
    },
    { 
      key: 'scheduled' as BlogFilterType, 
      label: 'Scheduled', 
      count: counts.scheduled,
      icon: Clock
    }
  ];

  if (loading) {
    return (
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-10 w-24 bg-gray-800/50 rounded-lg animate-pulse flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Filter Buttons and Search Container - Mobile: stacked, Desktop: side by side */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Filter Buttons */}
        <div className="flex gap-0.5 flex-shrink-0">
          {filters.map((filter, index) => (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FilterButton
                label={filter.label}
                count={filter.count}
                active={activeFilter === filter.key}
                onClick={() => onFilterChange(filter.key)}
                icon={filter.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* Search Field - Next line on mobile, same line on desktop */}
        <div className="w-full lg:w-auto lg:min-w-[320px] lg:max-w-lg lg:ml-4">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search blog posts..."
            className="w-full"
          />
        </div>
      </div>
    </motion.div>
  );
}