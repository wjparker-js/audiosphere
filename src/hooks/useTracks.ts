'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthenticatedFetch } from '@/lib/token-storage';
import { useNotification } from '@/contexts/NotificationContext';

// Track interfaces
export interface Track {
  id: number;
  title: string;
  artist: string;
  albumTitle?: string;
  albumId?: number;
  trackNumber?: number;
  duration: string;
  durationSeconds: number;
  filePath: string;
  playCount: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TracksResponse {
  tracks: Track[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTrackData {
  trackTitle: string;
  albumId: number;
  audioFile: File;
}

export interface UpdateTrackData {
  title?: string;
  artist?: string;
  trackNumber?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface LikeTrackData {
  isLiked: boolean;
}

// Query keys
export const trackKeys = {
  all: ['tracks'] as const,
  lists: () => [...trackKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...trackKeys.lists(), filters] as const,
  details: () => [...trackKeys.all, 'detail'] as const,
  detail: (id: number) => [...trackKeys.details(), id] as const,
  album: (albumId: number) => [...trackKeys.all, 'album', albumId] as const,
  popular: () => [...trackKeys.all, 'popular'] as const,
  liked: (userId: number) => [...trackKeys.all, 'liked', userId] as const,
};

// Fetch tracks with filters
async function fetchTracks(params: {
  page?: number;
  limit?: number;
  albumId?: number;
  search?: string;
  sort?: 'title' | 'artist' | 'playCount' | 'createdAt';
  order?: 'asc' | 'desc';
} = {}): Promise<TracksResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/tracks?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tracks');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch tracks');
  }

  return data.data;
}

// Fetch single track
async function fetchTrack(id: number): Promise<Track> {
  const response = await fetch(`/api/tracks/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch track');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch track');
  }

  return data.data.track;
}

// Fetch popular tracks
async function fetchPopularTracks(limit: number = 20): Promise<Track[]> {
  const response = await fetch(`/api/tracks/popular?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch popular tracks');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch popular tracks');
  }

  return data.data.tracks;
}

// Fetch liked tracks for user
async function fetchLikedTracks(userId: number): Promise<Track[]> {
  const response = await AuthenticatedFetch.get(`/api/users/${userId}/liked-tracks`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch liked tracks');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch liked tracks');
  }

  return data.data.tracks;
}

// Create track
async function createTrack(trackData: CreateTrackData): Promise<Track> {
  const formData = new FormData();
  
  formData.append('trackTitle', trackData.trackTitle);
  formData.append('albumId', trackData.albumId.toString());
  formData.append('audioFile', trackData.audioFile);

  const response = await AuthenticatedFetch.fetch('/api/tracks', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create track');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create track');
  }

  return data.data.track;
}

// Update track
async function updateTrack(id: number, trackData: UpdateTrackData): Promise<Track> {
  const response = await AuthenticatedFetch.put(`/api/tracks/${id}`, trackData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update track');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update track');
  }

  return data.data.track;
}

// Delete track
async function deleteTrack(id: number): Promise<void> {
  const response = await AuthenticatedFetch.delete(`/api/tracks/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete track');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to delete track');
  }
}

// Like/unlike track
async function likeTrack(id: number, likeData: LikeTrackData): Promise<void> {
  const response = await AuthenticatedFetch.post(`/api/tracks/${id}/like`, likeData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update track like status');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update track like status');
  }
}

// Hooks
export function useTracks(params: Parameters<typeof fetchTracks>[0] = {}) {
  return useQuery({
    queryKey: trackKeys.list(params),
    queryFn: () => fetchTracks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrack(id: number) {
  return useQuery({
    queryKey: trackKeys.detail(id),
    queryFn: () => fetchTrack(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePopularTracks(limit?: number) {
  return useQuery({
    queryKey: trackKeys.popular(),
    queryFn: () => fetchPopularTracks(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes (popular tracks don't change as frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useLikedTracks(userId: number) {
  return useQuery({
    queryKey: trackKeys.liked(userId),
    queryFn: () => fetchLikedTracks(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes (user preferences change more frequently)
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: createTrack,
    onSuccess: (newTrack) => {
      // Invalidate and refetch tracks list
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
      
      // Invalidate album tracks if this track belongs to an album
      if (newTrack.albumId) {
        queryClient.invalidateQueries({ queryKey: trackKeys.album(newTrack.albumId) });
      }
      
      // Add the new track to the cache
      queryClient.setQueryData(trackKeys.detail(newTrack.id), newTrack);
      
      success('Track Created', `"${newTrack.title}" has been uploaded successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Create Track', err.message);
    },
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTrackData }) => updateTrack(id, data),
    onSuccess: (updatedTrack) => {
      // Update the track in the cache
      queryClient.setQueryData(trackKeys.detail(updatedTrack.id), updatedTrack);
      
      // Invalidate tracks list to reflect changes
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
      
      // Invalidate album tracks if this track belongs to an album
      if (updatedTrack.albumId) {
        queryClient.invalidateQueries({ queryKey: trackKeys.album(updatedTrack.albumId) });
      }
      
      success('Track Updated', `"${updatedTrack.title}" has been updated successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Update Track', err.message);
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: deleteTrack,
    onSuccess: (_, deletedId) => {
      // Remove the track from the cache
      queryClient.removeQueries({ queryKey: trackKeys.detail(deletedId) });
      
      // Invalidate tracks list
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
      
      // Invalidate popular tracks
      queryClient.invalidateQueries({ queryKey: trackKeys.popular() });
      
      success('Track Deleted', 'The track has been deleted successfully.');
    },
    onError: (err: Error) => {
      error('Failed to Delete Track', err.message);
    },
  });
}

export function useLikeTrack() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ id, isLiked }: { id: number; isLiked: boolean }) => likeTrack(id, { isLiked }),
    onMutate: async ({ id, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: trackKeys.detail(id) });

      // Snapshot the previous value
      const previousTrack = queryClient.getQueryData(trackKeys.detail(id));

      // Optimistically update the track
      queryClient.setQueryData(trackKeys.detail(id), (old: Track | undefined) => {
        if (!old) return old;
        return {
          ...old,
          // We don't have a liked field in the track interface, but we could add it
          // For now, we'll just update the cache without showing the like status
        };
      });

      return { previousTrack };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTrack) {
        queryClient.setQueryData(trackKeys.detail(id), context.previousTrack);
      }
      error('Failed to Update Like Status', err.message);
    },
    onSuccess: (_, { isLiked }) => {
      // Invalidate liked tracks to reflect changes
      queryClient.invalidateQueries({ queryKey: trackKeys.liked });
      
      success(
        isLiked ? 'Track Liked' : 'Track Unliked',
        isLiked ? 'Added to your liked tracks.' : 'Removed from your liked tracks.'
      );
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(id) });
    },
  });
}

// Prefetch functions
export function usePrefetchTrack() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: trackKeys.detail(id),
      queryFn: () => fetchTrack(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchTracks() {
  const queryClient = useQueryClient();

  return (params: Parameters<typeof fetchTracks>[0] = {}) => {
    queryClient.prefetchQuery({
      queryKey: trackKeys.list(params),
      queryFn: () => fetchTracks(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}