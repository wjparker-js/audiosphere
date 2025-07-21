import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { DataTransformer, createApiResponse } from '@/lib/data-transformer';
import { ErrorHandler, withErrorHandling } from '@/lib/error-handler';
import { playlistSchemas } from '@/lib/validation';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // TODO: Get actual user ID from authentication context
  // For now, using hardcoded user ID 1 (should match library page)
  const userId = 1;
  
  // Get playlists with track count and user info for the current user only
  const [playlists] = await pool.execute(`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.is_public,
      p.user_id,
      p.created_at,
      p.updated_at,
      u.username as owner_name,
      COUNT(pt.track_id) as track_count
    FROM playlists p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
    WHERE p.user_id = ?
    GROUP BY p.id, p.name, p.description, p.is_public, p.user_id, p.created_at, p.updated_at, u.username
    ORDER BY p.created_at DESC
    LIMIT 50
  `, [userId]);
  
  // Transform and sanitize the data
  const sanitizedPlaylists = (playlists as any[]).map(playlist => ({
    id: DataTransformer.toInt(playlist.id),
    name: DataTransformer.toString(playlist.name),
    description: playlist.description || null,
    isPublic: Boolean(playlist.is_public),
    userId: DataTransformer.toInt(playlist.user_id),
    trackCount: DataTransformer.toInt(playlist.track_count),
    ownerName: DataTransformer.toString(playlist.owner_name, 'Unknown User'),
    createdAt: DataTransformer.parseDate(playlist.created_at) || new Date().toISOString(),
    updatedAt: DataTransformer.parseDate(playlist.updated_at) || new Date().toISOString()
  }));
  
  return NextResponse.json(
    createApiResponse(true, { playlists: sanitizedPlaylists })
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate request body using Zod schema
  const validationResult = playlistSchemas.create.safeParse(body);

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code.toUpperCase()
    }));
    
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Invalid playlist data provided',
      details: validationErrors
    } as any);
  }

  const { name, description, isPublic, userId } = validationResult.data;

  // Check if playlist name already exists for this user
  const [existingPlaylists] = await pool.execute(
    'SELECT id FROM playlists WHERE user_id = ? AND LOWER(name) = LOWER(?)',
    [userId, name.trim()]
  );

  if (Array.isArray(existingPlaylists) && existingPlaylists.length > 0) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'A playlist with this name already exists',
      field: 'name',
      value: name
    } as any);
  }

  // Create new playlist
  const [result] = await pool.execute(
    'INSERT INTO playlists (name, description, is_public, user_id) VALUES (?, ?, ?, ?)',
    [name.trim(), description.trim(), Boolean(isPublic), userId]
  );

  const insertResult = result as any;
  const playlistId = insertResult.insertId;

  // Get the created playlist with user info
  const [newPlaylist] = await pool.execute(
    `SELECT p.*, u.username as owner_name 
     FROM playlists p 
     LEFT JOIN users u ON p.user_id = u.id 
     WHERE p.id = ?`,
    [playlistId]
  );

  const rawPlaylist = Array.isArray(newPlaylist) ? newPlaylist[0] : newPlaylist;
  
  if (!rawPlaylist) {
    return ErrorHandler.handleNotFoundError('Created playlist');
  }

  const sanitizedPlaylist = {
    id: DataTransformer.toInt(rawPlaylist.id),
    name: DataTransformer.toString(rawPlaylist.name),
    description: rawPlaylist.description || null,
    isPublic: Boolean(rawPlaylist.is_public),
    userId: DataTransformer.toInt(rawPlaylist.user_id),
    trackCount: 0, // New playlist starts with 0 tracks
    ownerName: DataTransformer.toString(rawPlaylist.owner_name, 'Unknown User'),
    createdAt: DataTransformer.parseDate(rawPlaylist.created_at) || new Date().toISOString(),
    updatedAt: DataTransformer.parseDate(rawPlaylist.updated_at) || new Date().toISOString()
  };

  return NextResponse.json(
    createApiResponse(true, { 
      playlist: sanitizedPlaylist,
      message: 'Playlist created successfully' 
    }),
    { status: 201 }
  );
});