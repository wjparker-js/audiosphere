const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function testFinalFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Test the EXACT same query that the FIXED API uses
    console.log('\n🧪 Testing FIXED API query:');
    const userId = 1;
    const limit = 20;
    const offset = 0;
    const orderBy = 'created_at';
    const order = 'DESC';
    const searchCondition = ''; // No search
    const searchParams_array = []; // No search params
    
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
    
    console.log('📝 Final Query:', albumQuery.replace(/\s+/g, ' ').trim());
    console.log('📝 Final Parameters:', albumParams);
    
    const [albumResults] = await connection.execute(albumQuery, albumParams);
    
    console.log('\n🎵 SUCCESS! Album Results:');
    console.table(albumResults);
    
    // Test playlists too
    console.log('\n🧪 Testing FIXED playlist query:');
    const playlistQuery = `
      SELECT p.*,
             (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p 
      WHERE p.user_id = ? ${searchCondition}
      ORDER BY p.` + orderBy + ` ` + order + `
      LIMIT ` + limit + ` OFFSET ` + offset + `
    `;
    
    const playlistParams = [userId, ...searchParams_array];
    
    console.log('📝 Playlist Query:', playlistQuery.replace(/\s+/g, ' ').trim());
    console.log('📝 Playlist Parameters:', playlistParams);
    
    const [playlistResults] = await connection.execute(playlistQuery, playlistParams);
    
    console.log('\n🎵 SUCCESS! Playlist Results:');
    console.table(playlistResults);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testFinalFix();