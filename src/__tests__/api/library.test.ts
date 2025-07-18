import { NextRequest } from 'next/server';
import { GET } from '@/app/api/users/[userId]/library/route';
import { POST } from '@/app/api/library/bulk/route';
import { executeQuery } from '@/lib/database';

// Mock the database module
jest.mock('@/lib/database', () => ({
  executeQuery: jest.fn()
}));

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('/api/users/[userId]/library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    const mockAlbumData = [
      {
        id: 1,
        title: 'Test Album',
        artist: 'Test Artist',
        cover_image_url: '/test.jpg',
        track_count: 10,
        genre_name: 'Rock',
        status: 'published',
        description: 'Test description',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        created_by: 1
      }
    ];

    const mockPlaylistData = [
      {
        id: 2,
        name: 'Test Playlist',
        description: 'Test playlist description',
        cover_image_url: '/playlist.jpg',
        track_count: 15,
        is_public: true,
        last_played: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        user_id: 1
      }
    ];

    const mockBlogData = [
      {
        id: 3,
        title: 'Test Blog Post',
        content: 'This is a test blog post content...',
        excerpt: 'Test excerpt',
        featured_image_url: '/blog.jpg',
        status: 'published',
        published_at: '2023-01-01T00:00:00Z',
        view_count: 100,
        comment_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        user_id: 1
      }
    ];

    const mockCounts = [
      { count: 1 }, // albums
      { count: 1 }, // playlists
      { count: 1 }  // blogs
    ];

    it('returns library data for valid user', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce(mockAlbumData)
        .mockResolvedValueOnce(mockPlaylistData)
        .mockResolvedValueOnce(mockBlogData)
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2]);

      const request = new NextRequest('http://localhost/api/users/1/library');
      const response = await GET(request, { params: { userId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.albums).toHaveLength(1);
      expect(data.data.playlists).toHaveLength(1);
      expect(data.data.blogPosts).toHaveLength(1);
      expect(data.data.counts.all).toBe(3);
    });

    it('handles search query parameter', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2]);

      const request = new NextRequest('http://localhost/api/users/1/library?search=test');
      const response = await GET(request, { params: { userId: '1' } });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND (title LIKE ? OR artist LIKE ? OR description LIKE ?)'),
        expect.arrayContaining(['1', '%test%', '%test%', '%test%'])
      );
    });

    it('handles filter parameter', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce(mockAlbumData)
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2]);

      const request = new NextRequest('http://localhost/api/users/1/library?filter=albums');
      const response = await GET(request, { params: { userId: '1' } });
      const data = await response.json();

      expect(data.data.albums).toHaveLength(1);
      expect(data.data.playlists).toHaveLength(0);
      expect(data.data.blogPosts).toHaveLength(0);
    });

    it('handles sorting parameters', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2]);

      const request = new NextRequest('http://localhost/api/users/1/library?sort=title&order=asc');
      await GET(request, { params: { userId: '1' } });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY a.title ASC'),
        expect.any(Array)
      );
    });

    it('handles pagination parameters', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2]);

      const request = new NextRequest('http://localhost/api/users/1/library?page=2&limit=10');
      await GET(request, { params: { userId: '1' } });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        expect.arrayContaining([10, 10]) // limit, offset
      );
    });

    it('handles database errors', async () => {
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/users/1/library');
      const response = await GET(request, { params: { userId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Failed to fetch library content');
    });
  });
});

describe('/api/library/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('handles bulk delete action', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([{ id: 1 }]) // album check
        .mockResolvedValueOnce([]) // delete tracks
        .mockResolvedValueOnce([]); // delete album

      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          contentIds: ['1'],
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results[0].success).toBe(true);
      expect(data.data.results[0].type).toBe('album');
    });

    it('handles bulk publish action', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([]) // album update
        .mockResolvedValueOnce([]); // blog update

      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'publish',
          contentIds: ['1', '2'],
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary.total).toBe(2);
      expect(data.data.summary.successful).toBe(2);
    });

    it('validates request parameters', async () => {
      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          // Missing contentIds
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('validation');
    });

    it('handles unsupported actions', async () => {
      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'unsupported',
          contentIds: ['1'],
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results[0].success).toBe(false);
      expect(data.data.results[0].error).toBe('Unsupported action');
    });

    it('handles database errors during bulk operations', async () => {
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          contentIds: ['1'],
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results[0].success).toBe(false);
      expect(data.data.results[0].error).toBe('Operation failed');
    });

    it('provides summary of bulk operation results', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([{ id: 1 }]) // successful delete
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Database error')); // failed delete

      const request = new NextRequest('http://localhost/api/library/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          contentIds: ['1', '2'],
          userId: 'user1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.summary.total).toBe(2);
      expect(data.data.summary.successful).toBe(1);
      expect(data.data.summary.failed).toBe(1);
    });
  });
});