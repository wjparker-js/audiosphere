'use client';

import { useState, useMemo, useCallback } from 'react';
import { ContentCard } from '@/components/library/ContentCard';
import { TrackList } from '@/components/music/TrackList';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { LazyContent } from '@/hooks/useIntersectionObserver';
import { ContentItem, ContentAction } from '@/types/library';
import { BlogPost, BlogAction } from '@/types/blog';
import { Home, Music, List, FileText, Album, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import React Query hooks
import { useAlbums } from '@/hooks/useAlbums';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useTracks } from '@/hooks/useTracks';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useImagePreload } from '@/services/image-preload.service';
import { useEffect } from 'react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use React Query hooks for data fetching
  const {
    data: albums = [],
    isLoading: albumsLoading,
    error: albumsError,
    refetch: refetchAlbums
  } = useAlbums();
  
  const {
    data: playlists = [],
    isLoading: playlistsLoading,
    error: playlistsError,
    refetch: refetchPlaylists
  } = usePlaylists();
  
  const {
    data: tracks = [],
    isLoading: tracksLoading,
    error: tracksError,
    refetch: refetchTracks
  } = useTracks();
  
  const {
    data: blogPosts = [],
    isLoading: blogPostsLoading,
    error: blogPostsError,
    refetch: refetchBlogPosts
  } = useBlogPosts();

  // Image preloading hook
  const { preloadForPage } = useImagePreload();

  // Preload images when data is available
  useEffect(() => {
    if (albums.length > 0 || blogPosts.length > 0) {
      const allContent = [...albums, ...blogPosts];
      preloadForPage('home', allContent).catch(error => {
        console.warn('Image preloading failed:', error);
      });
    }
  }, [albums, blogPosts, preloadForPage]);



  // Memoize greeting function to avoid recalculation on every render
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const handleContentAction = useCallback((action: ContentAction, content: ContentItem) => {
    if (action === 'view' && content.type === 'album') {
      // Navigate to album details page
      window.location.href = `/albums/${content.id}`;
    } else {
      console.log(`${action} action on ${content.title}`);
    }
  }, []);

  const handleBlogAction = useCallback((action: BlogAction, post: BlogPost) => {
    console.log(`${action} action on ${post.title}`);
  }, []);

  // Filter content based on search query
  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    return albums.filter((album: ContentItem) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, albums]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists;
    return playlists.filter((playlist: ContentItem) =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, playlists]);

  const filteredBlogPosts = useMemo(() => {
    if (!searchQuery.trim()) return blogPosts;
    return blogPosts.filter((post: BlogPost) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, blogPosts]);

  // Memoize computed values to prevent unnecessary recalculations
  const totalItems = useMemo(() => 
    albums.length + playlists.length + blogPosts.length, 
    [albums.length, playlists.length, blogPosts.length]
  );
  
  const hasSearchResults = useMemo(() => 
    searchQuery.trim() && (filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredBlogPosts.length > 0),
    [searchQuery, filteredAlbums.length, filteredPlaylists.length, filteredBlogPosts.length]
  );
  
  const hasNoResults = useMemo(() => 
    searchQuery.trim() && filteredAlbums.length === 0 && filteredPlaylists.length === 0 && filteredBlogPosts.length === 0,
    [searchQuery, filteredAlbums.length, filteredPlaylists.length, filteredBlogPosts.length]
  );

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
                Albums {albums.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-8 px-3"
              >
                <List className="w-3 h-3 mr-1" />
                Playlists {playlists.length}
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
          
          {albumsLoading ? (
            <LoadingState count={6} type="card" />
          ) : albumsError ? (
            <ErrorState
              message={albumsError.message}
              onRetry={refetchAlbums}
            />
          ) : albums.length === 0 ? (
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
          
          {playlistsLoading ? (
            <LoadingState count={6} type="card" />
          ) : playlistsError ? (
            <ErrorState
              message={playlistsError.message}
              onRetry={refetchPlaylists}
            />
          ) : playlists.length === 0 ? (
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
        
        {/* Popular Right Now - Lazy loaded */}
        <LazyContent
          fallback={<LoadingState count={5} type="list" />}
          threshold={0.1}
          rootMargin="200px"
        >
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Popular right now</h2>
            <div className="bg-black/20 rounded-lg p-4">
              <TrackList 
                tracks={tracks}
                loading={tracksLoading}
                error={tracksError?.message}
                onRetry={refetchTracks}
              />
            </div>
          </section>
        </LazyContent>
        
        {/* Latest from our Blog - Lazy loaded */}
        <LazyContent
          fallback={<LoadingState count={4} type="blog" />}
          threshold={0.1}
          rootMargin="200px"
        >
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Latest from our Blog</h2>
              <button className="text-sm text-gray-300 hover:text-white transition-colors">
                Show all
              </button>
            </div>
            
            {blogPostsLoading ? (
              <LoadingState count={4} type="blog" />
            ) : blogPostsError ? (
              <ErrorState
                message={blogPostsError.message}
                onRetry={refetchBlogPosts}
              />
            ) : blogPosts.length === 0 ? (
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
        </LazyContent>
      </div>
    </div>
  );
}