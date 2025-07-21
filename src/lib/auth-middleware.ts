import { NextRequest, NextResponse } from 'next/server';
import { AuthService, JWTUser } from './auth';
import { createApiResponse } from './data-transformer';
import { ErrorHandler } from './error-handler';

// Authentication middleware for API routes
export function withAuth(
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>,
  options: {
    requiredRole?: JWTUser['role'];
    requireVerification?: boolean;
  } = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const { requiredRole, requireVerification = true } = options;
      
      // Extract user from request
      const user = AuthService.getUserFromRequest(request);
      
      if (!user) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
            status: 401
          }),
          { status: 401 }
        );
      }

      // Check email verification if required
      if (requireVerification && !user.isVerified) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'EMAIL_VERIFICATION_REQUIRED',
            message: 'Email verification required',
            status: 403
          }),
          { status: 403 }
        );
      }

      // Check role permissions if required
      if (requiredRole && !AuthService.hasRole(user, requiredRole)) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions',
            status: 403
          }),
          { status: 403 }
        );
      }

      // Call the handler with authenticated user
      return handler(request, user, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// Optional authentication middleware (user may or may not be authenticated)
export function withOptionalAuth(
  handler: (request: NextRequest, user: JWTUser | null, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const user = AuthService.getUserFromRequest(request);
      return handler(request, user, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// Resource ownership middleware
export function withResourceOwnership(
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>,
  getResourceUserId: (request: NextRequest, ...args: any[]) => Promise<number>
) {
  return withAuth(async (request: NextRequest, user: JWTUser, ...args: any[]) => {
    try {
      const resourceUserId = await getResourceUserId(request, ...args);
      
      if (!AuthService.canAccessResource(user, resourceUserId)) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'RESOURCE_ACCESS_DENIED',
            message: 'You can only access your own resources',
            status: 403
          }),
          { status: 403 }
        );
      }

      return handler(request, user, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  });
}

// Rate limiting middleware for authentication endpoints
export function withAuthRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  getIdentifier: (request: NextRequest) => string = (req) => req.ip || 'unknown'
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const identifier = getIdentifier(request);
      const { allowed, remainingAttempts, resetTime } = AuthService.checkRateLimit(identifier);

      if (!allowed) {
        const resetDate = new Date(resetTime);
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again later.',
            status: 429,
            details: {
              resetTime: resetDate.toISOString(),
              remainingAttempts: 0
            }
          }),
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString()
            }
          }
        );
      }

      const response = await handler(request, ...args);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', '5');
      response.headers.set('X-RateLimit-Remaining', remainingAttempts.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());

      return response;
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// CSRF protection middleware
export function withCSRFProtection(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, ...args);
    }

    try {
      const csrfToken = request.headers.get('X-CSRF-Token');
      const cookieToken = request.cookies.get('csrf-token')?.value;

      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF token validation failed',
            status: 403
          }),
          { status: 403 }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// Combined authentication and authorization middleware
export function createAuthMiddleware(options: {
  requiredRole?: JWTUser['role'];
  requireVerification?: boolean;
  requireOwnership?: boolean;
  rateLimit?: boolean;
  csrfProtection?: boolean;
  getResourceUserId?: (request: NextRequest, ...args: any[]) => Promise<number>;
} = {}) {
  return (handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>) => {
    let wrappedHandler = handler;

    // Apply authentication
    wrappedHandler = withAuth(wrappedHandler, {
      requiredRole: options.requiredRole,
      requireVerification: options.requireVerification
    });

    // Apply resource ownership check if needed
    if (options.requireOwnership && options.getResourceUserId) {
      wrappedHandler = withResourceOwnership(wrappedHandler, options.getResourceUserId);
    }

    // Apply rate limiting if needed
    if (options.rateLimit) {
      wrappedHandler = withAuthRateLimit(wrappedHandler);
    }

    // Apply CSRF protection if needed
    if (options.csrfProtection) {
      wrappedHandler = withCSRFProtection(wrappedHandler);
    }

    return wrappedHandler;
  };
}

// Helper to extract user ID from URL parameters
export function getUserIdFromParams(paramName = 'userId') {
  return async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const userId = parseInt(context.params[paramName]);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return userId;
  };
}

// Helper to extract resource ID and get owner from database
export function getResourceOwnerFromDB(
  resourceType: 'album' | 'playlist' | 'blog_post',
  paramName = 'id'
) {
  return async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const resourceId = parseInt(context.params[paramName]);
    if (isNaN(resourceId)) {
      throw new Error('Invalid resource ID');
    }

    // This would typically query the database to get the resource owner
    // For now, we'll return a placeholder - you'd implement the actual DB query
    const pool = (await import('@/lib/database')).default;
    
    let query: string;
    switch (resourceType) {
      case 'album':
        query = 'SELECT created_by as user_id FROM albums WHERE id = ?';
        break;
      case 'playlist':
        query = 'SELECT user_id FROM playlists WHERE id = ?';
        break;
      case 'blog_post':
        query = 'SELECT user_id FROM blog_posts WHERE id = ?';
        break;
      default:
        throw new Error('Unknown resource type');
    }

    const [rows] = await pool.execute(query, [resourceId]);
    const results = Array.isArray(rows) ? rows : [];
    
    if (results.length === 0) {
      throw new Error('Resource not found');
    }

    return (results[0] as any).user_id;
  };
}

export default {
  withAuth,
  withOptionalAuth,
  withResourceOwnership,
  withAuthRateLimit,
  withCSRFProtection,
  createAuthMiddleware,
  getUserIdFromParams,
  getResourceOwnerFromDB
};