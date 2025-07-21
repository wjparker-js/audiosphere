'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Music, 
  List, 
  FileText, 
  Heart,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface UserProfileProps {
  showStats?: boolean;
  showDropdown?: boolean;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export function UserProfile({ 
  showStats = true, 
  showDropdown = true,
  onSettingsClick,
  onProfileClick 
}: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg animate-pulse">
        <div className="w-10 h-10 bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded mb-1" />
          <div className="h-3 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-3 p-3 bg-gray-800 rounded-lg transition-colors
          ${showDropdown ? 'cursor-pointer hover:bg-gray-700' : ''}
        `}
        onClick={showDropdown ? () => setIsDropdownOpen(!isDropdownOpen) : onProfileClick}
      >
        {/* Avatar */}
        <div className="relative">
          <OptimizedImage
            src={user.avatarUrl || '/images/default-avatar.svg'}
            alt={user.username}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          {/* Verification Badge */}
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{user.username}</p>
            {getRoleIcon(user.role)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{getRoleLabel(user.role)}</span>
            {!user.isVerified && (
              <span className="text-orange-400 text-xs">• Unverified</span>
            )}
          </div>
        </div>

        {/* Dropdown Arrow */}
        {showDropdown && (
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        )}
      </motion.div>

      {/* User Stats */}
      {showStats && user.stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 grid grid-cols-2 gap-2 text-xs"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <Music className="w-3 h-3" />
            <span>{user.stats.albumCount} Albums</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <List className="w-3 h-3" />
            <span>{user.stats.playlistCount} Playlists</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="w-3 h-3" />
            <span>{user.stats.blogPostCount} Posts</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Heart className="w-3 h-3" />
            <span>{user.stats.likedTracksCount} Liked</span>
          </div>
        </motion.div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              {/* Profile Link */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onProfileClick?.();
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>

              {/* Settings Link */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onSettingsClick?.();
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-700" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {showDropdown && isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default UserProfile;