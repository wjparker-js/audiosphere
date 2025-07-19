const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

async function testTracksQuery() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test the exact query from the API
    const query = `
      SELECT 
        t.id,
        t.title,
        t.artist,
        t.album_title,
        t.track_number,
        t.duration,
        t.duration_seconds,
        t.file_path,
        t.play_count,
        t.status,
        t.created_at,
        t.updated_at,
        a.cover_image_url
      FROM tracks t
      LEFT JOIN albums a ON t.album_id = a.id
      WHERE t.status = 'published'
      ORDER BY t.play_count DESC, t.track_number ASC
      LIMIT 10 OFFSET 0
    `;
    
    console.log('🔍 Executing query...');
    const [tracks] = await connection.execute(query);
    
    console.log('📊 Query results:');
    console.log(`Found ${tracks.length} tracks`);
    
    if (tracks.length > 0) {
      console.log('First track:', tracks[0]);
    }
    
    // Test count query
    const countQuery = 'SELECT COUNT(*) as total FROM tracks WHERE status = "published"';
    const [countResult] = await connection.execute(countQuery);
    console.log('Total published tracks:', countResult[0].total);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTracksQuery();