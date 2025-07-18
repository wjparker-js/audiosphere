'use client';

import { Button } from '@/components/ui/button';
import { TrackFilterType } from '@/types/track';
import { cn } from '@/lib/utils';

interface TrackFiltersProps {
  activeFilter: TrackFilterType;
  onFilterChange: (filter: TrackFilterType) => void;
}

const filters: { key: TrackFilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'recently-added', label: 'Recently Added' },
  { key: 'most-played', label: 'Most Played' },
  { key: 'artist', label: 'By Artist' },
  { key: 'album', label: 'By Album' }
];

export function TrackFilters({ activeFilter, onFilterChange }: TrackFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            "h-8 px-3 text-sm transition-colors",
            activeFilter === filter.key
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}