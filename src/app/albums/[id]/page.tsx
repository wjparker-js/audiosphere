'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { TrackList } from '@/components/tracks/TrackList';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { AddTrackModal } from '@/components/modals/AddTrackModal';
import { Track, TrackAction } from '@/types/track';

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_image_url: string;
  genre: string;
  release_date: string;
  description: string;
  track_count: number;
  created_at: string;
}

export default function AlbumDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const fetchAlbumAndTracks = async () => {
      try {
        // Fetch album details
        const albumResponse = await fetch(`/api/albums/${albumId}`);
        if (albumResponse.ok) {
          const albumData = await albumResponse.json();
          if (albumData.success) {
            setAlbum(albumData.album);
          }
        }

        // Fetch tracks for this album
        const tracksResponse = await fetch(`/api/albums/${albumId}/tracks`);
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          if (tracksData.success) {
            // Fetch user's liked tracks to determine like status
            const userId = 1; // Mock user ID - replace with actual auth
            let likedTrackIds: Set<string> = new Set();
            
            try {
              const likedResponse = await fetch(`/api/users/${userId}/liked-tracks`);
              if (likedResponse.ok) {
                const likedData = await likedResponse.json();
                if (likedData.success) {
                  likedTrackIds = new Set(likedData.data.tracks.map((track: any) => track.id));
                  console.log('🔍 Debug: Liked track IDs from API:', Array.from(likedTrackIds));
                } else {
                  console.error('🔍 Debug: Liked tracks API response not successful:', likedData);
                }
              } else {
                console.error('🔍 Debug: Liked tracks API failed:', likedResponse.status);
              }
            } catch (error) {
              console.error('Error fetching liked tracks:', error);
            }

            // Convert API tracks to Track interface format
            const formattedTracks: Track[] = tracksData.tracks.map((track: any) => {
              const trackIdString = track.id.toString();
              const isLiked = likedTrackIds.has(trackIdString);
              console.log(`🔍 Debug: Track "${track.title}" (ID: ${trackIdString}): isLiked = ${isLiked}`);
              
              return {
                id: trackIdString,
                title: track.title,
                artist: track.artist,
                album: track.album_title,
                duration: track.duration,
                plays: track.play_count || 0,
                thumbnail: track.album_cover || '/api/placeholder/48/48',
                audioUrl: track.file_path,
                isLiked: isLiked,
              };
            });
            setTracks(formattedTracks);
          }
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumAndTracks();
    }
  }, [albumId]);

  const handleTrackAction = async (action: TrackAction, track: Track) => {
    switch (action) {
      case 'play':
        // Always set the new track to play, regardless of current state
        setCurrentPlayingId(track.id);
        setCurrentTrack(track);
        
        // Increment play count
        try {
          const response = await fetch(`/api/tracks/${track.id}/play`, {
            method: 'POST',
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              // Update the track's play count in the UI
              setTracks(prev => prev.map(t => 
                t.id === track.id ? { ...t, plays: result.data.newPlayCount } : t
              ));
            }
          }
        } catch (error) {
          console.error('Error updating play count:', error);
        }
        break;
        
      case 'pause':
        // Only pause if the clicked track is currently playing
        if (currentPlayingId === track.id) {
          setCurrentPlayingId(null);
        }
        break;
        
      case 'like':
        // If track is already liked, do nothing
        if (track.isLiked) {
          console.log(`Track "${track.title}" is already liked - no action taken`);
          return;
        }
        
        // Optimistic UI update - only for liking (not unliking)
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, isLiked: true } : t
        ));
        
        try {
          const response = await fetch(`/api/tracks/${track.id}/like`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            // Revert optimistic update on error
            setTracks(prev => prev.map(t => 
              t.id === track.id ? { ...t, isLiked: false } : t
            ));
            
            const errorData = await response.json();
            console.error('Error liking track:', errorData.error);
            
            // Show error message to user (you could add a toast notification here)
            alert(`Failed to like track: ${errorData.error}`);
          }
        } catch (error) {
          // Revert optimistic update on network error
          setTracks(prev => prev.map(t => 
            t.id === track.id ? { ...t, isLiked: false } : t
          ));
          console.error('Network error liking track:', error);
          alert('Network error: Failed to like track');
        }
        break;
        
      default:
        console.log(`${action} action on ${track.title}`);
    }
  };

  const handleAddTrack = () => {
    setShowAddTrackModal(true);
  };

  const handleTrackAdded = () => {
    // Refresh tracks after adding a new one
    const fetchTracks = async () => {
      try {
        const tracksResponse = await fetch(`/api/albums/${albumId}/tracks`);
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          if (tracksData.success) {
            // Fetch user's liked tracks to determine like status
            const userId = 1; // Mock user ID - replace with actual auth
            let likedTrackIds: Set<string> = new Set();
            
            try {
              const likedResponse = await fetch(`/api/users/${userId}/liked-tracks`);
              if (likedResponse.ok) {
                const likedData = await likedResponse.json();
                if (likedData.success) {
                  likedTrackIds = new Set(likedData.data.tracks.map((track: any) => track.id));
                }
              }
            } catch (error) {
              console.error('Error fetching liked tracks:', error);
            }

            const formattedTracks: Track[] = tracksData.tracks.map((track: any) => ({
              id: track.id.toString(),
              title: track.title,
              artist: track.artist,
              album: track.album_title,
              duration: track.duration,
              plays: track.play_count || 0,
              thumbnail: track.album_cover || '/api/placeholder/48/48',
              audioUrl: track.file_path,
              isLiked: likedTrackIds.has(track.id.toString()),
            }));
            setTracks(formattedTracks);
          }
        }
      } catch (error) {
        console.error('Error refreshing tracks:', error);
      }
    };
    
    fetchTracks();
  };

  const handleDeleteAlbum = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== album?.title) {
      alert('Please type the exact album name to confirm deletion.');
      return;
    }

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Album has been marked as deleted and can be restored if needed.');
          router.push('/');
        } else {
          alert('Failed to delete album: ' + result.error);
        }
      } else {
        alert('Failed to delete album. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="flex gap-6 mb-8">
              <div className="w-48 h-48 bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-700 rounded w-64 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Album not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">


      {/* Album Info */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Album Cover */}
          <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
            <img
              src={album.cover_image_url || '/api/placeholder/192/192'}
              alt={`${album.title} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/192/192';
              }}
            />
          </div>

          {/* Album Details */}
          <div className="flex-1 relative">
            {/* Action Buttons - Top Right */}
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <button
                onClick={handleAddTrack}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                title="Add Track"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteAlbum}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                title="Delete Album"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider">ALBUM</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 pr-24">{album.title}</h1>
            
            <div className="flex items-center gap-2 text-gray-300 mb-4">
              <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                👤
              </span>
              <span className="font-medium">{album.artist}</span>
              <span>•</span>
              <span>{new Date(album.release_date || album.created_at).getFullYear()}</span>
              <span>•</span>
              <span>{tracks.length} songs</span>
              <span>•</span>
              <span>3:00</span>
            </div>

            {album.genre && (
              <div className="mb-4">
                <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {album.genre}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Track List with Scrolling */}
        <div className="bg-black/20 rounded-lg">
          <div className="p-4 pb-0">
            <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          </div>
          <div 
            className="px-4 pb-4 overflow-y-scroll album-tracklist-scroll"
            style={{ 
              maxHeight: currentTrack ? 'calc(100vh - 500px)' : 'calc(100vh - 440px)',
              minHeight: '200px'
            }}
          >
            <TrackList
              tracks={tracks}
              onAction={handleTrackAction}
              currentPlayingId={currentPlayingId || undefined}
            />
          </div>
        </div>
      </div>

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={showAddTrackModal}
        onClose={() => setShowAddTrackModal(false)}
        albumId={albumId}
        albumTitle={album?.title || ''}
        onTrackAdded={handleTrackAdded}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Album</h3>
            <p className="text-gray-300 mb-4">
              This action will mark the album as deleted. It can be restored later if needed.
            </p>
            <p className="text-gray-300 mb-4">
              To confirm, please type the album name: <strong>"{album?.title}"</strong>
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type album name here"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText !== album?.title}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Delete Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Player */}
      {currentTrack && (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-50">
          <MusicPlayer
            track={currentTrack}
            isPlaying={currentPlayingId === currentTrack.id}
            onPlayPause={() => handleTrackAction(
              currentPlayingId === currentTrack.id ? 'pause' : 'play', 
              currentTrack
            )}
          />
        </div>
      )}
    </div>
  );
}