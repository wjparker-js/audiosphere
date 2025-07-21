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

    // Get total plays for all tracks in the album
    const [playsResult] = await connection.execute(
      'SELECT COALESCE(SUM(play_count), 0) as total_plays FROM tracks WHERE album_id = ?',
      [albumId]
    );

    // Get total likes for all tracks in the album
    const [likesResult] = await connection.execute(
      `SELECT COUNT(*) as total_likes 
       FROM user_likes ul 
       JOIN tracks t ON ul.entity_id = t.id 
       WHERE ul.entity_type = 'track' AND t.album_id = ?`,
      [albumId]
    );

    await connection.end();

    const totalPlays = (playsResult as any)[0]?.total_plays || 0;
    const totalLikes = (likesResult as any)[0]?.total_likes || 0;

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    };

    return NextResponse.json({
      success: true,
      data: {
        totalPlays: Number(totalPlays),
        totalLikes: Number(totalLikes),
        formattedPlays: formatNumber(Number(totalPlays)),
        formattedLikes: formatNumber(Number(totalLikes))
      }
    });

  } catch (error) {
    console.error('Error fetching album stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch album statistics'
        }
      },
      { status: 500 }
    );
  }
}