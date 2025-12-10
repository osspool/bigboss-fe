import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * API Route for on-demand revalidation of landing pages
 * POST /api/revalidate
 *
 * Body:
 * - type: 'tag' | 'path' | 'both'
 * - slug: string (required for path/both)
 * - tags: string[] (optional, defaults to slug-based tags)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type = 'both', slug, tags, path } = body;

    // Validate input
    if (!slug && !tags && !path) {
      return NextResponse.json(
        { message: 'Missing required parameters: slug, tags, or path' },
        { status: 400 }
      );
    }

    // Revalidate by tag
    if (type === 'tag' || type === 'both') {
      const tagsToRevalidate = tags || [`landing-page-${slug}`, 'landing-pages'];

      for (const tag of tagsToRevalidate) {
        revalidateTag(tag, 'max');
        console.log(`Revalidated tag: ${tag}`);
      }
    }

    // Revalidate by path
    if (type === 'path' || type === 'both') {
      const pathToRevalidate = path || `/${slug}`;
      revalidatePath(pathToRevalidate);
      console.log(`Revalidated path: ${pathToRevalidate}`);
    }

    return NextResponse.json({
      revalidated: true,
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        message: 'Error revalidating cache',
        error: error.message
      },
      { status: 500 }
    );
  }
}
