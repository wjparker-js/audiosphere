const http = require('http');

function testAPI() {
  console.log('🔄 Testing API endpoints directly...\n');
  
  // Test liked tracks API
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
        console.log('✅ Liked Tracks API Response:');
        console.log('Status:', res.statusCode);
        console.log('Success:', response.success);
        
        if (response.success && response.data.tracks.length > 0) {
          console.log('Track count:', response.data.tracks.length);
          console.log('\nFirst liked track:');
          const firstTrack = response.data.tracks[0];
          console.log('- ID:', firstTrack.id, '(type:', typeof firstTrack.id, ')');
          console.log('- Title:', firstTrack.title);
          console.log('- isLiked:', firstTrack.isLiked);
          
          console.log('\nAll liked track IDs:');
          response.data.tracks.forEach(track => {
            console.log(`- ${track.id} (${track.title})`);
          });
        } else {
          console.log('No liked tracks found or API failed');
          console.log('Response:', response);
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API request failed:', error.message);
    console.log('💡 Make sure the development server is running on http://localhost:3000');
    console.log('💡 Run: npm run dev');
  });

  req.end();
}

testAPI();