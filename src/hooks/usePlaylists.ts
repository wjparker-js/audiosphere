'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthenticatedFetch } from '@/lib/token-storage';
import { useNotification } from '@/contexts/NotificationContext';

// Playlist interfaces
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: number;
  ownerName?: string;
  trackCount: number;
  coverArt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistsResponse {
  playlists: Playlist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

// Query keys
export const playlistKeys = {
  all: ['playlists'] as const,
  lists: () => [...playlistKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...playlistKeys.lists(), filters] as const,
  details: () => [...playlistKeys.all, 'detail'] as const,
  detail: (id: number) => [...playlistKeys.details(), id] as const,
  user: (userId: number) => [...playlistKeys.all, 'user', userId] as const,
  tracks: (id: number) => [...playlistKeys.detail(id), 'tracks'] as const,
};

// Fetch playlists with filters
async function fetchPlaylists(params: {
  page?: number;
  limit?: number;
  userId?: number;
  isPublic?: boolean;
  search?: string;
} = {}): Promise<PlaylistsResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/playlists?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch playlists');
  }

  return data.data;
}

// Fetch single playlist
async function fetchPlaylist(id: number): Promise<Playlist> {
  const response = await fetch(`/api/playlists/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch playlist');
  }

  return data.data.playlist;
}

// Fetch playlist tracks
async function fetchPlaylistTracks(id: number) {
  const response = await fetch(`/api/playlists/${id}/tracks`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch playlist tracks');
  }

  return data.data.tracks;
}

// Create playlist
async function createPlaylist(playlistData: CreatePlaylistData): Promise<Playlist> {
  const response = await AuthenticatedFetch.post('/api/playlists', playlistData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create playlist');
  }

  return data.data.playlist;
}

// Update playlist
async function updatePlaylist(id: number, playlistData: UpdatePlaylistData): Promise<Playlist> {
  const response = await AuthenticatedFetch.put(`/api/playlists/${id}`, playlistData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update playlist');
  }

  return data.data.playlist;
}

// Delete playlist
async function deletePlaylist(id: number): Promise<void> {
  const response = await AuthenticatedFetch.delete(`/api/playlists/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to delete playlist');
  }
}

// Add track to playlist
async function addTrackToPlaylist(playlistId: number, trackId: number): Promise<void> {
  const response = await AuthenticatedFetch.post(`/api/playlists/${playlistId}/tracks`, {
    trackId
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to add track to playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to add track to playlist');
  }
}

// Remove track from playlist
async function removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void> {
  const response = await AuthenticatedFetch.delete(`/api/playlists/${playlistId}/tracks/${trackId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to remove track from playlist');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to remove track from playlist');
  }
}

// Hooks
export function usePlaylists(params: Parameters<typeof fetchPlaylists>[0] = {}) {
  return useQuery({
    queryKey: playlistKeys.list(params),
    queryFn: () => fetchPlaylists(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePlaylist(id: number) {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: () => fetchPlaylist(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePlaylistTracks(id: number) {
  return useQuery({
    queryKey: playlistKeys.tracks(id),
    queryFn: () => fetchPlaylistTracks(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (tracks change more frequently)
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: (newPlaylist) => {
      // Invalidate and refetch playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      
      // Add the new playlist to the cache
      queryClient.setQueryData(playlistKeys.detail(newPlaylist.id), newPlaylist);
      
      success('Playlist Created', `"${newPlaylist.name}" has been created successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Create Playlist', err.message);
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlaylistData }) => updatePlaylist(id, data),
    onSuccess: (updatedPlaylist) => {
      // Update the playlist in the cache
      queryClient.setQueryData(playlistKeys.detail(updatedPlaylist.id), updatedPlaylist);
      
      // Invalidate playlists list to reflect changes
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      
      success('Playlist Updated', `"${updatedPlaylist.name}" has been updated successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Update Playlist', err.message);
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: deletePlaylist,
    onSuccess: (_, deletedId) => {
      // Remove the playlist from the cache
      queryClient.removeQueries({ queryKey: playlistKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: playlistKeys.tracks(deletedId) });
      
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      
      success('Playlist Deleted', 'The playlist has been deleted successfully.');
    },
    onError: (err: Error) => {
      error('Failed to Delete Playlist', err.message);
    },
  });
}

export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) => 
      addTrackToPlaylist(playlistId, trackId),
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist tracks and details
      queryClient.invalidateQueries({ queryKey: playlistKeys.tracks(playlistId) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
      
      success('Track Added', 'Track has been added to the playlist.');
    },
    onError: (err: Error) => {
      error('Failed to Add Track', err.message);
    },
  });
}

export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) => 
      removeTrackFromPlaylist(playlistId, trackId),
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist tracks and details
      queryClient.invalidateQueries({ queryKey: playlistKeys.tracks(playlistId) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
      
      success('Track Removed', 'Track has been removed from the playlist.');
    },
    onError: (err: Error) => {
      error('Failed to Remove Track', err.message);
    },
  });
}

// Prefetch functions
export function usePrefetchPlaylist() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: playlistKeys.detail(id),
      queryFn: () => fetchPlaylist(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchPlaylists() {
  const queryClient = useQueryClient();

  return (params: Parameters<typeof fetchPlaylists>[0] = {}) => {
    queryClient.prefetchQuery({
      queryKey: playlistKeys.list(params),
      queryFn: () => fetchPlaylists(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}  // R
emove track from playlist
  const removeTrackFromPlaylistAPI = useCallback(async (playlistId: number, trackId: number) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove track from playlist');
      }
      
      const data = await response.json();
      
      if (data.success) {
        removeTrackFromPlaylist(playlistId, trackId);
        return { success: true };
      } else {
        throw new Error(data.error?.message || 'Failed to remove track from playlist');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [removeTrackFromPlaylist]);
  
  return {
    // State
    playlists,
    currentPlaylist,
    isLoadingPlaylists,
    playlistsError,
    
    // Basic actions
    setPlaylists,
    addPlaylist,
    updatePlaylist,
    removePlaylist,
    setCurrentPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    setPlaylistTracks,
    setLoadingPlaylists,
    setPlaylistsError,
    
    // Enhanced helpers
    getPlaylistById,
    getUserPlaylists,
    getPublicPlaylists,
    isTrackInPlaylist,
    toggleTrackInPlaylist,
    
    // API actions
    fetchPlaylists,
    createPlaylist,
    updatePlaylistDetails,
    deletePlaylist,
    addTrackToPlaylistAPI,
    removeTrackFromPlaylistAPI,
  };
}

export default usePlaylists;