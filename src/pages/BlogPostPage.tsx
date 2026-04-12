import { useParams, Link, Navigate } from 'react-router-dom';
import { getPostBySlugFrom, categoryLabels, categoryColors } from '../data/posts';
import SEO, { buildBlogPostSchema } from '../components/SEO';
import Footer from '../components/Footer';
import ContentRenderer from '../components/ContentRenderer';
import useBlogPosts from '../hooks/useBlogPosts';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { posts, loading } = useBlogPosts();
  const post = slug ? getPostBySlugFrom(posts, slug) : undefined;

  if (!slug) {
    return <Navigate to="/news" replace />;
  }

  if (!post && loading) {
    return (
      <div className="min-h-screen bg-dojo-black text-white">
        <nav className="border-b border-white/5 bg-dojo-black/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-dojo-red flex items-center justify-center">
                <span className="font-heading text-white text-xs">M</span>
              </div>
              <span className="font-heading text-base tracking-wider text-white">MatBoss</span>
            </Link>
            <Link
              to="/news"
              className="text-[11px] font-mono text-gray-500 hover:text-white tracking-wider uppercase transition-colors"
            >
              &larr; All Posts
            </Link>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
          <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-gray-600">
            Loading article
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/news" replace />;
  }

  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-dojo-black text-white">
      <SEO
        title={`${post.title} — MatBoss News`}
        description={`${post.excerpt} By Ammar Alkheder, founder of MatBoss — San Diego martial arts enrollment automation.`}
        canonical={`/news/${post.category}/${post.slug}`}
        ogType="article"
        ogImage={post.thumbnail.startsWith('http') ? post.thumbnail : `https://matboss.online${post.thumbnail}`}
        rssFeedUrl="/rss.xml"
        article={{
          publishedTime: post.date,
          author: 'Ammar Alkheder',
          section: categoryLabels[post.category],
        }}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'News', url: '/news' },
          { name: post.title, url: `/news/${post.category}/${post.slug}` },
        ]}
        jsonLd={buildBlogPostSchema(post)}
      />
      {/* Nav */}
      <nav className="border-b border-white/5 bg-dojo-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-dojo-red flex items-center justify-center">
              <span className="font-heading text-white text-xs">M</span>
            </div>
            <span className="font-heading text-base tracking-wider text-white">MatBoss</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/news"
              className="text-[11px] font-mono text-gray-500 hover:text-white tracking-wider uppercase transition-colors"
            >
              &larr; All Posts
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-white rounded ${categoryColors[post.category]}`}>
            {categoryLabels[post.category]}
          </span>
          <span className="text-[10px] font-mono text-gray-600">{formatDate(post.date)}</span>
          <span className="text-[10px] font-mono text-gray-700">{post.readTime}</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
          {post.headline}
        </h1>

        {/* Excerpt */}
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10 border-l-2 border-dojo-red/30 pl-4">
          {post.excerpt}
        </p>

        {/* Thumbnail */}
        <div className="mb-10 rounded-lg overflow-hidden border border-white/5">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full aspect-[2/1] object-cover"
          />
        </div>

        {/* Content */}
        <ContentRenderer content={post.content} />

        {/* Bottom divider */}
        <div className="section-divider my-12" />

        {/* Post navigation */}
        <div className="grid sm:grid-cols-2 gap-4">
          {prevPost && (
            <Link
              to={`/news/${prevPost.category}/${prevPost.slug}`}
              className="group p-4 border border-white/5 rounded-lg hover:border-dojo-red/20 transition-colors"
            >
              <span className="text-[9px] font-mono text-gray-600 tracking-wider uppercase">
                &larr; Previous
              </span>
              <p className="text-sm text-white mt-1 group-hover:text-dojo-red transition-colors leading-snug">
                {prevPost.title}
              </p>
            </Link>
          )}
          {nextPost && (
            <Link
              to={`/news/${nextPost.category}/${nextPost.slug}`}
              className="group p-4 border border-white/5 rounded-lg hover:border-dojo-red/20 transition-colors sm:text-right"
            >
              <span className="text-[9px] font-mono text-gray-600 tracking-wider uppercase">
                Next &rarr;
              </span>
              <p className="text-sm text-white mt-1 group-hover:text-dojo-red transition-colors leading-snug">
                {nextPost.title}
              </p>
            </Link>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-dojo-dark border border-dojo-red/20 rounded-lg text-center">
          <p className="text-xs font-mono text-gray-500 tracking-wider uppercase mb-3">
            Stop the leaks
          </p>
          <p className="text-white text-sm mb-4">
            Your school is losing students right now. Let us show you exactly where.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dojo-red text-white text-xs font-mono rounded hover:bg-dojo-crimson transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Book Your Leakage Diagnosis Call
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
