'use client';

import React, { useState } from 'react';
import { useTrackMutations, usePlaylistMutations, useBlogMutations } from '@/hooks/mutations';
import { useTracks } from '@/hooks/useTracks';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Heart, Plus, Trash2, Edit, MessageCircle, Loader2 } from 'lucide-react';

/**
 * Example component demonstrating React Query server state management
 * with optimistic updates and proper error handling
 */
export function ServerStateExample() {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedBlogPost, setSelectedBlogPost] = useState<number | null>(null);

  // Query hooks for data fetching
  const { data: tracksData, isLoading: tracksLoading, error: tracksError } = useTracks();
  const { data: playlistsData, isLoading: playlistsLoading } = usePlaylists();
  const { data: blogPostsData, isLoading: blogLoading } = useBlogPosts();

  // Mutation hooks for server state updates
  const {
    likeTrack,
    isLikingTrack,
    updatePlayCount,
  } = useTrackMutations();

  const {
    createPlaylist,
    isCreatingPlaylist,
    deletePlaylist,
    isDeletingPlaylist,
    addTrackToPlaylist,
    isAddingTrackToPlaylist,
  } = usePlaylistMutations();

  const {
    createComment,
    isCreatingComment,
    deleteComment,
    isDeletingComment,
  } = useBlogMutations();

  const tracks = tracksData?.data?.tracks || [];
  const playlists = playlistsData?.data?.playlists || [];
  const blogPosts = blogPostsData?.data?.posts || [];

  const handleLikeTrack = (trackId: number, isCurrentlyLiked: boolean) => {
    likeTrack({ trackId, isLiked: isCurrentlyLiked });
  };

  const handlePlayTrack = (trackId: number) => {
    updatePlayCount(trackId);
    // Here you would also trigger the actual audio playback
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist({
        name: newPlaylistName,
        description: 'Created from server state example',
        isPublic: true,
      });
      setNewPlaylistName('');
    }
  };

  const handleDeletePlaylist = (playlistId: number) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId);
    }
  };

  const handleAddTrackToPlaylist = (playlistId: number, trackId: number) => {
    addTrackToPlaylist({ playlistId, trackId });
  };

  const handleCreateComment = () => {
    if (newComment.trim() && selectedBlogPost) {
      createComment({
        blogPostId: selectedBlogPost,
        content: newComment,
      });
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId: number, blogPostId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment({ commentId, blogPostId });
    }
  };

  if (tracksLoading || playlistsLoading || blogLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading server state...</span>
      </div>
    );
  }

  if (tracksError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 dark:text-red-400">
          {tracksError.message || 'Failed to load tracks'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        React Query Server State Example
      </h2>

      {/* Tracks Section with Optimistic Updates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Tracks with Optimistic Like Updates
        </h3>
        <div className="space-y-2">
          {tracks.slice(0, 5).map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {track.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {track.artist} • {track.playCount} plays
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayTrack(track.id)}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                >
                  Play
                </button>
                
                <button
                  onClick={() => handleLikeTrack(track.id, track.isLiked || false)}
                  disabled={isLikingTrack}
                  className={`
                    p-2 rounded-full transition-colors
                    ${track.isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                    }
                    ${isLikingTrack ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists Section with CRUD Operations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Playlists with Optimistic CRUD
        </h3>
        
        {/* Create Playlist */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleCreatePlaylist}
            disabled={isCreatingPlaylist || !newPlaylistName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreatingPlaylist ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create
          </button>
        </div>

        {/* Playlists List */}
        <div className="space-y-2">
          {playlists.slice(0, 5).map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {playlist.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {playlist.trackCount} tracks • by {playlist.ownerName}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {tracks.length > 0 && (
                  <button
                    onClick={() => handleAddTrackToPlaylist(playlist.id, tracks[0].id)}
                    disabled={isAddingTrackToPlaylist}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {isAddingTrackToPlaylist ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    Add Track
                  </button>
                )}
                
                <button
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  disabled={isDeletingPlaylist}
                  className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  {isDeletingPlaylist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Comments Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Blog Comments with Optimistic Updates
        </h3>
        
        {/* Blog Post Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select a blog post to comment on:
          </label>
          <select
            value={selectedBlogPost || ''}
            onChange={(e) => setSelectedBlogPost(Number(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Choose a blog post...</option>
            {blogPosts.slice(0, 3).map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        {/* Comment Creation */}
        {selectedBlogPost && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleCreateComment}
              disabled={isCreatingComment || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCreatingComment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              Comment
            </button>
          </div>
        )}
      </div>

      {/* Features Showcase */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          React Query Features Demonstrated:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Optimistic Updates:</strong> UI updates immediately, reverts on error</li>
          <li>• <strong>Automatic Caching:</strong> Data is cached and reused across components</li>
          <li>• <strong>Background Refetching:</strong> Data stays fresh automatically</li>
          <li>• <strong>Error Handling:</strong> Graceful error recovery with user feedback</li>
          <li>• <strong>Loading States:</strong> Proper loading indicators for better UX</li>
          <li>• <strong>Cache Invalidation:</strong> Related queries update when data changes</li>
        </ul>
      </div>
    </div>
  );
}

export default ServerStateExample;