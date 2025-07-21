import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/database';
import { parseBuffer } from 'music-metadata';

// GET method to fetch tracks
export async function GET(request: NextRequest) {
  try {
    // Simple query without complex joins
    const [tracks] = await pool.execute(`
      SELECT 
        id,
        title,
        artist,
        album_title,
        track_number,
        duration,
        duration_seconds,
        file_path,
        play_count,
        status,
        created_at,
        updated_at
      FROM tracks 
      WHERE status = 'published'
      ORDER BY play_count DESC, track_number ASC
      LIMIT 10
    `);
    
    // Simple data transformation
    const sanitizedTracks = (tracks as any[]).map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      albumTitle: track.album_title,
      trackNumber: track.track_number,
      duration: track.duration,
      durationSeconds: track.duration_seconds,
      filePath: track.file_path,
      playCount: track.play_count || 0,
      status: track.status,
      createdAt: track.created_at,
      updatedAt: track.updated_at
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        tracks: sanitizedTracks
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

// Function to extract audio duration from buffer using music-metadata
async function getAudioDuration(buffer: Buffer): Promise<number> {
  try {
    const metadata = await parseBuffer(buffer);
    
    // Get duration from metadata
    const duration = metadata.format.duration;
    
    if (duration && duration > 0) {
      return Math.round(duration); // Return duration in seconds, rounded
    } else {
      console.warn('Could not extract duration from audio file, using default');
      return 180; // 3 minutes default fallback
    }
  } catch (error) {
    console.error('Error extracting audio metadata:', error);
    return 180; // 3 minutes default fallback
  }
}

// Function to format duration from seconds to MM:SS
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const audioFile = formData.get('audioFile') as File;
    const trackTitle = formData.get('trackTitle') as string;
    const albumId = formData.get('albumId') as string;
    
    // Validate required fields
    if (!audioFile || !trackTitle || !albumId) {
      return NextResponse.json(
        { success: false, error: 'Audio file, track title, and album ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/m4a'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only MP3 and M4A files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Get album details
    const albumQuery = 'SELECT * FROM albums WHERE id = ?';
    const albumResult = await pool.execute(albumQuery, [albumId]);
    const albums = Array.isArray(albumResult[0]) ? albumResult[0] : [];
    
    if (albums.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }
    
    const album = albums[0] as any;

    // Create upload directory structure
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tracks', year.toString(), month);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const fileExtension = audioFile.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);
    
    // Save the file
    const buffer = await audioFile.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    await writeFile(filePath, fileBuffer);
    
    // Get audio duration
    const durationSeconds = await getAudioDuration(fileBuffer);
    const formattedDuration = formatDuration(durationSeconds);
    
    // Create the public URL path
    const audioUrl = `/uploads/tracks/${year}/${month}/${fileName}`;

    // Get the next track number for this album
    const trackCountQuery = 'SELECT COUNT(*) as count FROM tracks WHERE album_id = ?';
    const trackCountResult = await pool.execute(trackCountQuery, [albumId]);
    const trackCount = Array.isArray(trackCountResult[0]) ? (trackCountResult[0][0] as any).count : 0;
    const trackNumber = trackCount + 1;

    // Insert track into database
    const insertQuery = `
      INSERT INTO tracks (
        title, 
        artist, 
        album_id, 
        album_title,
        track_number, 
        duration, 
        duration_seconds,
        file_path, 
        file_size, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `;
    
    const insertParams = [
      trackTitle,
      album.artist, // Use album's artist
      albumId,
      album.title, // Store album title for easier queries
      trackNumber,
      formattedDuration,
      durationSeconds,
      audioUrl,
      audioFile.size
    ];
    
    const result = await pool.execute(insertQuery, insertParams);
    const trackId = (result[0] as any).insertId;

    // Update album track count
    const updateAlbumQuery = 'UPDATE albums SET track_count = track_count + 1 WHERE id = ?';
    await pool.execute(updateAlbumQuery, [albumId]);
    
    // Fetch the created track with all details
    const fetchQuery = `
      SELECT t.*, a.title as album_title, a.artist as album_artist, a.cover_image_url
      FROM tracks t 
      JOIN albums a ON t.album_id = a.id
      WHERE t.id = ?
    `;
    
    const trackResult = await pool.execute(fetchQuery, [trackId]);
    const track = Array.isArray(trackResult[0]) ? trackResult[0][0] : null;
    
    return NextResponse.json({ 
      success: true, 
      track,
      message: 'Track uploaded successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error uploading track:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload track' },
      { status: 500 }
    );
  }
}