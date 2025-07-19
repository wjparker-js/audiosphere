/**
 * Data transformation utilities for consistent API responses
 */

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: 'draft' | 'published' | 'private';
  publishedAt: string | null; // ISO string or null
  viewCount: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  authorName: string;
  commentCount: number;
  readTime: number;
  tags: string[];
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  albumId: number | null;
  albumTitle: string | null;
  trackNumber: number | null;
  duration: string | null;
  durationSeconds: number | null;
  filePath: string;
  playCount: number;
  status: 'published' | 'draft' | 'private';
  createdAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  description: string | null;
  coverImageUrl: string | null;
  genreId: number | null;
  genreName: string | null;
  trackCount: number;
  status: 'published' | 'draft' | 'private';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export class DataTransformer {
  /**
   * Safely parse date values, returning ISO string or null
   */
  static parseDate(dateValue: any): string | null {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (error) {
      console.warn('Invalid date value:', dateValue);
      return null;
    }
  }

  /**
   * Calculate read time based on content word count
   */
  static calculateReadTime(content: string): number {
    if (!content || typeof content !== 'string') return 1;
    
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Safely convert value to integer with default
   */
  static toInt(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Safely convert value to string with default
   */
  static toString(value: any, defaultValue: string = ''): string {
    if (value === null || value === undefined) return defaultValue;
    return String(value);
  }

  /**
   * Transform raw blog post data from database
   */
  static sanitizeBlogPost(rawPost: any): BlogPost {
    return {
      id: this.toInt(rawPost.id),
      title: this.toString(rawPost.title),
      slug: this.toString(rawPost.slug),
      excerpt: rawPost.excerpt || null,
      content: this.toString(rawPost.content),
      featuredImage: rawPost.featured_image_url || rawPost.featured_image || null,
      status: rawPost.status || 'draft',
      publishedAt: this.parseDate(rawPost.published_at || rawPost.publishedAt),
      viewCount: this.toInt(rawPost.view_count || rawPost.viewCount),
      userId: this.toInt(rawPost.user_id || rawPost.userId),
      createdAt: this.parseDate(rawPost.created_at || rawPost.createdAt) || new Date().toISOString(),
      updatedAt: this.parseDate(rawPost.updated_at || rawPost.updatedAt) || new Date().toISOString(),
      // Computed fields
      authorName: this.toString(rawPost.author_name || rawPost.authorName, 'Unknown Author'),
      commentCount: this.toInt(rawPost.comment_count || rawPost.commentCount),
      readTime: this.calculateReadTime(rawPost.content || ''),
      tags: Array.isArray(rawPost.tags) ? rawPost.tags : []
    };
  }

  /**
   * Transform raw track data from database
   */
  static sanitizeTrack(rawTrack: any): Track {
    return {
      id: this.toInt(rawTrack.id),
      title: this.toString(rawTrack.title),
      artist: this.toString(rawTrack.artist),
      albumId: rawTrack.album_id ? this.toInt(rawTrack.album_id) : null,
      albumTitle: rawTrack.album_title || null,
      trackNumber: rawTrack.track_number ? this.toInt(rawTrack.track_number) : null,
      duration: rawTrack.duration || null,
      durationSeconds: rawTrack.duration_seconds ? this.toInt(rawTrack.duration_seconds) : null,
      filePath: this.toString(rawTrack.file_path),
      playCount: this.toInt(rawTrack.play_count),
      status: rawTrack.status || 'published',
      createdAt: this.parseDate(rawTrack.created_at) || new Date().toISOString(),
      updatedAt: this.parseDate(rawTrack.updated_at) || new Date().toISOString(),
      coverImageUrl: rawTrack.cover_image_url || null
    };
  }

  /**
   * Transform raw album data from database
   */
  static sanitizeAlbum(rawAlbum: any): Album {
    return {
      id: this.toInt(rawAlbum.id),
      title: this.toString(rawAlbum.title),
      artist: this.toString(rawAlbum.artist),
      description: rawAlbum.description || null,
      coverImageUrl: rawAlbum.cover_image_url || null,
      genreId: rawAlbum.genre_id ? this.toInt(rawAlbum.genre_id) : null,
      genreName: rawAlbum.genre_name || null,
      trackCount: this.toInt(rawAlbum.track_count),
      status: rawAlbum.status || 'published',
      createdBy: this.toInt(rawAlbum.created_by),
      createdAt: this.parseDate(rawAlbum.created_at) || new Date().toISOString(),
      updatedAt: this.parseDate(rawAlbum.updated_at) || new Date().toISOString()
    };
  }

  /**
   * Generate URL-friendly slug from title
   */
  static generateSlug(title: string): string {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  pagination?: { total: number; limit: number; offset: number; hasMore: boolean }
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    },
    pagination
  };
}