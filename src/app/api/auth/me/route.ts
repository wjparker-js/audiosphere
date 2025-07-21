import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { withAuth } from '@/lib/auth-middleware';
import { withErrorHandling } from '@/lib/error-handler';
import { createApiResponse } from '@/lib/data-transformer';
import { DataTransformer } from '@/lib/data-transformer';

// GET /api/auth/me - Get current user profile
export const GET = withErrorHandling(
  withAuth(async (request: NextRequest, user) => {
    try {
      // Get detailed user information from database
      const [users] = await pool.execute(
        `SELECT 
          id,
          username,
          email,
          role,
          is_verified,
          is_active,
          bio,
          avatar_url,
          created_at,
          updated_at,
          last_login_at,
          email_verified_at
        FROM users 
        WHERE id = ?`,
        [user.id]
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

      const userData = userRows[0] as any;

      // Get user statistics
      const [stats] = await pool.execute(
        `SELECT 
          (SELECT COUNT(*) FROM albums WHERE created_by = ?) as album_count,
          (SELECT COUNT(*) FROM playlists WHERE user_id = ?) as playlist_count,
          (SELECT COUNT(*) FROM blog_posts WHERE user_id = ?) as blog_post_count,
          (SELECT COUNT(*) FROM user_likes WHERE user_id = ?) as liked_tracks_count
        `,
        [user.id, user.id, user.id, user.id]
      );

      const userStats = Array.isArray(stats) && stats.length > 0 ? stats[0] as any : {
        album_count: 0,
        playlist_count: 0,
        blog_post_count: 0,
        liked_tracks_count: 0
      };

      return NextResponse.json(
        createApiResponse(true, {
          user: {
            id: DataTransformer.toInt(userData.id),
            username: DataTransformer.toString(userData.username),
            email: DataTransformer.toString(userData.email),
            role: userData.role,
            isVerified: Boolean(userData.is_verified),
            isActive: Boolean(userData.is_active),
            bio: userData.bio || null,
            avatarUrl: userData.avatar_url || null,
            createdAt: DataTransformer.parseDate(userData.created_at) || new Date().toISOString(),
            updatedAt: DataTransformer.parseDate(userData.updated_at) || new Date().toISOString(),
            lastLoginAt: DataTransformer.parseDate(userData.last_login_at),
            emailVerifiedAt: DataTransformer.parseDate(userData.email_verified_at),
            stats: {
              albumCount: DataTransformer.toInt(userStats.album_count),
              playlistCount: DataTransformer.toInt(userStats.playlist_count),
              blogPostCount: DataTransformer.toInt(userStats.blog_post_count),
              likedTracksCount: DataTransformer.toInt(userStats.liked_tracks_count)
            }
          }
        })
      );
    } catch (error) {
      console.error('Get user profile error:', error);
      return NextResponse.json(
        createApiResponse(false, null, {
          code: 'PROFILE_FETCH_FAILED',
          message: 'Failed to fetch user profile',
          status: 500
        }),
        { status: 500 }
      );
    }
  })
);