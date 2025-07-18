import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/database';

// GET endpoint to fetch albums
export async function GET() {
  try {
    const query = `
      SELECT a.*, g.name as genre_name, u.username as created_by_username
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC 
      LIMIT 20
    `;
    
    const albums = await pool.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      albums: Array.isArray(albums[0]) ? albums[0] : [] 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

// POST endpoint to create new album
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { success: false, error: 'Title and artist are required' },
        { status: 400 }
      );
    }

    if (!coverImage) {
      return NextResponse.json(
        { success: false, error: 'Cover image is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(coverImage.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (coverImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 403 }
      );
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
      SELECT a.*, g.name as genre_name, u.username as created_by_username
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `;
    
    const albumResult = await pool.execute(fetchQuery, [albumId]);
    const album = Array.isArray(albumResult[0]) ? albumResult[0][0] : null;
    
    return NextResponse.json({ 
      success: true, 
      album,
      message: 'Album created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create album' },
      { status: 500 }
    );
  }
}