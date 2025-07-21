'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { JWTUser } from '@/lib/auth';
import { ClientTokenStorage, TokenRefreshManager, AuthenticatedFetch } from '@/lib/token-storage';

interface AuthContextType {
  user: JWTUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<JWTUser>) => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on mount and token changes
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a valid token
      const hasValidToken = await TokenRefreshManager.ensureValidToken();
      if (!hasValidToken) {
        setUser(null);
        return;
      }

      // Get user profile
      const response = await AuthenticatedFetch.get('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn('Auth status check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        if (data.data.tokens) {
          ClientTokenStorage.setTokens(data.data.tokens);
        }
        
        // Set user
        setUser(data.data.user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (
    username: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        if (data.data.tokens) {
          ClientTokenStorage.setTokens(data.data.tokens);
        }
        
        // Set user
        setUser(data.data.user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      ClientTokenStorage.clearTokens();
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const success = await TokenRefreshManager.refreshToken();
      if (success) {
        // Refresh user data
        await checkAuthStatus();
      } else {
        // Refresh failed, logout user
        setUser(null);
        ClientTokenStorage.clearTokens();
      }
      return success;
    } catch (error) {
      console.error('Token refresh error:', error);
      setUser(null);
      ClientTokenStorage.clearTokens();
      return false;
    }
  }, [checkAuthStatus]);

  // Update user function
  const updateUser = useCallback((userData: Partial<JWTUser>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      // Check if token needs refresh (5 minutes before expiry)
      const tokenExpiry = ClientTokenStorage.getTokenExpiry();
      if (tokenExpiry && Date.now() >= (tokenExpiry - 5 * 60 * 1000)) {
        await refreshToken();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  // Listen for storage events (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'audiosphere_access_token' && !e.newValue) {
        // Token was removed in another tab, logout this tab too
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;