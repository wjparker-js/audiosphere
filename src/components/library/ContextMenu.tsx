'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Edit, 
  Trash2, 
  Share, 
  Eye, 
  Copy,
  Download,
  Archive
} from 'lucide-react';
import { ContentItem, ContentAction } from '@/types/library';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  content: ContentItem;
  position: { x: number; y: number };
  onAction: (action: ContentAction, content: ContentItem) => void;
  onClose: () => void;
  visible: boolean;
}

interface MenuItem {
  key: ContentAction;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  separator?: boolean;
}

function getMenuItems(contentType: ContentItem['type']): MenuItem[] {
  const baseItems: MenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Edit },
    { key: 'share', label: 'Share', icon: Share, separator: true },
    { key: 'duplicate', label: 'Duplicate', icon: Copy },
  ];

  if (contentType === 'playlist') {
    baseItems.unshift({ key: 'play', label: 'Play', icon: Play });
  }

  baseItems.push(
    { key: 'delete', label: 'Delete', icon: Trash2, destructive: true, separator: true }
  );

  return baseItems;
}

export function ContextMenu({
  content,
  position,
  onAction,
  onClose,
  visible
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Adjust horizontal position if menu would overflow
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position if menu would overflow
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 10;
    }

    setAdjustedPosition({ x, y });
  }, [position, visible]);

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = getMenuItems(content.type);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 min-w-48"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {menuItems.map((item, index) => (
        <div key={item.key}>
          {item.separator && index > 0 && (
            <div className="h-px bg-gray-700 my-1" />
          )}
          <button
            onClick={() => {
              onAction(item.key, content);
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
              item.destructive
                ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}