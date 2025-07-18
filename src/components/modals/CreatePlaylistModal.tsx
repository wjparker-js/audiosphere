'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Playlist {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
}

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlist: Playlist) => void;
  initialTrackId?: string;
}

export function CreatePlaylistModal({
  isOpen,
  onClose,
  onPlaylistCreated,
  initialTrackId
}: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPlaylistName('');
      setError('');
      setIsLoading(false);
      // Focus input after modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistName.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName.trim(),
          description: '',
          isPublic: false
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If we have an initial track, add it to the new playlist
        if (initialTrackId && data.playlist) {
          try {
            await fetch(`/api/playlists/${data.playlist.id}/tracks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                trackId: initialTrackId
              }),
            });
          } catch (error) {
            console.error('Failed to add track to new playlist:', error);
          }
        }

        onPlaylistCreated?.(data.playlist);
        onClose();
      } else {
        setError(data.error || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md p-6 relative"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="pr-8">
          <h2 id="modal-title" className="text-xl font-semibold text-white mb-6">
            Create new playlist
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Playlist Name Input */}
            <div className="mb-6">
              <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
                Playlist name
              </label>
              <input
                ref={inputRef}
                id="playlist-name"
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="My Playlist #1"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!playlistName.trim() || isLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}