'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Plus, Sparkles, TrendingUp, Filter, MoreHorizontal, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryHeaderProps {
  onSearch: (query: string) => void;
  onAddContent: () => void;
  searchQuery: string;
  totalItems: number;
  loading?: boolean;
}

export function LibraryHeader({
  onSearch,
  onAddContent,
  searchQuery,
  totalItems,
  loading = false
}: LibraryHeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce search to optimize performance
  const debouncedSearch = useDebounce(localSearchQuery, 300);
  
  // Call onSearch when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, onSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    onSearch('');
  }, [onSearch]);

  // Hidden state variables for admin features (to be moved to Admin Settings)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Simplified Header - Only Title and Statistics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Your Library
            </h1>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-white font-medium">
              {loading ? '...' : `${totalItems} items`}
            </span>
            <span className="text-gray-400 text-xs">
              Last updated today
            </span>
          </div>
        </div>
      </div>

      {/* HIDDEN ADMIN FEATURES - These should be moved to Admin Settings page */}
      <div className="hidden">
        {/* Quick Stats - Hidden but preserved for Admin Settings */}
        <div className="lg:flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-3 py-2 cursor-pointer"
            onClick={() => setShowInsights(!showInsights)}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">+12% this week</span>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">AI Insights</span>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Action Bar - Hidden but preserved for Admin Settings */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Advanced Search */}
          <div className="relative flex-1 lg:flex-initial lg:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search with AI-powered suggestions..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="pl-12 pr-12 h-12 bg-gray-800/50 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 focus:bg-gray-800/80 transition-all duration-200"
            />
            {localSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
            
            {/* Search suggestions dropdown */}
            <AnimatePresence>
              {localSearchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50"
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide">
                      <Zap className="w-3 h-3" />
                      Smart Suggestions
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded cursor-pointer">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-white">Recent albums</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded cursor-pointer">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-white">Popular playlists</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Advanced Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white h-12 px-4"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Filters</span>
          </Button>
          
          {/* Add Content Dropdown */}
          <div className="relative">
            <Button
              onClick={onAddContent}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 px-6 shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Create</span>
            </Button>
          </div>
          
          {/* More Options */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800 h-12 w-12 p-0"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Advanced Search Panel - Hidden but preserved for Admin Settings */}
        <AnimatePresence>
          {showAdvancedSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option>All Types</option>
                    <option>Albums</option>
                    <option>Playlists</option>
                    <option>Blog Posts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option>All Time</option>
                    <option>Last Week</option>
                    <option>Last Month</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Private</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights Panel - Hidden but preserved for Admin Settings */}
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+24%</div>
                  <div className="text-sm text-gray-400">Content Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">1.2K</div>
                  <div className="text-sm text-gray-400">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">89%</div>
                  <div className="text-sm text-gray-400">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">4.8</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}