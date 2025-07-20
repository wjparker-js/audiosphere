import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { LibraryData, Album, Playlist, BlogPost, FilterType } from '@/types/library';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = params.userId;
    
    // Parse query parameters
    const filter = (searchParams.get('filter') as FilterType) || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'date';
    const sortOrder = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build WHERE clause for search
    const searchCondition = search 
      ? `AND (title LIKE ? OR artist LIKE ? OR description LIKE ?)` 
      : '';
    const searchParams_array = search 
      ? [`%${search}%`, `%${search}%`, `%${search}%`] 
      : [];

    // Build ORDER BY clause
    const orderByMap: Record<string, string> = {
      'date': 'created_at',
      'title': 'title',
      'modified': 'updated_at'
    };
    const orderBy = orderByMap[sortBy] || 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let albums: Album[] = [];
    let playlists: Playlist[] = [];
    let blogPosts: BlogPost[] = [];

    // Fetch albums (for admin users or if filter includes albums)
    if (filter === 'all' || filter === 'albums') {
      const albumQuery = `
        SELECT a.*, g.name as genre_name,
               (SELECT COUNT(*) FROM tracks WHERE album_id = a.id) as track_count
        FROM albums a 
        LEFT JOIN genres g ON a.genre_id = g.id 
        WHERE a.created_by = ? ${searchCondition}
        ORDER BY a.` + orderBy + ` ` + order + `
        LIMIT ` + limit + ` OFFSET ` + offset + `
      `;
      
      const albumParams = [userId, ...searchParams_array];
      const albumResults = await executeQuery(albumQuery, albumParams) as any[];

      albums = albumResults.map(row => ({
        id: row.id.toString(),
        type: 'album' as const,
        title: row.title,
        artist: row.artist,
        coverArt: row.cover_image_url || '',
        trackCount: row.track_count || 0,
        genre: row.genre_name || 'Unknown',
        status: row.status || 'published',
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.created_by.toString()
      }));
    }

    // Fetch playlists
    if (filter === 'all' || filter === 'playlists') {
      const playlistQuery = `
        SELECT p.*,
               (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
        FROM playlists p 
        WHERE p.user_id = ? ${searchCondition}
        ORDER BY p.` + orderBy + ` ` + order + `
        LIMIT ` + limit + ` OFFSET ` + offset + `
      `;
      
      const playlistParams = [userId, ...searchParams_array];
      const playlistResults = await executeQuery(playlistQuery, playlistParams) as any[];

      playlists = playlistResults.map(row => ({
        id: row.id.toString(),
        type: 'playlist' as const,
        title: row.name,
        description: row.description,
        coverArt: row.cover_image_url,
        trackCount: row.track_count || 0,
        isPublic: row.is_public || false,
        lastPlayed: row.last_played ? new Date(row.last_played) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.user_id.toString()
      }));
    }

    // Fetch blog posts
    if (filter === 'all' || filter === 'blogs') {
      const blogQuery = `
        SELECT bp.*,
               (SELECT COUNT(*) FROM comments WHERE blog_post_id = bp.id) as comment_count
        FROM blog_posts bp 
        WHERE bp.user_id = ? ${searchCondition}
        ORDER BY bp.` + orderBy + ` ` + order + `
        LIMIT ` + limit + ` OFFSET ` + offset + `
      `;
      
      const blogParams = [userId, ...searchParams_array];
      const blogResults = await executeQuery(blogQuery, blogParams) as any[];

      blogPosts = blogResults.map(row => ({
        id: row.id.toString(),
        type: 'blog' as const,
        title: row.title,
        excerpt: row.excerpt || row.content?.substring(0, 150) + '...',
        featuredImage: row.featured_image_url,
        status: row.status || 'draft',
        publishedAt: row.published_at ? new Date(row.published_at) : undefined,
        viewCount: row.view_count || 0,
        commentCount: row.comment_count || 0,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.user_id.toString()
      }));
    }

    // Get counts for each content type
    const [albumCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM albums WHERE created_by = ?',
      [userId]
    ) as any[];
    
    const [playlistCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM playlists WHERE user_id = ?',
      [userId]
    ) as any[];
    
    const [blogCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM blog_posts WHERE user_id = ?',
      [userId]
    ) as any[];

    const counts = {
      albums: albumCount.count || 0,
      playlists: playlistCount.count || 0,
      blogs: blogCount.count || 0,
      all: (albumCount.count || 0) + (playlistCount.count || 0) + (blogCount.count || 0)
    };

    // Calculate total items for pagination
    const totalItems = filter === 'all' 
      ? counts.all
      : filter === 'albums' 
        ? counts.albums
        : filter === 'playlists'
          ? counts.playlists
          : counts.blogs;

    const response: LibraryData = {
      albums,
      playlists,
      blogPosts,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit)
      },
      counts
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Library API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'server',
          message: 'Failed to fetch library content'
        }
      },
      { status: 500 }
    );
  }
}