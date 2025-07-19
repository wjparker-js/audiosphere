'use client';

import { TrackList } from '@/components/tracks/TrackList';
import { TrackFilters } from '@/components/tracks/TrackFilters';
import { TrackControls } from '@/components/tracks/TrackControls';
import { SearchField } from '@/components/ui/SearchField';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { Heart } from 'lucide-react';

export default function LikedSongsPage() {
  const {
    tracks,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    sortBy,
    sortOrder,
    currentPlayingId,
    handleTrackAction,
    handlePlayAll,
    handleShuffle,
    handleDownloadAll,
    handleSortChange
  } = useLikedTracks();

  // Get the currently playing track
  const currentTrack = tracks.find(track => track.id === currentPlayingId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Liked Songs</h1>
              <p className="text-gray-400">Your personal music collection</p>
            </div>
          </div>
        </div>

        {/* Filters and Search - Desktop: side by side, Mobile: stacked */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <TrackFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Search Field - Right of buttons on desktop, below on mobile */}
          <div className="w-full lg:w-auto lg:min-w-[320px] lg:max-w-lg lg:ml-4">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search liked songs..."
              className="w-full"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <TrackControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onPlayAll={handlePlayAll}
            onShuffle={handleShuffle}
            onDownloadAll={handleDownloadAll}
            totalTracks={tracks.length}
          />
        </div>

        {/* Track List */}
        <div className="bg-black/20 rounded-lg p-4">
          <TrackList
            tracks={tracks}
            onAction={handleTrackAction}
            currentPlayingId={currentPlayingId}
          />
        </div>
      </div>

      {/* Music Player */}
      {currentTrack && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50">
          <MusicPlayer
            track={currentTrack}
            isPlaying={currentPlayingId === currentTrack.id}
            onPlayPause={() => handleTrackAction(
              currentPlayingId === currentTrack.id ? 'pause' : 'play', 
              currentTrack
            )}
            onLike={() => handleTrackAction('like', currentTrack)}
          />
        </div>
      )}
    </div>
  );
}