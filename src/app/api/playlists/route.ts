import { NextRequest, NextResponse } from 'next/server';

// Mock user ID for now - in a real app this would come from authentication
const MOCK_USER_ID = 'user-1';

// Mock playlists storage - in a real app this would be a database
let mockPlaylists: any[] = [
  {
    id: 'playlist-1',
    name: 'My Favorites',
    description: 'My favorite tracks',
    isPublic: false,
    userId: MOCK_USER_ID,
    createdAt: new Date('2024-01-01').toISOString(),
    trackCount: 0
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, filter by authenticated user
    const userPlaylists = mockPlaylists.filter(p => p.userId === MOCK_USER_ID);
    
    return NextResponse.json({
      success: true,
      playlists: userPlaylists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description = '', isPublic = false } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Playlist name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if playlist name already exists for this user
    const existingPlaylist = mockPlaylists.find(
      p => p.userId === MOCK_USER_ID && p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingPlaylist) {
      return NextResponse.json(
        { success: false, error: 'A playlist with this name already exists' },
        { status: 400 }
      );
    }

    // Create new playlist
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      isPublic: Boolean(isPublic),
      userId: MOCK_USER_ID,
      createdAt: new Date().toISOString(),
      trackCount: 0
    };

    mockPlaylists.push(newPlaylist);

    return NextResponse.json({
      success: true,
      playlist: newPlaylist
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}