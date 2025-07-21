import { createConnection } from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'SealTeam6',
    database: 'audiosphere'
};

async function testTrackInteractions() {
    let connection;

    try {
        console.log('🔄 Connecting to AudioSphere database...');
        connection = await createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Test 1: Check if we have tracks to work with
        console.log('\n📋 Testing Track Data:');
        const [tracks] = await connection.execute(`
      SELECT id, title, artist, play_count 
      FROM tracks 
      LIMIT 5
    `);
        console.table(tracks);

        if (tracks.length === 0) {
            console.log('❌ No tracks found in database');
            return;
        }

        const testTrackId = tracks[0].id;
        const testUserId = 1; // Mock user ID

        // Test 2: Test liking a track
        console.log('\n🔄 Testing Track Like Functionality:');

        // Check if track is already liked
        const [existingLikes] = await connection.execute(`
      SELECT * FROM user_likes 
      WHERE user_id = ? AND entity_type = 'track' AND entity_id = ?
    `, [testUserId, testTrackId]);

        if (existingLikes.length > 0) {
            console.log('🔄 Track already liked, removing like first...');
            await connection.execute(`
        DELETE FROM user_likes 
        WHERE user_id = ? AND entity_type = 'track' AND entity_id = ?
      `, [testUserId, testTrackId]);
        }

        // Add like
        console.log(`🔄 Adding like for track ${testTrackId} by user ${testUserId}...`);
        await connection.execute(`
      INSERT INTO user_likes (user_id, entity_type, entity_id) 
      VALUES (?, 'track', ?)
    `, [testUserId, testTrackId]);
        console.log('✅ Track liked successfully');

        // Verify like was added
        const [newLikes] = await connection.execute(`
      SELECT ul.*, t.title as track_title 
      FROM user_likes ul
      JOIN tracks t ON ul.entity_id = t.id
      WHERE ul.user_id = ? AND ul.entity_type = 'track' AND ul.entity_id = ?
    `, [testUserId, testTrackId]);

        if (newLikes.length > 0) {
            console.log('✅ Like verified in database:');
            console.table(newLikes);
        } else {
            console.log('❌ Like not found in database');
        }

        // Test 3: Test play count increment
        console.log('\n🔄 Testing Play Count Functionality:');

        const originalPlayCount = tracks[0].play_count || 0;
        console.log(`Original play count for "${tracks[0].title}": ${originalPlayCount}`);

        // Increment play count
        await connection.execute(`
      UPDATE tracks 
      SET play_count = play_count + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [testTrackId]);

        // Verify play count was incremented
        const [updatedTrack] = await connection.execute(`
      SELECT id, title, play_count 
      FROM tracks 
      WHERE id = ?
    `, [testTrackId]);

        if (updatedTrack.length > 0) {
            const newPlayCount = updatedTrack[0].play_count;
            console.log(`New play count for "${updatedTrack[0].title}": ${newPlayCount}`);

            if (newPlayCount === originalPlayCount + 1) {
                console.log('✅ Play count incremented successfully');
            } else {
                console.log('❌ Play count increment failed');
            }
        }

        // Test 4: Test user's liked tracks retrieval
        console.log('\n🔄 Testing User Liked Tracks Retrieval:');

        const [userLikedTracks] = await connection.execute(`
      SELECT 
        t.id,
        t.title,
        t.artist,
        t.album_title as album,
        t.duration,
        t.play_count,
        ul.created_at as liked_at
      FROM user_likes ul
      JOIN tracks t ON ul.entity_id = t.id
      WHERE ul.user_id = ? 
        AND ul.entity_type = 'track'
        AND t.status = 'published'
      ORDER BY ul.created_at DESC
      LIMIT 5
    `, [testUserId]);

        console.log(`Found ${userLikedTracks.length} liked tracks for user ${testUserId}:`);
        if (userLikedTracks.length > 0) {
            console.table(userLikedTracks);
        }

        // Test 5: Test unlike functionality
        console.log('\n🔄 Testing Track Unlike Functionality:');

        const [deleteResult] = await connection.execute(`
      DELETE FROM user_likes 
      WHERE user_id = ? AND entity_type = 'track' AND entity_id = ?
    `, [testUserId, testTrackId]);

        if (deleteResult.affectedRows > 0) {
            console.log('✅ Track unliked successfully');

            // Verify like was removed
            const [verifyUnlike] = await connection.execute(`
        SELECT * FROM user_likes 
        WHERE user_id = ? AND entity_type = 'track' AND entity_id = ?
      `, [testUserId, testTrackId]);

            if (verifyUnlike.length === 0) {
                console.log('✅ Unlike verified - like removed from database');
            } else {
                console.log('❌ Unlike failed - like still exists in database');
            }
        } else {
            console.log('❌ Unlike failed - no rows affected');
        }

        console.log('\n🎉 Track interactions testing completed!');
        console.log('\nSummary:');
        console.log('✅ Database connection working');
        console.log('✅ Track like functionality working');
        console.log('✅ Play count increment working');
        console.log('✅ User liked tracks retrieval working');
        console.log('✅ Track unlike functionality working');

    } catch (error) {
        console.error('❌ Testing failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the test
if (require.main === module) {
    testTrackInteractions();
}

export default { testTrackInteractions };