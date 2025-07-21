'use client';

import { TrackList } from '@/components/tracks/TrackList';
import { TrackControls } from '@/components/tracks/TrackControls';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
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

        {/* Search and Sort Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Sort Controls (Quick Filters) */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'recently-added', label: 'Recently Added' },
                { key: 'title', label: 'Title' },
                { key: 'artist', label: 'Artist' },
                { key: 'album', label: 'Album' },
                { key: 'plays', label: 'Plays' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    if (sortBy === option.key) {
                      handleSortChange(option.key, sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      handleSortChange(option.key, 'asc');
                    }
                  }}
                  className={`h-8 px-3 text-sm transition-colors flex items-center gap-1 rounded-lg ${
                    sortBy === option.key
                      ? "bg-orange-500 text-white"
                      : "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500"
                  }`}
                >
                  {option.label}
                  {sortBy === option.key && (
                    sortOrder === 'asc' ? (
                      <span className="text-xs">↑</span>
                    ) : (
                      <span className="text-xs">↓</span>
                    )
                  )}
                </button>
              ))}
            </div>

            {/* Search Field */}
            <div className="relative flex-1 max-w-md lg:ml-4">
              <input
                type="text"
                placeholder="Search liked songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
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