const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
};

async function checkTracksTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to AudioSphere database');
    
    // Check tracks table structure
    const [tracksStructure] = await connection.execute('DESCRIBE tracks');
    console.log('\n🎵 Tracks table structure:');
    tracksStructure.forEach(column => {
      console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkTracksTable();