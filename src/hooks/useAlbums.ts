'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthenticatedFetch } from '@/lib/token-storage';
import { useNotification } from '@/contexts/NotificationContext';

// Album interfaces
export interface Album {
  id: number;
  title: string;
  artist: string;
  description?: string;
  coverArt?: string;
  genreId?: number;
  genreName?: string;
  trackCount: number;
  status: 'draft' | 'published' | 'archived';
  createdBy: number;
  createdByUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumsResponse {
  albums: Album[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAlbumData {
  title: string;
  artist: string;
  description?: string;
  genreId?: number;
  coverImage?: File;
}

export interface UpdateAlbumData {
  title?: string;
  artist?: string;
  description?: string;
  genreId?: number;
  status?: 'draft' | 'published' | 'archived';
}

// Query keys
export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...albumKeys.lists(), filters] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
  user: (userId: number) => [...albumKeys.all, 'user', userId] as const,
};

// Fetch albums with filters
async function fetchAlbums(params: {
  page?: number;
  limit?: number;
  genre?: string;
  artist?: string;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<AlbumsResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/albums?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch albums');
  }

  return data.data;
}

// Fetch single album
async function fetchAlbum(id: number): Promise<Album> {
  const response = await fetch(`/api/albums/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch album');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch album');
  }

  return data.data.album;
}

// Create album
async function createAlbum(albumData: CreateAlbumData): Promise<Album> {
  const formData = new FormData();
  
  formData.append('title', albumData.title);
  formData.append('artist', albumData.artist);
  
  if (albumData.description) {
    formData.append('description', albumData.description);
  }
  
  if (albumData.genreId) {
    formData.append('genreId', albumData.genreId.toString());
  }
  
  if (albumData.coverImage) {
    formData.append('coverImage', albumData.coverImage);
  }

  const response = await AuthenticatedFetch.fetch('/api/albums', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create album');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create album');
  }

  return data.data.album;
}

// Update album
async function updateAlbum(id: number, albumData: UpdateAlbumData): Promise<Album> {
  const response = await AuthenticatedFetch.put(`/api/albums/${id}`, albumData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update album');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update album');
  }

  return data.data.album;
}

// Delete album
async function deleteAlbum(id: number): Promise<void> {
  const response = await AuthenticatedFetch.delete(`/api/albums/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete album');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to delete album');
  }
}

// Hooks
export function useAlbums(params: Parameters<typeof fetchAlbums>[0] = {}) {
  return useQuery({
    queryKey: albumKeys.list(params),
    queryFn: () => fetchAlbums(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAlbum(id: number) {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => fetchAlbum(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: createAlbum,
    onSuccess: (newAlbum) => {
      // Invalidate and refetch albums list
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      
      // Add the new album to the cache
      queryClient.setQueryData(albumKeys.detail(newAlbum.id), newAlbum);
      
      success('Album Created', `"${newAlbum.title}" has been created successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Create Album', err.message);
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAlbumData }) => updateAlbum(id, data),
    onSuccess: (updatedAlbum) => {
      // Update the album in the cache
      queryClient.setQueryData(albumKeys.detail(updatedAlbum.id), updatedAlbum);
      
      // Invalidate albums list to reflect changes
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      
      success('Album Updated', `"${updatedAlbum.title}" has been updated successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Update Album', err.message);
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: (_, deletedId) => {
      // Remove the album from the cache
      queryClient.removeQueries({ queryKey: albumKeys.detail(deletedId) });
      
      // Invalidate albums list
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      
      success('Album Deleted', 'The album has been deleted successfully.');
    },
    onError: (err: Error) => {
      error('Failed to Delete Album', err.message);
    },
  });
}

// Prefetch functions
export function usePrefetchAlbum() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: albumKeys.detail(id),
      queryFn: () => fetchAlbum(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchAlbums() {
  const queryClient = useQueryClient();

  return (params: Parameters<typeof fetchAlbums>[0] = {}) => {
    queryClient.prefetchQuery({
      queryKey: albumKeys.list(params),
      queryFn: () => fetchAlbums(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}