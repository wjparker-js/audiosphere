import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
  charset: 'utf8mb4',
  timezone: 'Z',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

export default pool;

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to AudioSphere database');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Database query helper with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get user by ID (example query)
export async function getUserById(userId: number) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const results = await executeQuery(query, [userId]);
  return Array.isArray(results) ? results[0] : null;
}

// Get albums with pagination
export async function getAlbums(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT a.*, g.name as genre_name 
    FROM albums a 
    LEFT JOIN genres g ON a.genre_id = g.id 
    ORDER BY a.created_at DESC 
    LIMIT ? OFFSET ?
  `;
  return await executeQuery(query, [limit, offset]);
}

// Get popular tracks
export async function getPopularTracks(limit: number = 10) {
  const query = `
    SELECT t.*, a.title as album_title, a.cover_image_url 
    FROM tracks t 
    JOIN albums a ON t.album_id = a.id 
    ORDER BY t.play_count DESC 
    LIMIT ?
  `;
  return await executeQuery(query, [limit]);
}

// Get user's recently played tracks
export async function getRecentlyPlayed(userId: number, limit: number = 10) {
  const query = `
    SELECT t.*, a.title as album_title, a.cover_image_url, ae.created_at as played_at
    FROM analytics_events ae
    JOIN tracks t ON ae.entity_id = t.id
    JOIN albums a ON t.album_id = a.id
    WHERE ae.user_id = ? AND ae.event_type = 'track_play' AND ae.entity_type = 'track'
    ORDER BY ae.created_at DESC
    LIMIT ?
  `;
  return await executeQuery(query, [userId, limit]);
}

// Get blog posts
export async function getBlogPosts(limit: number = 6) {
  const query = `
    SELECT bp.*, u.username as author_name
    FROM blog_posts bp
    JOIN users u ON bp.user_id = u.id
    WHERE bp.status = 'published'
    ORDER BY bp.published_at DESC
    LIMIT ?
  `;
  return await executeQuery(query, [limit]);
}