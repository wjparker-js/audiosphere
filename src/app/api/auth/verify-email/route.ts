import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/verify-email - Verify email with token
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'TOKEN_REQUIRED',
          message: 'Verification token is required',
          status: 400
        }),
        { status: 400 }
      );
    }

    // Find user with verification token
    const [users] = await pool.execute(
      `SELECT 
        id, 
        username, 
        email, 
        role, 
        is_verified,
        verification_token,
        verification_token_expires
      FROM users 
      WHERE verification_token = ?`,
      [token]
    );

    const userRows = Array.isArray(users) ? users : [];
    
    if (userRows.length === 0) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'INVALID_TOKEN',
          message: 'Invalid verification token',
          status: 400
        }),
        { status: 400 }
      );
    }

    const user = userRows[0] as any;

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'ALREADY_VERIFIED',
          message: 'Email is already verified',
          status: 400
        }),
        { status: 400 }
      );
    }

    // Check if token has expired (if expiration is set)
    if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'TOKEN_EXPIRED',
          message: 'Verification token has expired',
          status: 400
        }),
        { status: 400 }
      );
    }

    // Update user as verified
    await pool.execute(
      `UPDATE users SET 
        is_verified = true, 
        verification_token = NULL, 
        verification_token_expires = NULL,
        email_verified_at = NOW(),
        updated_at = NOW()
      WHERE id = ?`,
      [user.id]
    );

    // Create user object for JWT
    const jwtUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: true
    };

    // Generate new tokens with verified status
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
        message: 'Email verified successfully'
      }),
      tokens
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      createApiResponse(false, null, {
        code: 'VERIFICATION_FAILED',
        message: 'Email verification failed',
        status: 500
      }),
      { status: 500 }
    );
  }
});

// GET /api/auth/verify-email?token=xxx - Verify email via GET (for email links)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=missing-token', request.url));
  }

  try {
    // Use the same logic as POST but redirect instead of JSON response
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(postRequest);
    const data = await response.json();

    if (data.success) {
      return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url));
    } else {
      return NextResponse.redirect(new URL(`/auth/verify-email?error=${data.error?.code || 'verification-failed'}`, request.url));
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/verify-email?error=verification-failed', request.url));
  }
});