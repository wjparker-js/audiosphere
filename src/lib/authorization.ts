import { JWTUser } from './auth';

// Permission system for fine-grained access control
export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  DELETE_OWN_ACCOUNT = 'delete_own_account',
  
  // Content permissions
  CREATE_ALBUM = 'create_album',
  UPDATE_OWN_ALBUM = 'update_own_album',
  DELETE_OWN_ALBUM = 'delete_own_album',
  PUBLISH_ALBUM = 'publish_album',
  
  CREATE_PLAYLIST = 'create_playlist',
  UPDATE_OWN_PLAYLIST = 'update_own_playlist',
  DELETE_OWN_PLAYLIST = 'delete_own_playlist',
  SHARE_PLAYLIST = 'share_playlist',
  
  CREATE_BLOG_POST = 'create_blog_post',
  UPDATE_OWN_BLOG_POST = 'update_own_blog_post',
  DELETE_OWN_BLOG_POST = 'delete_own_blog_post',
  PUBLISH_BLOG_POST = 'publish_blog_post',
  
  CREATE_COMMENT = 'create_comment',
  UPDATE_OWN_COMMENT = 'update_own_comment',
  DELETE_OWN_COMMENT = 'delete_own_comment',
  
  // Admin permissions
  READ_ALL_USERS = 'read_all_users',
  UPDATE_ANY_USER = 'update_any_user',
  DELETE_ANY_USER = 'delete_any_user',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  READ_ALL_CONTENT = 'read_all_content',
  UPDATE_ANY_CONTENT = 'update_any_content',
  DELETE_ANY_CONTENT = 'delete_any_content',
  MODERATE_CONTENT = 'moderate_content',
  
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM = 'manage_system',
  
  // Super admin permissions
  MANAGE_ADMINS = 'manage_admins',
  SYSTEM_CONFIGURATION = 'system_configuration',
  DATABASE_ACCESS = 'database_access'
}

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<JWTUser['role'], Permission[]> = {
  user: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.DELETE_OWN_ACCOUNT,
    Permission.CREATE_ALBUM,
    Permission.UPDATE_OWN_ALBUM,
    Permission.DELETE_OWN_ALBUM,
    Permission.PUBLISH_ALBUM,
    Permission.CREATE_PLAYLIST,
    Permission.UPDATE_OWN_PLAYLIST,
    Permission.DELETE_OWN_PLAYLIST,
    Permission.SHARE_PLAYLIST,
    Permission.CREATE_BLOG_POST,
    Permission.UPDATE_OWN_BLOG_POST,
    Permission.DELETE_OWN_BLOG_POST,
    Permission.PUBLISH_BLOG_POST,
    Permission.CREATE_COMMENT,
    Permission.UPDATE_OWN_COMMENT,
    Permission.DELETE_OWN_COMMENT
  ],
  admin: [
    // All user permissions
    ...ROLE_PERMISSIONS?.user || [],
    // Plus admin permissions
    Permission.READ_ALL_USERS,
    Permission.UPDATE_ANY_USER,
    Permission.DELETE_ANY_USER,
    Permission.READ_ALL_CONTENT,
    Permission.UPDATE_ANY_CONTENT,
    Permission.DELETE_ANY_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM
  ],
  super_admin: [
    // All admin permissions
    ...ROLE_PERMISSIONS?.admin || [],
    // Plus super admin permissions
    Permission.MANAGE_ADMINS,
    Permission.MANAGE_USER_ROLES,
    Permission.SYSTEM_CONFIGURATION,
    Permission.DATABASE_ACCESS
  ]
};

