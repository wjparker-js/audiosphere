'use client';

import { Grid, List, Calendar, Type, Eye, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogSortBy, BlogSortOrder, BlogViewMode } from '@/types/blog';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BlogControlsProps {
  viewMode: BlogViewMode;
  onViewModeChange: (mode: BlogViewMode) => void;
  sortBy: BlogSortBy;
  sortOrder: BlogSortOrder;
  onSortChange: (sortBy: BlogSortBy, sortOrder: BlogSortOrder) => void;
}

export function BlogControls({
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange
}: BlogControlsProps) {
  const sortOptions = [
    { key: 'date' as BlogSortBy, label: 'Date Created', icon: Calendar },
    { key: 'title' as BlogSortBy, label: 'Title', icon: Type },
    { key: 'views' as BlogSortBy, label: 'Views', icon: Eye },
    { key: 'comments' as BlogSortBy, label: 'Comments', icon: MessageCircle },
  ];

  const currentSort = sortOptions.find(option => option.key === sortBy);

  const handleSortClick = () => {
    // Toggle sort order if same sort type, otherwise use desc as default
    const newOrder = sortBy === 'date' && sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(sortBy, newOrder);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSortClick}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white h-9 px-3"
        >
          {currentSort && <currentSort.icon className="w-4 h-4 mr-2" />}
          <span className="hidden sm:inline">Sort by </span>
          <span>{currentSort?.label || 'Date'}</span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-1 transition-transform",
            sortOrder === 'asc' && "rotate-180"
          )} />
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "h-8 w-8 p-0 transition-all duration-200",
            viewMode === 'grid'
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={cn(
            "h-8 w-8 p-0 transition-all duration-200",
            viewMode === 'list'
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}