import type { Context } from '@netlify/functions';
import {
  BLOG_LANGUAGE,
  BLOG_PUBLICATION_NAME,
  buildBlogPostUrl,
  getLastModified,
  isRecentNewsPost,
  loadMergedBlogPosts,
  toAbsoluteUrl,
  SITE_URL,
} from './blog-store';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildKeywords(title: string, category: string): string {
  return [
    'MatBoss',
    'Ammar Alkheder',
    'San Diego martial arts',
    'enrollment automation',
    category,
    title,
  ].join(', ');
}

function buildStaticUrlEntry(path: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>
  </url>`;
}

export default async (_req: Request, _context: Context) => {
  const posts = await loadMergedBlogPosts();
  const latestNewsUpdate = posts.reduce<string>(
    (latest, post) => {
      const candidate = getLastModified(post);
      return candidate > latest ? candidate : latest;
    },
    '2026-04-11',
  );

  const staticEntries = [
    buildStaticUrlEntry('/', '2026-04-07', 'weekly', '1.0'),
    buildStaticUrlEntry('/pricing', '2026-04-07', 'monthly', '0.9'),
    buildStaticUrlEntry('/news', latestNewsUpdate, 'daily', '0.95'),
    buildStaticUrlEntry('/terms', '2026-04-01', 'yearly', '0.3'),
    buildStaticUrlEntry('/privacy', '2026-04-01', 'yearly', '0.3'),
    buildStaticUrlEntry('/dmarc', '2026-04-01', 'yearly', '0.2'),
  ];

  const postEntries = posts.map((post) => {
    const imageXml = `    <image:image>
      <image:loc>${escapeXml(toAbsoluteUrl(post.thumbnail))}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>`;

    const newsXml = isRecentNewsPost(post)
      ? `
    <news:news>
      <news:publication>
        <news:name>${escapeXml(BLOG_PUBLICATION_NAME)}</news:name>
        <news:language>${escapeXml(BLOG_LANGUAGE)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(post.date)}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      <news:keywords>${escapeXml(buildKeywords(post.title, post.category))}</news:keywords>
    </news:news>`
      : '';

    return `  <url>
    <loc>${escapeXml(buildBlogPostUrl(post))}</loc>
    <lastmod>${escapeXml(getLastModified(post))}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>${newsXml}
${imageXml}
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticEntries, ...postEntries].join('\n')}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
