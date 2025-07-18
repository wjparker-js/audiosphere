'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, Edit, Share2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  id?: number;
  title: string;
  artist: string;
  image: string;
  onClick?: () => void;
}

// Album type badge component
function AlbumTypeBadge() {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-blue-500">
      <Music className="w-3 h-3" />
    </div>
  );
}

export function AlbumCard({ title, artist, image, onClick }: AlbumCardProps) {
  const [showActions, setShowActions] = useState(false);

  const quickActions = [
    { key: 'play', icon: Play, label: 'Play' },
    { key: 'view', icon: Eye, label: 'View' },
    { key: 'edit', icon: Edit, label: 'Edit' },
    { key: 'share', icon: Share2, label: 'Share' }
  ];

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
        "h-72" // Consistent height
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      {/* Album Cover */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image}
          alt={`${title} by ${artist}`}
          className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Actions Overlay */}
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
                    onClick?.();
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full h-14 w-14 p-0 shadow-xl hover:shadow-orange-500/50 transition-all duration-300"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
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
                          console.log(`${action.label} ${title}`);
                        }}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full backdrop-blur-sm"
                        title={action.label}
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Album Type Badge */}
        <div className="absolute top-2 right-2">
          <AlbumTypeBadge />
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-semibold text-white truncate mb-1 text-base">
            {title}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {artist}
          </p>
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
}