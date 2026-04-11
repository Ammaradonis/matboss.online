import type { Context } from '@netlify/functions';
import {
  buildBlogPostUrl,
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

function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

function buildContent(post: { excerpt: string; content: string[]; thumbnail: string; title: string }): string {
  const paragraphs = post.content
    .map((block) => `<p>${escapeXml(block)}</p>`)
    .join('');

  return `<p><img src="${escapeXml(toAbsoluteUrl(post.thumbnail))}" alt="${escapeXml(post.title)}" /></p><p>${escapeXml(post.excerpt)}</p>${paragraphs}`;
}

export default async (_req: Request, _context: Context) => {
  const posts = (await loadMergedBlogPosts()).slice(0, 50);
  const latestPubDate = posts[0]?.date ?? '2026-04-11';

  const items = posts.map((post) => {
    const link = buildBlogPostUrl(post);

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(toRfc822(post.date))}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${buildContent(post)}]]></content:encoded>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>MatBoss News</title>
    <link>${SITE_URL}/news</link>
    <description>San Diego martial arts enrollment intelligence, market analysis, and automation insights from MatBoss.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(toRfc822(latestPubDate))}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
