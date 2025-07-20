import { useState, useEffect, useCallback } from 'react';
import { LibraryService } from '@/services/library.service';
import { MockLibraryService } from '@/services/mock-library.service';
import { 
  LibraryState, 
  LibraryFilters, 
  ContentItem, 
  FilterType, 
  SortBy, 
  SortOrder, 
  ViewMode,
  BulkAction
} from '@/types/library';

// Use real service to show user-specific content
const libraryService = new LibraryService();

const initialFilters: LibraryFilters = {
  activeFilter: 'all',
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 20
};

const initialState: LibraryState = {
  content: {
    albums: [],
    playlists: [],
    blogPosts: []
  },
  filters: initialFilters,
  ui: {
    loading: false,
    selectedItems: [],
    viewMode: 'grid'
  },
  counts: {
    all: 0,
    playlists: 0,
    albums: 0,
    blogs: 0
  }
};

export function useLibrary(userId: string) {
  const [state, setState] = useState<LibraryState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Fetch library data
  const fetchLibrary = useCallback(async (filters?: Partial<LibraryFilters>, showLoading: boolean = true) => {
    if (!userId) return;

    if (showLoading) {
      setState(prev => ({ ...prev, ui: { ...prev.ui, loading: true } }));
    }
    setError(null);

    try {
      const currentFilters = filters 
        ? { ...state.filters, ...filters }
        : state.filters;

      const data = await libraryService.getUserLibrary(userId, currentFilters);
      
      setState(prev => ({
        ...prev,
        content: {
          albums: data.albums,
          playlists: data.playlists,
          blogPosts: data.blogPosts
        },
        counts: data.counts,
        filters: currentFilters,
        ui: { ...prev.ui, loading: false }
      }));
    } catch (err) {
      console.error('Library fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library');
      
      // Set mock data to prevent empty state
      setState(prev => ({
        ...prev,
        content: {
          albums: [],
          playlists: [],
          blogPosts: []
        },
        counts: {
          all: 0,
          playlists: 0,
          albums: 0,
          blogs: 0
        },
        filters: filters ? { ...prev.filters, ...filters } : prev.filters,
        ui: { ...prev.ui, loading: false }
      }));
    }
  }, [userId, state.filters]);

  // Initial load
  useEffect(() => {
    fetchLibrary();
  }, [userId]);

  // Get all content items as a flat array
  const getAllContent = useCallback((): ContentItem[] => {
    const { albums, playlists, blogPosts } = state.content;
    const { activeFilter } = state.filters;

    let content: ContentItem[] = [];

    switch (activeFilter) {
      case 'albums':
        content = albums;
        break;
      case 'playlists':
        content = playlists;
        break;
      case 'blogs':
        content = blogPosts;
        break;
      default:
        content = [...albums, ...playlists, ...blogPosts];
    }

    // Apply search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      content = content.filter(item => 
        item.title.toLowerCase().includes(query) ||
        ('artist' in item && item.artist.toLowerCase().includes(query)) ||
        ('description' in item && item.description?.toLowerCase().includes(query)) ||
        ('excerpt' in item && item.excerpt.toLowerCase().includes(query))
      );
    }

    // Apply sorting - maintain content type order (Albums → Playlists → Blogs) when showing all
    content.sort((a, b) => {
      // If showing all content types, first sort by type to maintain Albums → Playlists → Blogs order
      if (state.filters.activeFilter === 'all') {
        const typeOrder = { album: 0, playlist: 1, blog: 2 };
        const typeComparison = typeOrder[a.type] - typeOrder[b.type];
        
        // If different types, use type order
        if (typeComparison !== 0) {
          return typeComparison;
        }
        
        // If same type, sort by the selected criteria within that type
      }
      
      let comparison = 0;
      
      switch (state.filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'modified':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'date':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return state.filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return content;
  }, [state.content, state.filters]);

  // Filter actions
  const setFilter = useCallback((filter: FilterType) => {
    fetchLibrary({ activeFilter: filter, page: 1 }, false); // Don't show loading for filter changes
  }, [fetchLibrary]);

  const setSearch = useCallback((searchQuery: string) => {
    fetchLibrary({ searchQuery, page: 1 }, false); // Don't show loading for search
  }, [fetchLibrary]);

  const setSort = useCallback((sortBy: SortBy, sortOrder: SortOrder) => {
    fetchLibrary({ sortBy, sortOrder, page: 1 }, false); // Don't show loading for sort
  }, [fetchLibrary]);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, viewMode }
    }));
  }, []);

  // Selection actions
  const toggleSelection = useCallback((itemId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        selectedItems: selected
          ? [...prev.ui.selectedItems, itemId]
          : prev.ui.selectedItems.filter(id => id !== itemId)
      }
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, selectedItems: [] }
    }));
  }, []);

  const selectAll = useCallback(() => {
    const allContent = getAllContent();
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, selectedItems: allContent.map(item => item.id) }
    }));
  }, [getAllContent]);

  // Bulk actions
  const performBulkAction = useCallback(async (action: BulkAction) => {
    if (state.ui.selectedItems.length === 0) return;

    try {
      await libraryService.bulkAction(action, state.ui.selectedItems, userId);
      clearSelection();
      fetchLibrary(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    }
  }, [state.ui.selectedItems, userId, clearSelection, fetchLibrary]);

  // Content actions
  const deleteContent = useCallback(async (contentId: string) => {
    try {
      await libraryService.deleteContent(contentId, 'content', userId);
      fetchLibrary(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [userId, fetchLibrary]);

  return {
    // State
    content: getAllContent(),
    loading: state.ui.loading,
    error,
    filters: state.filters,
    counts: state.counts,
    viewMode: state.ui.viewMode,
    selectedItems: state.ui.selectedItems,
    
    // Actions
    setFilter,
    setSearch,
    setSort,
    setViewMode,
    toggleSelection,
    clearSelection,
    selectAll,
    performBulkAction,
    deleteContent,
    refresh: () => fetchLibrary()
  };
}