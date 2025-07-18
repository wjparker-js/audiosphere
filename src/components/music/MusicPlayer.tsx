'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart
} from 'lucide-react';
import { Track } from '@/types/track';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: () => void;
}

export function MusicPlayer({ 
  track, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onLike 
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else if (onNext) {
        onNext();
      }
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [isDragging, isRepeat, onNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle track changes - when a new track is selected, reset the audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset audio state when track changes
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);

    // If the track should be playing, start it immediately
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [track.id, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="bg-gray-900 border-t border-gray-700 h-[60px] flex items-center px-4 gap-4">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        preload="metadata"
      />

      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 w-64">
        <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
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
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">
            {track.title}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {track.artist}
          </div>
        </div>
        {onLike && (
          <button
            onClick={onLike}
            className={cn(
              "p-1 rounded transition-colors",
              track.isLiked 
                ? "text-red-500 hover:text-red-400" 
                : "text-gray-400 hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", track.isLiked && "fill-current")} />
          </button>
        )}
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-md mx-auto">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(
              "p-1 rounded transition-colors",
              isShuffle ? "text-green-500" : "text-gray-400 hover:text-white"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={onPlayPause}
            className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            )}
          </button>
          
          {onNext && (
            <button
              onClick={onNext}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn(
              "p-1 rounded transition-colors",
              isRepeat ? "text-green-500" : "text-gray-400 hover:text-white"
            )}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-gray-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 w-32">
        <button
          onClick={toggleMute}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <div
          className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group"
          onClick={handleVolumeChange}
        >
          <div
            className="h-full bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
            style={{ width: `${volumePercent}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}