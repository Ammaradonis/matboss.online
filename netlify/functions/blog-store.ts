import pool from './db';
import { mergePosts, posts as staticPosts, type BlogPost } from '../../src/data/posts';
import { blockObjectToLines, expandJsonBlockString } from '../../src/lib/contentParser';

export const SITE_URL = 'https://matboss.online';
export const BLOG_PUBLICATION_NAME = 'MatBoss';
export const BLOG_LANGUAGE = 'en';

export interface StoredBlogPost extends BlogPost {
  createdAt?: string;
  updatedAt?: string;
}

let blogTableReady: Promise<void> | null = null;

export async function ensureBlogPostsTable() {
  if (!blogTableReady) {
    blogTableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id              VARCHAR(120) PRIMARY KEY,
        slug            VARCHAR(255) NOT NULL UNIQUE,
        category        VARCHAR(50) NOT NULL,
        title           VARCHAR(255) NOT NULL,
        headline        VARCHAR(255) NOT NULL,
        excerpt         TEXT NOT NULL,
        published_date  DATE NOT NULL,
        thumbnail_url   TEXT NOT NULL,
        read_time       VARCHAR(32) NOT NULL,
        content         JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date
        ON blog_posts (published_date DESC);

      CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published_date
        ON blog_posts (category, published_date DESC);

      ALTER TABLE blog_posts
        ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50),
        ADD COLUMN IF NOT EXISTS title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
        ADD COLUMN IF NOT EXISTS excerpt TEXT,
        ADD COLUMN IF NOT EXISTS published_date DATE,
        ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
        ADD COLUMN IF NOT EXISTS read_time VARCHAR(32),
        ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

      UPDATE blog_posts
      SET
        slug = COALESCE(NULLIF(slug, ''), id),
        category = COALESCE(NULLIF(category, ''), 'company'),
        title = COALESCE(NULLIF(title, ''), slug, id),
        headline = COALESCE(NULLIF(headline, ''), title, slug, id),
        excerpt = COALESCE(NULLIF(excerpt, ''), headline, title, slug, id),
        published_date = COALESCE(published_date, CURRENT_DATE),
        thumbnail_url = COALESCE(NULLIF(thumbnail_url, ''), '/og-image.png'),
        read_time = COALESCE(NULLIF(read_time, ''), '5 min'),
        content = COALESCE(content, '[]'::jsonb),
        created_at = COALESCE(created_at, NOW()),
        updated_at = COALESCE(updated_at, created_at, NOW())
      WHERE
        slug IS NULL OR slug = '' OR
        category IS NULL OR category = '' OR
        title IS NULL OR title = '' OR
        headline IS NULL OR headline = '' OR
        excerpt IS NULL OR excerpt = '' OR
        published_date IS NULL OR
        thumbnail_url IS NULL OR thumbnail_url = '' OR
        read_time IS NULL OR read_time = '' OR
        content IS NULL OR
        created_at IS NULL OR
        updated_at IS NULL;

      ALTER TABLE blog_posts
        ALTER COLUMN slug SET NOT NULL,
        ALTER COLUMN category SET NOT NULL,
        ALTER COLUMN title SET NOT NULL,
        ALTER COLUMN headline SET NOT NULL,
        ALTER COLUMN excerpt SET NOT NULL,
        ALTER COLUMN published_date SET NOT NULL,
        ALTER COLUMN thumbnail_url SET NOT NULL,
        ALTER COLUMN read_time SET NOT NULL,
        ALTER COLUMN content SET DEFAULT '[]'::jsonb,
        ALTER COLUMN content SET NOT NULL,
        ALTER COLUMN created_at SET DEFAULT NOW(),
        ALTER COLUMN created_at SET NOT NULL,
        ALTER COLUMN updated_at SET DEFAULT NOW(),
        ALTER COLUMN updated_at SET NOT NULL;
    `).then(() => undefined).catch((error) => {
      blogTableReady = null;
      throw error;
    });
  }

  return blogTableReady;
}

function toIsoDate(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function toPublishedDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

export function mapRowToStoredPost(row: Record<string, unknown>): StoredBlogPost {
  const content: string[] = [];

  if (Array.isArray(row.content)) {
    for (const item of row.content) {
      if (typeof item === 'string') {
        const expanded = expandJsonBlockString(item);
        if (expanded) {
          content.push(...expanded);
        } else {
          content.push(item);
        }
      } else if (typeof item === 'object' && item !== null && 'type' in item) {
        content.push(...blockObjectToLines(item as Record<string, unknown>));
      }
    }
  } else if (typeof row.content === 'string') {
    const expanded = expandJsonBlockString(row.content);
    if (expanded) {
      content.push(...expanded);
    } else {
      content.push(row.content);
    }
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    category: String(row.category) as BlogPost['category'],
    title: String(row.title),
    headline: String(row.headline),
    excerpt: String(row.excerpt),
    date: toPublishedDate(row.published_date),
    thumbnail: String(row.thumbnail_url),
    readTime: String(row.read_time),
    content,
    createdAt: toIsoDate(row.created_at),
    updatedAt: toIsoDate(row.updated_at),
  };
}

export async function loadDatabasePosts(): Promise<StoredBlogPost[]> {
  await ensureBlogPostsTable();

  const { rows } = await pool.query(`
    SELECT
      id,
      slug,
      category,
      title,
      headline,
      excerpt,
      published_date,
      thumbnail_url,
      read_time,
      content,
      created_at,
      updated_at
    FROM blog_posts
    ORDER BY published_date DESC, created_at DESC
  `);

  return rows.map((row) => mapRowToStoredPost(row));
}

export async function saveBlogPost(post: BlogPost): Promise<StoredBlogPost> {
  await ensureBlogPostsTable();

  const { rows } = await pool.query(
    `
      INSERT INTO blog_posts (
        id,
        slug,
        category,
        title,
        headline,
        excerpt,
        published_date,
        thumbnail_url,
        read_time,
        content,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        headline = EXCLUDED.headline,
        excerpt = EXCLUDED.excerpt,
        published_date = EXCLUDED.published_date,
        thumbnail_url = EXCLUDED.thumbnail_url,
        read_time = EXCLUDED.read_time,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING
        id,
        slug,
        category,
        title,
        headline,
        excerpt,
        published_date,
        thumbnail_url,
        read_time,
        content,
        created_at,
        updated_at
    `,
    [
      post.id,
      post.slug,
      post.category,
      post.title,
      post.headline,
      post.excerpt,
      post.date,
      post.thumbnail,
      post.readTime,
      JSON.stringify(post.content),
    ],
  );

  return mapRowToStoredPost(rows[0] as Record<string, unknown>);
}

export function getDatabaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export async function loadMergedBlogPosts(): Promise<StoredBlogPost[]> {
  try {
    const databasePosts = await loadDatabasePosts();
    return mergePosts(databasePosts, staticPosts) as StoredBlogPost[];
  } catch (error) {
    console.error('Failed to load blog posts from the database:', error);
    return mergePosts([], staticPosts) as StoredBlogPost[];
  }
}

export function buildBlogPostUrl(post: Pick<BlogPost, 'category' | 'slug'>): string {
  return `${SITE_URL}/news/${post.category}/${post.slug}`;
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

export function getLastModified(post: Pick<StoredBlogPost, 'updatedAt' | 'date'>): string {
  return post.updatedAt ? post.updatedAt.slice(0, 10) : post.date;
}

export function isRecentNewsPost(post: Pick<BlogPost, 'date'>, now = new Date()): boolean {
  const publishedAt = new Date(`${post.date}T00:00:00Z`);
  const ageMs = now.getTime() - publishedAt.getTime();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  return ageMs >= 0 && ageMs <= twoDaysMs;
}
