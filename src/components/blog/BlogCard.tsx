'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Calendar,
  MessageCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

import { BlogPost, BlogAction } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  onAction: (action: BlogAction, post: BlogPost) => void;
}

// Status badge component
function StatusBadge({ status }: { status: BlogPost['status'] }) {
  const statusConfig = {
    published: { color: 'bg-green-500', label: 'Published' },
    draft: { color: 'bg-yellow-500', label: 'Draft' },
    scheduled: { color: 'bg-blue-500', label: 'Scheduled' }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("px-2 py-1 rounded-full text-xs font-medium text-white", config.color)}>
      {config.label}
    </div>
  );
}

// Get quick actions for blog posts
function getQuickActions() {
  return [
    { key: 'view', icon: Eye, label: 'View' },
    { key: 'edit', icon: Edit, label: 'Edit' },
    { key: 'share', icon: Share, label: 'Share' },
    { key: 'delete', icon: Trash2, label: 'Delete' }
  ];
}

const BlogCardComponent = ({
  post,
  featured = false,
  onAction
}: BlogCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const quickActions = getQuickActions();

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown date';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Unknown date';
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={cn(
        "relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 flex flex-col",
        "bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm",
        "border border-gray-700/50 hover:border-gray-600/50",
        "shadow-lg hover:shadow-2xl hover:shadow-orange-500/10",
        // Consistent height for all cards
        "h-72"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onAction('view', post)}
    >
      {/* Featured Image */}
      <div className="relative overflow-hidden flex-1">
        <PlaceholderImage
          src={post?.featuredImage}
          alt={post?.title || 'Blog post'}
          fallbackText={post?.title || 'Blog Post'}
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
          width={400}
          height={200}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Actions Overlay */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
              {/* Primary Action Button */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction('view', post);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full h-14 w-14 p-0 shadow-xl hover:shadow-orange-500/50 transition-all duration-300"
                >
                  <Eye className="w-6 h-6" />
                </Button>
              </motion.div>
              
              {/* Secondary Actions */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex gap-2">
                  {quickActions.slice(1, 4).map((action, index) => (
                    <motion.div
                      key={action.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(action.key as BlogAction, post);
                        }}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full backdrop-blur-sm"
                        title={action.label}
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                
                {/* More Options */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle more options
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full backdrop-blur-sm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={post?.status || 'draft'} />
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className={cn(
            "font-semibold text-white mb-1",
            featured ? "text-xl" : "text-lg"
          )}>
            {post?.title || 'Untitled Post'}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {post?.excerpt || 'No excerpt available'}
          </p>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{post?.createdAt ? formatDate(post.createdAt) : 'Unknown date'}</span>
            {post?.readTime && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post?.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{post?.commentCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const BlogCard = React.memo(BlogCardComponent);