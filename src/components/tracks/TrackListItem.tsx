'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track, TrackAction } from '@/types/track';
import { TrackMenu } from './TrackMenu';
import { cn } from '@/lib/utils';

interface TrackListItemProps {
  track: Track;
  index: number;
  isPlaying?: boolean;
  onAction: (action: TrackAction, track: Track) => void;
}

export function TrackListItem({ 
  track, 
  index, 
  isPlaying = false, 
  onAction 
}: TrackListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-md group relative",
        isPlaying ? "bg-white/10" : "hover:bg-white/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Number/Play Button */}
      <div className="w-8 text-center">
        {isPlaying ? (
          isHovered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction('pause', track)}
              className="h-8 w-8 p-0 text-green-500 hover:text-white hover:bg-green-500 rounded-full mx-auto"
            >
              <Pause className="w-4 h-4" fill="currentColor" />
            </Button>
          ) : (
            <div className="w-4 h-4 text-green-500 mx-auto cursor-pointer" onClick={() => onAction('pause', track)}>
              <span className="sr-only">Now playing - click to pause</span>
              <div className="w-1 h-4 bg-green-500 animate-music-bar-1 inline-block"></div>
              <div className="w-1 h-4 bg-green-500 animate-music-bar-2 mx-0.5 inline-block"></div>
              <div className="w-1 h-4 bg-green-500 animate-music-bar-3 inline-block"></div>
            </div>
          )
        ) : isHovered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('play', track)}
            className="h-8 w-8 p-0 text-white hover:text-white hover:bg-green-500 rounded-full mx-auto"
          >
            <Play className="w-4 h-4" fill="currentColor" />
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">{index + 1}</span>
        )}
      </div>

      {/* Track Thumbnail */}
      <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
        <img 
          src={track.thumbnail} 
          alt={track.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Track Info */}
      <div className="w-[300px] truncate ml-3">
        <div className="text-white font-medium truncate">{track.title}</div>
        <div className="text-gray-400 text-sm truncate">{track.artist}</div>
      </div>

      {/* Album (hidden on small screens) */}
      <div className="hidden md:block w-[200px] text-gray-400 text-sm truncate">
        {track.album}
      </div>

      {/* Duration (hidden on very small screens) */}
      <div className="hidden sm:block w-[80px] text-right text-gray-400 text-sm">
        {track.duration}
      </div>

      {/* Play Count (hidden on medium screens) */}
      <div className="hidden lg:block w-[100px] text-right text-gray-400 text-sm">
        {typeof track.plays === 'number' 
          ? track.plays.toLocaleString() 
          : track.plays}
      </div>

      {/* Actions */}
      <div className="w-[80px] flex items-center">
        {/* Like Button - Always visible */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction('like', track)}
          className={cn(
            "h-8 w-8 p-0",
            track.isLiked 
              ? "text-red-500 hover:text-red-400" 
              : "text-gray-400 hover:text-white"
          )}
          title={track.isLiked ? "Remove from liked songs" : "Add to liked songs"}
        >
          <Heart className={cn("w-4 h-4", track.isLiked && "fill-current")} />
        </Button>

        {/* Menu Button - Show on hover */}
        <div className={cn(
          "transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <TrackMenu track={track} onAction={onAction} />
        </div>
      </div>
    </div>
  );
}