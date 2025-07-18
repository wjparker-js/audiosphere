'use client';

import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogFilterType, BlogAction } from '@/types/blog';

interface EmptyBlogStateProps {
  filter: BlogFilterType;
  onAction: (action: BlogAction) => void;
}

export function EmptyBlogState({ filter, onAction }: EmptyBlogStateProps) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'published':
        return {
          title: 'No published posts yet',
          description: 'Your published blog posts will appear here once you publish them.',
          action: 'Create your first blog post'
        };
      case 'drafts':
        return {
          title: 'No drafts found',
          description: 'Your draft blog posts will be saved here as you work on them.',
          action: 'Start writing a draft'
        };
      case 'scheduled':
        return {
          title: 'No scheduled posts',
          description: 'Posts scheduled for future publication will appear here.',
          action: 'Schedule a blog post'
        };
      default:
        return {
          title: 'No blog posts yet',
          description: 'Start sharing your thoughts and ideas with the world.',
          action: 'Create your first blog post'
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6"
      >
        <FileText className="w-12 h-12 text-gray-400" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-white mb-2"
      >
        {content.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-8 max-w-md"
      >
        {content.description}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => onAction('create')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          {content.action}
        </Button>
      </motion.div>
    </motion.div>
  );
}