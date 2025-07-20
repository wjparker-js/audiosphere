const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function testLibraryAPIFixed() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Test the EXACT same query that the fixed API uses
    const userId = '1';
    const filter = 'all';
    const search = '';
    const sortBy = 'date';
    const sortOrder = 'desc';
    const page = 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause for search (same as API)
    const searchCondition = search 
      ? `AND (title LIKE ? OR artist LIKE ? OR description LIKE ?)` 
      : '';
    const searchParams_array = search 
      ? [`%${search}%`, `%${search}%`, `%${search}%`] 
      : [];

    // Build ORDER BY clause (same as API)
    const orderByMap = {
      'date': 'created_at',
      'title': 'title',
      'modified': 'updated_at'
    };
    const orderBy = orderByMap[sortBy] || 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    console.log('\n🧪 Testing FIXED album query:');
    
    // Test albums query (EXACT same as fixed API)
    if (filter === 'all' || filter === 'albums') {
      const albumQuery = `
        SELECT a.*, g.name as genre_name,
               (SELECT COUNT(*) FROM tracks WHERE album_id = a.id) as track_count
        FROM albums a 
        LEFT JOIN genres g ON a.genre_id = g.id 
        WHERE a.created_by = ? ${searchCondition}
        ORDER BY a.` + orderBy + ` ` + order + `
        LIMIT ? OFFSET ?
      `;
      
      const albumParams = [parseInt(userId), ...searchParams_array, limit, offset];
      console.log('📝 Album Query:', albumQuery.replace(/\s+/g, ' ').trim());
      console.log('📝 Album Parameters:', albumParams);
      
      const [albumResults] = await connection.execute(albumQuery, albumParams);
      
      console.log('\n🎵 Album Results:');
      console.table(albumResults);
      
      // Transform like API does
      const albums = albumResults.map(row => ({
        id: row.id.toString(),
        type: 'album',
        title: row.title,
        artist: row.artist,
        coverArt: row.cover_image_url || '',
        trackCount: row.track_count || 0,
        genre: row.genre_name || 'Unknown',
        status: row.status || 'published',
        description: row.description,
        userId: row.created_by.toString()
      }));
      
      console.log('\n🎵 Transformed Albums:');
      console.table(albums);
    }

    // Test playlists query
    if (filter === 'all' || filter === 'playlists') {
      const playlistQuery = `
        SELECT p.*,
               (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
        FROM playlists p 
        WHERE p.user_id = ? ${searchCondition}
        ORDER BY p.` + orderBy + ` ` + order + `
        LIMIT ? OFFSET ?
      `;
      
      const playlistParams = [userId, ...searchParams_array, limit, offset];
      console.log('\n📝 Playlist Query:', playlistQuery.replace(/\s+/g, ' ').trim());
      console.log('📝 Playlist Parameters:', playlistParams);
      
      const [playlistResults] = await connection.execute(playlistQuery, playlistParams);
      
      console.log('\n🎵 Playlist Results:');
      console.table(playlistResults);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testLibraryAPIFixed();