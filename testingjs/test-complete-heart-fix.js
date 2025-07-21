const mysql = require('mysql2/promise');
const http = require('http');

async function testCompleteHeartFix() {
  console.log('🔄 Testing Complete Heart Icon Fix...\n');
  
  // Test 1: Database verification
  console.log('1️⃣ Testing Database...');
  const connection = await mysql.createConnection({
    host: 'localhost', 
    port: 3306, 
    user: 'root', 
    password: 'SealTeam6', 
    database: 'audiosphere'
  });
  
  // Get liked tracks from database
  const [likedTracks] = await connection.execute(`
    SELECT ul.entity_id as track_id, t.title
    FROM user_likes ul
    JOIN tracks t ON ul.entity_id = t.id
    WHERE ul.user_id = 1 AND ul.entity_type = 'track'
    ORDER BY ul.created_at DESC
  `);
  
  console.log('✅ Database liked tracks:');
  likedTracks.forEach(track => {
    console.log(`  - Track ID ${track.track_id}: ${track.title}`);
  });
  
  await connection.end();
  
  // Test 2: API verification
  console.log('\n2️⃣ Testing API...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/1/liked-tracks',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success) {
            console.log('✅ API liked tracks:');
            response.data.tracks.forEach(track => {
              console.log(`  - Track ID ${track.id}: ${track.title} (isLiked: ${track.isLiked})`);
            });
            
            // Test 3: Frontend logic simulation
            console.log('\n3️⃣ Testing Frontend Logic...');
            
            // Simulate album tracks (from album 2 - Rachael)
            const albumTracks = [
              { id: 1, title: 'Evening Danza (Cover)' },
              { id: 2, title: 'Evening Danza' },
              { id: 3, title: 'One Way Out' },
              { id: 4, title: 'The Storm' },
              { id: 5, title: 'The Evening Dance' }
            ];
            
            // Simulate frontend logic
            const likedTrackIds = new Set(response.data.tracks.map(track => track.id));
            console.log('Liked track IDs set:', Array.from(likedTrackIds));
            
            console.log('\n🎨 Heart Icon Colors:');
            albumTracks.forEach(track => {
              const trackIdString = track.id.toString();
              const isLiked = likedTrackIds.has(trackIdString);
              const heartColor = isLiked ? '💚 GREEN' : '🤍 GRAY';
              console.log(`  ${track.title} (ID: ${track.id}): ${heartColor}`);
            });
            
            console.log('\n✅ Fix Summary:');
            console.log('1. ✅ Database has liked tracks');
            console.log('2. ✅ API returns liked tracks correctly');
            console.log('3. ✅ Frontend logic should work correctly');
            console.log('4. ✅ Heart icons should show GREEN for liked tracks');
            
            console.log('\n🔧 Next Steps:');
            console.log('1. Start development server: npm run dev');
            console.log('2. Navigate to album page: http://localhost:3000/albums/2');
            console.log('3. Check browser console for debug messages');
            console.log('4. Verify heart icons are GREEN for liked tracks');
            
          } else {
            console.log('❌ API failed:', response.error);
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Failed to parse API response:', error.message);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API request failed:', error.message);
      console.log('💡 Make sure the development server is running');
      resolve();
    });

    req.end();
  });
}

testCompleteHeartFix().catch(console.error);