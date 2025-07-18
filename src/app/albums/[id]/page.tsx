'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Play, Pause, MoreHorizontal } from 'lucide-react';
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
            // Convert API tracks to Track interface format
            const formattedTracks: Track[] = tracksData.tracks.map((track: any) => ({
              id: track.id.toString(),
              title: track.title,
              artist: track.artist,
              album: track.album_title,
              duration: track.duration,
              plays: track.play_count || 0,
              thumbnail: track.album_cover || '/api/placeholder/48/48',
              audioUrl: track.file_path,
              isLiked: false, // TODO: Check if user has liked this track
            }));
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

  const handleTrackAction = (action: TrackAction, track: Track) => {
    switch (action) {
      case 'play':
        // Always set the new track to play, regardless of current state
        setCurrentPlayingId(track.id);
        setCurrentTrack(track);
        break;
      case 'pause':
        // Only pause if the clicked track is currently playing
        if (currentPlayingId === track.id) {
          setCurrentPlayingId(null);
        }
        break;
      case 'like':
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, isLiked: !t.isLiked } : t
        ));
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
            const formattedTracks: Track[] = tracksData.tracks.map((track: any) => ({
              id: track.id.toString(),
              title: track.title,
              artist: track.artist,
              album: track.album_title,
              duration: track.duration,
              plays: track.play_count || 0,
              thumbnail: track.album_cover || '/api/placeholder/48/48',
              audioUrl: track.file_path,
              isLiked: false,
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
    if (confirm('Are you sure you want to delete this album?')) {
      // TODO: Implement delete album functionality
      console.log('Delete album');
      router.push('/');
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
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddTrack}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Track
              </button>
              <button
                onClick={handleDeleteAlbum}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Album
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex-1">
            <div className="mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider">ALBUM</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>
            
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
            className="px-4 pb-4 overflow-y-auto"
            style={{ 
              maxHeight: currentTrack ? 'calc(100vh - 500px)' : 'calc(100vh - 440px)',
              minHeight: '200px'
            }}
          >
            <TrackList
              tracks={tracks}
              onAction={handleTrackAction}
              currentPlayingId={currentPlayingId}
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

      {/* Music Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-64 right-0 z-50">
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