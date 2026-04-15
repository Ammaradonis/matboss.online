import type { Context } from '@netlify/functions';
import { createHash, timingSafeEqual } from 'node:crypto';
import { blogCategories, type BlogPost } from '../../src/data/posts';
import { blockObjectToLines, expandJsonBlockString } from '../../src/lib/contentParser';
import { getDatabaseErrorCode, loadMergedBlogPosts, saveBlogPost } from './blog-store';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...headers,
    },
  });
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function getProvidedApiKey(req: Request): string {
  const authorization = req.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return (
    req.headers.get('x-api-key')?.trim() ??
    req.headers.get('x-matboss-api-key')?.trim() ??
    ''
  );
}

function apiKeysMatch(providedKey: string, expectedHash: string): boolean {
  try {
    const providedBuffer = Buffer.from(sha256Hex(providedKey), 'hex');
    const expectedBuffer = Buffer.from(expectedHash.trim().toLowerCase(), 'hex');

    if (providedBuffer.length === 0 || providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

function isBlogCategory(value: unknown): value is BlogPost['category'] {
  return typeof value === 'string' && blogCategories.includes(value as BlogPost['category']);
}

function normalizeString(value: unknown, fieldName: string, maxLength = 500): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

function normalizeDate(value: unknown): string | null {
  const normalized = normalizeString(value, 'date', 10);
  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return normalized;
}

function normalizeReadTime(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `${Math.round(value)} min`;
  }

  const normalized = normalizeString(value, 'readTime', 32);
  if (!normalized) {
    return null;
  }

  return normalized;
}

function normalizeThumbnail(value: unknown): string | null {
  const normalized = normalizeString(value, 'thumbnailUrl', 2048);
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('/') || /^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return null;
}

function normalizeContent(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const normalized: string[] = [];

    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const expanded = expandJsonBlockString(trimmed);
        if (expanded) {
          normalized.push(...expanded);
        } else {
          normalized.push(trimmed);
        }
      } else if (typeof item === 'object' && item !== null && 'type' in item) {
        normalized.push(...blockObjectToLines(item as Record<string, unknown>));
      }
    }

    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === 'string') {
    const expanded = expandJsonBlockString(value);
    if (expanded) {
      return expanded.length > 0 ? expanded : null;
    }

    const normalized = value
      .split(/\r?\n\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : null;
  }

  return null;
}

function normalizeIncomingPost(payload: unknown): { post?: BlogPost; errors: string[] } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { errors: ['Request body must be a JSON object.'] };
  }

  const body = payload as Record<string, unknown>;
  const id = normalizeString(body.id, 'id', 120);
  const slug = normalizeString(body.slug, 'slug', 255);
  const category = body.category;
  const title = normalizeString(body.title, 'title', 255);
  const headline = normalizeString(body.headline, 'headline', 255);
  const excerpt = normalizeString(body.excerpt, 'excerpt', 1000);
  const date = normalizeDate(body.date);
  const thumbnail = normalizeThumbnail(body.thumbnailUrl ?? body.thumbnail);
  const readTime = normalizeReadTime(body.readTime);
  const content = normalizeContent(body.content);

  const errors: string[] = [];

  if (!id) errors.push('id is required.');
  if (!slug) errors.push('slug is required.');
  if (!isBlogCategory(category)) errors.push(`category must be one of: ${blogCategories.join(', ')}.`);
  if (!title) errors.push('title is required.');
  if (!headline) errors.push('headline is required.');
  if (!excerpt) errors.push('excerpt is required.');
  if (!date) errors.push('date must use YYYY-MM-DD.');
  if (!thumbnail) errors.push('thumbnailUrl must be an absolute URL or a site-relative path.');
  if (!readTime) errors.push('readTime is required.');
  if (!content) errors.push('content must be a non-empty string or string array.');

  if (errors.length > 0 || !id || !slug || !isBlogCategory(category) || !title || !headline || !excerpt || !date || !thumbnail || !readTime || !content) {
    return { errors };
  }

  return {
    errors: [],
    post: {
      id,
      slug,
      category,
      title,
      headline,
      excerpt,
      date,
      thumbnail,
      readTime,
      content,
    },
  };
}

async function handleGet() {
  return jsonResponse(
    200,
    { posts: await loadMergedBlogPosts() },
    { 'Cache-Control': 'public, max-age=60' },
  );
}

async function handlePost(req: Request) {
  const expectedHash = process.env.BLOG_INGEST_API_KEY_HASH?.trim();
  if (!expectedHash) {
    return jsonResponse(500, {
      error: 'BLOG_INGEST_API_KEY_HASH is not configured.',
    });
  }

  const providedApiKey = getProvidedApiKey(req);
  if (!providedApiKey || !apiKeysMatch(providedApiKey, expectedHash)) {
    return jsonResponse(401, { error: 'Unauthorized.' });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const { post, errors } = normalizeIncomingPost(payload);
  if (!post) {
    return jsonResponse(400, { error: 'Validation failed.', details: errors });
  }

  try {
    const storedPost = await saveBlogPost(post);

    return jsonResponse(
      200,
      { success: true, post: storedPost },
      { 'Cache-Control': 'no-store' },
    );
  } catch (error: any) {
    console.error('Failed to save blog post:', error);

    const errorCode = getDatabaseErrorCode(error);

    if (errorCode === '23505') {
      return jsonResponse(409, {
        error: 'A post with the same id or slug already exists.',
      });
    }

    return jsonResponse(500, {
      error: 'Failed to save blog post.',
    });
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'GET, POST, OPTIONS',
      },
    });
  }

  if (req.method === 'GET') {
    return handleGet();
  }

  if (req.method === 'POST') {
    return handlePost(req);
  }

  return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'GET, POST, OPTIONS' });
};
