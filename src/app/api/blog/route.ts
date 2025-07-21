import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { DataTransformer, createApiResponse } from '@/lib/data-transformer';
import { ErrorHandler, withErrorHandling } from '@/lib/error-handler';
import { blogSchemas } from '@/lib/validation';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Get published blog posts with comment count and user info
  const [posts] = await pool.execute(`
    SELECT 
      bp.id,
      bp.title,
      bp.slug,
      bp.excerpt,
      bp.content,
      bp.featured_image_url,
      bp.status,
      bp.published_at,
      bp.view_count,
      bp.created_at,
      bp.updated_at,
      bp.user_id,
      u.username as author_name,
      COALESCE(c.comment_count, 0) as comment_count
    FROM blog_posts bp
    LEFT JOIN users u ON bp.user_id = u.id
    LEFT JOIN (
      SELECT blog_post_id, COUNT(*) as comment_count
      FROM comments
      WHERE status = 'approved'
      GROUP BY blog_post_id
    ) c ON bp.id = c.blog_post_id
    WHERE bp.status = 'published'
    ORDER BY bp.published_at DESC
    LIMIT 20
  `);
  
  // Transform and sanitize the data
  const sanitizedPosts = (posts as any[]).map(post => 
    DataTransformer.sanitizeBlogPost(post)
  );
  
  return NextResponse.json(
    createApiResponse(true, { posts: sanitizedPosts })
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate request body using Zod schema
  const validationResult = blogSchemas.create.safeParse(body);

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code.toUpperCase()
    }));
    
    return ErrorHandler.handleValidationError({
      name: 'ValidationError',
      message: 'Invalid blog post data provided',
      details: validationErrors
    } as any);
  }

  const { title, excerpt, content, featuredImage, status, userId } = validationResult.data;

  // Generate slug from title using DataTransformer
  const baseSlug = DataTransformer.generateSlug(title);

  // Ensure slug is unique
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (true) {
    const [existing] = await pool.execute(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [uniqueSlug]
    );
    
    if ((existing as any[]).length === 0) break;
    
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create new blog post (matching existing schema)
  const [result] = await pool.execute(
    `INSERT INTO blog_posts 
     (title, slug, excerpt, content, featured_image_url, status, user_id, published_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title.trim(), 
      uniqueSlug,
      excerpt?.trim() || '', 
      content.trim(), 
      featuredImage || null, 
      status,
      userId,
      status === 'published' ? new Date() : null
    ]
  );

  const insertResult = result as any;
  const postId = insertResult.insertId;

  // Get the created post with user info
  const [newPost] = await pool.execute(
    `SELECT bp.*, u.username as author_name 
     FROM blog_posts bp 
     LEFT JOIN users u ON bp.user_id = u.id 
     WHERE bp.id = ?`,
    [postId]
  );

  const rawPost = Array.isArray(newPost) ? newPost[0] : newPost;
  const sanitizedPost = DataTransformer.sanitizeBlogPost(rawPost);

  return NextResponse.json(
    createApiResponse(true, { post: sanitizedPost })
  );
});