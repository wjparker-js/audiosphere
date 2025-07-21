const mysql = require('mysql2/promise');

async function debugLikedTracks() {
  const connection = await mysql.createConnection({
    host: 'localhost', 
    port: 3306, 
    user: 'root', 
    password: 'SealTeam6', 
    database: 'audiosphere'
  });
  
  console.log('🔍 Debugging Liked Tracks Issue...\n');
  
  // Check liked tracks data
  const [likedTracks] = await connection.execute(`
    SELECT ul.entity_id, t.id, t.title
    FROM user_likes ul
    JOIN tracks t ON ul.entity_id = t.id
    WHERE ul.user_id = 1 AND ul.entity_type = 'track'
    LIMIT 5
  `);
  
  console.log('📋 Liked Tracks from Database:');
  likedTracks.forEach(track => {
    console.log(`- Track ID: ${track.id} (type: ${typeof track.id})`);
    console.log(`- Entity ID: ${track.entity_id} (type: ${typeof track.entity_id})`);
    console.log(`- Title: ${track.title}`);
    console.log('---');
  });
  
  // Check album tracks data
  const [albumTracks] = await connection.execute(`
    SELECT id, title FROM tracks WHERE album_id = 2 LIMIT 5
  `);
  
  console.log('\n📋 Album Tracks from Database:');
  albumTracks.forEach(track => {
    console.log(`- Track ID: ${track.id} (type: ${typeof track.id})`);
    console.log(`- Title: ${track.title}`);
    console.log('---');
  });
  
  // Simulate the frontend logic
  console.log('\n🔍 Simulating Frontend Logic:');
  const likedTrackIds = new Set(likedTracks.map(track => track.id.toString()));
  console.log('Liked Track IDs Set:', Array.from(likedTrackIds));
  
  albumTracks.forEach(track => {
    const trackIdString = track.id.toString();
    const isLiked = likedTrackIds.has(trackIdString);
    console.log(`Track "${track.title}" (ID: ${track.id}): isLiked = ${isLiked}`);
  });
  
  await connection.end();
}

debugLikedTracks().catch(console.error);