'use client';

import { useEffect, useState } from 'react';
import { ContentItem, ContentAction } from '@/types/library';

interface TouchHandlerProps {
  children: React.ReactNode;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function TouchHandler({
  children,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  className
}: TouchHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });

    // Start long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setLongPressTimer(null);
      }, 500); // 500ms for long press
      setLongPressTimer(timer);
    }
  };

  const handleTouchMove = () => {
    // Cancel long press on move
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Cancel long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Check for swipe (minimum distance and maximum time)
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime && Math.abs(deltaY) < 100) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setTouchStart(null);
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Only allow pull down when at top of page
    if (window.scrollY === 0 && distance > 0) {
      setPullDistance(Math.min(distance, 100));
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance * 0.5}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {pullDistance > 0 && (
        <div className="flex justify-center py-2">
          <div className="text-gray-400 text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// Mobile-specific context menu
interface MobileContextMenuProps {
  content: ContentItem;
  onAction: (action: ContentAction, content: ContentItem) => void;
  onClose: () => void;
  visible: boolean;
}

export function MobileContextMenu({
  content,
  onAction,
  onClose,
  visible
}: MobileContextMenuProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  const actions = [
    { key: 'view', label: 'View', icon: '👁️' },
    { key: 'edit', label: 'Edit', icon: '✏️' },
    { key: 'share', label: 'Share', icon: '📤' },
    { key: 'delete', label: 'Delete', icon: '🗑️', destructive: true }
  ];

  if (content.type === 'playlist') {
    actions.unshift({ key: 'play', label: 'Play', icon: '▶️' });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-gray-900 rounded-t-xl p-4 animate-slide-up">
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
        
        <div className="mb-4">
          <h3 className="text-white font-medium">{content.title}</h3>
          <p className="text-gray-400 text-sm">
            {content.type === 'album' && 'artist' in content && content.artist}
            {content.type === 'playlist' && `${content.trackCount} tracks`}
            {content.type === 'blog' && content.excerpt}
          </p>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => {
                onAction(action.key as ContentAction, content);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                action.destructive
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 p-3 bg-gray-800 text-white rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}