const mysql = require('mysql2/promise');

async function testLikedTracksQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost', 
    port: 3306, 
    user: 'root', 
    password: 'SealTeam6', 
    database: 'audiosphere'
  });
  
  console.log('🔄 Testing the exact query from the API...');
  
  try {
    const userId = 1;
    const limit = 20;
    const offset = 0;
    
    const [likedTracks] = await connection.execute(`
      SELECT 
        t.id,
        t.title,
        t.artist,
        t.album_title as album,
        t.duration,
        t.duration_seconds,
        t.play_count,
        t.file_path as audioUrl,
        a.cover_image_url as thumbnail,
        ul.created_at as liked_at
      FROM user_likes ul
      JOIN tracks t ON ul.entity_id = t.id
      LEFT JOIN albums a ON t.album_id = a.id
      WHERE ul.user_id = ? 
        AND ul.entity_type = 'track'
        AND t.status = 'published'
      ORDER BY ul.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
    
    console.log('✅ Query executed successfully');
    console.log('Results:', likedTracks.length, 'tracks');
    
    if (likedTracks.length > 0) {
      console.log('\nFirst result:');
      console.log(likedTracks[0]);
      
      console.log('\nAll liked track IDs:');
      likedTracks.forEach(track => {
        console.log(`- ID: ${track.id} (${track.title})`);
      });
    } else {
      console.log('\n❌ No liked tracks found');
      
      // Check if there are any user_likes at all
      const [allLikes] = await connection.execute(`
        SELECT * FROM user_likes WHERE user_id = ? AND entity_type = 'track'
      `, [userId]);
      
      console.log('Total user_likes for user 1:', allLikes.length);
      
      if (allLikes.length > 0) {
        console.log('Sample user_like:', allLikes[0]);
        
        // Check if the tracks exist
        const trackId = allLikes[0].entity_id;
        const [trackCheck] = await connection.execute(`
          SELECT * FROM tracks WHERE id = ?
        `, [trackId]);
        
        console.log('Track exists:', trackCheck.length > 0);
        if (trackCheck.length > 0) {
          console.log('Track status:', trackCheck[0].status);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
  }
  
  await connection.end();
}

testLikedTracksQuery().catch(console.error);