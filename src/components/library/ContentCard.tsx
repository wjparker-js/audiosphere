'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  Music, 
  FileText, 
  List,
  Calendar,
  Clock,
  Heart,
  MoreHorizontal,
  TrendingUp,
  Users,
  MessageCircle,
  Star,
  Zap,
  Award,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

import { ContentItem, ContentAction } from '@/types/library';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  content: ContentItem;
  onAction: (action: ContentAction, content: ContentItem) => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
}

// Content type badge component - Small circle with icon
function ContentTypeBadge({ type }: { type: ContentItem['type'] }) {
  const config = {
    album: { icon: Music, color: 'bg-blue-500' },
    playlist: { icon: List, color: 'bg-green-500' },
    blog: { icon: FileText, color: 'bg-purple-500' }
  };

  const { icon: Icon, color } = config[type];

  return (
    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", color)}>
      <Icon className="w-3 h-3" />
    </div>
  );
}

// Status indicator component
function ContentStatus({ content }: { content: ContentItem }) {
  if (content.type === 'album' || content.type === 'blog') {
    const status = content.status;
    const statusConfig = {
      published: { color: 'text-green-400', label: 'Published' },
      draft: { color: 'text-yellow-400', label: 'Draft' },
      private: { color: 'text-gray-400', label: 'Private' },
      scheduled: { color: 'text-blue-400', label: 'Scheduled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
    );
  }

  if (content.type === 'playlist') {
    return (
      <span className="text-xs text-gray-400">
        {content.isPublic ? 'Public' : 'Private'}
      </span>
    );
  }

  return null;
}

// Metadata component
function ContentMetadata({ content }: { content: ContentItem }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <Calendar className="w-3 h-3" />
      <span>{formatDate(content.createdAt)}</span>
      {/* Removed "played" information for playlists */}
    </div>
  );
}

// Get quick actions based on content type
function getQuickActions(type: ContentItem['type']) {
  const baseActions = [
    { key: 'view', icon: Eye, label: 'View' },
    { key: 'edit', icon: Edit, label: 'Edit' },
    { key: 'share', icon: Share2, label: 'Share' }
    // Removed delete action
  ];

  if (type === 'playlist') {
    return [
      { key: 'play', icon: Play, label: 'Play' },
      ...baseActions
    ];
  }

  return baseActions;
}

// Get content image - returns null if no image available
function getContentImage(content: ContentItem) {
  switch (content.type) {
    case 'album':
      return content.coverArt;
    case 'playlist':
      return content.coverArt;
    case 'blog':
      return content.featuredImage;
    default:
      return null;
  }
}

// Get content subtitle
function getContentSubtitle(content: ContentItem) {
  switch (content.type) {
    case 'album':
      return `${content.artist} • ${content.trackCount} track${content.trackCount !== 1 ? 's' : ''}`;
    case 'playlist':
      return `${content.trackCount} track${content.trackCount !== 1 ? 's' : ''}`;
    case 'blog':
      return content.excerpt;
    default:
      return '';
  }
}

