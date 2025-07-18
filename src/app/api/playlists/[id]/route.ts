import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    
    const query = `
      SELECT p.*,
             (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p 
      WHERE p.id = ?
    `;
    
    const results = await executeQuery(query, [playlistId]) as any[];
    
    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Playlist not found' } },
        { status: 404 }
      );
    }

    const playlist = results[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: playlist.id.toString(),
        title: playlist.name,
        description: playlist.description,
        coverArt: playlist.cover_image_url,
        trackCount: playlist.track_count || 0,
        isPublic: playlist.is_public || false,
        lastPlayed: playlist.last_played,
        createdAt: playlist.created_at,
        updatedAt: playlist.updated_at,
        userId: playlist.user_id.toString()
      }
    });

  } catch (error) {
    console.error('Playlist fetch error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch playlist' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    
    // Delete related playlist tracks first
    await executeQuery('DELETE FROM playlist_tracks WHERE playlist_id = ?', [playlistId]);
    
    // Delete the playlist
    await executeQuery('DELETE FROM playlists WHERE id = ?', [playlistId]);
    
    return NextResponse.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Playlist deletion error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete playlist' } },
      { status: 500 }
    );
  }
}