'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ContentCard } from './ContentCard';
import { ContentItem, ContentAction, ViewMode } from '@/types/library';

interface VirtualizedGridProps {
  content: ContentItem[];
  onAction: (action: ContentAction, content: ContentItem) => void;
  selectedItems: string[];
  onSelectionChange: (itemId: string, selected: boolean) => void;
  viewMode: ViewMode;
  showCheckboxes?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export function VirtualizedGrid({
  content,
  onAction,
  selectedItems,
  onSelectionChange,
  viewMode,
  showCheckboxes = false,
  itemHeight = 280, // Approximate height of a content card
  containerHeight = 600
}: VirtualizedGridProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const { itemsPerRow, visibleItems, totalHeight } = useMemo(() => {
    if (viewMode === 'list') {
      return {
        itemsPerRow: 1,
        visibleItems: content,
        totalHeight: content.length * itemHeight
      };
    }

    // Calculate items per row based on container width
    const minItemWidth = 200;
    const gap = 16;
    const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
    
    // Calculate visible range
    const startRow = Math.floor(scrollTop / itemHeight);
    const endRow = Math.ceil((scrollTop + containerHeight) / itemHeight);
    const visibleRows = Math.max(0, endRow - startRow);
    
    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(content.length, (startRow + visibleRows + 2) * itemsPerRow); // +2 for buffer
    
    const visibleItems = content.slice(startIndex, endIndex);
    const totalRows = Math.ceil(content.length / itemsPerRow);
    const totalHeight = totalRows * itemHeight;

    return {
      itemsPerRow,
      visibleItems,
      totalHeight
    };
  }, [content, containerWidth, scrollTop, containerHeight, itemHeight, viewMode]);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Only use virtualization for large collections
  if (content.length < 50) {
    return (
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
          : 'space-y-2'
        }
      `}>
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            onAction={onAction}
            selected={selectedItems.includes(item.id)}
            onSelect={(selected) => onSelectionChange(item.id, selected)}
            showCheckbox={showCheckboxes}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          className={`
            ${viewMode === 'grid' 
              ? 'grid gap-4'
              : 'space-y-2'
            }
          `}
          style={{
            gridTemplateColumns: viewMode === 'grid' ? `repeat(${itemsPerRow}, 1fr)` : undefined,
            position: 'absolute',
            top: Math.floor(scrollTop / itemHeight) * itemHeight,
            width: '100%'
          }}
        >
          {visibleItems.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onAction={onAction}
              selected={selectedItems.includes(item.id)}
              onSelect={(selected) => onSelectionChange(item.id, selected)}
              showCheckbox={showCheckboxes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}