// Base blog post interface
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  viewCount: number;
  commentCount: number;
  tags: string[];
  category?: string;
  readTime: number; // estimated reading time in minutes
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Blog filter options
export type BlogFilterType = 'all' | 'published' | 'drafts' | 'scheduled';

// Sort options
export type BlogSortBy = 'date' | 'title' | 'views' | 'comments';
export type BlogSortOrder = 'asc' | 'desc';

// View mode options
export type BlogViewMode = 'grid' | 'list';

// Blog filters interface
export interface BlogFilters {
  activeFilter: BlogFilterType;
  sortBy: BlogSortBy;
  sortOrder: BlogSortOrder;
  page: number;
  limit: number;
}

// Blog state interface
export interface BlogState {
  posts: BlogPost[];
  filters: BlogFilters;
  ui: {
    loading: boolean;
    viewMode: BlogViewMode;
  };
  counts: {
    all: number;
    published: number;
    drafts: number;
    scheduled: number;
  };
}

// API response interfaces
export interface BlogData {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    all: number;
    published: number;
    drafts: number;
    scheduled: number;
  };
}

// Blog action types
export type BlogAction = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'share' 
  | 'create';