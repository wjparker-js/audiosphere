import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService, AuthRateLimit } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { withValidation, userSchemas } from '@/lib/validation';
import { withAuthRateLimit } from '@/lib/middleware/rateLimitMiddleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/login - User login
export const POST = withErrorHandling(
  withAuthRateLimit(
    withValidation(
      userSchemas.login,
      async (request: NextRequest) => {
        const body = await request.json();
        const { email, password } = body;
        const clientIP = request.ip || 'unknown';

        try {
          // Get user from database
          const [users] = await pool.execute(
            `SELECT 
              id, 
              username, 
              email, 
              password_hash, 
              role, 
              is_verified,
              is_active,
              failed_login_attempts,
              locked_until,
              last_login_at
            FROM users 
            WHERE email = ?`,
            [email]
          );

          const userRows = Array.isArray(users) ? users : [];
          
          if (userRows.length === 0) {
            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
                status: 401
              }),
              { status: 401 }
            );
          }

          const user = userRows[0] as any;

          // Check if account is active
          if (!user.is_active) {
            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'ACCOUNT_DISABLED',
                message: 'Account has been disabled. Please contact support.',
                status: 403
              }),
              { status: 403 }
            );
          }

          // Check if account is locked
          if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const lockExpiry = new Date(user.locked_until);
            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'ACCOUNT_LOCKED',
                message: 'Account is temporarily locked due to too many failed login attempts',
                status: 423,
                details: {
                  lockedUntil: lockExpiry.toISOString()
                }
              }),
              { status: 423 }
            );
          }

          // Verify password
          const passwordValid = await AuthService.verifyPassword(password, user.password_hash);
          
          if (!passwordValid) {
            // Increment failed login attempts
            const failedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockUntil = null;

            // Lock account after 5 failed attempts for 15 minutes
            if (failedAttempts >= 5) {
              lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            }

            await pool.execute(
              'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
              [failedAttempts, lockUntil, user.id]
            );

            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
                status: 401,
                details: failedAttempts >= 5 ? {
                  accountLocked: true,
                  lockedUntil: lockUntil?.toISOString()
                } : undefined
              }),
              { status: 401 }
            );
          }

          // Reset failed login attempts on successful login
          await pool.execute(
            `UPDATE users SET 
              failed_login_attempts = 0, 
              locked_until = NULL, 
              last_login_at = NOW(),
              last_login_ip = ?
            WHERE id = ?`,
            [clientIP, user.id]
          );

          // Reset rate limiting for this IP on successful login
          AuthRateLimit.resetRateLimit(clientIP);

          // Create user object for JWT
          const jwtUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.is_verified
          };

          // Generate tokens
          const tokens = AuthService.generateTokenPair(jwtUser);

          return TokenStorage.createAuthResponse(
            createApiResponse(true, {
              user: {
                id: jwtUser.id,
                email: jwtUser.email,
                username: jwtUser.username,
                role: jwtUser.role,
                isVerified: jwtUser.isVerified,
                lastLoginAt: new Date().toISOString()
              },
              tokens,
              message: 'Login successful'
            }),
            tokens
          );
        } catch (error) {
          console.error('Login error:', error);
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'LOGIN_FAILED',
              message: 'Login failed. Please try again.',
              status: 500
            }),
            { status: 500 }
          );
        }
      }
    ),
    (req) => req.ip || 'unknown'
  )
);