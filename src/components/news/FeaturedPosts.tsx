import { Link } from 'react-router-dom';
import { getFeaturedPosts, categoryLabels, categoryColors, type BlogPost } from '../../data/posts';

export default function FeaturedPosts({ posts }: { posts: BlogPost[] }) {
  const featured = getFeaturedPosts(5, posts);
  const [lead, ...rest] = featured;

  if (!lead) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <span className="h-px w-8 bg-dojo-red/40" />
        <h2 className="text-xs font-mono text-gray-500 tracking-[0.25em] uppercase">
          Featured Intelligence
        </h2>
        <span className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead story — large card */}
        <Link
          to={`/news/${lead.category}/${lead.slug}`}
          className="group relative bg-dojo-dark border border-white/5 rounded-lg overflow-hidden hover:border-dojo-red/20 transition-all duration-300"
        >
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={lead.thumbnail}
              alt={lead.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-white rounded ${categoryColors[lead.category]}`}>
                {categoryLabels[lead.category]}
              </span>
              <span className="text-[10px] font-mono text-gray-600">{formatDate(lead.date)}</span>
              <span className="text-[10px] font-mono text-gray-700">{lead.readTime}</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl text-white leading-tight mb-3 group-hover:text-dojo-red transition-colors">
              {lead.headline}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {lead.excerpt}
            </p>
          </div>
        </Link>

        {/* Secondary stories — 2x2 grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {rest.map((post) => (
            <Link
              key={post.id}
              to={`/news/${post.category}/${post.slug}`}
              className="group bg-dojo-dark border border-white/5 rounded-lg overflow-hidden hover:border-dojo-red/20 transition-all duration-300"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider text-white rounded ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <span className="text-[9px] font-mono text-gray-600">{formatDate(post.date)}</span>
                </div>
                <h3 className="font-heading text-base sm:text-lg text-white leading-tight group-hover:text-dojo-red transition-colors">
                  {post.headline}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
