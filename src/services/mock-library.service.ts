import { LibraryData, LibraryFilters, Album, Playlist, BlogPost } from '@/types/library';

// Mock data for testing
const mockAlbums: Album[] = [
  {
    id: '1',
    type: 'album',
    title: 'Midnight Sessions',
    artist: 'The Velvet Underground',
    coverArt: '/images/album1.jpg',
    trackCount: 12,
    genre: 'Rock',
    status: 'published',
    description: 'A collection of late-night recordings',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    userId: '1'
  },
  {
    id: '2',
    type: 'album',
    title: 'Digital Dreams',
    artist: 'Synthwave Collective',
    coverArt: '/images/album2.jpg',
    trackCount: 8,
    genre: 'Electronic',
    status: 'published',
    description: 'Retro-futuristic electronic music',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    userId: '1'
  }
];

const mockPlaylists: Playlist[] = [
  {
    id: '3',
    type: 'playlist',
    title: 'Chill Vibes',
    description: 'Perfect for relaxing evenings',
    coverArt: '/images/playlist1.jpg',
    trackCount: 25,
    isPublic: true,
    lastPlayed: new Date('2024-03-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-01'),
    userId: '1'
  },
  {
    id: '4',
    type: 'playlist',
    title: 'Workout Mix',
    description: 'High-energy tracks for exercise',
    coverArt: '/images/playlist2.jpg',
    trackCount: 18,
    isPublic: false,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-28'),
    userId: '1'
  }
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '5',
    type: 'blog',
    title: 'The Evolution of Electronic Music',
    excerpt: 'Exploring how electronic music has transformed over the decades...',
    featuredImage: '/images/blog1.jpg',
    status: 'published',
    publishedAt: new Date('2024-02-20'),
    viewCount: 1250,
    commentCount: 23,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-20'),
    userId: '1'
  },
  {
    id: '6',
    type: 'blog',
    title: 'Building the Perfect Playlist',
    excerpt: 'Tips and tricks for creating playlists that flow seamlessly...',
    featuredImage: '/images/blog2.jpg',
    status: 'draft',
    viewCount: 0,
    commentCount: 0,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
    userId: '1'
  }
];

export class MockLibraryService {
  async getUserLibrary(userId: string, filters: LibraryFilters): Promise<LibraryData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let albums = [...mockAlbums];
    let playlists = [...mockPlaylists];
    let blogPosts = [...mockBlogPosts];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      albums = albums.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.artist.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
      playlists = playlists.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
      blogPosts = blogPosts.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query)
      );
    }

    // Apply content type filter
    switch (filters.activeFilter) {
      case 'albums':
        playlists = [];
        blogPosts = [];
        break;
      case 'playlists':
        albums = [];
        blogPosts = [];
        break;
      case 'blogs':
        albums = [];
        playlists = [];
        break;
      // 'all' shows everything
    }

    const counts = {
      albums: mockAlbums.length,
      playlists: mockPlaylists.length,
      blogs: mockBlogPosts.length,
      all: mockAlbums.length + mockPlaylists.length + mockBlogPosts.length
    };

    return {
      albums,
      playlists,
      blogPosts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: albums.length + playlists.length + blogPosts.length,
        totalPages: Math.ceil((albums.length + playlists.length + blogPosts.length) / filters.limit)
      },
      counts
    };
  }

  async bulkAction(action: string, contentIds: string[], userId: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Mock bulk action: ${action} on items:`, contentIds);
    return { success: true };
  }

  async deleteContent(contentId: string, contentType: string, userId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Mock delete: ${contentType} ${contentId}`);
  }
}