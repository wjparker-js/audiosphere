import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { BulkAction } from '@/types/library';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentIds, userId } = body as {
      action: BulkAction;
      contentIds: string[];
      userId: string;
    };

    if (!action || !contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid request parameters'
          }
        },
        { status: 400 }
      );
    }

    const results = [];

    for (const contentId of contentIds) {
      try {
        switch (action) {
          case 'delete':
            // Determine content type and delete accordingly
            // First check if it's an album
            const albumCheck = await executeQuery(
              'SELECT id FROM albums WHERE id = ? AND created_by = ?',
              [contentId, userId]
            ) as any[];

            if (albumCheck.length > 0) {
              // Delete album and related tracks
              await executeQuery('DELETE FROM tracks WHERE album_id = ?', [contentId]);
              await executeQuery('DELETE FROM albums WHERE id = ?', [contentId]);
              results.push({ id: contentId, type: 'album', success: true });
              continue;
            }

            // Check if it's a playlist
            const playlistCheck = await executeQuery(
              'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
              [contentId, userId]
            ) as any[];

            if (playlistCheck.length > 0) {
              // Delete playlist and related tracks
              await executeQuery('DELETE FROM playlist_tracks WHERE playlist_id = ?', [contentId]);
              await executeQuery('DELETE FROM playlists WHERE id = ?', [contentId]);
              results.push({ id: contentId, type: 'playlist', success: true });
              continue;
            }

            // Check if it's a blog post
            const blogCheck = await executeQuery(
              'SELECT id FROM blog_posts WHERE id = ? AND user_id = ?',
              [contentId, userId]
            ) as any[];

            if (blogCheck.length > 0) {
              // Delete blog post and related comments
              await executeQuery('DELETE FROM comments WHERE blog_post_id = ?', [contentId]);
              await executeQuery('DELETE FROM blog_posts WHERE id = ?', [contentId]);
              results.push({ id: contentId, type: 'blog', success: true });
              continue;
            }

            results.push({ id: contentId, success: false, error: 'Content not found' });
            break;

          case 'publish':
            // Update status to published for albums and blog posts
            const albumUpdate = await executeQuery(
              'UPDATE albums SET status = "published" WHERE id = ? AND created_by = ?',
              [contentId, userId]
            );
            
            const blogUpdate = await executeQuery(
              'UPDATE blog_posts SET status = "published", published_at = NOW() WHERE id = ? AND user_id = ?',
              [contentId, userId]
            );

            results.push({ id: contentId, success: true });
            break;

          case 'unpublish':
            // Update status to draft for albums and blog posts
            await executeQuery(
              'UPDATE albums SET status = "draft" WHERE id = ? AND created_by = ?',
              [contentId, userId]
            );
            
            await executeQuery(
              'UPDATE blog_posts SET status = "draft" WHERE id = ? AND user_id = ?',
              [contentId, userId]
            );

            results.push({ id: contentId, success: true });
            break;

          default:
            results.push({ id: contentId, success: false, error: 'Unsupported action' });
        }
      } catch (error) {
        console.error(`Bulk action error for ${contentId}:`, error);
        results.push({ id: contentId, success: false, error: 'Operation failed' });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        results,
        summary: {
          total: contentIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Bulk action API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'server',
          message: 'Failed to perform bulk action'
        }
      },
      { status: 500 }
    );
  }
}