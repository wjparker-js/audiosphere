'use client';

import { BlogCard } from './BlogCard';
import { BlogListItem } from './BlogListItem';
import { EmptyBlogState } from './EmptyBlogState';
import { BlogGridSkeleton } from './BlogGridSkeleton';
import { BlogPost, BlogAction, BlogViewMode, BlogFilterType } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogGridProps {
  posts: BlogPost[];
  loading: boolean;
  onAction: (action: BlogAction, post: BlogPost) => void;
  viewMode: BlogViewMode;
  activeFilter: BlogFilterType;
}

export function BlogGrid({
  posts,
  loading,
  onAction,
  viewMode,
  activeFilter
}: BlogGridProps) {
  if (loading) {
    return <BlogGridSkeleton viewMode={viewMode} />;
  }

  if (posts.length === 0) {
    return (
      <EmptyBlogState 
        filter={activeFilter} 
        onAction={onAction}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {posts.map((post) => (
          <BlogListItem
            key={post.id}
            post={post}
            onAction={onAction}
          />
        ))}
      </div>
    );
  }

  // Grid view with double-wide first post
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={cn(
            // First post is double-wide on medium screens and up
            index === 0 && "md:col-span-2 lg:col-span-2"
          )}
        >
          <BlogCard
            post={post}
            featured={index === 0}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}