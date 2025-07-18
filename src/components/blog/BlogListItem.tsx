'use client';

import { BlogPost, BlogAction } from '@/types/blog';
import { cn } from '@/lib/utils';
import { Calendar, Eye, MessageCircle, Clock } from 'lucide-react';

interface BlogListItemProps {
  post: BlogPost;
  onAction: (action: BlogAction, post: BlogPost) => void;
}

export function BlogListItem({
  post,
  onAction
}: BlogListItemProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'text-green-400';
      case 'draft':
        return 'text-yellow-400';
      case 'scheduled':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer max-h-[120px]",
        "hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50"
      )}
      onClick={() => onAction('view', post)}
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
        <img
          src={post.featuredImage || '/blog/default-blog.jpg'}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling!.classList.remove('hidden');
          }}
        />
        <div className="hidden w-full h-full flex items-center justify-center text-3xl">
          📝
        </div>
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate text-base mb-1">
          {post.title}
        </h3>
        <p className="text-sm text-gray-400 truncate mb-2">
          {post.excerpt}
        </p>
        {/* Status and Metadata */}
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", getStatusColor(post.status))}>
            {post.status}
          </span>
          <span className="text-gray-500">•</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          {post.readTime && (
            <>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{post.viewCount}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount}</span>
        </div>
      </div>

      {/* Date - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0 text-sm text-gray-500 w-24 text-right">
        {formatDate(post.createdAt)}
      </div>
    </div>
  );
}