import pool from './db';
import { mergePosts, posts as staticPosts, type BlogPost } from '../../src/data/posts';

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
  const content = Array.isArray(row.content)
    ? row.content.filter((item): item is string => typeof item === 'string')
    : [];

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
