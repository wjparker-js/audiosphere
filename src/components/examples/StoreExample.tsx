'use client';

import React from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useUI } from '@/hooks/useUI';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePlaylists } from '@/hooks/usePlaylists';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';

/**
 * Example component demonstrating Zustand store usage
 * This can be removed once the store is integrated into the main components
 */
export function StoreExample() {
  const {
    currentTrack,
    isPlaying,
    volume,
    muted,
    togglePlay,
    setVolume,
    toggleMute,
  } = usePlayer();

  const {
    theme,
    sidebarExpanded,
    toggleTheme,
    toggleSidebar,
    notifySuccess,
    notifyError,
    notifyInfo,
  } = useUI();

  const {
    preferences,
    setAudioQuality,
    toggleFavoriteGenre,
  } = useUserPreferences();

  const {
    playlists,
    isLoadingPlaylists,
    createPlaylist,
  } = usePlaylists();

  const handleCreatePlaylist = async () => {
    const result = await createPlaylist('Test Playlist', 'Created from store example');
    if (result.success) {
      notifySuccess('Playlist created successfully!');
    } else {
      notifyError(result.error || 'Failed to create playlist');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Zustand Store Example
      </h2>

      {/* Player Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Player State
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentTrack ? `Playing: ${currentTrack.title}` : 'No track selected'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
            
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* UI Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          UI State
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Theme: {theme}
            </button>
            
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Sidebar: {sidebarExpanded ? 'Expanded' : 'Collapsed'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => notifySuccess('Success notification!')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              Success
            </button>
            <button
              onClick={() => notifyError('Error notification!')}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Error
            </button>
            <button
              onClick={() => notifyInfo('Info notification!')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Info
            </button>
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          User Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Audio Quality:
            </label>
            <select
              value={preferences.audioQuality}
              onChange={(e) => setAudioQuality(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Recent searches: {preferences.recentSearches.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Recently played: {preferences.recentlyPlayed.length}
            </span>
          </div>
        </div>
      </div>

      {/* Playlists */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Playlists
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreatePlaylist}
              disabled={isLoadingPlaylists}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingPlaylists ? 'Creating...' : 'Create Test Playlist'}
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total playlists: {playlists.length}
            </span>
          </div>

          {playlists.length > 0 && (
            <div className="space-y-1">
              {playlists.slice(0, 3).map((playlist) => (
                <div
                  key={playlist.id}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  • {playlist.name} ({playlist.trackCount} tracks)
                </div>
              ))}
              {playlists.length > 3 && (
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  ... and {playlists.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <Settings className="w-4 h-4 inline mr-1" />
        This is a demo component showing Zustand store integration. 
        Remove this component once the store is integrated into the main app.
      </div>
    </div>
  );
}

export default StoreExample;