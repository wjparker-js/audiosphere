'use client';

import { useState, useEffect } from 'react';
import { Home, Search, Library, BookOpen, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Your Library', icon: Library, href: '/library' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
];

const bottomNavigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Library', icon: Library, href: '/library' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
    // Desktop layout - return children with normal sidebar
    return (
      <div className="flex h-screen bg-gray-900">
        <DesktopSidebar />
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
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-orange-500">AUDIOSPHERE</span>
            </h1>
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

// Desktop Sidebar Component
function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-56 bg-black text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-white">AUDIOSPHERE</span>
          </h1>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-2">
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
          {navigation.map((item) => {
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
        
        {/* Additional Options */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <ul className="space-y-2">
            <li>
              <Link href="/create-album" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-10 px-3"
                >
                  <span className="text-base">Create Album</span>
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/create-playlist" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors h-10 px-3"
                >
                  <span className="text-base">Create Playlist</span>
                </Button>
              </Link>
            </li>
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