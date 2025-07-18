import { NextRequest, NextResponse } from 'next/server';

// Mock playlist tracks storage - in a real app this would be a database
let mockPlaylistTracks: { [playlistId: string]: string[] } = {};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    const body = await request.json();
    const { trackId } = body;

    // Validation
    if (!trackId || typeof trackId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Initialize playlist tracks if not exists
    if (!mockPlaylistTracks[playlistId]) {
      mockPlaylistTracks[playlistId] = [];
    }

    // Check if track is already in playlist
    if (mockPlaylistTracks[playlistId].includes(trackId)) {
      return NextResponse.json(
        { success: false, error: 'Track is already in this playlist' },
        { status: 400 }
      );
    }

    // Add track to playlist
    mockPlaylistTracks[playlistId].push(trackId);

    return NextResponse.json({
      success: true,
      message: 'Track added to playlist successfully'
    });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add track to playlist' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    const tracks = mockPlaylistTracks[playlistId] || [];

    return NextResponse.json({
      success: true,
      tracks: tracks
    });
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch playlist tracks' },
      { status: 500 }
    );
  }
}