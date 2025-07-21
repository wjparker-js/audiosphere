// Test the album stats API endpoint
async function testAlbumStatsAPI() {
  console.log('🌐 Testing Album Stats API Endpoint...\n');

  try {
    // Test with album ID 3 (Fat Boy Fat by Bill)
    const albumId = 3;
    const url = `http://localhost:3010/api/albums/${albumId}/stats`;
    
    console.log(`📡 Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API endpoint is working correctly!');
      console.log(`   - Total Plays: ${data.data.totalPlays} (formatted: ${data.data.formattedPlays})`);
      console.log(`   - Total Likes: ${data.data.totalLikes} (formatted: ${data.data.formattedLikes})`);
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoint:', error.message);
  }
}

// Run the test
testAlbumStatsAPI();