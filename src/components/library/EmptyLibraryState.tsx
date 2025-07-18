'use client';

import { Plus, Search, Music, List, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType, ContentAction, ContentItem } from '@/types/library';

interface EmptyLibraryStateProps {
  filter: FilterType;
  searchQuery: string;
  onAction: (action: ContentAction, content?: ContentItem) => void;
}

function getEmptyStateContent(filter: FilterType, hasSearch: boolean) {
  if (hasSearch) {
    return {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search terms or filters',
      actionText: 'Clear search',
      actionKey: 'clear-search' as const
    };
  }

  switch (filter) {
    case 'albums':
      return {
        icon: Music,
        title: 'No albums yet',
        description: 'Upload your first album to get started',
        actionText: 'Upload Album',
        actionKey: 'create-album' as const
      };
    case 'playlists':
      return {
        icon: List,
        title: 'No playlists yet',
        description: 'Create your first playlist to organize your music',
        actionText: 'Create Playlist',
        actionKey: 'create-playlist' as const
      };
    case 'blogs':
      return {
        icon: FileText,
        title: 'No blog posts yet',
        description: 'Write your first blog post to share your thoughts',
        actionText: 'Write Post',
        actionKey: 'create-blog' as const
      };
    default:
      return {
        icon: Plus,
        title: 'Your library is empty',
        description: 'Start by creating playlists, uploading albums, or writing blog posts',
        actionText: 'Get Started',
        actionKey: 'get-started' as const
      };
  }
}

export function EmptyLibraryState({ 
  filter, 
  searchQuery, 
  onAction 
}: EmptyLibraryStateProps) {
  const hasSearch = searchQuery.trim().length > 0;
  const content = getEmptyStateContent(filter, hasSearch);
  const Icon = content.icon;

  const handleAction = () => {
    if (content.actionKey === 'clear-search') {
      // This would be handled by the parent component
      return;
    }
    
    // Handle other actions
    onAction(content.actionKey as ContentAction);
  };

  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        {content.description}
      </p>

      {!hasSearch && (
        <div className="space-y-3">
          <Button
            onClick={handleAction}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {content.actionText}
          </Button>
          
          {filter === 'all' && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('create-playlist' as ContentAction)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <List className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('create-album' as ContentAction)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Music className="w-4 h-4 mr-2" />
                Upload Album
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('create-blog' as ContentAction)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <FileText className="w-4 h-4 mr-2" />
                Write Post
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}