import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { SocialAuthService } from '@/lib/social-auth';
import { withAuthRateLimit } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/facebook - Facebook OAuth authentication
export const POST = withErrorHandling(
  withAuthRateLimit(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { accessToken, userInfo } = body;

        if (!accessToken || !userInfo) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'ACCESS_TOKEN_REQUIRED',
              message: 'Facebook access token and user info are required',
              status: 400
            }),
            { status: 400 }
          );
        }

        // Verify the access token with Facebook
        const facebookProfile = await SocialAuthService.getFacebookProfile(accessToken);

        if (!facebookProfile.email) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'EMAIL_REQUIRED',
              message: 'Email permission is required for Facebook authentication',
              status: 400
            }),
            { status: 400 }
          );
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
          'SELECT id, username, email, role, is_verified, is_active FROM users WHERE email = ? OR facebook_id = ?',
          [facebookProfile.email, facebookProfile.id]
        );

        const userRows = Array.isArray(existingUsers) ? existingUsers : [];
        let user;

        if (userRows.length > 0) {
          // User exists, update Facebook ID and profile info if needed
          user = userRows[0] as any;
          
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

          // Update Facebook ID and profile info
          await pool.execute(
            `UPDATE users SET 
              facebook_id = ?, 
              avatar_url = COALESCE(avatar_url, ?),
              is_verified = true,
              last_login_at = NOW(),
              updated_at = NOW()
            WHERE id = ?`,
            [facebookProfile.id, facebookProfile.picture, user.id]
          );

          user.is_verified = true;
        } else {
          // Create new user
          const username = await generateUniqueUsername(facebookProfile.name || facebookProfile.email.split('@')[0]);
          
          const [result] = await pool.execute(
            `INSERT INTO users (
              username,
              email,
              facebook_id,
              avatar_url,
              is_verified,
              is_active,
              role,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              username,
              facebookProfile.email,
              facebookProfile.id,
              facebookProfile.picture,
              true, // Facebook accounts are automatically verified
              true,
              'user'
            ]
          );

          const userId = (result as any).insertId;
          
          user = {
            id: userId,
            username,
            email: facebookProfile.email,
            role: 'user',
            is_verified: true,
            is_active: true
          };
        }

        // Create JWT user object
        const jwtUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.is_verified
        };

        // Generate tokens
        const authTokens = AuthService.generateTokenPair(jwtUser);

        return TokenStorage.createAuthResponse(
          createApiResponse(true, {
            user: {
              id: jwtUser.id,
              email: jwtUser.email,
              username: jwtUser.username,
              role: jwtUser.role,
              isVerified: jwtUser.isVerified
            },
            tokens: authTokens,
            message: userRows.length > 0 ? 'Login successful' : 'Account created and logged in successfully'
          }),
          authTokens
        );
      } catch (error) {
        console.error('Facebook OAuth error:', error);
        return NextResponse.json(
          createApiResponse(false, null, {
            code: 'FACEBOOK_AUTH_FAILED',
            message: 'Facebook authentication failed',
            status: 500
          }),
          { status: 500 }
        );
      }
    },
    (req) => req.ip || 'unknown'
  )
);

// Helper function to generate unique username (same as Google)
async function generateUniqueUsername(baseName: string): Promise<string> {
  // Clean the base name
  let cleanName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  if (cleanName.length < 3) {
    cleanName = 'user' + cleanName;
  }

  // Check if username exists
  const [existing] = await pool.execute(
    'SELECT COUNT(*) as count FROM users WHERE username = ?',
    [cleanName]
  );

  const count = (existing as any[])[0].count;
  
  if (count === 0) {
    return cleanName;
  }

  // Generate unique username with number suffix
  let counter = 1;
  let uniqueName = `${cleanName}${counter}`;
  
  while (true) {
    const [check] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [uniqueName]
    );
    
    if ((check as any[])[0].count === 0) {
      return uniqueName;
    }
    
    counter++;
    uniqueName = `${cleanName}${counter}`;
    
    // Prevent infinite loop
    if (counter > 9999) {
      return `${cleanName}${Date.now()}`;
    }
  }
}