// Enhanced Performance Metrics Component
function PerformanceMetrics({ content }: { content: ContentItem }) {
  const getMetrics = () => {
    switch (content.type) {
      case 'album':
        return [
          { icon: Play, value: '2.4K', label: 'Plays', color: 'text-green-400' },
          { icon: Heart, value: '89', label: 'Likes', color: 'text-red-400' },
          { icon: Star, value: '4.8', label: 'Rating', color: 'text-yellow-400' }
        ];
      case 'playlist':
        return [
          { icon: Users, value: '156', label: 'Followers', color: 'text-blue-400' },
          { icon: Play, value: '1.2K', label: 'Plays', color: 'text-green-400' },
          { icon: TrendingUp, value: '+12%', label: 'Growth', color: 'text-purple-400' }
        ];
      case 'blog':
        return [
          { icon: Eye, value: content.viewCount.toString(), label: 'Views', color: 'text-cyan-400' },
          { icon: MessageCircle, value: content.commentCount.toString(), label: 'Comments', color: 'text-orange-400' },
          { icon: Share2, value: '24', label: 'Shares', color: 'text-pink-400' }
        ];
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className={cn("flex items-center justify-center gap-1", metric.color)}>
            <metric.icon className="w-3 h-3" />
            <span className="text-xs font-bold">{metric.value}</span>
          </div>
          <div className="text-xs text-gray-500">{metric.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// AI Insights Badge
function AIInsightsBadge({ content }: { content: ContentItem }) {
  const insights = [
    { type: 'trending', icon: TrendingUp, color: 'from-green-400 to-emerald-500', text: 'Trending' },
    { type: 'popular', icon: Star, color: 'from-yellow-400 to-orange-500', text: 'Popular' },
    { type: 'recommended', icon: Zap, color: 'from-purple-400 to-pink-500', text: 'AI Pick' },
    { type: 'award', icon: Award, color: 'from-blue-400 to-cyan-500', text: 'Top Rated' }
  ];

  // Simulate AI insight based on content
  const insight = insights[Math.floor(Math.random() * insights.length)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white",
        `bg-gradient-to-r ${insight.color}`,
        "shadow-lg backdrop-blur-sm"
      )}
    >
      <div className="flex items-center gap-1">
        <insight.icon className="w-3 h-3" />
        <span>{insight.text}</span>
      </div>
    </motion.div>
  );
}

export function ContentCard({
  content,
  onAction,
  selected = false,
  onSelect,
  showCheckbox = false
}: ContentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const quickActions = getQuickActions(content.type);

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
        "h-72", // Consistent height for all cards
        selected && "ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onAction('view', content)}
    >
      {/* Enhanced Cover Art / Thumbnail */}
      <div className="aspect-square relative overflow-hidden">
        <PlaceholderImage
          src={getContentImage(content)}
          alt={content.title}
          fallbackText={content.title}
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
          width={300}
          height={300}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        

        
        {/* Enhanced Actions Overlay */}
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
                    onAction(quickActions[0]?.key as ContentAction || 'view', content);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full h-14 w-14 p-0 shadow-xl hover:shadow-orange-500/50 transition-all duration-300"
                >
                  {quickActions[0]?.icon && React.createElement(quickActions[0].icon, { className: "w-6 h-6" })}
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
                          onAction(action.key as ContentAction, content);
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
                      setShowDetails(!showDetails);
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
        
        {/* Content Type Badge - Smaller and closer to corner */}
        <div className="absolute top-2 right-2">
          <ContentTypeBadge type={content.type} />
        </div>

        {/* Bookmark Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className={cn(
            "absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            isBookmarked 
              ? "bg-orange-500 text-white" 
              : "bg-black/30 text-gray-300 hover:text-white"
          )}
        >
          <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        </motion.button>

        {/* Selection Checkbox */}
        {showCheckbox && onSelect && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 left-3"
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(e.target.checked);
              }}
              className="w-5 h-5 rounded border-2 border-gray-400 bg-black/50 text-orange-500 focus:ring-orange-500 focus:ring-2 backdrop-blur-sm"
            />
          </motion.div>
        )}
      </div>

      {/* Enhanced Content Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white truncate mb-1 text-base">
            {content.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {getContentSubtitle(content)}
          </p>
        </div>
        
        {/* Status and Metadata Row */}
        <div className="flex items-center justify-between">
          <ContentStatus content={content} />
          <ContentMetadata content={content} />
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics content={content} />

        {/* Removed completion progress bar */}
      </div>

      {/* Detailed Info Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm"
          >
            <div className="p-4 space-y-3">
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Intl.DateTimeFormat('en-US').format(content.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modified:</span>
                  <span>{new Intl.DateTimeFormat('en-US').format(content.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>2.4 MB</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {['Popular', 'Trending', 'Featured'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(251, 146, 60, 0.1), transparent)',
          filter: 'blur(1px)'
        }}
      />
    </motion.div>
  );
}