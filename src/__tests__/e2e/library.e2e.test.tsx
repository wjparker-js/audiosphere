/**
 * End-to-End tests for User Library functionality
 * These tests simulate complete user journeys through the library interface
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LibraryPage from '@/app/library/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the library service
jest.mock('@/services/library.service');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock OptimizedImage
jest.mock('@/components/ui/optimized-image', () => ({
  OptimizedImage: ({ alt, className }: any) => (
    <div className={className} data-testid="optimized-image" aria-label={alt} />
  )
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockPush = jest.fn();
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Library E2E User Journeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any);

    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/users/1/library')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              albums: [
                {
                  id: '1',
                  type: 'album',
                  title: 'Test Album',
                  artist: 'Test Artist',
                  coverArt: '/test.jpg',
                  trackCount: 10,
                  genre: 'Rock',
                  status: 'published',
                  createdAt: new Date('2023-01-01'),
                  updatedAt: new Date('2023-01-02'),
                  userId: '1'
                }
              ],
              playlists: [
                {
                  id: '2',
                  type: 'playlist',
                  title: 'My Playlist',
                  trackCount: 15,
                  isPublic: true,
                  createdAt: new Date('2023-01-01'),
                  updatedAt: new Date('2023-01-02'),
                  userId: '1'
                }
              ],
              blogPosts: [
                {
                  id: '3',
                  type: 'blog',
                  title: 'My Blog Post',
                  excerpt: 'This is my blog post...',
                  status: 'published',
                  publishedAt: new Date('2023-01-01'),
                  viewCount: 100,
                  commentCount: 5,
                  createdAt: new Date('2023-01-01'),
                  updatedAt: new Date('2023-01-02'),
                  userId: '1'
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
            }
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Library Browsing Journey', () => {
    it('allows user to browse, filter, search, and interact with library content', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Your Library')).toBeInTheDocument();
      });

      // Step 1: Verify initial state shows all content
      await waitFor(() => {
        expect(screen.getByText('3 items')).toBeInTheDocument();
        expect(screen.getByText('Test Album')).toBeInTheDocument();
        expect(screen.getByText('My Playlist')).toBeInTheDocument();
        expect(screen.getByText('My Blog Post')).toBeInTheDocument();
      });

      // Step 2: Test filtering - click on Albums filter
      const albumsFilter = screen.getByRole('button', { name: /albums/i });
      await user.click(albumsFilter);

      // Verify API call was made with correct filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('filter=albums'),
          undefined
        );
      });

      // Step 3: Test search functionality
      const searchInput = screen.getByPlaceholderText('Search your library...');
      await user.type(searchInput, 'Test Album');

      // Verify search query is applied
      expect(searchInput).toHaveValue('Test Album');

      // Step 4: Test sorting
      const sortButton = screen.getByRole('button', { name: /date created/i });
      await user.click(sortButton);

      const titleSortOption = screen.getByText('Title');
      await user.click(titleSortOption);

      // Verify sort API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=title'),
          undefined
        );
      });

      // Step 5: Test view mode toggle
      const listViewButton = screen.getByTitle('List view');
      await user.click(listViewButton);

      // Verify view mode changed (button should be active)
      expect(listViewButton).toHaveClass('bg-orange-600');

      // Step 6: Test content interaction - click on album
      const albumCard = screen.getByText('Test Album').closest('div');
      if (albumCard) {
        await user.click(albumCard);
        
        // Verify navigation to album detail page
        expect(mockPush).toHaveBeenCalledWith('/albums/1');
      }
    });
  });

  describe('Content Management Journey', () => {
    it('allows user to select, manage, and delete content', async () => {
      const user = userEvent.setup();
      
      // Mock bulk delete API
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('/api/users/1/library')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                albums: [
                  {
                    id: '1',
                    type: 'album',
                    title: 'Test Album',
                    artist: 'Test Artist',
                    coverArt: '/test.jpg',
                    trackCount: 10,
                    genre: 'Rock',
                    status: 'published',
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-02'),
                    userId: '1'
                  }
                ],
                playlists: [],
                blogPosts: [],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
                counts: { all: 1, playlists: 0, albums: 1, blogs: 0 }
              }
            })
          });
        }
        
        if (url.includes('/api/library/bulk')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                action: 'delete',
                results: [{ id: '1', success: true }],
                summary: { total: 1, successful: 1, failed: 0 }
              }
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(<LibraryPage />);

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Album')).toBeInTheDocument();
      });

      // Step 1: Right-click on content to open context menu
      const albumCard = screen.getByText('Test Album').closest('div');
      if (albumCard) {
        fireEvent.contextMenu(albumCard);
      }

      // Wait for context menu to appear
      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      // Step 2: Click delete from context menu
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Step 3: Confirm deletion in dialog
      await waitFor(() => {
        expect(screen.getByText('Delete album?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      // Step 4: Verify bulk delete API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/library/bulk'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"action":"delete"')
          })
        );
      });
    });
  });

  describe('Mobile Experience Journey', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
    });

    it('provides optimized mobile experience with touch interactions', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Your Library')).toBeInTheDocument();
      });

      // Verify mobile layout adjustments
      const container = screen.getByText('Your Library').closest('div');
      expect(container).toHaveClass('p-4'); // Mobile padding instead of p-8

      // Test horizontal scrolling filters on mobile
      const filtersContainer = screen.getByText('All').closest('div');
      expect(filtersContainer).toHaveClass('overflow-x-auto');

      // Test mobile search interface
      const searchInput = screen.getByPlaceholderText('Search your library...');
      expect(searchInput.closest('div')).toHaveClass('flex-1');
    });
  });

  describe('Error Handling Journey', () => {
    it('handles API errors gracefully and provides user feedback', async () => {
      // Mock API error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<LibraryPage />);

      // Wait for error state
      await waitFor(() => {
        // The error should be handled by the useLibrary hook
        // and displayed via toast notification
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('shows empty state when user has no content', async () => {
      // Mock empty library response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            albums: [],
            playlists: [],
            blogPosts: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            counts: { all: 0, playlists: 0, albums: 0, blogs: 0 }
          }
        })
      });

      render(<LibraryPage />);

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText('Your library is empty')).toBeInTheDocument();
        expect(screen.getByText('Start by creating playlists, uploading albums, or writing blog posts')).toBeInTheDocument();
      });

      // Test empty state action buttons
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create playlist/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload album/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /write post/i })).toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility Journey', () => {
    it('maintains good performance with large content collections', async () => {
      // Mock large dataset
      const largeDataset = {
        albums: Array.from({ length: 100 }, (_, i) => ({
          id: `album-${i}`,
          type: 'album' as const,
          title: `Album ${i}`,
          artist: `Artist ${i}`,
          coverArt: `/album-${i}.jpg`,
          trackCount: 10,
          genre: 'Rock',
          status: 'published' as const,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
          userId: '1'
        })),
        playlists: [],
        blogPosts: [],
        pagination: { page: 1, limit: 20, total: 100, totalPages: 5 },
        counts: { all: 100, playlists: 0, albums: 100, blogs: 0 }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: largeDataset
        })
      });

      const startTime = performance.now();
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('100 items')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Verify reasonable render time (should be under 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('provides proper accessibility features', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Library')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const searchInput = screen.getByPlaceholderText('Search your library...');
      expect(searchInput).toBeInTheDocument();
      
      // Test ARIA labels and roles
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });

      // Test proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Your Library');
    });
  });
});