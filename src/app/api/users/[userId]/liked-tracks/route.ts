import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users/[userId]/liked-tracks - Get user's liked tracks
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user's liked tracks with track details
    const [likedTracks] = await pool.execute(`
      SELECT 
        t.id,
        t.title,
        t.artist,
        t.album_title as album,
        t.duration,
        t.duration_seconds,
        t.play_count,
        t.file_path as audioUrl,
        a.cover_image_url as thumbnail,
        ul.created_at as liked_at
      FROM user_likes ul
      JOIN tracks t ON ul.entity_id = t.id
      LEFT JOIN albums a ON t.album_id = a.id
      WHERE ul.user_id = ? 
        AND ul.entity_type = 'track'
        AND t.status = 'published'
      ORDER BY ul.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `, [userId]);

    // Get total count for pagination
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM user_likes ul
      JOIN tracks t ON ul.entity_id = t.id
      WHERE ul.user_id = ? 
        AND ul.entity_type = 'track'
        AND t.status = 'published'
    `, [userId]);

    const total = Array.isArray(countResult) && countResult.length > 0 
      ? (countResult[0] as any).total 
      : 0;

    // Format tracks for frontend
    const formattedTracks = Array.isArray(likedTracks) ? likedTracks.map((track: any) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      durationSeconds: track.duration_seconds,
      plays: track.play_count || 0,
      thumbnail: track.thumbnail || '/api/placeholder/48/48',
      audioUrl: track.audioUrl,
      isLiked: true, // All tracks in this list are liked
      likedAt: track.liked_at
    })) : [];

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        tracks: formattedTracks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        userId,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      }
    });

  } catch (error) {
    console.error('Error fetching liked tracks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch liked tracks' },
      { status: 500 }
    );
  }
}