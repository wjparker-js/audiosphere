'use client';

import React, { useState, useCallback } from 'react';
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
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useLazyImage } from '@/hooks/useLazyImage';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useHoverPrefetch } from '@/hooks/usePrefetch';

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

// Get content subtitle (description/artist info with year for albums)
function getContentSubtitle(content: ContentItem) {
  switch (content.type) {
    case 'album':
      const artist = content.artist || 'Unknown Artist';
      const year = content.createdAt.getFullYear();
      return `${artist} ${year}`;
    case 'playlist':
      return content.description || 'Custom playlist';
    case 'blog':
      return content.excerpt;
    default:
      return '';
  }
}

// Get track count display text
function getTrackCountText(content: ContentItem) {
  if (content.type === 'album' || content.type === 'playlist') {
    const count = content.trackCount || 0;
    return count === 1 ? '1 track' : `${count} tracks`;
  }
  return null;
}



const ContentCardComponent = ({
  content,
  onAction,
  selected = false,
  onSelect,
  showCheckbox = false
}: ContentCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const quickActions = getQuickActions(content.type);
  const { handleAlbumHover, handleBlogHover } = useHoverPrefetch();

  // Handle hover prefetching based on content type
  const handleMouseEnter = useCallback(() => {
    setShowActions(true);
    
    // Prefetch data based on content type
    if (content.type === 'album' && typeof content.id === 'number') {
      const cleanup = handleAlbumHover(content.id);
      return cleanup;
    } else if (content.type === 'blog' && typeof content.id === 'number') {
      const cleanup = handleBlogHover(content.id);
      return cleanup;
    }
  }, [content.type, content.id, handleAlbumHover, handleBlogHover]);

  const handleMouseLeave = useCallback(() => {
    setShowActions(false);
  }, []);

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
        "h-64", // Smaller height to reclaim space
        selected && "ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onAction('view', content)}
    >
      {/* Enhanced Cover Art / Thumbnail */}
      <div className="aspect-square relative overflow-hidden bg-gray-800">
        <OptimizedImage
          src={getContentImage(content) || '/images/placeholder.svg'}
          alt={content.title}
          width={300}
          height={300}
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
          quality={80}
          lazy={true}
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
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

      {/* Content Info */}
      <div className="relative p-3 pb-2">
        {/* Track Count - Higher up, smaller font */}
        {getTrackCountText(content) && (
          <div className="absolute top-1 right-2 text-xs text-gray-400 font-normal">
            {getTrackCountText(content)}
          </div>
        )}
        
        {/* Album/Playlist Title - Single line with truncation */}
        <div className="mt-3">
          {/* Track count moved to top right corner */}
          <h3 className="font-bold text-white mb-1 text-sm leading-tight truncate w-full">
            {content.title}
          </h3>
          
          {/* Artist Name and Year on same line */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate flex-1 mr-2">
              {content.type === 'album' ? (content.artist || 'Unknown Artist') : 
               content.type === 'playlist' ? (content.description || 'Custom playlist') : 
               content.excerpt}
            </p>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {content.createdAt.getFullYear()}
            </span>
          </div>
        </div>
      </div>

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
};

// Memoize the component to prevent unnecessary re-renders
export const ContentCard = React.memo(ContentCardComponent);