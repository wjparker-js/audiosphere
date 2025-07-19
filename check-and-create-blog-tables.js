const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

async function checkAndCreateBlogTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Check existing tables
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(row => Object.values(row)[0]);
    console.log('📋 Existing tables:', existingTables);
    
    // Create blog_posts table if it doesn't exist
    if (!existingTables.includes('blog_posts')) {
      console.log('📝 Creating blog_posts table...');
      await connection.execute(`
        CREATE TABLE blog_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          excerpt TEXT,
          content LONGTEXT NOT NULL,
          featured_image VARCHAR(500),
          status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
          published_at DATETIME NULL,
          view_count INT DEFAULT 0,
          category VARCHAR(100),
          read_time INT DEFAULT 1,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_published_at (published_at),
          INDEX idx_user_id (user_id),
          INDEX idx_category (category),
          FULLTEXT(title, excerpt, content)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ blog_posts table created');
    }
    
    // Create comments table if it doesn't exist
    if (!existingTables.includes('comments')) {
      console.log('💬 Creating comments table...');
      await connection.execute(`
        CREATE TABLE comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          blog_post_id INT NOT NULL,
          user_id INT NOT NULL,
          parent_comment_id INT NULL,
          content TEXT NOT NULL,
          comment_level TINYINT DEFAULT 1 CHECK (comment_level <= 2),
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_blog_post (blog_post_id),
          INDEX idx_user (user_id),
          INDEX idx_parent (parent_comment_id),
          INDEX idx_status (status),
          FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ comments table created');
    }
    
    // Create tags table if it doesn't exist
    if (!existingTables.includes('tags')) {
      console.log('🏷️ Creating tags table...');
      await connection.execute(`
        CREATE TABLE tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ tags table created');
    }
    
    // Create blog_post_tags junction table if it doesn't exist
    if (!existingTables.includes('blog_post_tags')) {
      console.log('🔗 Creating blog_post_tags table...');
      await connection.execute(`
        CREATE TABLE blog_post_tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          blog_post_id INT NOT NULL,
          tag_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_post_tag (blog_post_id, tag_id),
          FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ blog_post_tags table created');
    }
    
    // Create users table if it doesn't exist (needed for blog posts)
    if (!existingTables.includes('users')) {
      console.log('👤 Creating users table...');
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          avatar_url VARCHAR(500),
          bio TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          is_verified BOOLEAN DEFAULT FALSE,
          last_login DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_is_admin (is_admin)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ users table created');
      
      // Insert a default user for testing
      await connection.execute(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin) 
        VALUES ('wjparker', 'wjparker@example.com', '$2b$12$hashedpassword', 'WJ', 'Parker', TRUE)
      `);
      console.log('✅ Default user created');
    }
    
    // Insert some sample blog posts for testing
    const [blogCount] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');
    if (blogCount[0].count === 0) {
      console.log('📝 Creating sample blog posts...');
      
      const samplePosts = [
        {
          title: 'Welcome to AudioSphere',
          excerpt: 'Discover the future of music streaming and sharing.',
          content: 'Welcome to AudioSphere, your new favorite music platform! Here you can discover new music, create playlists, and share your thoughts through our integrated blog system.',
          category: 'Announcements',
          status: 'published'
        },
        {
          title: 'The Art of Music Discovery',
          excerpt: 'How to find your next favorite song on AudioSphere.',
          content: 'Music discovery is an art form. With AudioSphere\'s advanced recommendation system, you can explore new genres, artists, and tracks that match your taste perfectly.',
          category: 'Music',
          status: 'published'
        },
        {
          title: 'Building the Perfect Playlist',
          excerpt: 'Tips and tricks for creating playlists that tell a story.',
          content: 'A great playlist is more than just a collection of songs. It\'s a journey, a story, an experience. Learn how to craft playlists that captivate and inspire.',
          category: 'Tips',
          status: 'published'
        }
      ];
      
      for (const post of samplePosts) {
        const wordCount = post.content.trim().split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        
        await connection.execute(`
          INSERT INTO blog_posts (title, excerpt, content, category, status, read_time, user_id, published_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
        `, [post.title, post.excerpt, post.content, post.category, post.status, readTime]);
      }
      
      console.log('✅ Sample blog posts created');
    }
    
    console.log('🎉 Blog tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up blog tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndCreateBlogTables();