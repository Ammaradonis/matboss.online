import { Link } from 'react-router-dom';
import { categoryLabels, categoryColors, type BlogPost } from '../../data/posts';

export default function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="posts" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="h-px w-8 bg-dojo-red/40" />
        <h2 className="text-xs font-mono text-gray-500 tracking-[0.25em] uppercase">
          All Posts
        </h2>
        <span className="text-[10px] font-mono text-gray-700 ml-2">{posts.length} entries</span>
        <span className="h-px flex-1 bg-white/5" />
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[120px_110px_1fr_60px] gap-4 px-4 py-2 text-[9px] font-mono text-gray-600 tracking-wider uppercase border-b border-white/5 mb-2">
        <span>Date</span>
        <span>Category</span>
        <span>Title</span>
        <span className="text-right">Read</span>
      </div>

      {/* Post rows */}
      <div className="divide-y divide-white/[0.03]">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function PostRow({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/news/${post.category}/${post.slug}`}
      className="group grid grid-cols-1 sm:grid-cols-[120px_110px_1fr_60px] gap-2 sm:gap-4 px-4 py-4 hover:bg-white/[0.02] transition-colors rounded"
    >
      {/* Date */}
      <span className="text-xs font-mono text-gray-600 sm:pt-0.5">
        {formatDate(post.date)}
      </span>

      {/* Category */}
      <span className="flex items-start">
        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-white rounded ${categoryColors[post.category]}`}>
          {categoryLabels[post.category]}
        </span>
      </span>

      {/* Title + excerpt */}
      <div>
        <h3 className="text-sm font-medium text-white group-hover:text-dojo-red transition-colors leading-snug">
          {post.title}
        </h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1 hidden sm:block">
          {post.excerpt}
        </p>
      </div>

      {/* Read time */}
      <span className="text-[10px] font-mono text-gray-700 sm:text-right hidden sm:block">
        {post.readTime}
      </span>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
