const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function checkPlaylists() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Check all playlists
    console.log('\n🎵 All playlists in database:');
    const [allPlaylists] = await connection.execute(`
      SELECT p.*, u.email as creator_email,
             (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p 
      LEFT JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    console.table(allPlaylists);
    
    // Check playlists for user 1
    console.log('\n🎵 Playlists created by user 1:');
    const [user1Playlists] = await connection.execute(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p 
      WHERE p.user_id = 1 
      ORDER BY p.created_at DESC
    `);
    console.table(user1Playlists);
    
    // Check playlist table structure
    console.log('\n📋 Playlist table structure:');
    const [structure] = await connection.execute('DESCRIBE playlists');
    console.table(structure);
    
    // Test the exact API query for playlists
    console.log('\n🧪 Testing API query for user 1 playlists:');
    const [apiResults] = await connection.execute(`
      SELECT p.*,
             (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p 
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [1, 20, 0]);
    
    console.log('API Query Results:');
    console.table(apiResults);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkPlaylists();