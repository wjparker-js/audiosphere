'use client';

import { useState, useEffect, useMemo } from 'react';
import { Track, TrackAction, TrackFilterType, TrackSortType } from '@/types/track';

export function useLikedTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TrackFilterType>('all');
  const [sortBy, setSortBy] = useState<TrackSortType>('recently-added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | undefined>();

  // Load tracks
  useEffect(() => {
    const loadTracks = async () => {
      setLoading(true);
      try {
        // Use real API endpoint instead of mock data
        const userId = 1; // Mock user ID - replace with actual auth
        const response = await fetch(`/api/users/${userId}/liked-tracks`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Convert API response to Track format
            const likedTracks: Track[] = data.data.tracks.map((track: any) => ({
              id: track.id,
              title: track.title,
              artist: track.artist,
              album: track.album,
              duration: track.duration,
              plays: track.plays || 0,
              thumbnail: track.thumbnail || '/api/placeholder/48/48',
              audioUrl: track.audioUrl,
              isLiked: true, // All tracks in liked songs are liked
              addedAt: new Date(track.likedAt || track.createdAt || Date.now())
            }));
            setTracks(likedTracks);
          } else {
            console.error('Failed to load liked tracks:', data.error);
            setTracks([]);
          }
        } else {
          console.error('Failed to load liked tracks:', response.status);
          setTracks([]);
        }
      } catch (error) {
        console.error('Failed to load liked tracks:', error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  // Filter and sort tracks
  const filteredAndSortedTracks = useMemo(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'recently-added':
        filtered = filtered.filter(track => {
          const daysDiff = Math.floor((Date.now() - track.addedAt.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        });
        break;
      case 'most-played':
        filtered = filtered.filter(track => {
          const plays = typeof track.plays === 'number' ? track.plays : parseInt(track.plays.toString().replace(/[^\d]/g, ''));
          return plays >= 10; // 10+ plays
        });
        break;
      // 'artist' and 'album' filters could group by these fields
      // For now, we'll just show all tracks
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'album':
          comparison = a.album.localeCompare(b.album);
          break;
        case 'plays':
          const aPlays = typeof a.plays === 'number' ? a.plays : parseInt(a.plays.toString().replace(/[^\d]/g, ''));
          const bPlays = typeof b.plays === 'number' ? b.plays : parseInt(b.plays.toString().replace(/[^\d]/g, ''));
          comparison = aPlays - bPlays;
          break;
        case 'recently-added':
        default:
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tracks, searchQuery, activeFilter, sortBy, sortOrder]);

  // Handle track actions
  const handleTrackAction = async (action: TrackAction, track: Track) => {
    switch (action) {
      case 'play':
        // Always set the new track as playing (this automatically stops any other playing track)
        setCurrentPlayingId(track.id);
        console.log('Playing:', track.title);
        
        // Increment play count via API
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
        // Only pause if this track is actually the currently playing track
        if (currentPlayingId === track.id) {
          setCurrentPlayingId(undefined);
          console.log('Paused:', track.title);
        }
        break;
        
      case 'like':
        // Since this is the liked songs page, clicking like should unlike the track
        try {
          const response = await fetch(`/api/tracks/${track.id}/like`, {
            method: 'DELETE', // Unlike the track
          });
          
          if (response.ok) {
            // Remove the track from the liked songs list
            setTracks(prev => prev.filter(t => t.id !== track.id));
            console.log('Removed from liked songs:', track.title);
          } else {
            const errorData = await response.json();
            console.error('Failed to unlike track:', errorData.error);
          }
        } catch (error) {
          console.error('Network error unliking track:', error);
        }
        break;
        
      case 'add-to-playlist':
        console.log('Add to playlist:', track.title);
        break;
        
      case 'download':
        console.log('Download:', track.title);
        break;
        
      case 'share':
        console.log('Share:', track.title);
        break;
        
      case 'remove':
        // Same as like action - remove from liked songs
        try {
          const response = await fetch(`/api/tracks/${track.id}/like`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            setTracks(prev => prev.filter(t => t.id !== track.id));
            console.log('Removed from liked songs:', track.title);
          } else {
            const errorData = await response.json();
            console.error('Failed to remove track:', errorData.error);
          }
        } catch (error) {
          console.error('Network error removing track:', error);
        }
        break;
    }
  };

  // Bulk actions
  const handlePlayAll = () => {
    if (filteredAndSortedTracks.length > 0) {
      setCurrentPlayingId(filteredAndSortedTracks[0].id);
      console.log('Playing all tracks starting with:', filteredAndSortedTracks[0].title);
    }
  };

  const handleShuffle = () => {
    if (filteredAndSortedTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAndSortedTracks.length);
      setCurrentPlayingId(filteredAndSortedTracks[randomIndex].id);
      console.log('Shuffling and playing:', filteredAndSortedTracks[randomIndex].title);
    }
  };

  const handleDownloadAll = () => {
    console.log('Downloading all tracks');
  };

  const handleSortChange = (newSortBy: TrackSortType, newOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  };

  return {
    tracks: filteredAndSortedTracks,
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
  };
}