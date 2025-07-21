'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Theme types
export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

// Color schemes
export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Available color schemes
export const colorSchemes: Record<string, ColorScheme> = {
  orange: {
    name: 'Orange',
    primary: '#FF6B35',
    secondary: '#FF8A5B',
    accent: '#FFB08A',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0'
  },
  blue: {
    name: 'Blue',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0'
  },
  green: {
    name: 'Green',
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#6EE7B7',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0'
  },
  purple: {
    name: 'Purple',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#C4B5FD',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0'
  },
  red: {
    name: 'Red',
    primary: '#EF4444',
    secondary: '#F87171',
    accent: '#FCA5A5',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0'
  }
};

// Theme preferences
interface ThemePreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

// Theme state
interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  colorScheme: string;
  preferences: ThemePreferences;
  systemTheme: ResolvedTheme;
}

// Theme context interface
interface ThemeContextType {
  // Current state
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  colorScheme: string;
  currentColors: ColorScheme;
  preferences: ThemePreferences;
  systemTheme: ResolvedTheme;
  
  // Theme controls
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: string) => void;
  toggleTheme: () => void;
  
  // Preference controls
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setCompactMode: (enabled: boolean) => void;
  
  // Utility functions
  isDark: boolean;
  isLight: boolean;
  getThemeClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: ThemePreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  compactMode: false
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [colorScheme, setColorSchemeState] = useState('orange');
  const [preferences, setPreferencesState] = useState<ThemePreferences>(defaultPreferences);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Resolve the actual theme based on system preference
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme as ResolvedTheme;
  const currentColors = colorSchemes[colorScheme] || colorSchemes.orange;
  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  // Detect system theme preference
  const detectSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Detect system preferences
  const detectSystemPreferences = useCallback((): Partial<ThemePreferences> => {
    if (typeof window === 'undefined') return {};
    
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches
    };
  }, []);

  // Update system theme when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(detectSystemTheme());
    
    setSystemTheme(detectSystemTheme());
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [detectSystemTheme]);

  // Update system preferences when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = () => {
      setPreferencesState(prev => ({
        ...prev,
        reducedMotion: motionQuery.matches
      }));
    };
    
    const handleContrastChange = () => {
      setPreferencesState(prev => ({
        ...prev,
        highContrast: contrastQuery.matches
      }));
    };
    
    // Set initial values
    const systemPrefs = detectSystemPreferences();
    setPreferencesState(prev => ({ ...prev, ...systemPrefs }));
    
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, [detectSystemPreferences]);

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('audiosphere_theme') as Theme;
      const savedColorScheme = localStorage.getItem('audiosphere_color_scheme');
      const savedPreferences = localStorage.getItem('audiosphere_theme_preferences');

      if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      if (savedColorScheme && colorSchemes[savedColorScheme]) {
        setColorSchemeState(savedColorScheme);
      }

      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferencesState(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }

    setMounted(true);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem('audiosphere_theme', theme);
      localStorage.setItem('audiosphere_color_scheme', colorScheme);
      localStorage.setItem('audiosphere_theme_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }, [theme, colorScheme, preferences, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Apply color scheme CSS variables
    root.style.setProperty('--color-primary', currentColors.primary);
    root.style.setProperty('--color-secondary', currentColors.secondary);
    root.style.setProperty('--color-accent', currentColors.accent);
    root.style.setProperty('--color-background', currentColors.background);
    root.style.setProperty('--color-surface', currentColors.surface);
    root.style.setProperty('--color-text', currentColors.text);
    root.style.setProperty('--color-text-secondary', currentColors.textSecondary);
    
    // Apply preferences
    root.classList.toggle('reduce-motion', preferences.reducedMotion);
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('compact-mode', preferences.compactMode);
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${preferences.fontSize}`);
    
    // Set theme-color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', currentColors.background);
    }
  }, [resolvedTheme, currentColors, preferences]);

  // Theme control functions
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setColorScheme = useCallback((scheme: string) => {
    if (colorSchemes[scheme]) {
      setColorSchemeState(scheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, systemTheme, setTheme]);

  // Preference control functions
  const setReducedMotion = useCallback((enabled: boolean) => {
    setPreferencesState(prev => ({ ...prev, reducedMotion: enabled }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setPreferencesState(prev => ({ ...prev, highContrast: enabled }));
  }, []);

  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setPreferencesState(prev => ({ ...prev, fontSize: size }));
  }, []);

  const setCompactMode = useCallback((enabled: boolean) => {
    setPreferencesState(prev => ({ ...prev, compactMode: enabled }));
  }, []);

  // Utility functions
  const getThemeClass = useCallback((): string => {
    const classes = [resolvedTheme];
    
    if (preferences.reducedMotion) classes.push('reduce-motion');
    if (preferences.highContrast) classes.push('high-contrast');
    if (preferences.compactMode) classes.push('compact-mode');
    classes.push(`font-${preferences.fontSize}`);
    
    return classes.join(' ');
  }, [resolvedTheme, preferences]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    colorScheme,
    currentColors,
    preferences,
    systemTheme,
    setTheme,
    setColorScheme,
    toggleTheme,
    setReducedMotion,
    setHighContrast,
    setFontSize,
    setCompactMode,
    isDark,
    isLight,
    getThemeClass
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;