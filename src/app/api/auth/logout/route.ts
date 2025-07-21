import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { TokenStorage } from '@/lib/token-storage';
import { withOptionalAuth } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/logout - User logout
export const POST = withErrorHandling(
  withOptionalAuth(async (request: NextRequest, user) => {
    try {
      // If user is authenticated, update last logout time
      if (user) {
        await pool.execute(
          'UPDATE users SET last_logout_at = NOW() WHERE id = ?',
          [user.id]
        );
      }

      // Clear authentication cookies and return success response
      return TokenStorage.createLogoutResponse(
        createApiResponse(true, {
          message: 'Logout successful'
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if database update fails, we should still clear cookies
      return TokenStorage.createLogoutResponse(
        createApiResponse(true, {
          message: 'Logout successful'
        })
      );
    }
  })
);

// GET /api/auth/logout - Alternative logout method for GET requests
export const GET = POST;