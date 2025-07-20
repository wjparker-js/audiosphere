const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function checkUserAlbums() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Test the exact query that the API uses
    console.log('\n🧪 Testing API query for user 1:');
    const [apiResults] = await connection.execute(`
      SELECT a.*, g.name as genre_name,
             (SELECT COUNT(*) FROM tracks WHERE album_id = a.id) as track_count
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
    `, [1]);
    
    console.log('API Query Results:');
    console.table(apiResults);
    
    // Check album structure
    console.log('\n📋 Album table structure:');
    const [structure] = await connection.execute('DESCRIBE albums');
    console.table(structure);
    
    // Check if there are any tracks for these albums
    console.log('\n🎵 Tracks for user 1 albums:');
    const [tracks] = await connection.execute(`
      SELECT t.id, t.title, t.album_id, a.title as album_title
      FROM tracks t
      JOIN albums a ON t.album_id = a.id
      WHERE a.created_by = 1
    `);
    console.table(tracks);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkUserAlbums();