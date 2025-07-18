import { useState, useEffect, useCallback } from 'react';
import { MockBlogService } from '@/services/mock-blog.service';
import { 
  BlogState, 
  BlogFilters, 
  BlogPost, 
  BlogFilterType, 
  BlogSortBy, 
  BlogSortOrder, 
  BlogViewMode
} from '@/types/blog';

// Use mock service for now
const blogService = new MockBlogService();

const initialFilters: BlogFilters = {
  activeFilter: 'all',
  sortBy: 'date',
  sortOrder: 'desc', // Most recent first by default
  page: 1,
  limit: 20
};

// Add search query state
const initialSearchQuery = '';

const initialState: BlogState = {
  posts: [],
  filters: initialFilters,
  ui: {
    loading: false,
    viewMode: 'grid'
  },
  counts: {
    all: 0,
    published: 0,
    drafts: 0,
    scheduled: 0
  }
};

export function useBlog() {
  const [state, setState] = useState<BlogState>(initialState);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog data
  const fetchBlog = useCallback(async (filters?: Partial<BlogFilters>, showLoading: boolean = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, ui: { ...prev.ui, loading: true } }));
    }
    setError(null);

    try {
      const currentFilters = filters 
        ? { ...state.filters, ...filters }
        : state.filters;

      const data = await blogService.getBlogPosts(currentFilters);
      
      setState(prev => ({
        ...prev,
        posts: data.posts,
        counts: data.counts,
        filters: currentFilters,
        ui: { ...prev.ui, loading: false }
      }));
    } catch (err) {
      console.error('Blog fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
      
      setState(prev => ({
        ...prev,
        posts: [],
        counts: {
          all: 0,
          published: 0,
          drafts: 0,
          scheduled: 0
        },
        filters: filters ? { ...prev.filters, ...filters } : prev.filters,
        ui: { ...prev.ui, loading: false }
      }));
    }
  }, [state.filters]);

  // Initial load
  useEffect(() => {
    fetchBlog();
  }, []);

  // Filter actions
  const setFilter = useCallback((filter: BlogFilterType) => {
    fetchBlog({ activeFilter: filter, page: 1 }, false); // Don't show loading for filter changes
  }, [fetchBlog]);

  const setSort = useCallback((sortBy: BlogSortBy, sortOrder: BlogSortOrder) => {
    fetchBlog({ sortBy, sortOrder, page: 1 }, false); // Don't show loading for sort
  }, [fetchBlog]);

  const setViewMode = useCallback((viewMode: BlogViewMode) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, viewMode }
    }));
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Blog actions
  const createBlogPost = useCallback(async (data: any) => {
    try {
      await blogService.createBlogPost(data);
      fetchBlog(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
    }
  }, [fetchBlog]);

  const deleteBlogPost = useCallback(async (postId: string) => {
    try {
      await blogService.deleteBlogPost(postId);
      fetchBlog(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  }, [fetchBlog]);

  // Filter posts based on search query
  const filteredPosts = searchQuery.trim() 
    ? state.posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : state.posts;

  return {
    // State
    posts: filteredPosts,
    loading: state.ui.loading,
    error,
    filters: state.filters,
    counts: state.counts,
    viewMode: state.ui.viewMode,
    searchQuery,
    
    // Actions
    setFilter,
    setSort,
    setViewMode,
    setSearch,
    createBlogPost,
    deleteBlogPost,
    refresh: () => fetchBlog()
  };
}