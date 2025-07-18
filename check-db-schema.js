const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
};

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to AudioSphere database');
    
    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Check if albums table exists
    const [albumsCheck] = await connection.execute("SHOW TABLES LIKE 'albums'");
    if (albumsCheck.length > 0) {
      console.log('\n🎵 Albums table structure:');
      const [albumsStructure] = await connection.execute('DESCRIBE albums');
      albumsStructure.forEach(column => {
        console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
    } else {
      console.log('\n❌ Albums table does not exist');
    }
    
    // Check if users table exists
    const [usersCheck] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (usersCheck.length > 0) {
      console.log('\n👥 Users table structure:');
      const [usersStructure] = await connection.execute('DESCRIBE users');
      usersStructure.forEach(column => {
        console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
    } else {
      console.log('\n❌ Users table does not exist');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkSchema();