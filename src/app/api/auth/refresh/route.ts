import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/refresh - Refresh access token
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    // Get refresh token from cookie or request body
    let refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required',
          status: 400
        }),
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = AuthService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          status: 401
        }),
        { status: 401 }
      );
    }

    // Get current user data from database to ensure account is still active
    const [users] = await pool.execute(
      `SELECT 
        id, 
        username, 
        email, 
        role, 
        is_verified,
        is_active
      FROM users 
      WHERE id = ?`,
      [payload.id]
    );

    const userRows = Array.isArray(users) ? users : [];
    
    if (userRows.length === 0) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          status: 404
        }),
        { status: 404 }
      );
    }

    const user = userRows[0] as any;

    // Check if account is still active
    if (!user.is_active) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'ACCOUNT_DISABLED',
          message: 'Account has been disabled',
          status: 403
        }),
        { status: 403 }
      );
    }

    // Create updated user object for JWT
    const jwtUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.is_verified
    };

    // Generate new token pair
    const tokens = AuthService.generateTokenPair(jwtUser);

    // Update last activity timestamp
    await pool.execute(
      'UPDATE users SET last_activity_at = NOW() WHERE id = ?',
      [user.id]
    );

    return TokenStorage.createAuthResponse(
      createApiResponse(true, {
        user: {
          id: jwtUser.id,
          email: jwtUser.email,
          username: jwtUser.username,
          role: jwtUser.role,
          isVerified: jwtUser.isVerified
        },
        tokens,
        message: 'Token refreshed successfully'
      }),
      tokens
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      createApiResponse(false, null, {
        code: 'TOKEN_REFRESH_FAILED',
        message: 'Failed to refresh token',
        status: 500
      }),
      { status: 500 }
    );
  }
});