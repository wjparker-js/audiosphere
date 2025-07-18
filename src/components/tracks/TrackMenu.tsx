'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal,
  Plus,
  Download,
  Share2,
  Mail,
  Link,
  Code,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track, TrackAction } from '@/types/track';
import { CreatePlaylistModal } from '@/components/modals/CreatePlaylistModal';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackMenuProps {
  track: Track;
  onAction: (action: TrackAction, track: Track) => void;
}

export function TrackMenu({ track, onAction }: TrackMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showShareSubmenu, setShowShareSubmenu] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowShareSubmenu(false);
        setShowPlaylistSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user playlists when playlist submenu is opened
  useEffect(() => {
    if (showPlaylistSubmenu && playlists.length === 0) {
      fetchUserPlaylists();
    }
  }, [showPlaylistSubmenu]);

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlaylists(data.playlists || []);
        }
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleMenuClick = (action: TrackAction) => {
    onAction(action, track);
    setIsOpen(false);
    setShowShareSubmenu(false);
  };

  const handlePlaylistCreated = async (playlist: any) => {
    // Add the new playlist to the list
    setPlaylists(prev => [playlist, ...prev]);
    // Add the track to the new playlist
    await handleAddToPlaylist(playlist.id);
    // Close menus
    setIsOpen(false);
    setShowPlaylistSubmenu(false);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id
        }),
      });

      if (response.ok) {
        console.log('Track added to playlist successfully');
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error adding track to playlist:', error);
    }
    
    setIsOpen(false);
    setShowPlaylistSubmenu(false);
  };

  const handleShareAction = (shareType: string) => {
    switch (shareType) {
      case 'email':
        // Handle email sharing
        const emailSubject = `Check out "${track.title}" by ${track.artist}`;
        const emailBody = `I thought you might like this track: "${track.title}" by ${track.artist}`;
        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
        break;
      case 'copy':
        // Copy link to clipboard
        const trackUrl = `${window.location.origin}/tracks/${track.id}`;
        navigator.clipboard.writeText(trackUrl).then(() => {
          // You could show a toast notification here
          console.log('Link copied to clipboard');
        });
        break;
      case 'embed':
        // Copy embed code
        const embedCode = `<iframe src="${window.location.origin}/embed/track/${track.id}" width="400" height="100"></iframe>`;
        navigator.clipboard.writeText(embedCode).then(() => {
          console.log('Embed code copied to clipboard');
        });
        break;
    }
    setIsOpen(false);
    setShowShareSubmenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            <div className="py-1">
              {/* Add to Playlist - with left submenu */}
              <div className="relative">
                <button
                  onClick={() => setShowPlaylistSubmenu(!showPlaylistSubmenu)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to playlist
                  <span className="ml-auto text-xs">‹</span>
                </button>

                <AnimatePresence>
                  {showPlaylistSubmenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-full top-0 mr-1 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                    >
                      <div className="py-1">
                        {/* Create New Playlist */}
                        <button
                          onClick={() => {
                            setShowCreatePlaylistModal(true);
                            setIsOpen(false);
                            setShowPlaylistSubmenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-gray-700 hover:text-green-300 flex items-center gap-3 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create playlist
                        </button>

                        {/* Existing Playlists */}
                        {playlists.length > 0 && (
                          <>
                            <div className="border-t border-gray-700 my-1"></div>
                            {playlists.map((playlist) => (
                              <button
                                key={playlist.id}
                                onClick={() => handleAddToPlaylist(playlist.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                              >
                                <div className="w-4 h-4 bg-gray-600 rounded flex-shrink-0"></div>
                                <span className="truncate">{playlist.name}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Download */}
              <button
                onClick={() => handleMenuClick('download')}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {/* Share - with left submenu */}
              <div className="relative">
                <button
                  onClick={() => setShowShareSubmenu(!showShareSubmenu)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                  <span className="ml-auto text-xs">‹</span>
                </button>

                <AnimatePresence>
                  {showShareSubmenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-full top-0 mr-1 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => handleShareAction('email')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Share via Email
                        </button>
                        <button
                          onClick={() => handleShareAction('copy')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                        >
                          <Link className="w-4 h-4" />
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShareAction('embed')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                        >
                          <Code className="w-4 h-4" />
                          Embed
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 my-1"></div>

              {/* Remove */}
              <button
                onClick={() => handleMenuClick('remove')}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove from album
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onPlaylistCreated={handlePlaylistCreated}
        initialTrackId={track.id}
      />
    </div>
  );
}