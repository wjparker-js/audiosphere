import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = params.id;
    
    const query = `
      SELECT bp.*,
             (SELECT COUNT(*) FROM comments WHERE blog_post_id = bp.id) as comment_count
      FROM blog_posts bp 
      WHERE bp.id = ?
    `;
    
    const results = await executeQuery(query, [blogId]) as any[];
    
    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    const blog = results[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: blog.id.toString(),
        title: blog.title,
        excerpt: blog.excerpt || blog.content?.substring(0, 150) + '...',
        featuredImage: blog.featured_image_url,
        status: blog.status || 'draft',
        publishedAt: blog.published_at,
        viewCount: blog.view_count || 0,
        commentCount: blog.comment_count || 0,
        createdAt: blog.created_at,
        updatedAt: blog.updated_at,
        userId: blog.user_id.toString()
      }
    });

  } catch (error) {
    console.error('Blog post fetch error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch blog post' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = params.id;
    
    // Delete related comments first
    await executeQuery('DELETE FROM comments WHERE blog_post_id = ?', [blogId]);
    
    // Delete the blog post
    await executeQuery('DELETE FROM blog_posts WHERE id = ?', [blogId]);
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Blog post deletion error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete blog post' } },
      { status: 500 }
    );
  }
}