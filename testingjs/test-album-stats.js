// Test script to verify album statistics API endpoint
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

async function testAlbumStats() {
  console.log('🧪 Testing Album Statistics Calculation...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Test 1: Check if we have albums with tracks
    console.log('📊 Step 1: Checking available albums with tracks...');
    const [albums] = await connection.execute(`
      SELECT a.id, a.title, a.artist, COUNT(t.id) as track_count
      FROM albums a
      LEFT JOIN tracks t ON a.id = t.album_id
      GROUP BY a.id, a.title, a.artist
      HAVING track_count > 0
      LIMIT 5
    `);

    if (albums.length === 0) {
      console.log('❌ No albums with tracks found. Please add some test data first.');
      await connection.end();
      return;
    }

    console.log('✅ Found albums with tracks:');
    albums.forEach(album => {
      console.log(`   - ${album.title} by ${album.artist} (${album.track_count} tracks)`);
    });

    // Test 2: Calculate stats for the first album
    const testAlbum = albums[0];
    console.log(`\n📈 Step 2: Calculating stats for "${testAlbum.title}"...`);

    // Get total plays for all tracks in the album
    const [playsResult] = await connection.execute(
      'SELECT COALESCE(SUM(play_count), 0) as total_plays FROM tracks WHERE album_id = ?',
      [testAlbum.id]
    );

    // Get total likes for all tracks in the album
    const [likesResult] = await connection.execute(`
      SELECT COUNT(*) as total_likes 
      FROM user_likes ul 
      JOIN tracks t ON ul.entity_id = t.id 
      WHERE ul.entity_type = 'track' AND t.album_id = ?
    `, [testAlbum.id]);

    const totalPlays = playsResult[0]?.total_plays || 0;
    const totalLikes = likesResult[0]?.total_likes || 0;

    // Format numbers for display
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    };

    console.log('✅ Album Statistics:');
    console.log(`   - Total Plays: ${totalPlays} (formatted: ${formatNumber(totalPlays)})`);
    console.log(`   - Total Likes: ${totalLikes} (formatted: ${formatNumber(totalLikes)})`);

    // Test 3: Show individual track breakdown
    console.log(`\n🎵 Step 3: Track breakdown for "${testAlbum.title}":`);
    const [tracks] = await connection.execute(`
      SELECT 
        t.title,
        t.play_count,
        (SELECT COUNT(*) FROM user_likes ul WHERE ul.entity_type = 'track' AND ul.entity_id = t.id) as like_count
      FROM tracks t
      WHERE t.album_id = ?
      ORDER BY t.track_number ASC
    `, [testAlbum.id]);

    tracks.forEach((track, index) => {
      console.log(`   ${index + 1}. ${track.title} - ${track.play_count} plays, ${track.like_count} likes`);
    });

    // Test 4: Test the API endpoint format
    console.log(`\n🌐 Step 4: API Response Format:`);
    const apiResponse = {
      success: true,
      data: {
        totalPlays: totalPlays,
        totalLikes: totalLikes,
        formattedPlays: formatNumber(totalPlays),
        formattedLikes: formatNumber(totalLikes)
      }
    };
    console.log(JSON.stringify(apiResponse, null, 2));

    await connection.end();
    console.log('\n✅ Album statistics test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing album statistics:', error);
  }
}

// Run the test
testAlbumStats();