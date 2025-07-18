import { LibraryData, LibraryFilters, BulkAction } from '@/types/library';

// Simple cache implementation
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export class LibraryService {
  private baseUrl = '/api';
  private cache = new SimpleCache();

  async getUserLibrary(userId: string, filters: LibraryFilters): Promise<LibraryData> {
    const startTime = performance.now();
    
    // Create cache key
    const cacheKey = `library-${userId}-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Library data loaded from cache in ${(performance.now() - startTime).toFixed(2)}ms`);
      return cachedData;
    }

    const params = new URLSearchParams({
      filter: filters.activeFilter,
      search: filters.searchQuery,
      sort: filters.sortBy,
      order: filters.sortOrder,
      page: filters.page.toString(),
      limit: filters.limit.toString()
    });

    const response = await fetch(`${this.baseUrl}/users/${userId}/library?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch library: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch library');
    }

    // Cache the result
    this.cache.set(cacheKey, result.data, 2 * 60 * 1000); // 2 minutes for library data

    const endTime = performance.now();
    console.log(`[API Performance] Library data fetched in ${(endTime - startTime).toFixed(2)}ms`);

    return result.data;
  }

  async bulkAction(action: BulkAction, contentIds: string[], userId: string): Promise<any> {
    const startTime = performance.now();
    
    const response = await fetch(`${this.baseUrl}/library/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        contentIds,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`Bulk action failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Bulk action failed');
    }

    // Invalidate cache after successful bulk action
    this.cache.invalidate(`library-${userId}`);
    
    const endTime = performance.now();
    console.log(`[API Performance] Bulk action (${action}) completed in ${(endTime - startTime).toFixed(2)}ms`);

    return result.data;
  }

  async deleteContent(contentId: string, contentType: string, userId: string): Promise<void> {
    const result = await this.bulkAction('delete', [contentId], userId);
    // Additional cache invalidation for specific content
    this.cache.invalidate(contentId);
    return result;
  }

  async publishContent(contentId: string, userId: string): Promise<void> {
    const result = await this.bulkAction('publish', [contentId], userId);
    this.cache.invalidate(contentId);
    return result;
  }

  async unpublishContent(contentId: string, userId: string): Promise<void> {
    const result = await this.bulkAction('unpublish', [contentId], userId);
    this.cache.invalidate(contentId);
    return result;
  }

  // Method to clear all cache (useful for debugging or manual refresh)
  clearCache() {
    this.cache.clear();
  }

  // Method to preload library data
  async preloadLibrary(userId: string, filters: LibraryFilters): Promise<void> {
    try {
      await this.getUserLibrary(userId, filters);
    } catch (error) {
      console.warn('Failed to preload library data:', error);
    }
  }
}