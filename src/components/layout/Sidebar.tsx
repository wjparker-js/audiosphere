'use client';

import { useState } from 'react';
import { Home, Library, BookOpen, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePlaylistModal } from '@/components/modals/CreatePlaylistModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Liked Songs', icon: Heart, href: '/liked' },
  { name: 'Your Library', icon: Library, href: '/library' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
];

const creationLinks = [
  { name: 'Create Album', icon: Plus, href: '/create-album' },
  { name: 'Create Playlist', icon: Plus, href: '/create-playlist' },
  { name: 'Create Blog Post', icon: Plus, href: '/blog/new' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  return (
    <div className="w-56 bg-black text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0">
              <img 
                src="/logo1.png" 
                alt="AudioSphere Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to SVG logo if PNG fails to load
                  (e.target as HTMLImageElement).src = "/logo.svg";
                }}
              />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-white">AUDIOSPHERE</span>
            </h1>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-2 flex flex-col">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-8 px-3",
                      isActive && "text-white bg-gray-800"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Creation Links Section - Positioned at bottom */}
        <div className="mt-auto mb-4">
          <ul className="space-y-1">
            {creationLinks.map((item) => {
              const isActive = pathname === item.href;
              
              // Handle Create Playlist specially to open modal
              if (item.name === 'Create Playlist') {
                return (
                  <li key={item.name}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreatePlaylistModal(true)}
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-8 px-3"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-sm">{item.name}</span>
                    </Button>
                  </li>
                );
              }
              
              // Regular links for other creation items
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-8 px-3",
                        isActive && "text-white bg-gray-800"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-sm">{item.name}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-3 border-t border-gray-800">
        <Link href="/profile">
          <div className="flex items-center space-x-2 hover:bg-gray-800 p-2 rounded-md transition-colors cursor-pointer">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/avatars/wjparker.jpg" alt="wjparker" />
              <AvatarFallback className="bg-orange-500 text-white text-xs">WP</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">wjparker</span>
          </div>
        </Link>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onPlaylistCreated={(playlist) => {
          console.log('Playlist created:', playlist);
          // Could add additional logic here like refreshing playlist lists
        }}
      />
    </div>
  );
}