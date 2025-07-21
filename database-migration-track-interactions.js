const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to AudioSphere database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to database successfully');
    
    // 1. Create user_likes table
    console.log('🔄 Creating user_likes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        track_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_track (user_id, track_id),
        INDEX idx_user_likes_user_id (user_id),
        INDEX idx_user_likes_track_id (track_id),
        INDEX idx_user_likes_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ user_likes table created successfully');
    
    // 2. Check if play_count column exists in tracks table
    console.log('🔄 Checking tracks table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'audiosphere' 
      AND TABLE_NAME = 'tracks' 
      AND COLUMN_NAME = 'play_count'
    `);
    
    if (columns.length === 0) {
      console.log('🔄 Adding play_count column to tracks table...');
      await connection.execute(`
        ALTER TABLE tracks 
        ADD COLUMN play_count INT DEFAULT 0 NOT NULL
      `);
      console.log('✅ play_count column added successfully');
    } else {
      console.log('✅ play_count column already exists');
    }
    
    // 3. Add indexes for performance
    console.log('🔄 Adding performance indexes...');
    
    // Index for play_count (for popular tracks queries)
    try {
      await connection.execute(`
        CREATE INDEX idx_tracks_play_count ON tracks(play_count DESC)
      `);
      console.log('✅ Play count index created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Play count index already exists');
      } else {
        throw error;
      }
    }
    
    // Index for album_id (for album track queries)
    try {
      await connection.execute(`
        CREATE INDEX idx_tracks_album_id ON tracks(album_id)
      `);
      console.log('✅ Album ID index created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Album ID index already exists');
      } else {
        throw error;
      }
    }
    
    // 4. Update existing tracks to have play_count = 0 if NULL
    console.log('🔄 Updating existing tracks with default play counts...');
    const [updateResult] = await connection.execute(`
      UPDATE tracks 
      SET play_count = 0 
      WHERE play_count IS NULL
    `);
    console.log(`✅ Updated ${updateResult.affectedRows} tracks with default play counts`);
    
    // 5. Verify the migration
    console.log('🔄 Verifying migration...');
    
    // Check user_likes table
    const [userLikesCheck] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_likes
    `);
    console.log(`✅ user_likes table verified (${userLikesCheck[0].count} records)`);
    
    // Check tracks table structure
    const [tracksCheck] = await connection.execute(`
      SELECT COUNT(*) as count, 
             SUM(CASE WHEN play_count IS NOT NULL THEN 1 ELSE 0 END) as with_play_count
      FROM tracks
    `);
    console.log(`✅ tracks table verified (${tracksCheck[0].count} total tracks, ${tracksCheck[0].with_play_count} with play_count)`);
    
    // Show table structures
    console.log('\n📋 Final table structures:');
    
    const [userLikesStructure] = await connection.execute(`
      DESCRIBE user_likes
    `);
    console.log('\nuser_likes table structure:');
    console.table(userLikesStructure);
    
    const [tracksStructure] = await connection.execute(`
      DESCRIBE tracks
    `);
    console.log('\ntracks table structure (relevant columns):');
    const relevantColumns = tracksStructure.filter(col => 
      ['id', 'title', 'play_count', 'created_at', 'updated_at'].includes(col.Field)
    );
    console.table(relevantColumns);
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Implement track like/unlike API endpoints');
    console.log('2. Implement play count tracking API endpoint');
    console.log('3. Update frontend components to use new functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };