#!/usr/bin/env node

/**
 * MatBoss Blog — ID + Slug Generator
 *
 * Usage:
 *   node scripts/new-post.cjs --title "Your Post Title" --category product --date 2024-10-15
 *
 * Options:
 *   --title     Post title (required)
 *   --category  One of: product, announcements, policy, company, social, market (required)
 *   --date      YYYY-MM-DD format (defaults to today)
 *
 * Read-only helper. Prints the next available ID and a URL-safe slug so they
 * can be fed into the Make.com automation that POSTs to /api/news-posts.
 * Does NOT modify src/data/posts.ts and does NOT create thumbnails.
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = ['product', 'announcements', 'policy', 'company', 'social', 'market'];
const POSTS_FILE = path.join(__dirname, '..', 'src', 'data', 'posts.ts');

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

function main() {
  const args = parseArgs();

  if (!args.title) {
    console.error('ERROR: --title is required');
    console.error('Usage: node scripts/new-post.cjs --title "Title" --category product');
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

  const postsContent = fs.readFileSync(POSTS_FILE, 'utf8');
  const idMatches = postsContent.match(/id: 'post-(\d+)'/g) || [];
  const maxId = idMatches.reduce((max, m) => {
    const num = parseInt(m.match(/(\d+)/)[1]);
    return num > max ? num : max;
  }, 0);
  const newId = `post-${String(maxId + 1).padStart(3, '0')}`;

  console.log('');
  console.log('  ID + SLUG GENERATED');
  console.log('  ===================');
  console.log(`  ID:       ${newId}`);
  console.log(`  Slug:     ${slug}`);
  console.log(`  Title:    ${title}`);
  console.log(`  Category: ${category}`);
  console.log(`  Date:     ${date}`);
  console.log(`  URL:      /news/${category}/${slug}`);
  console.log('');
  console.log('  Feed these into the Make.com flow that POSTs to /api/news-posts.');
  console.log('');
}

main();
