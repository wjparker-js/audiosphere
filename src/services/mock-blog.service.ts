import { BlogData, BlogFilters, BlogPost } from '@/types/blog';

// Mock blog data for testing
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Evolution of Electronic Music',
    excerpt: 'Exploring how electronic music has transformed over the decades, from early synthesizers to modern digital production techniques.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/electronic-music.jpg',
    status: 'published',
    publishedAt: new Date('2024-02-20'),
    viewCount: 1250,
    commentCount: 23,
    tags: ['music', 'electronic', 'history'],
    category: 'Music History',
    readTime: 8,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-20'),
    userId: '1'
  },
  {
    id: '2',
    title: 'Building the Perfect Playlist',
    excerpt: 'Tips and tricks for creating playlists that flow seamlessly from one track to the next, keeping your listeners engaged.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/playlist-tips.jpg',
    status: 'draft',
    viewCount: 0,
    commentCount: 0,
    tags: ['playlists', 'curation', 'tips'],
    category: 'Music Curation',
    readTime: 5,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
    userId: '1'
  },
  {
    id: '3',
    title: 'The Rise of Independent Artists',
    excerpt: 'How streaming platforms and social media have empowered independent musicians to reach global audiences.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/independent-artists.jpg',
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    viewCount: 890,
    commentCount: 15,
    tags: ['independent', 'artists', 'streaming'],
    category: 'Music Industry',
    readTime: 6,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    userId: '1'
  },
  {
    id: '4',
    title: 'Audio Production Basics',
    excerpt: 'A beginner\'s guide to audio production, covering essential equipment, software, and techniques.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/audio-production.jpg',
    status: 'scheduled',
    scheduledAt: new Date('2024-04-01'),
    viewCount: 0,
    commentCount: 0,
    tags: ['production', 'audio', 'tutorial'],
    category: 'Tutorials',
    readTime: 12,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
    userId: '1'
  },
  {
    id: '5',
    title: 'Music Streaming Analytics',
    excerpt: 'Understanding your streaming data and how to use analytics to grow your audience and improve your music.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/streaming-analytics.jpg',
    status: 'published',
    publishedAt: new Date('2024-02-05'),
    viewCount: 567,
    commentCount: 8,
    tags: ['analytics', 'streaming', 'data'],
    category: 'Music Business',
    readTime: 7,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    userId: '1'
  },
  {
    id: '6',
    title: 'The Future of Music Technology',
    excerpt: 'Exploring emerging technologies that are shaping the future of music creation, distribution, and consumption.',
    content: 'Full blog post content here...',
    featuredImage: '/blog/music-technology.jpg',
    status: 'draft',
    viewCount: 0,
    commentCount: 0,
    tags: ['technology', 'future', 'innovation'],
    category: 'Technology',
    readTime: 10,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-22'),
    userId: '1'
  }
];

export class MockBlogService {
  async getBlogPosts(filters: BlogFilters): Promise<BlogData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let posts = [...mockBlogPosts];

    // Apply status filter
    switch (filters.activeFilter) {
      case 'published':
        posts = posts.filter(post => post.status === 'published');
        break;
      case 'drafts':
        posts = posts.filter(post => post.status === 'draft');
        break;
      case 'scheduled':
        posts = posts.filter(post => post.status === 'scheduled');
        break;
      // 'all' shows everything
    }

    // Apply sorting
    posts.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'comments':
          comparison = a.commentCount - b.commentCount;
          break;
        case 'date':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    const counts = {
      all: mockBlogPosts.length,
      published: mockBlogPosts.filter(p => p.status === 'published').length,
      drafts: mockBlogPosts.filter(p => p.status === 'draft').length,
      scheduled: mockBlogPosts.filter(p => p.status === 'scheduled').length
    };

    return {
      posts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: posts.length,
        totalPages: Math.ceil(posts.length / filters.limit)
      },
      counts
    };
  }

  async createBlogPost(data: any): Promise<BlogPost> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: data.title || 'New Blog Post',
      excerpt: data.excerpt || 'Blog post excerpt...',
      content: data.content || 'Blog post content...',
      featuredImage: data.featuredImage,
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : undefined,
      scheduledAt: data.scheduledAt,
      viewCount: 0,
      commentCount: 0,
      tags: data.tags || [],
      category: data.category,
      readTime: Math.ceil((data.content?.length || 0) / 200), // Rough estimate
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1'
    };

    mockBlogPosts.unshift(newPost);
    return newPost;
  }

  async deleteBlogPost(postId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockBlogPosts.findIndex(post => post.id === postId);
    if (index > -1) {
      mockBlogPosts.splice(index, 1);
    }
  }
}