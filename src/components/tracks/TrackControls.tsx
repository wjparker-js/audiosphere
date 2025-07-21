'use client';

import { Button } from '@/components/ui/button';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Play, 
  Shuffle,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { TrackSortType } from '@/types/track';
import { cn } from '@/lib/utils';

interface TrackControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: TrackSortType;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: TrackSortType, order: 'asc' | 'desc') => void;
  onPlayAll: () => void;
  onShuffle: () => void;
  onDownloadAll: () => void;
  totalTracks: number;
}

const sortOptions: { key: TrackSortType; label: string }[] = [
  { key: 'recently-added', label: 'Recently Added' },
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'plays', label: 'Plays' }
];

export function TrackControls({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onPlayAll,
  onShuffle,
  onDownloadAll,
  totalTracks
}: TrackControlsProps) {
  return (
    <div className="space-y-4">
      {/* Search and Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search liked songs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onPlayAll}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 h-9"
          >
            <Play className="w-4 h-4 mr-2" fill="currentColor" />
            Play All
          </Button>
          
          <Button
            variant="outline"
            onClick={onShuffle}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 h-9"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          
          <Button
            variant="ghost"
            onClick={onDownloadAll}
            className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 h-9"
            title="Download all"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 h-9"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.key}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy === option.key) {
                onSortChange(option.key, sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                onSortChange(option.key, 'asc');
              }
            }}
            className={cn(
              "h-8 px-3 text-sm transition-colors flex items-center gap-1",
              sortBy === option.key
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            {option.label}
            {sortBy === option.key && (
              sortOrder === 'asc' ? (
                <SortAsc className="w-3 h-3" />
              ) : (
                <SortDesc className="w-3 h-3" />
              )
            )}
          </Button>
        ))}
      </div>

      {/* Track Count */}
      <div className="text-sm text-gray-400">
        {totalTracks} {totalTracks === 1 ? 'song' : 'songs'}
      </div>
    </div>
  );
}