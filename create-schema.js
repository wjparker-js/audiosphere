const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere',
};

async function createSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to AudioSphere database');
    
    // Create users table first (referenced by albums)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_image_url VARCHAR(500),
        is_admin BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_admin (is_admin)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createUsersTable);
    console.log('✅ Users table created');
    
    // Create genres table
    const createGenresTable = `
      CREATE TABLE IF NOT EXISTS genres (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        popularity_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_popularity (popularity_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createGenresTable);
    console.log('✅ Genres table created');
    
    // Create albums table
    const createAlbumsTable = `
      CREATE TABLE IF NOT EXISTS albums (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        cover_image_url VARCHAR(500),
        genre_id INT,
        release_date DATE,
        description TEXT,
        status ENUM('published', 'draft', 'private') DEFAULT 'published',
        track_count INT DEFAULT 0,
        total_duration INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL,
        INDEX idx_artist (artist),
        INDEX idx_genre (genre_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at DESC),
        INDEX idx_created_by (created_by),
        FULLTEXT INDEX ft_search (title, artist, description)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createAlbumsTable);
    console.log('✅ Albums table created');
    
    // Create tracks table
    const createTracksTable = `
      CREATE TABLE IF NOT EXISTS tracks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        album_id INT NOT NULL,
        track_number INT,
        duration INT,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        play_count INT DEFAULT 0,
        status ENUM('published', 'draft', 'private') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
        INDEX idx_album (album_id),
        INDEX idx_track_number (track_number),
        INDEX idx_play_count (play_count DESC),
        INDEX idx_status (status),
        FULLTEXT INDEX ft_track_search (title, artist)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTracksTable);
    console.log('✅ Tracks table created');
    
    // Create playlists table
    const createPlaylistsTable = `
      CREATE TABLE IF NOT EXISTS playlists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url VARCHAR(500),
        is_public BOOLEAN DEFAULT TRUE,
        user_id INT NOT NULL,
        track_count INT DEFAULT 0,
        total_duration INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_public (is_public),
        INDEX idx_created_at (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createPlaylistsTable);
    console.log('✅ Playlists table created');
    
    // Create playlist_tracks junction table
    const createPlaylistTracksTable = `
      CREATE TABLE IF NOT EXISTS playlist_tracks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        playlist_id INT NOT NULL,
        track_id INT NOT NULL,
        position INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_playlist_track (playlist_id, track_id),
        INDEX idx_playlist (playlist_id),
        INDEX idx_track (track_id),
        INDEX idx_position (position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createPlaylistTracksTable);
    console.log('✅ Playlist tracks table created');
    
    // Create blog_posts table
    const createBlogPostsTable = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        featured_image_url VARCHAR(500),
        status ENUM('published', 'draft', 'private') DEFAULT 'draft',
        published_at TIMESTAMP NULL,
        user_id INT NOT NULL,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_published_at (published_at DESC),
        INDEX idx_user (user_id),
        FULLTEXT INDEX ft_blog_search (title, content, excerpt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createBlogPostsTable);
    console.log('✅ Blog posts table created');
    
    // Create comments table
    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT NOT NULL,
        user_id INT NOT NULL,
        blog_post_id INT NOT NULL,
        parent_comment_id INT NULL,
        comment_level TINYINT DEFAULT 1 CHECK (comment_level <= 2),
        status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        INDEX idx_blog_post (blog_post_id),
        INDEX idx_user (user_id),
        INDEX idx_parent (parent_comment_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createCommentsTable);
    console.log('✅ Comments table created');
    
    // Create user_likes table
    const createUserLikesTable = `
      CREATE TABLE IF NOT EXISTS user_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        entity_type ENUM('track', 'album', 'playlist', 'blog_post') NOT NULL,
        entity_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_like (user_id, entity_type, entity_id),
        INDEX idx_user (user_id),
        INDEX idx_entity (entity_type, entity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createUserLikesTable);
    console.log('✅ User likes table created');
    
    // Create analytics_events table
    const createAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        event_type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        metadata JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_event_type (event_type),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createAnalyticsTable);
    console.log('✅ Analytics events table created');
    
    // Insert admin users
    const insertAdminUsers = `
      INSERT IGNORE INTO users (email, username, password_hash, first_name, last_name, is_admin, is_verified) VALUES
      ('wjparker@outlook.com', 'wjparker', '$2b$12$dummy.hash.for.development.only', 'William', 'Parker', TRUE, TRUE),
      ('ghodgett59@gmail.com', 'ghodgett59', '$2b$12$dummy.hash.for.development.only', 'G', 'Hodgett', TRUE, TRUE);
    `;
    
    await connection.execute(insertAdminUsers);
    console.log('✅ Admin users inserted');
    
    // Insert default genres
    const insertGenres = `
      INSERT IGNORE INTO genres (name, slug, popularity_order) VALUES
      ('Pop', 'pop', 1),
      ('Rock', 'rock', 2),
      ('Hip Hop', 'hip-hop', 3),
      ('R&B', 'rnb', 4),
      ('Country', 'country', 5),
      ('Electronic', 'electronic', 6),
      ('Jazz', 'jazz', 7),
      ('Classical', 'classical', 8),
      ('Reggae', 'reggae', 9),
      ('Folk', 'folk', 10),
      ('Blues', 'blues', 11),
      ('Metal', 'metal', 12),
      ('Punk', 'punk', 13),
      ('Soul', 'soul', 14),
      ('Funk', 'funk', 15),
      ('Disco', 'disco', 16),
      ('Alternative', 'alternative', 17),
      ('Indie', 'indie', 18);
    `;
    
    await connection.execute(insertGenres);
    console.log('✅ Default genres inserted');
    
    console.log('\n🎉 Database schema created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

createSchema();