import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { TokenStorage } from '@/lib/token-storage';
import { withValidation, userSchemas } from '@/lib/validation';
import { withAuthRateLimit } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';

// POST /api/auth/register - User registration
export const POST = withErrorHandling(
  withAuthRateLimit(
    withValidation(
      userSchemas.register,
      async (request: NextRequest) => {
        const body = await request.json();
        const { username, email, password } = body;

        // Additional validation
        const emailValid = AuthService.validateEmail(email);
        if (!emailValid) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'INVALID_EMAIL',
              message: 'Invalid email format',
              status: 400
            }),
            { status: 400 }
          );
        }

        const usernameValidation = AuthService.validateUsername(username);
        if (!usernameValidation.valid) {
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'INVALID_USERNAME',
              message: 'Invalid username',
              status: 400,
              details: { errors: usernameValidation.errors }
            }),
            { status: 400 }
          );
        }

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

        try {
          // Check if user already exists
          const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
          );

          if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json(
              createApiResponse(false, null, {
                code: 'USER_EXISTS',
                message: 'User with this email or username already exists',
                status: 409
              }),
              { status: 409 }
            );
          }

          // Hash password
          const passwordHash = await AuthService.hashPassword(password);

          // Generate verification token
          const verificationToken = AuthService.generateSecureToken();

          // Insert new user
          const [result] = await pool.execute(
            `INSERT INTO users (
              username, 
              email, 
              password_hash, 
              verification_token, 
              is_verified, 
              role,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [username, email, passwordHash, verificationToken, false, 'user']
          );

          const userId = (result as any).insertId;

          // Create user object for JWT
          const user = {
            id: userId,
            email,
            username,
            role: 'user' as const,
            isVerified: false
          };

          // Generate tokens
          const tokens = AuthService.generateTokenPair(user);

          // TODO: Send verification email
          // await EmailService.sendVerificationEmail(email, verificationToken);

          return TokenStorage.createAuthResponse(
            createApiResponse(true, {
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified
              },
              tokens,
              message: 'Registration successful. Please check your email to verify your account.'
            }),
            tokens,
            201
          );
        } catch (error) {
          console.error('Registration error:', error);
          return NextResponse.json(
            createApiResponse(false, null, {
              code: 'REGISTRATION_FAILED',
              message: 'Registration failed. Please try again.',
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