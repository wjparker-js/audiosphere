import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// JWT Configuration
export const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256' as const,
  issuer: 'audiosphere',
  audience: 'audiosphere-users'
};

// User interface for JWT payload
export interface JWTUser {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'super_admin';
  isVerified: boolean;
}

// JWT payload interface
export interface JWTPayload extends JWTUser {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: 'access' | 'refresh';
}

// Token pair interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(user: JWTUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      ...user,
      iss: JWT_CONFIG.issuer,
      aud: JWT_CONFIG.audience,
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      algorithm: JWT_CONFIG.algorithm
    });
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(user: JWTUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      ...user,
      iss: JWT_CONFIG.issuer,
      aud: JWT_CONFIG.audience,
      type: 'refresh'
    };

    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
      algorithm: JWT_CONFIG.algorithm
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(user: JWTUser): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Calculate expiry time in seconds
    const expiresIn = 15 * 60; // 15 minutes in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      console.warn('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      console.warn('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Extract token from request
   */
  static extractTokenFromRequest(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization');
    const headerToken = this.extractTokenFromHeader(authHeader);
    if (headerToken) {
      return headerToken;
    }

    // Try cookie as fallback
    const cookieToken = request.cookies.get('accessToken')?.value;
    return cookieToken || null;
  }

  /**
   * Get user from request
   */
  static getUserFromRequest(request: NextRequest): JWTUser | null {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const payload = this.verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      isVerified: payload.isVerified
    };
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: JWTUser | null, requiredRole: JWTUser['role']): boolean {
    if (!user) return false;

    const roleHierarchy = {
      'user': 1,
      'admin': 2,
      'super_admin': 3
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Check if user owns resource or has admin privileges
   */
  static canAccessResource(user: JWTUser | null, resourceUserId: number): boolean {
    if (!user) return false;
    
    // User owns the resource
    if (user.id === resourceUserId) return true;
    
    // User has admin privileges
    return this.hasRole(user, 'admin');
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  static generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 100) {
      errors.push('Password must be less than 100 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      errors.push('Password cannot contain common patterns or words');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
      errors.push('Username must be less than 30 characters long');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    if (/^[_-]|[_-]$/.test(username)) {
      errors.push('Username cannot start or end with underscore or hyphen');
    }

    if (/admin|root|system|null|undefined/i.test(username)) {
      errors.push('Username cannot contain reserved words');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate cookie options for secure token storage
   */
  static getCookieOptions(isProduction = process.env.NODE_ENV === 'production') {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    };
  }

  /**
   * Generate refresh cookie options
   */
  static getRefreshCookieOptions(isProduction = process.env.NODE_ENV === 'production') {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
  }
}

// Middleware helper for authentication
export function requireAuth(requiredRole?: JWTUser['role']) {
  return (request: NextRequest) => {
    const user = AuthService.getUserFromRequest(request);
    
    if (!user) {
      return { authenticated: false, user: null, error: 'Authentication required' };
    }

    if (!user.isVerified) {
      return { authenticated: false, user: null, error: 'Email verification required' };
    }

    if (requiredRole && !AuthService.hasRole(user, requiredRole)) {
      return { authenticated: false, user: null, error: 'Insufficient permissions' };
    }

    return { authenticated: true, user, error: null };
  };
}

// Rate limiting for authentication endpoints
export class AuthRateLimit {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, { count: 1, resetTime: now + this.WINDOW_MS });
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1, resetTime: now + this.WINDOW_MS };
    }

    if (record.count >= this.MAX_ATTEMPTS) {
      return { allowed: false, remainingAttempts: 0, resetTime: record.resetTime };
    }

    // Increment attempts
    record.count++;
    this.attempts.set(identifier, record);

    return { 
      allowed: true, 
      remainingAttempts: this.MAX_ATTEMPTS - record.count, 
      resetTime: record.resetTime 
    };
  }

  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Cleanup rate limit records every hour
setInterval(() => {
  AuthRateLimit.cleanup();
}, 60 * 60 * 1000);

export default AuthService;