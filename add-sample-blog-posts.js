const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'audiosphere'
};

async function addSampleBlogPosts() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to AudioSphere database');
    
    // Check if we already have blog posts
    const [existingPosts] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');
    if (existingPosts[0].count > 0) {
      console.log('📝 Blog posts already exist, skipping...');
      return;
    }
    
    console.log('📝 Creating sample blog posts...');
    
    const samplePosts = [
      {
        title: 'Welcome to AudioSphere',
        slug: 'welcome-to-audiosphere',
        excerpt: 'Discover the future of music streaming and sharing with AudioSphere.',
        content: `Welcome to AudioSphere, your new favorite music platform! 

Here you can discover new music, create playlists, and share your thoughts through our integrated blog system. 

AudioSphere combines the best of music streaming with social features, allowing you to:
- Stream high-quality music
- Create and share playlists
- Discover new artists and genres
- Connect with other music lovers
- Share your musical journey through blog posts

Join our community and start exploring the world of music like never before!`,
        featured_image_url: null,
        status: 'published'
      },
      {
        title: 'The Art of Music Discovery',
        slug: 'the-art-of-music-discovery',
        excerpt: 'How to find your next favorite song on AudioSphere using our advanced recommendation system.',
        content: `Music discovery is an art form, and with AudioSphere's advanced recommendation system, you can explore new genres, artists, and tracks that match your taste perfectly.

Our recommendation engine analyzes your listening habits, favorite genres, and even the time of day you listen to music to suggest tracks that you'll love.

Here are some tips for discovering new music on AudioSphere:

1. **Explore Genre Playlists**: Check out our curated playlists for different genres
2. **Follow Similar Users**: Find users with similar taste and see what they're listening to
3. **Use the Discovery Feed**: Our AI-powered feed shows you new releases and trending tracks
4. **Check Out Related Artists**: When you find an artist you like, explore their related artists

The journey of music discovery never ends, and AudioSphere is here to guide you every step of the way!`,
        featured_image_url: null,
        status: 'published'
      },
      {
        title: 'Building the Perfect Playlist',
        slug: 'building-the-perfect-playlist',
        excerpt: 'Tips and tricks for creating playlists that tell a story and captivate your audience.',
        content: `A great playlist is more than just a collection of songs. It's a journey, a story, an experience that takes listeners on an emotional ride.

Here's how to craft playlists that captivate and inspire:

**1. Start with a Theme**
Every great playlist has a central theme - whether it's a mood, activity, or story you want to tell.

**2. Consider the Flow**
Think about how songs transition from one to another. Pay attention to:
- Tempo changes
- Key signatures
- Energy levels
- Emotional progression

**3. Mix Familiar with New**
Balance songs your audience knows with new discoveries to keep them engaged while introducing fresh content.

**4. Pay Attention to Length**
Different occasions call for different playlist lengths:
- Workout: 45-60 minutes
- Commute: 30-45 minutes
- Party: 2-3 hours
- Study: 1-2 hours

**5. Test and Refine**
Listen to your playlist from start to finish and make adjustments based on how it feels.

Remember, the best playlists are personal and authentic. Don't be afraid to experiment and let your personality shine through your musical choices!`,
        featured_image_url: null,
        status: 'published'
      },
      {
        title: 'The Evolution of Music Streaming',
        slug: 'evolution-of-music-streaming',
        excerpt: 'A look at how music streaming has transformed the way we discover and consume music.',
        content: `The music industry has undergone a dramatic transformation over the past two decades, with streaming services revolutionizing how we discover, consume, and share music.

**From Physical to Digital**
We've moved from vinyl records and CDs to digital downloads, and now to streaming services that give us access to millions of songs instantly.

**The Streaming Revolution**
Streaming has democratized music access, allowing independent artists to reach global audiences without traditional record label support.

**What's Next?**
The future of music streaming includes:
- AI-powered personalization
- Social listening experiences
- High-resolution audio
- Interactive and immersive content
- Better artist compensation models

AudioSphere represents the next evolution in music streaming, combining the best features of existing platforms with innovative social and discovery features.

Join us as we shape the future of how people experience music!`,
        featured_image_url: null,
        status: 'published'
      }
    ];
    
    for (const post of samplePosts) {
      await connection.execute(`
        INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, status, user_id, published_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
      `, [post.title, post.slug, post.excerpt, post.content, post.featured_image_url, post.status]);
      
      console.log(`✅ Created blog post: ${post.title}`);
    }
    
    console.log('🎉 Sample blog posts created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample blog posts:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSampleBlogPosts();