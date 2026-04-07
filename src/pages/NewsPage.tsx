import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsAnnouncementBar from '../components/news/NewsAnnouncementBar';
import NewsTicker from '../components/news/NewsTicker';
import NotificationRail from '../components/news/NotificationRail';
import NewsHero from '../components/news/NewsHero';
import FeaturedPosts from '../components/news/FeaturedPosts';
import PostList from '../components/news/PostList';
import RevenueLeakageSVG from '../components/news/RevenueLeakageSVG';
import Footer from '../components/Footer';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-dojo-black text-white">
      <SEO
        title="News — San Diego Martial Arts Enrollment Intelligence by MatBoss"
        description="MatBoss News by Ammar Alkheder — market intelligence, enrollment data, and automation insights for San Diego martial arts schools, BJJ academies, and dojos. The enrollment crisis data the industry doesn't want you to see."
        canonical="/news"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'News', url: '/news' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': 'https://matboss.online/news',
          name: 'MatBoss News — San Diego Martial Arts Enrollment Intelligence',
          description: 'Market intelligence and enrollment automation insights for San Diego martial arts schools by Ammar Alkheder.',
          url: 'https://matboss.online/news',
          publisher: { '@id': 'https://matboss.online/#organization' },
          author: { '@id': 'https://matboss.online/#founder' },
          inLanguage: 'en-US',
        }}
      />
      {/* Announcement Bar */}
      <NewsAnnouncementBar />

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
              className="text-[11px] font-mono text-dojo-red tracking-wider uppercase"
            >
              News
            </Link>
            <Link
              to="/"
              className="text-[11px] font-mono text-gray-500 hover:text-white tracking-wider uppercase transition-colors"
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-[11px] font-mono text-gray-500 hover:text-white tracking-wider uppercase transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Ticker */}
      <NewsTicker />

      {/* Notification Rail */}
      <NotificationRail />

      {/* Hero */}
      <NewsHero />

      {/* Divider */}
      <div className="section-divider" />

      {/* Featured Posts */}
      <FeaturedPosts />

      {/* Revenue Leakage Diagram — between sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <RevenueLeakageSVG className="w-full" />
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* All Posts Table */}
      <PostList />

      {/* Footer */}
      <Footer />
    </div>
  );
}
