const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4'
};

async function testSimpleQuery() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Test the simplest possible query first
    console.log('\n🧪 Testing simple album query:');
    const simpleQuery = `
      SELECT a.*, g.name as genre_name
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
    `;
    
    const [simpleResults] = await connection.execute(simpleQuery, [1]);
    console.log('Simple query results:');
    console.table(simpleResults);
    
    // Test with LIMIT
    console.log('\n🧪 Testing query with LIMIT:');
    const limitQuery = `
      SELECT a.*, g.name as genre_name
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `;
    
    const [limitResults] = await connection.execute(limitQuery, [1, 20]);
    console.log('Limit query results:');
    console.table(limitResults);
    
    // Test with LIMIT and OFFSET using string concatenation (like the fixed API)
    console.log('\n🧪 Testing query with LIMIT and OFFSET (string concatenation):');
    const limit = 20;
    const offset = 0;
    const offsetQuery = `
      SELECT a.*, g.name as genre_name
      FROM albums a 
      LEFT JOIN genres g ON a.genre_id = g.id 
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
      LIMIT ` + limit + ` OFFSET ` + offset + `
    `;
    
    const [offsetResults] = await connection.execute(offsetQuery, [1]);
    console.log('Fixed offset query results:');
    console.table(offsetResults);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testSimpleQuery();