import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id;
    
    // Fetch tracks for the album
    const query = `
      SELECT 
        t.*,
        a.title as album_title,
        a.artist as album_artist,
        a.cover_image_url as album_cover
      FROM tracks t 
      JOIN albums a ON t.album_id = a.id
      WHERE t.album_id = ? AND t.status = 'published'
      ORDER BY t.track_number ASC, t.created_at ASC
    `;
    
    const result = await pool.execute(query, [albumId]);
    const tracks = Array.isArray(result[0]) ? result[0] : [];
    
    return NextResponse.json({ 
      success: true, 
      tracks 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}