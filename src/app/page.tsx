'use client';

import { useState, useMemo, useEffect } from 'react';
import { ContentCard } from '@/components/library/ContentCard';
import { TrackList } from '@/components/music/TrackList';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchField } from '@/components/ui/SearchField';
import { ContentItem, ContentAction } from '@/types/library';
import { BlogPost, BlogAction } from '@/types/blog';
import { Home, Music, List, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample data converted to match library format
const recentlyPlayedAlbums: ContentItem[] = [
  {
    id: '1',
    type: 'album',
    title: "The Grand Sessions",
    artist: "Midnight",
    coverArt: "https://via.placeholder.com/300x300/1f2937/ffffff?text=The+Grand+Sessions",
    trackCount: 12,
    genre: "Electronic",
    status: 'published',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user1'
  },
  {
    id: '2',
    type: 'album',
    title: "Waffles Greatest Hits",
    artist: "The Midnight",
    coverArt: "https://via.placeholder.com/300x300/1f2937/ffffff?text=Waffles+Greatest+Hits",
    trackCount: 15,
    genre: "Synthwave",
    status: 'published',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    userId: 'user1'
  },
  {
    id: '3',
    type: 'album',
    title: "Endless Summer",
    artist: "The Midnight",
    coverArt: "https://via.placeholder.com/300x300/1f2937/ffffff?text=Endless+Summer",
    trackCount: 10,
    genre: "Synthwave",
    status: 'published',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    userId: 'user1'
  },
  {
    id: '4',
    type: 'album',
    title: "Neon Nights",
    artist: "Neon Dreams",
    coverArt: "https://via.placeholder.com/300x300/1f2937/ffffff?text=Neon+Nights",
    trackCount: 8,
    genre: "Electronic",
    status: 'published',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    userId: 'user1'
  },
  {
    id: '5',
    type: 'album',
    title: "After Hours",
    artist: "The Weeknd",
    coverArt: "https://via.placeholder.com/300x300/1f2937/ffffff?text=After+Hours",
    trackCount: 14,
    genre: "R&B",
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userId: 'user1'
  }
];

const madeForYouPlaylists: ContentItem[] = [
  {
    id: '6',
    type: 'playlist',
    title: "Big Stuff",
    description: "Created from track menu",
    coverArt: "/playlists/big-stuff.jpg",
    trackCount: 25,
    isPublic: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    userId: 'user1'
  },
  {
    id: '7',
    type: 'playlist',
    title: "My Playlist #1",
    description: "Created by you",
    coverArt: "/playlists/my-playlist-1.jpg",
    trackCount: 18,
    isPublic: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-10'),
    userId: 'user1'
  }
];

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: "AI Lamont",
    excerpt: "An incredible story of Garry Lamont...",
    content: "Full blog content here...",
    featuredImage: "https://via.placeholder.com/400x200/1f2937/ffffff?text=AI+Lamont",
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    viewCount: 1250,
    commentCount: 23,
    tags: ['AI', 'Music', 'Technology'],
    category: "Music News",
    readTime: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user1'
  },
  {
    id: '2',
    title: "Andy Capp",
    excerpt: "Capp for real...",
    content: "Full blog content here...",
    featuredImage: "https://via.placeholder.com/400x200/1f2937/ffffff?text=Andy+Capp",
    status: 'published',
    publishedAt: new Date('2024-01-12'),
    viewCount: 890,
    commentCount: 15,
    tags: ['Review', 'Artist'],
    category: "Reviews",
    readTime: 3,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    userId: 'user1'
  },
  {
    id: '3',
    title: "Home",
    excerpt: "Garry's home album...",
    content: "Full blog content here...",
    featuredImage: "https://via.placeholder.com/400x200/1f2937/ffffff?text=Home",
    status: 'published',
    publishedAt: new Date('2024-01-10'),
    viewCount: 654,
    commentCount: 8,
    tags: ['Album', 'Review'],
    category: "Music News",
    readTime: 4,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    userId: 'user1'
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<ContentItem[]>(recentlyPlayedAlbums);
  const [loading, setLoading] = useState(false);

  // Fetch albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/albums');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.albums && data.albums.length > 0) {
            // Convert API response to ContentItem format
            const apiAlbums: ContentItem[] = data.albums.map((album: any) => ({
              id: album.id.toString(),
              type: 'album' as const,
              title: album.title,
              artist: album.artist,
              coverArt: album.cover_image_url || "https://via.placeholder.com/300x300/1f2937/ffffff?text=" + encodeURIComponent(album.title),
              trackCount: album.track_count || 0,
              genre: album.genre_name || album.genre || "Unknown",
              status: album.status as 'published' | 'draft' | 'private',
              createdAt: new Date(album.created_at),
              updatedAt: new Date(album.updated_at),
              userId: album.created_by?.toString() || 'unknown'
            }));
            
            // Combine API albums with sample albums, with API albums first
            setAlbums([...apiAlbums, ...recentlyPlayedAlbums]);
          }
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
        // Keep using sample data if API fails
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbums();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleContentAction = (action: ContentAction, content: ContentItem) => {
    if (action === 'view' && content.type === 'album') {
      // Navigate to album details page
      window.location.href = `/albums/${content.id}`;
    } else {
      console.log(`${action} action on ${content.title}`);
    }
  };

  const handleBlogAction = (action: BlogAction, post: BlogPost) => {
    console.log(`${action} action on ${post.title}`);
  };

  // Filter content based on search query
  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    return albums.filter(album =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, albums]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return madeForYouPlaylists;
    return madeForYouPlaylists.filter(playlist =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredBlogPosts = useMemo(() => {
    if (!searchQuery.trim()) return blogPosts;
    return blogPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const totalItems = albums.length + madeForYouPlaylists.length + blogPosts.length;
  const hasSearchResults = searchQuery.trim() && (filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredBlogPosts.length > 0);
  const hasNoResults = searchQuery.trim() && filteredAlbums.length === 0 && filteredPlaylists.length === 0 && filteredBlogPosts.length === 0;

  return (
    <div className="h-full bg-gradient-to-b from-green-800 to-green-900 text-white overflow-y-auto">
      <div className="p-8">
        {/* Header Section - Similar to Library Page */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{getGreeting()}</h1>
              <p className="text-gray-400">Your personalized music experience</p>
            </div>
          </div>
          
          {/* Quick Stats and Search - Desktop: side by side, Mobile: stacked */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600 h-8 px-3"
              >
                <Music className="w-3 h-3 mr-1" />
                All Items {totalItems}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <Music className="w-3 h-3 mr-1" />
                Albums {albums.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <List className="w-3 h-3 mr-1" />
                Playlists {madeForYouPlaylists.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <FileText className="w-3 h-3 mr-1" />
                Blogs {blogPosts.length}
              </Button>
            </div>

            {/* Search Field - Right of buttons on desktop, below on mobile */}
            <div className="w-full lg:w-auto lg:min-w-[320px] lg:max-w-lg lg:ml-4">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search albums, playlists, and blog posts..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* No Results Message */}
        {hasNoResults && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400">
              Try searching with different keywords or browse our content below
            </p>
          </div>
        )}
        
        {/* Recently Played */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recently played</h2>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAlbums.map((album) => (
              <ContentCard
                key={album.id}
                content={album}
                onAction={handleContentAction}
              />
            ))}
          </div>
        </section>
        
        {/* Made for You */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Made for you</h2>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {madeForYouPlaylists.map((playlist) => (
              <ContentCard
                key={playlist.id}
                content={playlist}
                onAction={handleContentAction}
              />
            ))}
          </div>
        </section>
        
        {/* Popular Right Now */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular right now</h2>
          <div className="bg-black/20 rounded-lg p-4">
            <TrackList />
          </div>
        </section>
        
        {/* Latest from our Blog */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Latest from our Blog</h2>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onAction={handleBlogAction}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}