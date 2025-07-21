import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// POST /api/tracks/[trackId]/play - Increment play count
export async function POST(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const trackId = parseInt(params.trackId);

    if (!trackId || isNaN(trackId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid track ID' },
        { status: 400 }
      );
    }

    // Check if track exists and get current play count
    const [trackCheck] = await pool.execute(
      'SELECT id, title, play_count FROM tracks WHERE id = ?',
      [trackId]
    );

    if (!Array.isArray(trackCheck) || trackCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    const track = trackCheck[0] as any;
    const currentPlayCount = track.play_count || 0;

    // Increment play count
    const [result] = await pool.execute(
      'UPDATE tracks SET play_count = play_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [trackId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update play count' },
        { status: 500 }
      );
    }

    // Get updated play count
    const [updatedTrack] = await pool.execute(
      'SELECT play_count FROM tracks WHERE id = ?',
      [trackId]
    );

    const newPlayCount = Array.isArray(updatedTrack) && updatedTrack.length > 0 
      ? (updatedTrack[0] as any).play_count 
      : currentPlayCount + 1;

    return NextResponse.json({
      success: true,
      message: 'Play count updated successfully',
      data: {
        trackId,
        previousPlayCount: currentPlayCount,
        newPlayCount: newPlayCount,
        trackTitle: track.title
      }
    });

  } catch (error) {
    console.error('Error updating play count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update play count' },
      { status: 500 }
    );
  }
}