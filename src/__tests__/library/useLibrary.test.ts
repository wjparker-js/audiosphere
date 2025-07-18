import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibrary } from '@/hooks/useLibrary';
import { LibraryService } from '@/services/library.service';

// Mock the LibraryService
jest.mock('@/services/library.service');

const mockLibraryService = LibraryService as jest.MockedClass<typeof LibraryService>;

describe('useLibrary', () => {
  const mockLibraryData = {
    albums: [
      {
        id: '1',
        type: 'album' as const,
        title: 'Test Album',
        artist: 'Test Artist',
        coverArt: '/test.jpg',
        trackCount: 10,
        genre: 'Rock',
        status: 'published' as const,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        userId: 'user1'
      }
    ],
    playlists: [
      {
        id: '2',
        type: 'playlist' as const,
        title: 'Test Playlist',
        trackCount: 15,
        isPublic: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        userId: 'user1'
      }
    ],
    blogPosts: [
      {
        id: '3',
        type: 'blog' as const,
        title: 'Test Blog',
        excerpt: 'Test excerpt',
        status: 'published' as const,
        publishedAt: new Date('2023-01-01'),
        viewCount: 100,
        commentCount: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        userId: 'user1'
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1
    },
    counts: {
      all: 3,
      playlists: 1,
      albums: 1,
      blogs: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockLibraryService.prototype.getUserLibrary = jest.fn().mockResolvedValue(mockLibraryData);
    mockLibraryService.prototype.bulkAction = jest.fn().mockResolvedValue({ success: true });
    mockLibraryService.prototype.deleteContent = jest.fn().mockResolvedValue(undefined);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    expect(result.current.content).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.filters.activeFilter).toBe('all');
    expect(result.current.viewMode).toBe('grid');
    expect(result.current.selectedItems).toEqual([]);
  });

  it('fetches library data on mount', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(mockLibraryService.prototype.getUserLibrary).toHaveBeenCalledWith(
      'user1',
      expect.objectContaining({
        activeFilter: 'all',
        searchQuery: '',
        sortBy: 'date',
        sortOrder: 'desc'
      })
    );
    
    expect(result.current.content).toHaveLength(3);
    expect(result.current.counts).toEqual(mockLibraryData.counts);
  });

  it('handles filter changes', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.setFilter('albums');
    });
    
    await waitFor(() => {
      expect(mockLibraryService.prototype.getUserLibrary).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({
          activeFilter: 'albums',
          page: 1
        })
      );
    });
  });

  it('handles search queries', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.setSearch('test query');
    });
    
    await waitFor(() => {
      expect(mockLibraryService.prototype.getUserLibrary).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({
          searchQuery: 'test query',
          page: 1
        })
      );
    });
  });

  it('handles sorting changes', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.setSort('title', 'asc');
    });
    
    await waitFor(() => {
      expect(mockLibraryService.prototype.getUserLibrary).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({
          sortBy: 'title',
          sortOrder: 'asc',
          page: 1
        })
      );
    });
  });

  it('handles view mode changes', () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    act(() => {
      result.current.setViewMode('list');
    });
    
    expect(result.current.viewMode).toBe('list');
  });

  it('handles item selection', () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    act(() => {
      result.current.toggleSelection('item1', true);
    });
    
    expect(result.current.selectedItems).toContain('item1');
    
    act(() => {
      result.current.toggleSelection('item1', false);
    });
    
    expect(result.current.selectedItems).not.toContain('item1');
  });

  it('handles bulk actions', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Select some items first
    act(() => {
      result.current.toggleSelection('item1', true);
      result.current.toggleSelection('item2', true);
    });
    
    await act(async () => {
      await result.current.performBulkAction('delete');
    });
    
    expect(mockLibraryService.prototype.bulkAction).toHaveBeenCalledWith(
      'delete',
      ['item1', 'item2'],
      'user1'
    );
    
    // Should clear selection after bulk action
    expect(result.current.selectedItems).toEqual([]);
  });

  it('handles content deletion', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.deleteContent('content1');
    });
    
    expect(mockLibraryService.prototype.deleteContent).toHaveBeenCalledWith(
      'content1',
      'content',
      'user1'
    );
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to fetch library';
    mockLibraryService.prototype.getUserLibrary = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  it('filters content based on active filter', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Test 'all' filter
    expect(result.current.content).toHaveLength(3);
    
    // Mock filtered response for albums only
    const albumsOnlyData = {
      ...mockLibraryData,
      playlists: [],
      blogPosts: []
    };
    
    mockLibraryService.prototype.getUserLibrary = jest.fn().mockResolvedValue(albumsOnlyData);
    
    act(() => {
      result.current.setFilter('albums');
    });
    
    await waitFor(() => {
      expect(result.current.content).toHaveLength(1);
      expect(result.current.content[0].type).toBe('album');
    });
  });

  it('clears selection when clearSelection is called', () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    act(() => {
      result.current.toggleSelection('item1', true);
      result.current.toggleSelection('item2', true);
    });
    
    expect(result.current.selectedItems).toHaveLength(2);
    
    act(() => {
      result.current.clearSelection();
    });
    
    expect(result.current.selectedItems).toEqual([]);
  });

  it('refreshes data when refresh is called', async () => {
    const { result } = renderHook(() => useLibrary('user1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Clear the mock call count
    jest.clearAllMocks();
    
    await act(async () => {
      result.current.refresh();
    });
    
    expect(mockLibraryService.prototype.getUserLibrary).toHaveBeenCalled();
  });
});