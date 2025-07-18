'use client';

import { useState, useEffect, useMemo } from 'react';
import { Track, TrackAction, TrackFilterType, TrackSortType } from '@/types/track';
import { MockTracksService } from '@/services/mock-tracks.service';

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
        const likedTracks = await MockTracksService.getLikedTracks();
        setTracks(likedTracks);
      } catch (error) {
        console.error('Failed to load liked tracks:', error);
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
          const plays = parseFloat(track.plays.replace(/[^\d.]/g, ''));
          return plays >= 500; // 500M+ plays
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
          const aPlays = parseFloat(a.plays.replace(/[^\d.]/g, ''));
          const bPlays = parseFloat(b.plays.replace(/[^\d.]/g, ''));
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
        break;
      case 'pause':
        // Only pause if this track is actually the currently playing track
        if (currentPlayingId === track.id) {
          setCurrentPlayingId(undefined);
          console.log('Paused:', track.title);
        }
        break;
      case 'like':
        try {
          const newLikedState = await MockTracksService.toggleLike(track.id);
          setTracks(prev => prev.map(t => 
            t.id === track.id ? { ...t, isLiked: newLikedState } : t
          ));
        } catch (error) {
          console.error('Failed to toggle like:', error);
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
        console.log('Remove from liked songs:', track.title);
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