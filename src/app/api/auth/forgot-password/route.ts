import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { withAuthRateLimit } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/forgot-password - Request password reset
export const POST = withErrorHandling(
  withAuthRateLimit(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { email } = body;

        if (!email || !AuthService.validateEmail(email)) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'INVALID_EMAIL',
              message: 'Valid email address is required',
              status: 400
            }),
            { status: 400 }
          );
        }

        // Find user by email
        const [users] = await pool.execute(
          'SELECT id, username, email, is_active FROM users WHERE email = ?',
          [email]
        );

        const userRows = Array.isArray(users) ? users : [];

        // Always return success to prevent email enumeration attacks
        const successResponse = NextResponse.json(
          createApiResponse(true, {
            message: 'If an account with that email exists, a password reset link has been sent.'
          })
        );

        if (userRows.length === 0) {
          return successResponse;
        }

        const user = userRows[0] as any;

        // Check if account is active
        if (!user.is_active) {
          return successResponse;
        }

        // Generate reset token
        const resetToken = AuthService.generateSecureToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token
        await pool.execute(
          `UPDATE users SET 
            password_reset_token = ?, 
            password_reset_expires = ?,
            updated_at = NOW()
          WHERE id = ?`,
          [resetToken, resetExpires, user.id]
        );

        // TODO: Send password reset email
        // await EmailService.sendPasswordResetEmail(user.email, resetToken);

        console.log(`Password reset token for ${email}: ${resetToken}`); // For development

        return successResponse;
      } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'FORGOT_PASSWORD_FAILED',
            message: 'Failed to process password reset request',
            status: 500
          }),
          { status: 500 }
        );
      }
    },
    (req) => req.ip || 'unknown'
  )
);