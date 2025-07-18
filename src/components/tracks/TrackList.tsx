'use client';

import { TrackListItem } from './TrackListItem';
import { Track, TrackAction } from '@/types/track';

interface TrackListProps {
  tracks: Track[];
  onAction: (action: TrackAction, track: Track) => void;
  currentPlayingId?: string;
}

export function TrackList({ tracks, onAction, currentPlayingId }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💔</div>
        <h3 className="text-xl font-semibold text-white mb-2">No liked songs yet</h3>
        <p className="text-gray-400 mb-6">
          Start liking songs to build your personal collection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header Row */}
      <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
        <div className="w-8 text-center">#</div>
        <div className="w-12"></div>
        <div className="w-[300px] truncate">Title</div>
        <div className="hidden md:block w-[200px] truncate">Album</div>
        <div className="hidden sm:block w-[80px] text-right">Duration</div>
        <div className="hidden lg:block w-[100px] text-right">Plays</div>
        <div className="w-[80px]"></div>
      </div>

      {/* Track List */}
      {tracks.map((track, index) => (
        <TrackListItem
          key={track.id}
          track={track}
          index={index}
          isPlaying={currentPlayingId === track.id}
          onAction={onAction}
        />
      ))}
    </div>
  );
}