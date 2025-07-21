const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function testPlaylistsAPI() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Test the exact API query for user 1 playlists
    console.log('\n🧪 Testing API query for user 1 playlists:');
    const userId = 1;
    
    const [playlists] = await connection.execute(`
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
    
    console.log('API Query Results:');
    console.table(playlists);
    
    // Transform like the API does
    const sanitizedPlaylists = playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || null,
      isPublic: Boolean(playlist.is_public),
      userId: playlist.user_id,
      trackCount: playlist.track_count,
      ownerName: playlist.owner_name || 'Unknown User',
      createdAt: playlist.created_at,
      updatedAt: playlist.updated_at
    }));
    
    console.log('\n🎵 Transformed Playlists (as API would return):');
    console.table(sanitizedPlaylists);
    
    console.log('\n📊 Summary:');
    console.log(`Found ${sanitizedPlaylists.length} playlists for user ${userId}`);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testPlaylistsAPI();