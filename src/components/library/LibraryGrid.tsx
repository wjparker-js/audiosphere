'use client';

import { ContentCard } from './ContentCard';
import { EmptyLibraryState } from './EmptyLibraryState';
import { LibraryGridSkeleton } from './LibraryGridSkeleton';
import { ContentItem, ContentAction, ViewMode, FilterType } from '@/types/library';
import { cn } from '@/lib/utils';
import { Music, List, FileText } from 'lucide-react';

interface LibraryGridProps {
  content: ContentItem[];
  loading: boolean;
  onAction: (action: ContentAction, content: ContentItem) => void;
  selectedItems: string[];
  onSelectionChange: (itemId: string, selected: boolean) => void;
  viewMode: ViewMode;
  activeFilter: FilterType;
  searchQuery: string;
  showCheckboxes?: boolean;
}

export function LibraryGrid({
  content,
  loading,
  onAction,
  selectedItems,
  onSelectionChange,
  viewMode,
  activeFilter,
  searchQuery,
  showCheckboxes = false
}: LibraryGridProps) {
  if (loading) {
    return <LibraryGridSkeleton viewMode={viewMode} />;
  }

  if (content.length === 0) {
    return (
      <EmptyLibraryState 
        filter={activeFilter} 
        searchQuery={searchQuery}
        onAction={onAction}
      />
    );
  }

  // Group content by type when showing all content
  if (activeFilter === 'all') {
    const albums = content.filter(item => item.type === 'album');
    const playlists = content.filter(item => item.type === 'playlist');
    const blogs = content.filter(item => item.type === 'blog');

    return (
      <div className="space-y-8">
        {/* Albums Section */}
        {albums.length > 0 && (
          <ContentSection
            title="Albums"
            content={albums}
            viewMode={viewMode}
            onAction={onAction}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            showCheckboxes={showCheckboxes}
          />
        )}

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <ContentSection
            title="Playlists"
            content={playlists}
            viewMode={viewMode}
            onAction={onAction}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            showCheckboxes={showCheckboxes}
          />
        )}

        {/* Blogs Section */}
        {blogs.length > 0 && (
          <ContentSection
            title="Blog Posts"
            content={blogs}
            viewMode={viewMode}
            onAction={onAction}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            showCheckboxes={showCheckboxes}
          />
        )}
      </div>
    );
  }

  // Single content type view (when filtering by specific type)
  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {content.map((item) => (
          <ListViewItem
            key={item.id}
            content={item}
            onAction={onAction}
            selected={selectedItems.includes(item.id)}
            onSelect={(selected) => onSelectionChange(item.id, selected)}
            showCheckbox={showCheckboxes}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-300",
      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
    )}>
      {content.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          onAction={onAction}
          selected={selectedItems.includes(item.id)}
          onSelect={(selected) => onSelectionChange(item.id, selected)}
          showCheckbox={showCheckboxes}
        />
      ))}
    </div>
  );
}

// List View Item Component - 120px max height
function ListViewItem({
  content,
  onAction,
  selected = false,
  onSelect,
  showCheckbox = false
}: {
  content: ContentItem;
  onAction: (action: ContentAction, content: ContentItem) => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
}) {
  const getContentImage = (content: ContentItem) => {
    switch (content.type) {
      case 'album':
        return content.coverArt || '/album/default-album.jpg';
      case 'playlist':
        return content.coverArt || '/playlists/default-playlist.jpg';
      case 'blog':
        return content.featuredImage || '/blog/default-blog.jpg';
      default:
        return '/default-content.jpg';
    }
  };

  const getContentSubtitle = (content: ContentItem) => {
    switch (content.type) {
      case 'album':
        return `${content.artist} • ${content.trackCount} tracks`;
      case 'playlist':
        return `${content.trackCount} tracks`;
      case 'blog':
        return content.excerpt;
      default:
        return '';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'album':
        return '🎵';
      case 'playlist':
        return '📋';
      case 'blog':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer max-h-[120px]",
        "hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50",
        selected && "bg-orange-500/10 border-orange-500/30"
      )}
      onClick={() => onAction('view', content)}
    >
      {/* Checkbox */}
      {showCheckbox && onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="w-4 h-4 rounded border-2 border-gray-400 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-2"
        />
      )}

      {/* Larger Thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
        <img
          src={getContentImage(content)}
          alt={content.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling!.classList.remove('hidden');
          }}
        />
        <div className="hidden w-full h-full flex items-center justify-center text-3xl">
          {getTypeIcon(content.type)}
        </div>
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate text-base mb-1">
          {content.title}
        </h3>
        <p className="text-sm text-gray-400 truncate mb-2">
          {getContentSubtitle(content)}
        </p>
        {/* Status */}
        <div className="flex items-center gap-2">
          {content.type === 'album' || content.type === 'blog' ? (
            <span className={cn(
              "text-xs font-medium",
              content.status === 'published' && "text-green-400",
              content.status === 'draft' && "text-yellow-400",
              content.status === 'private' && "text-gray-400"
            )}>
              {content.status}
            </span>
          ) : content.type === 'playlist' ? (
            <span className="text-xs text-gray-400">
              {content.isPublic ? 'Public' : 'Private'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Type Badge - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          content.type === 'album' && "bg-blue-500/20 text-blue-400",
          content.type === 'playlist' && "bg-green-500/20 text-green-400",
          content.type === 'blog' && "bg-purple-500/20 text-purple-400"
        )}>
          {content.type}
        </span>
      </div>

      {/* Date - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0 text-sm text-gray-500 w-24 text-right">
        {new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(content.createdAt)}
      </div>
    </div>
  );
}

// Content Section Component - Displays a section with header and content grid
function ContentSection({
  title,
  content,
  viewMode,
  onAction,
  selectedItems,
  onSelectionChange,
  showCheckboxes = false
}: {
  title: string;
  content: ContentItem[];
  viewMode: ViewMode;
  onAction: (action: ContentAction, content: ContentItem) => void;
  selectedItems: string[];
  onSelectionChange: (itemId: string, selected: boolean) => void;
  showCheckboxes?: boolean;
}) {
  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'albums':
        return <Music className="w-5 h-5" />;
      case 'playlists':
        return <List className="w-5 h-5" />;
      case 'blog posts':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-700/50">
        <div className="text-orange-500">
          {getSectionIcon(title)}
        </div>
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
        <span className="text-sm text-gray-400 ml-2">
          ({content.length})
        </span>
      </div>

      {/* Section Content */}
      {viewMode === 'list' ? (
        <div className="space-y-1">
          {content.map((item) => (
            <ListViewItem
              key={item.id}
              content={item}
              onAction={onAction}
              selected={selectedItems.includes(item.id)}
              onSelect={(selected) => onSelectionChange(item.id, selected)}
              showCheckbox={showCheckboxes}
            />
          ))}
        </div>
      ) : (
        <div className={cn(
          "transition-all duration-300",
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
        )}>
          {content.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onAction={onAction}
              selected={selectedItems.includes(item.id)}
              onSelect={(selected) => onSelectionChange(item.id, selected)}
              showCheckbox={showCheckboxes}
            />
          ))}
        </div>
      )}
    </div>
  );
}