export class AuthorizationService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: JWTUser | null, permission: Permission): boolean {
    if (!user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: JWTUser | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: JWTUser | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user can access resource (owns it or has admin permissions)
   */
  static canAccessResource(
    user: JWTUser | null, 
    resourceUserId: number, 
    requiredPermission: Permission
  ): boolean {
    if (!user) return false;
    
    // User owns the resource and has the required permission
    if (user.id === resourceUserId && this.hasPermission(user, requiredPermission)) {
      return true;
    }
    
    // User has admin permission to access any resource
    const adminPermissions = [
      Permission.READ_ALL_CONTENT,
      Permission.UPDATE_ANY_CONTENT,
      Permission.DELETE_ANY_CONTENT,
      Permission.READ_ALL_USERS,
      Permission.UPDATE_ANY_USER,
      Permission.DELETE_ANY_USER
    ];
    
    return this.hasAnyPermission(user, adminPermissions);
  }

  /**
   * Check if user can moderate content
   */
  static canModerateContent(user: JWTUser | null): boolean {
    return this.hasPermission(user, Permission.MODERATE_CONTENT);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: JWTUser | null): boolean {
    return this.hasAnyPermission(user, [
      Permission.READ_ALL_USERS,
      Permission.UPDATE_ANY_USER,
      Permission.DELETE_ANY_USER,
      Permission.MANAGE_USER_ROLES
    ]);
  }

  /**
   * Check if user can view analytics
   */
  static canViewAnalytics(user: JWTUser | null): boolean {
    return this.hasPermission(user, Permission.VIEW_ANALYTICS);
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(user: JWTUser | null): Permission[] {
    if (!user) return [];
    
    return ROLE_PERMISSIONS[user.role] || [];
  }

  /**
   * Check if user can perform action on specific resource type
   */
  static canPerformAction(
    user: JWTUser | null,
    action: 'create' | 'read' | 'update' | 'delete',
    resourceType: 'album' | 'playlist' | 'blog_post' | 'comment' | 'user',
    resourceUserId?: number
  ): boolean {
    if (!user) return false;

    // Map actions and resource types to permissions
    const permissionMap: Record<string, Permission> = {
      'create_album': Permission.CREATE_ALBUM,
      'update_album': Permission.UPDATE_OWN_ALBUM,
      'delete_album': Permission.DELETE_OWN_ALBUM,
      'create_playlist': Permission.CREATE_PLAYLIST,
      'update_playlist': Permission.UPDATE_OWN_PLAYLIST,
      'delete_playlist': Permission.DELETE_OWN_PLAYLIST,
      'create_blog_post': Permission.CREATE_BLOG_POST,
      'update_blog_post': Permission.UPDATE_OWN_BLOG_POST,
      'delete_blog_post': Permission.DELETE_OWN_BLOG_POST,
      'create_comment': Permission.CREATE_COMMENT,
      'update_comment': Permission.UPDATE_OWN_COMMENT,
      'delete_comment': Permission.DELETE_OWN_COMMENT,
      'read_user': Permission.READ_OWN_PROFILE,
      'update_user': Permission.UPDATE_OWN_PROFILE,
      'delete_user': Permission.DELETE_OWN_ACCOUNT
    };

    const permissionKey = `${action}_${resourceType}`;
    const requiredPermission = permissionMap[permissionKey];

    if (!requiredPermission) {
      return false;
    }

    // For create actions, just check if user has the permission
    if (action === 'create') {
      return this.hasPermission(user, requiredPermission);
    }

    // For other actions, check ownership or admin permissions
    if (resourceUserId !== undefined) {
      return this.canAccessResource(user, resourceUserId, requiredPermission);
    }

    return this.hasPermission(user, requiredPermission);
  }

  /**
   * Filter resources based on user permissions
   */
  static filterAccessibleResources<T extends { user_id?: number; created_by?: number }>(
    user: JWTUser | null,
    resources: T[],
    permission: Permission
  ): T[] {
    if (!user) return [];

    // If user has admin permissions, return all resources
    if (this.hasAnyPermission(user, [
      Permission.READ_ALL_CONTENT,
      Permission.READ_ALL_USERS
    ])) {
      return resources;
    }

    // Filter to only resources owned by the user
    return resources.filter(resource => {
      const resourceUserId = resource.user_id || resource.created_by;
      return resourceUserId === user.id && this.hasPermission(user, permission);
    });
  }

  /**
   * Create authorization error response
   */
  static createAuthorizationError(
    requiredPermission: Permission,
    message?: string
  ): {
    code: string;
    message: string;
    status: number;
    details: {
      requiredPermission: string;
    };
  } {
    return {
      code: 'INSUFFICIENT_PERMISSIONS',
      message: message || `Permission required: ${requiredPermission}`,
      status: 403,
      details: {
        requiredPermission
      }
    };
  }
}

// Middleware factory for permission-based authorization
export function requirePermission(permission: Permission) {
  return (user: JWTUser | null) => {
    if (!AuthorizationService.hasPermission(user, permission)) {
      throw new Error(`Permission required: ${permission}`);
    }
    return true;
  };
}

// Middleware factory for resource ownership or admin access
export function requireResourceAccess(permission: Permission) {
  return (user: JWTUser | null, resourceUserId: number) => {
    if (!AuthorizationService.canAccessResource(user, resourceUserId, permission)) {
      throw new Error(`Access denied to resource`);
    }
    return true;
  };
}

export default AuthorizationService;