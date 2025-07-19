'use client';

import { Play, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  playCount?: number;
}

interface TrackListProps {
  tracks?: Track[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TrackList({ tracks, loading, error, onRetry }: TrackListProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  const formatPlayCount = (count: number) => {
    if (count >= 1000000000) {
      return `${(count / 1000000000).toFixed(1)}B`;
    } else if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Handle loading state
  if (loading) {
    return <LoadingState count={1} type="list" />;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Handle empty state
  if (!tracks || tracks.length === 0) {
    return (
      <EmptyState
        icon={Play}
        title="No tracks yet"
        description="Upload some music to see popular tracks here."
        actionText="Upload Music"
        onAction={() => console.log('Upload music')}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6">TITLE</div>
        <div className="col-span-3">ALBUM</div>
        <div className="col-span-1 text-center">
          <Clock className="h-3 w-3 mx-auto" />
        </div>
        <div className="col-span-1 text-center">PLAYS</div>
      </div>

      {/* Track List */}
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          className="grid grid-cols-12 gap-3 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors group cursor-pointer"
          onMouseEnter={() => setHoveredTrack(track.id)}
          onMouseLeave={() => setHoveredTrack(null)}
          whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
        >
          {/* Track Number / Play Button */}
          <div className="col-span-1 flex items-center justify-center">
            {hoveredTrack === track.id ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:text-green-400"
              >
                <Play className="h-3 w-3" fill="currentColor" />
              </Button>
            ) : (
              <span className="text-gray-400 text-xs">{index + 1}</span>
            )}
          </div>

          {/* Title and Artist */}
          <div className="col-span-6 flex items-center space-x-2">
            <div>
              <p className="text-white font-medium truncate text-sm">{track.title}</p>
              <p className="text-gray-400 text-xs truncate">{track.artist}</p>
            </div>
          </div>

          {/* Album */}
          <div className="col-span-3 flex items-center">
            <p className="text-gray-400 text-xs truncate">{track.album}</p>
          </div>

          {/* Duration */}
          <div className="col-span-1 flex items-center justify-center">
            <span className="text-gray-400 text-xs">{track.duration}</span>
          </div>

          {/* Play Count */}
          <div className="col-span-1 flex items-center justify-center">
            {hoveredTrack === track.id ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-gray-400 hover:text-white"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            ) : (
              <span className="text-gray-400 text-xs">
                {track.playCount ? formatPlayCount(track.playCount) : '0'}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}