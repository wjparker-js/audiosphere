'use client';

import { useState } from 'react';
import { 
  Grid3X3, 
  List, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Type,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortBy, SortOrder, ViewMode } from '@/types/library';
import { cn } from '@/lib/utils';

interface LibraryControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  selectedCount: number;
  onBulkAction?: (action: string) => void;
}

const sortOptions = [
  { key: 'date' as SortBy, label: 'Date Created', icon: Calendar },
  { key: 'title' as SortBy, label: 'Title', icon: Type },
  { key: 'modified' as SortBy, label: 'Last Modified', icon: Clock },
  { key: 'type' as SortBy, label: 'Content Type', icon: Layers },
];

export function LibraryControls({
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectedCount,
  onBulkAction
}: LibraryControlsProps) {
  const currentSort = sortOptions.find(option => option.key === sortBy);
  const SortIcon = currentSort?.icon || Calendar;

  const handleSortSelect = (newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same sort option is selected
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Use default order for new sort option
      onSortChange(newSortBy, 'desc');
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Bulk Actions (shown when items are selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction?.('delete')}
              className="text-white hover:bg-orange-700 h-7 px-2"
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction?.('publish')}
              className="text-white hover:bg-orange-700 h-7 px-2"
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction?.('unpublish')}
              className="text-white hover:bg-orange-700 h-7 px-2"
            >
              Unpublish
            </Button>
          </div>
        </div>
      )}

      {/* Regular Controls */}
      {selectedCount === 0 && (
        <>
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <SortIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{currentSort?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ArrowDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                {sortOptions.map((option) => {
                  const OptionIcon = option.icon;
                  const isActive = option.key === sortBy;
                  
                  return (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => handleSortSelect(option.key)}
                      className={cn(
                        "text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer",
                        isActive && "text-orange-400"
                      )}
                    >
                      <OptionIcon className="w-4 h-4 mr-2" />
                      <span>{option.label}</span>
                      {isActive && (
                        <div className="ml-auto">
                          {sortOrder === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'grid'
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'list'
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}