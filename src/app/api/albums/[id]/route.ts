import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id;
    
    // Fetch album with genre and creator info
    const query = `
      SELECT a.*, g.name as genre_name, u.username as created_by_username
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ? AND a.status = 'published'
    `;
    
    const result = await pool.execute(query, [albumId]);
    const albums = Array.isArray(result[0]) ? result[0] : [];
    
    if (albums.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }
    
    const album = albums[0];
    
    return NextResponse.json({ 
      success: true, 
      album 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}