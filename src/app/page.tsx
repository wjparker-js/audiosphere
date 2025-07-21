'use client';

import { useState, useMemo, useEffect } from 'react';
import { ContentCard } from '@/components/library/ContentCard';
import { TrackList } from '@/components/music/TrackList';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ContentItem, ContentAction } from '@/types/library';
import { BlogPost, BlogAction } from '@/types/blog';
import { Home, Music, List, FileText, Album, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Content section state interface
interface ContentSection {
  loading: boolean;
  error: string | null;
  data: any[];
  isEmpty: boolean;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Separate state for each content section
  const [albums, setAlbums] = useState<ContentSection>({
    loading: true,
    error: null,
    data: [],
    isEmpty: false
  });
  
  const [playlists, setPlaylists] = useState<ContentSection>({
    loading: true,
    error: null,
    data: [],
    isEmpty: false
  });
  
  const [blogPosts, setBlogPosts] = useState<ContentSection>({
    loading: true,
    error: null,
    data: [],
    isEmpty: false
  });
  
  const [tracks, setTracks] = useState<ContentSection>({
    loading: true,
    error: null,
    data: [],
    isEmpty: false
  });

  // Fetch albums from API
  const fetchAlbums = async () => {
    setAlbums(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/albums');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.albums) {
          // Convert API response to ContentItem format
          const apiAlbums: ContentItem[] = data.data.albums.map((album: any) => ({
            id: album.id.toString(),
            type: 'album' as const,
            title: album.title,
            artist: album.artist,
            coverArt: album.coverImageUrl || null,
            trackCount: album.trackCount || 0,
            genre: album.genreName || album.genre || "Unknown",
            status: album.status as 'published' | 'draft' | 'private',
            createdAt: new Date(album.createdAt),
            updatedAt: new Date(album.updatedAt),
            userId: album.createdBy?.toString() || 'unknown'
          }));
          
          setAlbums({
            loading: false,
            error: null,
            data: apiAlbums,
            isEmpty: apiAlbums.length === 0
          });
        } else {
          setAlbums({
            loading: false,
            error: null,
            data: [],
            isEmpty: true
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load albums',
        data: [],
        isEmpty: false
      });
    }
  };

  // Fetch playlists from API
  const fetchPlaylists = async () => {
    setPlaylists(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.playlists) {
          // Convert API response to ContentItem format
          const apiPlaylists: ContentItem[] = data.data.playlists.map((playlist: any) => ({
            id: playlist.id.toString(),
            type: 'playlist' as const,
            title: playlist.name,
            description: playlist.description,
            coverArt: playlist.coverImageUrl || null,
            trackCount: playlist.trackCount || 0,
            isPublic: playlist.isPublic || false,
            createdAt: new Date(playlist.createdAt),
            updatedAt: new Date(playlist.updatedAt),
            userId: playlist.userId?.toString() || 'unknown'
          }));
          
          setPlaylists({
            loading: false,
            error: null,
            data: apiPlaylists,
            isEmpty: apiPlaylists.length === 0
          });
        } else {
          setPlaylists({
            loading: false,
            error: null,
            data: [],
            isEmpty: true
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load playlists',
        data: [],
        isEmpty: false
      });
    }
  };

  // Fetch blog posts from API
  const fetchBlogPosts = async () => {
    setBlogPosts(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.posts) {
          // Sanitize blog posts data to prevent date errors
          const sanitizedPosts = data.data.posts.map((post: any) => ({
            ...post,
            createdAt: post.createdAt || new Date().toISOString(),
            updatedAt: post.updatedAt || new Date().toISOString(),
            publishedAt: post.publishedAt || null,
            viewCount: post.viewCount || 0,
            commentCount: post.commentCount || 0,
            readTime: post.readTime || 1,
            tags: post.tags || []
          }));
          
          setBlogPosts({
            loading: false,
            error: null,
            data: sanitizedPosts,
            isEmpty: sanitizedPosts.length === 0
          });
        } else {
          setBlogPosts({
            loading: false,
            error: null,
            data: [],
            isEmpty: true
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load blog posts',
        data: [],
        isEmpty: false
      });
    }
  };

  // Fetch tracks from API
  const fetchTracks = async () => {
    setTracks(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.tracks) {
          // Convert API response to Track format
          const apiTracks = data.data.tracks.map((track: any) => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.albumTitle || 'Unknown Album',
            duration: track.duration || '0:00',
            playCount: track.playCount || 0
          }));
          
          setTracks({
            loading: false,
            error: null,
            data: apiTracks,
            isEmpty: apiTracks.length === 0
          });
        } else {
          setTracks({
            loading: false,
            error: null,
            data: [],
            isEmpty: true
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load tracks',
        data: [],
        isEmpty: false
      });
    }
  };

  // Load all content on mount
  useEffect(() => {
    fetchAlbums();
    fetchPlaylists();
    fetchBlogPosts();
    fetchTracks();
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
    if (!searchQuery.trim()) return albums.data;
    return albums.data.filter((album: ContentItem) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, albums.data]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists.data;
    return playlists.data.filter((playlist: ContentItem) =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, playlists.data]);

  const filteredBlogPosts = useMemo(() => {
    if (!searchQuery.trim()) return blogPosts.data;
    return blogPosts.data.filter((post: BlogPost) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, blogPosts.data]);

  const totalItems = albums.data.length + playlists.data.length + blogPosts.data.length;
  const hasSearchResults = searchQuery.trim() && (filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredBlogPosts.length > 0);
  const hasNoResults = searchQuery.trim() && filteredAlbums.length === 0 && filteredPlaylists.length === 0 && filteredBlogPosts.length === 0;

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-y-auto">
      <div className="p-8">
        {/* Header Section - Similar to Library Page */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Home
                <span className="hidden md:inline"> - {getGreeting().split(' ')[1]}</span>
              </h1>
              <p className="text-gray-400">Your personalized music experience</p>
            </div>
          </div>
          
          {/* Quick Stats and Search - Mobile: stacked, Desktop: side by side */}
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
                Albums {albums.data.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <List className="w-3 h-3 mr-1" />
                Playlists {playlists.data.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <FileText className="w-3 h-3 mr-1" />
                Blogs {blogPosts.data.length}
              </Button>
            </div>

            {/* Search Field - Next line on mobile, same line on desktop */}
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
        
        {/* All Albums */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Albums</h2>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          
          {albums.loading ? (
            <LoadingState count={6} type="card" />
          ) : albums.error ? (
            <ErrorState
              message={albums.error}
              onRetry={fetchAlbums}
            />
          ) : albums.isEmpty ? (
            <EmptyState
              icon={Album}
              title="No albums yet"
              description="Start building your music library by uploading your first album."
              actionText="Upload Album"
              onAction={() => window.location.href = '/create-album'}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredAlbums.map((album) => (
                <ContentCard
                  key={album.id}
                  content={album}
                  onAction={handleContentAction}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Playlists */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Playlists</h2>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          
          {playlists.loading ? (
            <LoadingState count={6} type="card" />
          ) : playlists.error ? (
            <ErrorState
              message={playlists.error}
              onRetry={fetchPlaylists}
            />
          ) : playlists.isEmpty ? (
            <EmptyState
              icon={List}
              title="No playlists yet"
              description="Create your first playlist to organize your favorite tracks."
              actionText="Create Playlist"
              onAction={() => console.log('Create playlist')}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPlaylists.map((playlist) => (
                <ContentCard
                  key={playlist.id}
                  content={playlist}
                  onAction={handleContentAction}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Popular Right Now */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular right now</h2>
          <div className="bg-black/20 rounded-lg p-4">
            <TrackList 
              tracks={tracks.data}
              loading={tracks.loading}
              error={tracks.error}
              onRetry={fetchTracks}
            />
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
          
          {blogPosts.loading ? (
            <LoadingState count={4} type="blog" />
          ) : blogPosts.error ? (
            <ErrorState
              message={blogPosts.error}
              onRetry={fetchBlogPosts}
            />
          ) : blogPosts.isEmpty ? (
            <EmptyState
              icon={BookOpen}
              title="No blog posts yet"
              description="Share your thoughts and music insights with the community."
              actionText="Write Post"
              onAction={() => console.log('Create blog post')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBlogPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onAction={handleBlogAction}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}