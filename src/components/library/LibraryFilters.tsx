'use client';

import { useState } from 'react';
import { FilterType } from '@/types/library';
import { SearchField } from '@/components/ui/SearchField';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Music, List, FileText, Sparkles } from 'lucide-react';

// Main filter button component with icon and count
function MainFilterButton({ 
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

// Quick filter button component (no icon, no count)
function QuickFilterButton({ 
  label, 
  active, 
  onClick 
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-[70px] h-7",
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500"
      )}
    >
      {label}
    </motion.button>
  );
}

interface LibraryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    playlists: number;
    albums: number;
    blogs: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export function LibraryFilters({
  activeFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  loading = false
}: LibraryFiltersProps) {
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const mainFilters = [
    { 
      key: 'all' as FilterType, 
      label: 'All Items', 
      count: counts.all,
      icon: Sparkles
    },
    { 
      key: 'albums' as FilterType, 
      label: 'Albums', 
      count: counts.albums,
      icon: Music
    },
    { 
      key: 'playlists' as FilterType, 
      label: 'Playlists', 
      count: counts.playlists,
      icon: List
    },
    { 
      key: 'blogs' as FilterType, 
      label: 'Blogs', 
      count: counts.blogs,
      icon: FileText
    }
  ];

  const quickFilters = ['Recent', 'Popular', 'Favorites', 'Drafts'];

  const handleQuickFilterClick = (filter: string) => {
    setActiveQuickFilter(activeQuickFilter === filter ? null : filter);
  };

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
      {/* Filter Groups and Search Container - Desktop: side by side, Mobile: stacked */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Filter Buttons */}
          <div className="flex gap-0.5 flex-shrink-0">
            {mainFilters.map((filter, index) => (
              <motion.div
                key={filter.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MainFilterButton
                  label={filter.label}
                  count={filter.count}
                  active={activeFilter === filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  icon={filter.icon}
                />
              </motion.div>
            ))}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex gap-0.5 flex-shrink-0">
            {quickFilters.map((filter, index) => (
              <motion.div
                key={filter}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <QuickFilterButton
                  label={filter}
                  active={activeQuickFilter === filter}
                  onClick={() => handleQuickFilterClick(filter)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Field - Right of buttons on desktop, below on mobile */}
        <div className="w-full lg:w-auto lg:min-w-[320px] lg:max-w-lg lg:ml-4">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search your library..."
            className="w-full"
          />
        </div>
      </div>
    </motion.div>
  );
}