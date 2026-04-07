#!/usr/bin/env node

/**
 * MatBoss Blog — New Post Generator
 *
 * Usage:
 *   node scripts/new-post.js --title "Your Post Title" --category product --date 2024-10-15
 *
 * Options:
 *   --title     Post title (required)
 *   --category  One of: product, announcements, policy, company, social, market (required)
 *   --date      YYYY-MM-DD format (defaults to today)
 *   --excerpt   Short excerpt (optional, will prompt if missing)
 *
 * This script:
 *   1. Generates a URL-safe slug from the title
 *   2. Creates a new post entry in src/data/posts.ts
 *   3. Creates a placeholder thumbnail SVG in public/news/thumbnails/
 *   4. The post will automatically appear on /news — no manual index editing needed
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = ['product', 'announcements', 'policy', 'company', 'social', 'market'];
const POSTS_FILE = path.join(__dirname, '..', 'src', 'data', 'posts.ts');
const THUMBS_DIR = path.join(__dirname, '..', 'public', 'news', 'thumbnails');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    result[key] = args[i + 1];
  }
  return result;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function generateThumbnailSVG(title) {
  const words = title.split(' ').slice(0, 4).join(' ');
  return `<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#111111"/>
  <defs>
    <pattern id="grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(220,38,38,0.06)" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="600" height="400" fill="url(#grid)"/>
  <rect x="40" y="160" width="520" height="2" fill="rgba(220,38,38,0.2)"/>
  <text x="300" y="200" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="14" font-family="monospace" letter-spacing="2">${words.toUpperCase()}</text>
  <circle cx="300" cy="300" r="3" fill="rgba(220,38,38,0.3)"/>
  <circle cx="300" cy="300" r="12" fill="none" stroke="rgba(220,38,38,0.1)" stroke-width="0.5"/>
</svg>`;
}

function main() {
  const args = parseArgs();

  if (!args.title) {
    console.error('ERROR: --title is required');
    console.error('Usage: node scripts/new-post.js --title "Title" --category product');
    process.exit(1);
  }

  if (!args.category || !CATEGORIES.includes(args.category)) {
    console.error(`ERROR: --category is required. Must be one of: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  const title = args.title;
  const category = args.category;
  const date = args.date || new Date().toISOString().split('T')[0];
  const slug = slugify(title);
  const excerpt = args.excerpt || `New analysis: ${title}. Read the full breakdown on MatBoss News.`;
  const headline = title.toUpperCase();
  const thumbFilename = `${slug}.svg`;
  const thumbPath = `/news/thumbnails/${thumbFilename}`;

  // Read existing posts file
  const postsContent = fs.readFileSync(POSTS_FILE, 'utf8');

  // Find the highest post ID
  const idMatches = postsContent.match(/id: 'post-(\d+)'/g) || [];
  const maxId = idMatches.reduce((max, m) => {
    const num = parseInt(m.match(/(\d+)/)[1]);
    return num > max ? num : max;
  }, 0);
  const newId = `post-${String(maxId + 1).padStart(3, '0')}`;

  // Build the new post object as a string
  const newPost = `  {
    id: '${newId}',
    slug: '${slug}',
    category: '${category}',
    title: '${title.replace(/'/g, "\\'")}',
    headline: '${headline.replace(/'/g, "\\'")}',
    excerpt: '${excerpt.replace(/'/g, "\\'")}',
    date: '${date}',
    thumbnail: '${thumbPath}',
    readTime: '5 min',
    content: [
      'This is a new post. Edit the content in src/data/posts.ts to replace this placeholder.',
      '## Section Heading',
      'Add your analysis, data, and insights here.',
    ],
  },`;

  // Insert at the BEGINNING of the posts array (newest first)
  const insertPoint = postsContent.indexOf('export const posts: BlogPost[] = [\n') + 'export const posts: BlogPost[] = [\n'.length;
  const updatedContent = postsContent.slice(0, insertPoint) + newPost + '\n' + postsContent.slice(insertPoint);

  // Write updated posts file
  fs.writeFileSync(POSTS_FILE, updatedContent, 'utf8');

  // Generate and save thumbnail
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  fs.writeFileSync(path.join(THUMBS_DIR, thumbFilename), generateThumbnailSVG(title), 'utf8');

  console.log('');
  console.log('  POST CREATED SUCCESSFULLY');
  console.log('  ========================');
  console.log(`  ID:        ${newId}`);
  console.log(`  Title:     ${title}`);
  console.log(`  Category:  ${category}`);
  console.log(`  Date:      ${date}`);
  console.log(`  Slug:      ${slug}`);
  console.log(`  URL:       /news/${category}/${slug}`);
  console.log(`  Thumbnail: ${thumbPath}`);
  console.log('');
  console.log('  NEXT STEPS:');
  console.log(`  1. Edit post content in src/data/posts.ts (search for "${newId}")`);
  console.log('  2. Replace the placeholder thumbnail if desired');
  console.log('  3. Run "npm run dev" to preview');
  console.log('');
}

main();
