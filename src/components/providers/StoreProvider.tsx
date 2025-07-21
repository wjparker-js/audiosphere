'
use client';

import React, { useEffect } from 'react';
import useStore from '@/store';
import { useUI } from '@/hooks/useUI';

/**
 * Provider component that initializes the store and applies theme settings
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { theme, applyTheme } = useUI();
  
  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);
  
  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme]);
  
  return <>{children}</>;
}

export default StoreProvider;