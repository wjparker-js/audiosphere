'use client';

import { useState, useEffect } from 'react';
import { Home, Library, BookOpen, Settings, Menu, X, Plus, Heart, Disc, ListMusic, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const bottomNavigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Library', icon: Library, href: '/library' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

const sidebarNavigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Liked Songs', icon: Heart, href: '/liked' },
  { name: 'Your Library', icon: Library, href: '/library' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
];

const libraryLinks = [
  { name: 'Albums', icon: Disc, href: '/albums' },
  { name: 'Playlists', icon: ListMusic, href: '/playlists' },
  { name: 'Liked Songs', icon: Heart, href: '/liked' },
  { name: 'Artists', icon: User, href: '/artists' },
  { name: 'Podcasts', icon: Mic, href: '/podcasts' },
];

const creationLinks = [
  { name: 'Create Album', icon: Plus, href: '/create-album' },
  { name: 'Create Playlist', icon: Plus, href: '/create-playlist' },
  { name: 'Create Blog Post', icon: Plus, href: '/blog/new' },
];

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar when switching to desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  if (!isMobile) {
    // Desktop layout - use existing sidebar
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 h-14">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0">
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
                <span className="text-orange-500">AUDIOSPHERE</span>
              </h1>
            </div>
          </Link>
          
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-800 p-2"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-14 left-0 bottom-16 w-64 bg-black z-50 border-r border-gray-800"
            >
              <MobileSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-16 z-30">
        <div className="flex items-center justify-around h-full px-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-orange-500" : "text-gray-400"
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-orange-500" : "text-gray-400"
                    )}
                  >
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Mobile Sidebar Component
function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {sidebarNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-10 px-3",
                      isActive && "text-orange-500 bg-gray-800"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="text-base">{item.name}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Library Links */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <ul className="space-y-2">
            {libraryLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={onClose}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-10 px-3",
                        isActive && "text-orange-500 bg-gray-800"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="text-base">{item.name}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Creation Links */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <ul className="space-y-2">
            {creationLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={onClose}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-10 px-3",
                        isActive && "text-orange-500 bg-gray-800"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="text-base">{item.name}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <Link href="/profile" onClick={onClose}>
          <div className="flex items-center space-x-3 hover:bg-gray-800 p-3 rounded-md transition-colors cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/wjparker.jpg" alt="wjparker" />
              <AvatarFallback className="bg-orange-500 text-white text-sm">WP</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-medium text-white">wjparker</span>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}