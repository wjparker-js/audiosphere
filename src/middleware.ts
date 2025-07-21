import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Global middleware for request validation and security
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers to all responses
  addSecurityHeaders(response);
  
  // Handle authentication for protected routes
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const authResult = await handleAuthentication(request);
    if (!authResult.success) {
      return authResult.response;
    }
  }
  
  // Handle admin routes
  if (isAdminRoute(request.nextUrl.pathname)) {
    const adminResult = await handleAdminAuthentication(request);
    if (!adminResult.success) {
      return adminResult.response;
    }
  }
  
  // Handle API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = await handleRateLimit(request);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }
  }
  
  return response;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.buymeacoffee.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/create',
    '/upload',
    '/api/albums',
    '/api/playlists',
    '/api/tracks',
    '/api/blog',
    '/api/user'
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires admin access
 */
function isAdminRoute(pathname: string): boolean {
  const adminRoutes = [
    '/admin',
    '/api/admin'
  ];
  
  return adminRoutes.some(route => pathname.startsWith(route));
}

/**
 * Handle authentication for protected routes
 */
async function handleAuthentication(request: NextRequest): Promise<{
  success: boolean;
  response?: NextResponse;
}> {
  const user = AuthService.getUserFromRequest(request);
  
  if (!user) {
    // Redirect to login for page routes
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return {
        success: false,
        response: NextResponse.redirect(loginUrl)
      };
    }
    
    // Return 401 for API routes
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
            status: 401
          }
        },
        { status: 401 }
      )
    };
  }
  
  // Check if email verification is required for certain routes
  const requiresVerification = [
    '/create',
    '/upload',
    '/api/albums',
    '/api/playlists',
    '/api/blog'
  ];
  
  if (requiresVerification.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!user.isVerified) {
      if (!request.nextUrl.pathname.startsWith('/api/')) {
        return {
          success: false,
          response: NextResponse.redirect(new URL('/auth/verify-email', request.url))
        };
      }
      
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_VERIFICATION_REQUIRED',
              message: 'Email verification required',
              status: 403
            }
          },
          { status: 403 }
        )
      };
    }
  }
  
  return { success: true };
}

/**
 * Handle admin authentication
 */
async function handleAdminAuthentication(request: NextRequest): Promise<{
  success: boolean;
  response?: NextResponse;
}> {
  const user = AuthService.getUserFromRequest(request);
  
  if (!user || !AuthService.hasRole(user, 'admin')) {
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      return {
        success: false,
        response: NextResponse.redirect(new URL('/auth/login', request.url))
      };
    }
    
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required',
            status: 403
          }
        },
        { status: 403 }
      )
    };
  }
  
  return { success: true };
}

/**
 * Handle rate limiting for API routes
 */
async function handleRateLimit(request: NextRequest): Promise<{
  success: boolean;
  response?: NextResponse;
}> {
  // Skip rate limiting for certain routes
  const skipRateLimit = [
    '/api/auth/refresh',
    '/api/speed-test'
  ];
  
  if (skipRateLimit.some(route => request.nextUrl.pathname === route)) {
    return { success: true };
  }
  
  // Basic rate limiting (in production, use Redis or similar)
  const identifier = request.ip || 'unknown';
  const rateLimitKey = `rate_limit_${identifier}`;
  
  // For now, we'll use the AuthRateLimit class for general API rate limiting
  // In a real application, you'd want separate rate limits for different endpoints
  const { allowed } = AuthService.checkRateLimit(identifier);
  
  if (!allowed) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            status: 429
          }
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900' // 15 minutes
          }
        }
      )
    };
  }
  
  return { success: true };
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};