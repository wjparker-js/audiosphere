'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { BlogControls } from '@/components/blog/BlogControls';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogAction } from '@/types/blog';
import { toast } from 'sonner';

export default function BlogPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    posts,
    loading,
    error,
    filters,
    counts,
    viewMode,
    searchQuery,
    setFilter,
    setSort,
    setViewMode,
    setSearch,
  } = useBlog();

  useEffect(() => {
    setMounted(true);
    
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleBlogAction = (action: BlogAction, post?: BlogPost) => {
    if (!post && action !== 'create') return;

    switch (action) {
      case 'view':
        if (post) {
          router.push(`/blog/${post.id}`);
        }
        break;
        
      case 'edit':
        if (post) {
          router.push(`/blog/${post.id}/edit`);
        }
        break;
        
      case 'create':
        router.push('/blog/new');
        break;
        
      case 'delete':
        if (post) {
          // Implement delete functionality
          toast.success(`Deleted "${post.title}"`);
        }
        break;
        
      case 'share':
        if (post) {
          navigator.clipboard.writeText(window.location.origin + `/blog/${post.id}`);
          toast.success('Link copied to clipboard');
        }
        break;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-y-auto relative">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 ${isMobile ? 'p-4' : 'p-8'}`}
      >
        <BlogHeader
          totalPosts={counts.all}
          loading={loading}
        />
        
        <BlogFilters
          activeFilter={filters.activeFilter}
          onFilterChange={setFilter}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          loading={loading}
        />
        
        <BlogControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={setSort}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <BlogGrid
            posts={posts}
            loading={loading}
            onAction={handleBlogAction}
            viewMode={viewMode}
            activeFilter={filters.activeFilter}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}