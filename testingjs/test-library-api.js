// Using built-in fetch (Node 18+)

async function testLibraryAPI() {
  try {
    console.log('🧪 Testing Library API for user 1...\n');
    
    const response = await fetch('http://localhost:3000/api/users/1/library?filter=all');
    
    if (!response.ok) {
      console.error('❌ API Response not OK:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('Success:', data.success);
    console.log('Albums count:', data.data?.albums?.length || 0);
    console.log('Playlists count:', data.data?.playlists?.length || 0);
    console.log('Blog posts count:', data.data?.blogPosts?.length || 0);
    
    if (data.data?.albums?.length > 0) {
      console.log('\n🎵 Albums returned:');
      data.data.albums.forEach((album, index) => {
        console.log(`${index + 1}. ${album.title} by ${album.artist} (ID: ${album.id})`);
      });
    } else {
      console.log('\n❌ No albums returned from API');
    }
    
    console.log('\n📈 Counts:', data.data?.counts);
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testLibraryAPI();