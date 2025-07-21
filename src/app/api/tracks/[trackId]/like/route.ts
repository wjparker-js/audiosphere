import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getServerSession } from 'next-auth';

// POST /api/tracks/[trackId]/like - Like a track
export async function POST(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    // For now, we'll use a mock user ID since auth isn't fully implemented
    // In production, you'd get this from the session
    const userId = 1; // Mock user ID - replace with actual auth
    const trackId = parseInt(params.trackId);

    if (!trackId || isNaN(trackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid track ID' },
        { status: 400 }
      );
    }

    // Check if track exists
    const [trackCheck] = await pool.execute(
      'SELECT id FROM tracks WHERE id = ?',
      [trackId]
    );

    if (!Array.isArray(trackCheck) || trackCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked this track
    const [existingLike] = await pool.execute(
      'SELECT id FROM user_likes WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [userId, 'track', trackId]
    );

    if (Array.isArray(existingLike) && existingLike.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Track already liked by user' },
        { status: 409 }
      );
    }

    // Add the like
    await pool.execute(
      'INSERT INTO user_likes (user_id, entity_type, entity_id) VALUES (?, ?, ?)',
      [userId, 'track', trackId]
    );

    return NextResponse.json({
      success: true,
      message: 'Track liked successfully',
      data: {
        userId,
        trackId,
        liked: true
      }
    });

  } catch (error) {
    console.error('Error liking track:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like track' },
      { status: 500 }
    );
  }
}

// DELETE /api/tracks/[trackId]/like - Unlike a track
export async function DELETE(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    // For now, we'll use a mock user ID since auth isn't fully implemented
    const userId = 1; // Mock user ID - replace with actual auth
    const trackId = parseInt(params.trackId);

    if (!trackId || isNaN(trackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid track ID' },
        { status: 400 }
      );
    }

    // Check if user has liked this track
    const [existingLike] = await pool.execute(
      'SELECT id FROM user_likes WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [userId, 'track', trackId]
    );

    if (!Array.isArray(existingLike) || existingLike.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Track not liked by user' },
        { status: 404 }
      );
    }

    // Remove the like
    const [result] = await pool.execute(
      'DELETE FROM user_likes WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [userId, 'track', trackId]
    );

    return NextResponse.json({
      success: true,
      message: 'Track unliked successfully',
      data: {
        userId,
        trackId,
        liked: false
      }
    });

  } catch (error) {
    console.error('Error unliking track:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike track' },
      { status: 500 }
    );
  }
}