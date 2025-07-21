import { NextResponse } from 'next/server';
import { AuthService, TokenPair } from './auth';

// Server-side token storage utilities
export class TokenStorage {
  /**
   * Set authentication cookies in response
   */
  static setAuthCookies(response: NextResponse, tokens: TokenPair): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set access token cookie
    response.cookies.set('accessToken', tokens.accessToken, {
      ...AuthService.getCookieOptions(isProduction),
      maxAge: tokens.expiresIn * 1000 // Convert to milliseconds
    });

    // Set refresh token cookie (longer expiry, different path)
    response.cookies.set('refreshToken', tokens.refreshToken, {
      ...AuthService.getRefreshCookieOptions(isProduction)
    });

    // Set token expiry timestamp for client-side reference
    response.cookies.set('tokenExpiry', (Date.now() + (tokens.expiresIn * 1000)).toString(), {
      httpOnly: false, // Allow client-side access for token refresh logic
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: tokens.expiresIn * 1000
    });
  }

  /**
   * Clear authentication cookies
   */
  static clearAuthCookies(response: NextResponse): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0
    };

    response.cookies.set('accessToken', '', cookieOptions);
    response.cookies.set('refreshToken', '', {
      ...cookieOptions,
      path: '/api/auth'
    });
    response.cookies.set('tokenExpiry', '', {
      ...cookieOptions,
      httpOnly: false
    });
  }

  /**
   * Create response with auth cookies
   */
  static createAuthResponse(data: any, tokens: TokenPair, status = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    this.setAuthCookies(response, tokens);
    return response;
  }

  /**
   * Create logout response
   */
  static createLogoutResponse(data: any, status = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    this.clearAuthCookies(response);
    return response;
  }
}

// Client-side token storage utilities
export class ClientTokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'audiosphere_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'audiosphere_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'audiosphere_token_expiry';

  /**
   * Store tokens in localStorage (fallback for when cookies aren't available)
   */
  static setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, (Date.now() + (tokens.expiresIn * 1000)).toString());
    } catch (error) {
      console.warn('Failed to store tokens in localStorage:', error);
    }
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to get access token from localStorage:', error);
      return null;
    }
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to get refresh token from localStorage:', error);
      return null;
    }
  }

  /**
   * Get token expiry timestamp
   */
  static getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null;

    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry) : null;
    } catch (error) {
      console.warn('Failed to get token expiry from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    // Add 30 second buffer to account for network delays
    return Date.now() >= (expiry - 30000);
  }

  /**
   * Clear all tokens from localStorage
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.warn('Failed to clear tokens from localStorage:', error);
    }
  }

  /**
   * Get token from cookie (client-side)
   */
  static getTokenFromCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Get best available access token (cookie first, then localStorage)
   */
  static getBestAccessToken(): string | null {
    // Try cookie first (more secure)
    const cookieToken = this.getTokenFromCookie('accessToken');
    if (cookieToken) return cookieToken;

    // Fallback to localStorage
    return this.getAccessToken();
  }

  /**
   * Get best available refresh token
   */
  static getBestRefreshToken(): string | null {
    // Try cookie first (more secure)
    const cookieToken = this.getTokenFromCookie('refreshToken');
    if (cookieToken) return cookieToken;

    // Fallback to localStorage
    return this.getRefreshToken();
  }
}

// Token refresh utilities
export class TokenRefreshManager {
  private static refreshPromise: Promise<boolean> | null = null;
  private static refreshCallbacks: Array<(success: boolean) => void> = [];

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    
    // Notify all waiting callbacks
    this.refreshCallbacks.forEach(callback => callback(result));
    this.refreshCallbacks = [];
    this.refreshPromise = null;

    return result;
  }

  /**
   * Perform the actual token refresh
   */
  private static async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = ClientTokenStorage.getBestRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data.tokens) {
        ClientTokenStorage.setTokens(data.data.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Add callback to be notified when refresh completes
   */
  static onRefreshComplete(callback: (success: boolean) => void): void {
    if (this.refreshPromise) {
      this.refreshCallbacks.push(callback);
    } else {
      callback(true); // No refresh in progress, assume success
    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  static async ensureValidToken(): Promise<boolean> {
    if (!ClientTokenStorage.isTokenExpired()) {
      return true; // Token is still valid
    }

    return this.refreshToken();
  }
}

// HTTP client with automatic token refresh
export class AuthenticatedFetch {
  /**
   * Fetch with automatic token refresh
   */
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure we have a valid token
    const hasValidToken = await TokenRefreshManager.ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    // Get the access token
    const accessToken = ClientTokenStorage.getBestAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Add authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    // If we get a 401, try to refresh the token once
    if (response.status === 401) {
      const refreshSuccess = await TokenRefreshManager.refreshToken();
      if (refreshSuccess) {
        // Retry the request with new token
        const newAccessToken = ClientTokenStorage.getBestAccessToken();
        if (newAccessToken) {
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          return fetch(url, {
            ...options,
            headers,
            credentials: 'include'
          });
        }
      }
    }

    return response;
  }

  /**
   * GET request with authentication
   */
  static get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * POST request with authentication
   */
  static post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    if (data && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : options.body
    });
  }

  /**
   * PUT request with authentication
   */
  static put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    if (data && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : options.body
    });
  }

  /**
   * DELETE request with authentication
   */
  static delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }
}

export default {
  TokenStorage,
  ClientTokenStorage,
  TokenRefreshManager,
  AuthenticatedFetch
};