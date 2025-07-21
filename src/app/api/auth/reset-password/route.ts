import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { withAuthRateLimit } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/reset-password - Reset password with token
export const POST = withErrorHandling(
  withAuthRateLimit(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { token, password } = body;

        if (!token) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'TOKEN_REQUIRED',
              message: 'Reset token is required',
              status: 400
            }),
            { status: 400 }
          );
        }

        if (!password) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'PASSWORD_REQUIRED',
              message: 'New password is required',
              status: 400
            }),
            { status: 400 }
          );
        }

        // Validate password strength
        const passwordValidation = AuthService.validatePassword(password);
        if (!passwordValidation.valid) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'INVALID_PASSWORD',
              message: 'Password does not meet requirements',
              status: 400,
              details: { errors: passwordValidation.errors }
            }),
            { status: 400 }
          );
        }

        // Find user with reset token
        const [users] = await pool.execute(
          `SELECT 
            id, 
            username, 
            email, 
            role, 
            is_verified,
            is_active,
            password_reset_token,
            password_reset_expires
          FROM users 
          WHERE password_reset_token = ?`,
          [token]
        );

        const userRows = Array.isArray(users) ? users : [];
        
        if (userRows.length === 0) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired reset token',
              status: 400
            }),
            { status: 400 }
          );
        }

        const user = userRows[0] as any;

        // Check if account is active
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

        // Check if token has expired
        if (new Date(user.password_reset_expires) < new Date()) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'TOKEN_EXPIRED',
              message: 'Reset token has expired',
              status: 400
            }),
            { status: 400 }
          );
        }

        // Hash new password
        const passwordHash = await AuthService.hashPassword(password);

        // Update password and clear reset token
        await pool.execute(
          `UPDATE users SET 
            password_hash = ?, 
            password_reset_token = NULL, 
            password_reset_expires = NULL,
            failed_login_attempts = 0,
            locked_until = NULL,
            password_changed_at = NOW(),
            updated_at = NOW()
          WHERE id = ?`,
          [passwordHash, user.id]
        );

        // Create user object for JWT
        const jwtUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.is_verified
        };

        // Generate new tokens
        const tokens = AuthService.generateTokenPair(jwtUser);

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
            message: 'Password reset successfully'
          }),
          tokens
        );
      } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'PASSWORD_RESET_FAILED',
            message: 'Failed to reset password',
            status: 500
          }),
          { status: 500 }
        );
      }
    },
    (req) => req.ip || 'unknown'
  )
);