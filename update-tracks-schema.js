const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
};

async function updateTracksSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to AudioSphere database');
    
    // Add missing columns to tracks table
    const alterQueries = [
      `ALTER TABLE tracks ADD COLUMN album_title VARCHAR(255) AFTER album_id`,
      `ALTER TABLE tracks ADD COLUMN duration_seconds INT AFTER duration`
    ];
    
    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('✅ Updated tracks table schema');
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.error('Error updating schema:', error.message);
        }
      }
    }
    
    console.log('🎉 Tracks table schema updated successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

updateTracksSchema();