import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/database';
import { parseBuffer } from 'music-metadata';
import { DataTransformer, createApiResponse } from '@/lib/data-transformer';
import { ErrorHandler, withErrorHandling } from '@/lib/error-handler';
import { trackSchemas, validateFile } from '@/lib/validation';

// GET method to fetch tracks
export const GET = withErrorHandling(async (request: NextRequest) => {
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
  
  // Transform and sanitize the data
  const sanitizedTracks = (tracks as any[]).map(track => 
    DataTransformer.sanitizeTrack(track)
  );
  
  return NextResponse.json(
    createApiResponse(true, { tracks: sanitizedTracks })
  );
});

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

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  
  // Extract form fields
  const audioFile = formData.get('audioFile') as File;
  const trackTitle = formData.get('trackTitle') as string;
  const albumId = formData.get('albumId') as string;
  
  // Validate form data using Zod schema
  const validationResult = trackSchemas.create.safeParse({
    trackTitle,
    albumId
  });

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code.toUpperCase()
    }));
    
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Invalid track data provided',
      details: validationErrors
    } as any);
  }

  // Validate audio file
  if (!audioFile) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Audio file is required',
      field: 'audioFile'
    } as any);
  }

  const fileValidation = await validateFile(audioFile, 'audio');
  if (!fileValidation.success) {
    return fileValidation.error!;
  }

  // Get album details
  const albumQuery = 'SELECT * FROM albums WHERE id = ?';
  const albumResult = await pool.execute(albumQuery, [albumId]);
  const albums = Array.isArray(albumResult[0]) ? albumResult[0] : [];
  
  if (albums.length === 0) {
    return ErrorHandler.handleNotFoundError('Album');
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
    SELECT 
      t.id,
      t.title,
      t.artist,
      t.album_id,
      t.album_title,
      t.track_number,
      t.duration,
      t.duration_seconds,
      t.file_path,
      t.play_count,
      t.status,
      t.created_at,
      t.updated_at,
      a.cover_image_url
    FROM tracks t 
    JOIN albums a ON t.album_id = a.id
    WHERE t.id = ?
  `;
  
  const trackResult = await pool.execute(fetchQuery, [trackId]);
  const rawTrack = Array.isArray(trackResult[0]) ? trackResult[0][0] : null;
  
  if (!rawTrack) {
    return ErrorHandler.handleNotFoundError('Created track');
  }
  
  const sanitizedTrack = DataTransformer.sanitizeTrack(rawTrack);
  
  return NextResponse.json(
    createApiResponse(true, { 
      track: sanitizedTrack,
      message: 'Track uploaded successfully' 
    }),
    { status: 201 }
  );
});