const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

// Simulate the exact API logic
async function testAPILogic() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    const userId = '1';
    const filter = 'all';
    const search = '';
    const sortBy = 'date';
    const sortOrder = 'desc';
    const page = 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause for search
    const searchCondition = search 
      ? `AND (title LIKE ? OR artist LIKE ? OR description LIKE ?)` 
      : '';
    const searchParams_array = search 
      ? [`%${search}%`, `%${search}%`, `%${search}%`] 
      : [];

    // Build ORDER BY clause
    const orderByMap = {
      'date': 'created_at',
      'title': 'title',
      'modified': 'updated_at'
    };
    const orderBy = orderByMap[sortBy] || 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    console.log('\n🧪 Testing album query with exact API parameters:');
    console.log('userId:', userId);
    console.log('filter:', filter);
    console.log('orderBy:', orderBy);
    console.log('order:', order);
    console.log('limit:', limit);
    console.log('offset:', offset);

    // Test albums query (exact same as API)
    if (filter === 'all' || filter === 'albums') {
      const albumQuery = `
        SELECT a.*, g.name as genre_name,
               (SELECT COUNT(*) FROM tracks WHERE album_id = a.id) as track_count
        FROM albums a 
        LEFT JOIN genres g ON a.genre_id = g.id 
        WHERE a.created_by = ? ${searchCondition}
        ORDER BY a.${orderBy} ${order}
        LIMIT ? OFFSET ?
      `;
      
      console.log('\n📝 Album Query:', albumQuery);
      console.log('📝 Query Parameters:', [userId, ...searchParams_array, limit, offset]);
      
      const queryParams = [userId, ...searchParams_array, limit, offset];
      console.log('📝 Final Query Parameters:', queryParams);
      
      const [albumResults] = await connection.execute(albumQuery, queryParams);

      console.log('\n🎵 Raw Album Results:');
      console.table(albumResults);

      // Transform results like the API does
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
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.created_by.toString()
      }));

      console.log('\n🎵 Transformed Albums (as API would return):');
      console.table(albums);
    }

    // Get counts
    const [albumCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM albums WHERE created_by = ?',
      [userId]
    );
    
    console.log('\n📊 Album Count:', albumCount[0].count);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testAPILogic();