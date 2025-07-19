import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/database';

import { DataTransformer, createApiResponse } from '@/lib/data-transformer';
import { ErrorHandler, withErrorHandling } from '@/lib/error-handler';

// GET endpoint to fetch albums
export const GET = withErrorHandling(async () => {
  const query = `
    SELECT 
      a.id,
      a.title,
      a.artist,
      a.description,
      a.cover_image_url,
      a.genre_id,
      a.track_count,
      a.status,
      a.created_by,
      a.created_at,
      a.updated_at,
      g.name as genre_name,
      u.username as created_by_username
    FROM albums a 
    LEFT JOIN genres g ON a.genre_id = g.id 
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.status = 'published'
    ORDER BY a.created_at DESC 
    LIMIT 20
  `;
  
  const [albums] = await pool.execute(query);
  
  // Transform and sanitize the data
  const sanitizedAlbums = (albums as any[]).map(album => 
    DataTransformer.sanitizeAlbum({
      ...album,
      genre_name: album.genre_name
    })
  );
  
  return NextResponse.json(
    createApiResponse(true, { albums: sanitizedAlbums })
  );
});

// POST endpoint to create new album
export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  
  // Extract form fields
  const title = formData.get('title') as string;
  const artist = formData.get('artist') as string;
  const genre = formData.get('genre') as string;
  const releaseDate = formData.get('releaseDate') as string;
  const description = formData.get('description') as string;
  const coverImage = formData.get('coverImage') as File;
  
  // Validate required fields
  if (!title || !artist) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Title and artist are required',
      field: !title ? 'title' : 'artist'
    } as any);
  }

  if (!coverImage) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Cover image is required',
      field: 'coverImage'
    } as any);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(coverImage.type)) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      field: 'coverImage',
      value: coverImage.type
    } as any);
  }

  // Validate file size (10MB)
  if (coverImage.size > 10 * 1024 * 1024) {
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'File size must be less than 10MB',
      field: 'coverImage',
      value: `${Math.round(coverImage.size / 1024 / 1024)}MB`
    } as any);
  }

  // Create upload directory structure
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'albums', year.toString(), month);
  
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }

  // Generate unique filename
  const uniqueId = uuidv4();
  const fileExtension = coverImage.name.split('.').pop();
  const fileName = `${uniqueId}.${fileExtension}`;
  const filePath = join(uploadDir, fileName);
  
  // Save the file
  const buffer = await coverImage.arrayBuffer();
  await writeFile(filePath, Buffer.from(buffer));
  
  // Create the public URL path
  const coverImageUrl = `/uploads/albums/${year}/${month}/${fileName}`;

  // Get genre ID if genre is provided
  let genreId = null;
  if (genre) {
    try {
      const genreQuery = 'SELECT id FROM genres WHERE name = ?';
      const genreResult = await pool.execute(genreQuery, [genre]);
      if (Array.isArray(genreResult[0]) && genreResult[0].length > 0) {
        genreId = (genreResult[0][0] as any).id;
      }
    } catch (error) {
      console.error('Error fetching genre:', error);
    }
  }

  // Get the admin user ID (wjparker@outlook.com)
  const userQuery = 'SELECT id FROM users WHERE email = ? AND is_admin = TRUE';
  const userResult = await pool.execute(userQuery, ['wjparker@outlook.com']);
  
  if (!Array.isArray(userResult[0]) || userResult[0].length === 0) {
    return ErrorHandler.handleAuthorizationError('Admin user not found');
  }
  
  const adminUserId = (userResult[0][0] as any).id;

  // Insert album into database
  const insertQuery = `
    INSERT INTO albums (title, artist, cover_image_url, genre_id, release_date, description, created_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
  `;
  
  const insertParams = [
    title,
    artist,
    coverImageUrl,
    genreId,
    releaseDate || null,
    description || null,
    adminUserId
  ];
  
  const result = await pool.execute(insertQuery, insertParams);
  const albumId = (result[0] as any).insertId;
  
  // Fetch the created album with all details
  const fetchQuery = `
    SELECT 
      a.id,
      a.title,
      a.artist,
      a.description,
      a.cover_image_url,
      a.genre_id,
      a.track_count,
      a.status,
      a.created_by,
      a.created_at,
      a.updated_at,
      g.name as genre_name,
      u.username as created_by_username
    FROM albums a 
    LEFT JOIN genres g ON a.genre_id = g.id 
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.id = ?
  `;
  
  const albumResult = await pool.execute(fetchQuery, [albumId]);
  const rawAlbum = Array.isArray(albumResult[0]) ? albumResult[0][0] : null;
  
  if (!rawAlbum) {
    return ErrorHandler.handleNotFoundError('Created album');
  }
  
  const sanitizedAlbum = DataTransformer.sanitizeAlbum({
    ...rawAlbum,
    genre_name: rawAlbum.genre_name
  });
  
  return NextResponse.json(
    createApiResponse(true, { 
      album: sanitizedAlbum,
      message: 'Album created successfully' 
    }),
    { status: 201 }
  );
});