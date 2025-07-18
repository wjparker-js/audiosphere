'use client';

import { motion } from 'framer-motion';

interface BlogHeaderProps {
  totalPosts: number;
  loading?: boolean;
}

export function BlogHeader({
  totalPosts,
  loading = false
}: BlogHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Blog Posts
          </h1>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-white font-medium">
            {loading ? '...' : `${totalPosts} posts`}
          </span>
          <span className="text-gray-400 text-xs">
            Last updated today
          </span>
        </div>
      </div>
    </motion.div>
  );
}