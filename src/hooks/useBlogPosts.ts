'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthenticatedFetch } from '@/lib/token-storage';
import { useNotification } from '@/contexts/NotificationContext';

// Blog post interfaces
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  viewCount: number;
  userId: number;
  authorName?: string;
  commentCount: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: File;
  status?: 'draft' | 'published';
  tags?: string[];
  category?: string;
}

export interface UpdateBlogPostData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  blogPostId: number;
  parentId?: number;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentData {
  content: string;
  parentId?: number;
}

// Query keys
export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  post: (filters: Record<string, any>) => [...blogKeys.posts(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: number) => [...blogKeys.details(), id] as const,
  comments: (postId: number) => [...blogKeys.detail(postId), 'comments'] as const,
  user: (userId: number) => [...blogKeys.all, 'user', userId] as const,
  tags: () => [...blogKeys.all, 'tags'] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
};

// Fetch blog posts with filters
async function fetchBlogPosts(params: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived';
  userId?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: 'title' | 'publishedAt' | 'viewCount' | 'createdAt';
  order?: 'asc' | 'desc';
} = {}): Promise<BlogPostsResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/blog?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch blog posts');
  }

  return data.data;
}

// Fetch single blog post
async function fetchBlogPost(id: number): Promise<BlogPost> {
  const response = await fetch(`/api/blog/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch blog post');
  }

  return data.data.post;
}

// Fetch blog post by slug
async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetch(`/api/blog/slug/${slug}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch blog post');
  }

  return data.data.post;
}

// Fetch blog post comments
async function fetchBlogComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`/api/blog/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch comments');
  }

  return data.data.comments;
}

// Create blog post
async function createBlogPost(postData: CreateBlogPostData): Promise<BlogPost> {
  const formData = new FormData();
  
  formData.append('title', postData.title);
  formData.append('content', postData.content);
  
  if (postData.excerpt) {
    formData.append('excerpt', postData.excerpt);
  }
  
  if (postData.status) {
    formData.append('status', postData.status);
  }
  
  if (postData.featuredImage) {
    formData.append('featuredImage', postData.featuredImage);
  }
  
  if (postData.tags) {
    formData.append('tags', JSON.stringify(postData.tags));
  }
  
  if (postData.category) {
    formData.append('category', postData.category);
  }

  const response = await AuthenticatedFetch.fetch('/api/blog', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create blog post');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create blog post');
  }

  return data.data.post;
}

// Update blog post
async function updateBlogPost(id: number, postData: UpdateBlogPostData): Promise<BlogPost> {
  const response = await AuthenticatedFetch.put(`/api/blog/${id}`, postData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update blog post');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update blog post');
  }

  return data.data.post;
}

// Delete blog post
async function deleteBlogPost(id: number): Promise<void> {
  const response = await AuthenticatedFetch.delete(`/api/blog/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete blog post');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to delete blog post');
  }
}

// Create comment
async function createComment(postId: number, commentData: CreateCommentData): Promise<Comment> {
  const response = await AuthenticatedFetch.post(`/api/blog/${postId}/comments`, commentData);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create comment');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to create comment');
  }

  return data.data.comment;
}

// Hooks
export function useBlogPosts(params: Parameters<typeof fetchBlogPosts>[0] = {}) {
  return useQuery({
    queryKey: blogKeys.post(params),
    queryFn: () => fetchBlogPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => fetchBlogPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: [...blogKeys.all, 'slug', slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogComments(postId: number) {
  return useQuery({
    queryKey: blogKeys.comments(postId),
    queryFn: () => fetchBlogComments(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes (comments change more frequently)
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: (newPost) => {
      // Invalidate and refetch blog posts list
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      
      // Add the new post to the cache
      queryClient.setQueryData(blogKeys.detail(newPost.id), newPost);
      
      success('Blog Post Created', `"${newPost.title}" has been created successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Create Blog Post', err.message);
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBlogPostData }) => updateBlogPost(id, data),
    onSuccess: (updatedPost) => {
      // Update the post in the cache
      queryClient.setQueryData(blogKeys.detail(updatedPost.id), updatedPost);
      
      // Invalidate blog posts list to reflect changes
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      
      success('Blog Post Updated', `"${updatedPost.title}" has been updated successfully.`);
    },
    onError: (err: Error) => {
      error('Failed to Update Blog Post', err.message);
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: (_, deletedId) => {
      // Remove the post from the cache
      queryClient.removeQueries({ queryKey: blogKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: blogKeys.comments(deletedId) });
      
      // Invalidate blog posts list
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      
      success('Blog Post Deleted', 'The blog post has been deleted successfully.');
    },
    onError: (err: Error) => {
      error('Failed to Delete Blog Post', err.message);
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: CreateCommentData }) => 
      createComment(postId, data),
    onSuccess: (_, { postId }) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({ queryKey: blogKeys.comments(postId) });
      
      // Invalidate the post details to update comment count
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(postId) });
      
      success('Comment Posted', 'Your comment has been posted successfully.');
    },
    onError: (err: Error) => {
      error('Failed to Post Comment', err.message);
    },
  });
}

// Prefetch functions
export function usePrefetchBlogPost() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: blogKeys.detail(id),
      queryFn: () => fetchBlogPost(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchBlogPosts() {
  const queryClient = useQueryClient();

  return (params: Parameters<typeof fetchBlogPosts>[0] = {}) => {
    queryClient.prefetchQuery({
      queryKey: blogKeys.post(params),
      queryFn: () => fetchBlogPosts(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}