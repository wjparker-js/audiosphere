'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { LibraryControls } from '@/components/library/LibraryControls';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { ContextMenu } from '@/components/library/ContextMenu';
import { ConfirmationDialog } from '@/components/library/ConfirmationDialog';
import { PullToRefresh, MobileContextMenu } from '@/components/library/MobileOptimizations';
import { AnalyticsDashboard } from '@/components/library/AnalyticsDashboard';
import { useLibrary } from '@/hooks/useLibrary';
import { ContentItem, ContentAction } from '@/types/library';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Sparkles, 
  Zap, 
  TrendingUp,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LibraryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    content: ContentItem | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    content: null
  });
  const [mobileContextMenu, setMobileContextMenu] = useState<{
    visible: boolean;
    content: ContentItem | null;
  }>({
    visible: false,
    content: null
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    content: ContentItem | null;
    action: 'delete' | 'archive' | 'publish' | 'unpublish';
  }>({
    open: false,
    content: null,
    action: 'delete'
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);

  // TODO: Get actual user ID from auth context
  const userId = '1'; // Placeholder - should come from authentication
  
  const {
    content,
    loading,
    error,
    filters,
    counts,
    viewMode,
    selectedItems,
    setFilter,
    setSearch,
    setSort,
    setViewMode,
    toggleSelection,
    clearSelection,
    performBulkAction,
    deleteContent
  } = useLibrary(userId);

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

  const handleContentAction = (action: ContentAction, content?: ContentItem) => {
    if (!content && action !== 'clear-search') return;

    switch (action) {
      case 'view':
        if (content) {
          // Navigate to content detail page
          const routes = {
            album: `/albums/${content.id}`,
            playlist: `/playlists/${content.id}`,
            blog: `/blog/${content.id}`
          };
          router.push(routes[content.type]);
        }
        break;
        
      case 'edit':
        if (content) {
          const editRoutes = {
            album: `/admin/albums/${content.id}/edit`,
            playlist: `/playlists/${content.id}/edit`,
            blog: `/blog/${content.id}/edit`
          };
          router.push(editRoutes[content.type]);
        }
        break;
        
      case 'delete':
        if (content) {
          setConfirmDialog({
            open: true,
            content,
            action: 'delete'
          });
        }
        break;
        
      case 'share':
        if (content) {
          // Implement sharing functionality
          navigator.clipboard.writeText(window.location.origin + `/${content.type}s/${content.id}`);
          toast.success('Link copied to clipboard');
        }
        break;
        
      case 'play':
        if (content && content.type === 'playlist') {
          // Implement playlist playback
          toast.success(`Playing ${content.title}`);
        }
        break;
        
      case 'create-album':
        router.push('/admin/albums/new');
        break;
        
      case 'create-playlist':
        router.push('/playlists/new');
        break;
        
      case 'create-blog':
        router.push('/blog/new');
        break;
        
      case 'clear-search':
        setSearch('');
        break;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, content: ContentItem) => {
    e.preventDefault();
    if (isMobile) {
      setMobileContextMenu({
        visible: true,
        content
      });
    } else {
      setContextMenu({
        visible: true,
        position: { x: e.clientX, y: e.clientY },
        content
      });
    }
  };

  const handleLongPress = (content: ContentItem) => {
    if (isMobile) {
      setMobileContextMenu({
        visible: true,
        content
      });
    }
  };

  const handleAddContent = () => {
    // Show dropdown or navigate to creation page
    router.push('/create');
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        setConfirmDialog({
          open: true,
          content: null,
          action: 'delete'
        });
        break;
      case 'publish':
        performBulkAction('publish');
        break;
      case 'unpublish':
        performBulkAction('unpublish');
        break;
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action === 'delete') {
      if (confirmDialog.content) {
        await deleteContent(confirmDialog.content.id);
      } else {
        await performBulkAction('delete');
      }
    }
    
    setConfirmDialog({ open: false, content: null, action: 'delete' });
  };

  if (!mounted) {
    return null;
  }

  const handleRefresh = async () => {
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    // Refresh library data (this will be handled by the useLibrary hook)
    window.location.reload();
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-y-auto relative">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`relative z-10 ${isMobile ? 'p-4' : 'p-8'}`}
        >
          <LibraryHeader
            onSearch={setSearch}
            onAddContent={handleAddContent}
            searchQuery={filters.searchQuery}
            totalItems={counts.all}
            loading={loading}
          />
          
          <LibraryFilters
            activeFilter={filters.activeFilter}
            onFilterChange={setFilter}
            counts={counts}
            searchQuery={filters.searchQuery}
            onSearchChange={setSearch}
            loading={loading}
          />
          
          <LibraryControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={setSort}
            selectedCount={selectedItems.length}
            onBulkAction={handleBulkAction}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <LibraryGrid
              content={content}
              loading={loading}
              onAction={handleContentAction}
              selectedItems={selectedItems}
              onSelectionChange={toggleSelection}
              viewMode={viewMode}
              activeFilter={filters.activeFilter}
              searchQuery={filters.searchQuery}
              showCheckboxes={selectedItems.length > 0}
            />
          </motion.div>
        </motion.div>
      </PullToRefresh>

      {/* Floating Action Panel - Hidden for cleaner UI */}
      <div className="hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="flex flex-col gap-3">
            {/* Analytics Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setShowAnalytics(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full h-12 w-12 p-0 shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                title="View Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* AI Insights Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => toast.success('AI insights coming soon!')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full h-12 w-12 p-0 shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                title="AI Insights"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Quick Actions Menu */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setShowFloatingPanel(!showFloatingPanel)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full h-14 w-14 p-0 shadow-xl hover:shadow-orange-500/50 transition-all duration-300"
                title="Quick Actions"
              >
                <Zap className="w-6 h-6" />
              </Button>
            </motion.div>
          </div>

          {/* Floating Panel Menu */}
          <AnimatePresence>
            {showFloatingPanel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="absolute bottom-0 right-16 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl min-w-48"
              >
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleRefresh();
                      setShowFloatingPanel(false);
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Library
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.success('Export started!');
                      setShowFloatingPanel(false);
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.success('Import dialog opened!');
                      setShowFloatingPanel(false);
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Content
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.success('Settings opened!');
                      setShowFloatingPanel(false);
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Library Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Performance Indicator - Hidden for cleaner UI */}
      <div className="hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="fixed bottom-6 left-6 z-30"
        >
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Library optimized • {content.length} items loaded</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop Context Menu */}
      {!isMobile && (
        <ContextMenu
          content={contextMenu.content!}
          position={contextMenu.position}
          onAction={handleContentAction}
          onClose={() => setContextMenu({ visible: false, position: { x: 0, y: 0 }, content: null })}
          visible={contextMenu.visible}
        />
      )}

      {/* Mobile Context Menu */}
      {isMobile && (
        <MobileContextMenu
          content={mobileContextMenu.content!}
          onAction={handleContentAction}
          onClose={() => setMobileContextMenu({ visible: false, content: null })}
          visible={mobileContextMenu.visible}
        />
      )}

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isVisible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        content={confirmDialog.content}
        action={confirmDialog.action}
        onConfirm={handleConfirmAction}
      />

      {/* Background Click Handler for Floating Panel */}
      {showFloatingPanel && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowFloatingPanel(false)}
        />
      )}
    </div>
  );
}