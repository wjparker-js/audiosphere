// Base content item interface
export interface BaseContentItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Album interface
export interface Album extends BaseContentItem {
  type: 'album';
  artist: string;
  coverArt: string;
  trackCount: number;
  genre: string;
  status: 'published' | 'draft' | 'private';
  description?: string;
}

// Playlist interface
export interface Playlist extends BaseContentItem {
  type: 'playlist';
  description?: string;
  coverArt?: string;
  trackCount: number;
  isPublic: boolean;
  lastPlayed?: Date;
}

// Blog post interface
export interface BlogPost extends BaseContentItem {
  type: 'blog';
  excerpt: string;
  featuredImage?: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt?: Date;
  viewCount: number;
  commentCount: number;
}

// Union type for all content items
export type ContentItem = Album | Playlist | BlogPost;

// Content type filter options
export type FilterType = 'all' | 'playlists' | 'albums' | 'blogs';

// Sort options
export type SortBy = 'date' | 'title' | 'type' | 'modified';
export type SortOrder = 'asc' | 'desc';

// View mode options
export type ViewMode = 'grid' | 'list';

// Library filters interface
export interface LibraryFilters {
  activeFilter: FilterType;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

// Library state interface
export interface LibraryState {
  content: {
    albums: Album[];
    playlists: Playlist[];
    blogPosts: BlogPost[];
  };
  filters: LibraryFilters;
  ui: {
    loading: boolean;
    selectedItems: string[];
    viewMode: ViewMode;
  };
  counts: {
    all: number;
    playlists: number;
    albums: number;
    blogs: number;
  };
}

// API response interfaces
export interface LibraryData {
  albums: Album[];
  playlists: Playlist[];
  blogPosts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    all: number;
    playlists: number;
    albums: number;
    blogs: number;
  };
}

// Error handling interfaces
export interface LibraryError {
  type: 'network' | 'permission' | 'validation' | 'server';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Quick action interfaces
export interface QuickAction {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: (content: ContentItem) => void;
}

// Content action types
export type ContentAction = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'share' 
  | 'play' 
  | 'duplicate';

// Bulk action types
export type BulkAction = 
  | 'delete' 
  | 'archive' 
  | 'publish' 
  | 'unpublish' 
  | 'export';