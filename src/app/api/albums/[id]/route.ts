import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [albums] = await connection.execute(
      `SELECT a.*, g.name as genre_name 
       FROM albums a 
       LEFT JOIN genres g ON a.genre_id = g.id 
       WHERE a.id = ? AND (a.deleted_at IS NULL OR a.deleted_at = '0000-00-00 00:00:00')`,
      [albumId]
    );

    await connection.end();

    if ((albums as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALBUM_NOT_FOUND',
            message: 'Album not found'
          }
        },
        { status: 404 }
      );
    }

    const album = (albums as any[])[0];
    
    return NextResponse.json({
      success: true,
      album: {
        id: album.id.toString(),
        title: album.title,
        artist: album.artist,
        cover_image_url: album.cover_image_url,
        genre: album.genre_name || album.genre,
        release_date: album.release_date,
        description: album.description,
        track_count: album.track_count,
        created_at: album.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch album'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const albumId = params.id;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if album exists and is not already deleted
    const [albums] = await connection.execute(
      'SELECT id, title FROM albums WHERE id = ? AND (deleted_at IS NULL OR deleted_at = "0000-00-00 00:00:00")',
      [albumId]
    );

    if ((albums as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Album not found or already deleted'
        },
        { status: 404 }
      );
    }

    // Soft delete the album by setting deleted_at timestamp
    const [result] = await connection.execute(
      'UPDATE albums SET deleted_at = NOW() WHERE id = ?',
      [albumId]
    );

    // Also soft delete all tracks in this album
    await connection.execute(
      'UPDATE tracks SET deleted_at = NOW() WHERE album_id = ?',
      [albumId]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete album'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Album has been marked as deleted and can be restored if needed'
    });

  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database error occurred while deleting album'
      },
      { status: 500 }
    );
  }
}