import { NextRequest, NextResponse } from 'next/server';
import { AuthService, JWTUser } from './auth';
import { AuthorizationService, Permission } from './authorization';
import { createApiResponse } from './data-transformer';
import { ErrorHandler } from './error-handler';

// Enhanced API middleware with permission-based authorization
export function withPermission(
  permission: Permission,
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Get user from request
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

      // Check if user has required permission
      if (!AuthorizationService.hasPermission(user, permission)) {
        return NextResponse.json(
          createApiResponse(false, null, 
            AuthorizationService.createAuthorizationError(permission)
          ),
          { status: 403 }
        );
      }

      // Check email verification for content creation permissions
      const contentPermissions = [
        Permission.CREATE_ALBUM,
        Permission.CREATE_PLAYLIST,
        Permission.CREATE_BLOG_POST,
        Permission.CREATE_COMMENT,
        Permission.PUBLISH_ALBUM,
        Permission.PUBLISH_BLOG_POST
      ];

      if (contentPermissions.includes(permission) && !user.isVerified) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'EMAIL_VERIFICATION_REQUIRED',
            message: 'Email verification required for content creation',
            status: 403
          }),
          { status: 403 }
        );
      }

      return handler(request, user, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// Middleware for resource ownership with fallback to admin permissions
export function withResourceOwnership(
  permission: Permission,
  getResourceUserId: (request: NextRequest, ...args: any[]) => Promise<number>,
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
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

      // Get resource owner ID
      const resourceUserId = await getResourceUserId(request, ...args);
      
      // Check if user can access the resource
      if (!AuthorizationService.canAccessResource(user, resourceUserId, permission)) {
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'RESOURCE_ACCESS_DENIED',
            message: 'You can only access your own resources or need admin privileges',
            status: 403
          }),
          { status: 403 }
        );
      }

      return handler(request, user, ...args);
    } catch (error) {
      return ErrorHandler.handleUnknownError(error);
    }
  };
}

// Middleware for admin-only routes
export function withAdminAccess(
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>
) {
  return withPermission(Permission.READ_ALL_USERS, handler);
}

// Middleware for super admin-only routes
export function withSuperAdminAccess(
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>
) {
  return withPermission(Permission.MANAGE_ADMINS, handler);
}

// Middleware for content moderation
export function withModerationAccess(
  handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>
) {
  return withPermission(Permission.MODERATE_CONTENT, handler);
}

// Combined middleware factory for complex authorization scenarios
export function createAdvancedAuthMiddleware(options: {
  permission?: Permission;
  requireOwnership?: boolean;
  allowAdmin?: boolean;
  requireVerification?: boolean;
  getResourceUserId?: (request: NextRequest, ...args: any[]) => Promise<number>;
}) {
  return (handler: (request: NextRequest, user: JWTUser, ...args: any[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
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
        if (options.requireVerification && !user.isVerified) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'EMAIL_VERIFICATION_REQUIRED',
              message: 'Email verification required',
              status: 403
            }),
            { status: 403 }
          );
        }

        // Check basic permission if specified
        if (options.permission && !AuthorizationService.hasPermission(user, options.permission)) {
          // If admin access is allowed, check for admin permissions
          if (options.allowAdmin && AuthorizationService.hasAnyPermission(user, [
            Permission.READ_ALL_CONTENT,
            Permission.UPDATE_ANY_CONTENT,
            Permission.DELETE_ANY_CONTENT
          ])) {
            // Admin access granted, continue
          } else {
            return NextResponse.json(
              createApiResponse(false, null, 
                AuthorizationService.createAuthorizationError(options.permission)
              ),
              { status: 403 }
            );
          }
        }

        // Check resource ownership if required
        if (options.requireOwnership && options.getResourceUserId) {
          const resourceUserId = await options.getResourceUserId(request, ...args);
          
          if (!AuthorizationService.canAccessResource(
            user, 
            resourceUserId, 
            options.permission || Permission.READ_OWN_PROFILE
          )) {
            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'RESOURCE_ACCESS_DENIED',
                message: 'Access denied to this resource',
                status: 403
              }),
              { status: 403 }
            );
          }
        }

        return handler(request, user, ...args);
      } catch (error) {
        return ErrorHandler.handleUnknownError(error);
      }
    };
  };
}

// Utility functions for common resource ID extraction patterns
export const ResourceIdExtractors = {
  fromParams: (paramName: string) => {
    return async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
      const id = parseInt(context.params[paramName]);
      if (isNaN(id)) {
        throw new Error(`Invalid ${paramName}`);
      }
      return id;
    };
  },

  fromQuery: (queryName: string) => {
    return async (request: NextRequest): Promise<number> => {
      const { searchParams } = new URL(request.url);
      const id = parseInt(searchParams.get(queryName) || '');
      if (isNaN(id)) {
        throw new Error(`Invalid ${queryName}`);
      }
      return id;
    };
  },

  fromBody: (fieldName: string) => {
    return async (request: NextRequest): Promise<number> => {
      const body = await request.json();
      const id = parseInt(body[fieldName]);
      if (isNaN(id)) {
        throw new Error(`Invalid ${fieldName}`);
      }
      return id;
    };
  }
};

// Database resource owner extractors
export const DatabaseExtractors = {
  albumOwner: async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const albumId = parseInt(context.params.id);
    if (isNaN(albumId)) {
      throw new Error('Invalid album ID');
    }

    const pool = (await import('@/lib/database')).default;
    const [rows] = await pool.execute(
      'SELECT created_by FROM albums WHERE id = ?',
      [albumId]
    );
    
    const results = Array.isArray(rows) ? rows : [];
    if (results.length === 0) {
      throw new Error('Album not found');
    }

    return (results[0] as any).created_by;
  },

  playlistOwner: async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const playlistId = parseInt(context.params.id);
    if (isNaN(playlistId)) {
      throw new Error('Invalid playlist ID');
    }

    const pool = (await import('@/lib/database')).default;
    const [rows] = await pool.execute(
      'SELECT user_id FROM playlists WHERE id = ?',
      [playlistId]
    );
    
    const results = Array.isArray(rows) ? rows : [];
    if (results.length === 0) {
      throw new Error('Playlist not found');
    }

    return (results[0] as any).user_id;
  },

  blogPostOwner: async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const postId = parseInt(context.params.id);
    if (isNaN(postId)) {
      throw new Error('Invalid blog post ID');
    }

    const pool = (await import('@/lib/database')).default;
    const [rows] = await pool.execute(
      'SELECT user_id FROM blog_posts WHERE id = ?',
      [postId]
    );
    
    const results = Array.isArray(rows) ? rows : [];
    if (results.length === 0) {
      throw new Error('Blog post not found');
    }

    return (results[0] as any).user_id;
  },

  commentOwner: async (request: NextRequest, context: { params: Record<string, string> }): Promise<number> => {
    const commentId = parseInt(context.params.id);
    if (isNaN(commentId)) {
      throw new Error('Invalid comment ID');
    }

    const pool = (await import('@/lib/database')).default;
    const [rows] = await pool.execute(
      'SELECT user_id FROM comments WHERE id = ?',
      [commentId]
    );
    
    const results = Array.isArray(rows) ? rows : [];
    if (results.length === 0) {
      throw new Error('Comment not found');
    }

    return (results[0] as any).user_id;
  }
};

export default {
  withPermission,
  withResourceOwnership,
  withAdminAccess,
  withSuperAdminAccess,
  withModerationAccess,
  createAdvancedAuthMiddleware,
  ResourceIdExtractors,
  DatabaseExtractors
};