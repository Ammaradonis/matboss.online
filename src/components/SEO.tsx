import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  article?: {
    publishedTime: string;
    author: string;
    section: string;
  };
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: { name: string; url: string }[];
  faq?: { question: string; answer: string }[];
}

const SITE_URL = 'https://matboss.online';
const SITE_NAME = 'MatBoss Official Website';
const DEFAULT_TITLE = 'MatBoss Official Website | Enrollment Automation for San Diego Martial Arts Schools';
const DEFAULT_DESC =
  'MatBoss by Ammar Alkheder — the #1 enrollment automation system built exclusively for San Diego martial arts schools, BJJ academies, and dojos. Stop losing 40% of trial students to no-shows. Book your free Leakage Diagnosis Call.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const FOUNDER = 'Ammar Alkheder';

/* ──────────────────────────────────────────────
   Structured Data: Organization + LocalBusiness
   This "stacks" both types so Google can index
   MatBoss as both a tech company AND a local
   San Diego business entity.
   ────────────────────────────────────────────── */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: 'MatBoss',
  alternateName: ['MatBoss Online', 'MatBoss Official Website', 'MatBoss San Diego', 'MatBoss Enrollment Automation'],
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  image: DEFAULT_IMAGE,
  description: DEFAULT_DESC,
  founder: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#founder`,
    name: FOUNDER,
    jobTitle: 'Founder & CEO',
    url: SITE_URL,
    description: `${FOUNDER} is the founder of MatBoss, the enrollment automation platform built for San Diego martial arts schools. Based in San Diego, California.`,
    knowsAbout: [
      'Martial Arts School Management',
      'Enrollment Automation',
      'San Diego Martial Arts',
      'BJJ Academy Operations',
      'No-Show Recovery Systems',
      'SaaS for Martial Arts',
    ],
    worksFor: { '@type': 'Organization', name: 'MatBoss' },
  },
  foundingDate: '2021',
  foundingLocation: {
    '@type': 'Place',
    name: 'San Diego, California',
    address: { '@type': 'PostalAddress', addressLocality: 'San Diego', addressRegion: 'CA', addressCountry: 'US' },
  },
  areaServed: {
    '@type': 'City',
    name: 'San Diego',
    containedInPlace: { '@type': 'State', name: 'California' },
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Diego',
    addressRegion: 'CA',
    postalCode: '92101',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.7157,
    longitude: -117.1611,
  },
  priceRange: '$$',
  slogan: 'Enrollment Discipline for San Diego Martial Arts Schools',
  knowsAbout: [
    'Martial Arts Enrollment Automation',
    'Dojo Management Software',
    'BJJ Academy Enrollment',
    'No-Show Recovery for Martial Arts',
    'San Diego Martial Arts Business',
    'Trial Student Conversion',
  ],
  makesOffer: [
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Enrollment Automation System',
        description: 'Automated booking, reminders, no-show recovery, and follow-up for San Diego martial arts schools.',
        areaServed: { '@type': 'City', name: 'San Diego' },
        serviceType: 'Enrollment Automation',
        provider: { '@type': 'Organization', name: 'MatBoss' },
      },
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Free Enrollment Leakage Diagnosis',
        description: 'Complimentary audit of your martial arts school enrollment funnel to identify where trial students are being lost.',
        areaServed: { '@type': 'City', name: 'San Diego' },
        serviceType: 'Enrollment Consulting',
        provider: { '@type': 'Organization', name: 'MatBoss' },
      },
    },
  ],
};

/* ──────────────────────────────────────────────
   Structured Data: WebSite with SearchAction
   Attempts to trigger Google Sitelinks Searchbox
   ────────────────────────────────────────────── */
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: 'MatBoss',
  url: SITE_URL,
  description: DEFAULT_DESC,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/news?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-US',
};

/* ──────────────────────────────────────────────
   Person Schema for Ammar Alkheder
   Pushes for Knowledge Panel recognition
   ────────────────────────────────────────────── */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#founder`,
  name: FOUNDER,
  alternateName: ['Ammar Alkheder MatBoss', 'Ammar Alkheder San Diego'],
  jobTitle: 'Founder & CEO of MatBoss',
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  description: `${FOUNDER} is the founder and CEO of MatBoss, the enrollment automation platform revolutionizing how San Diego martial arts schools convert trial students into paying members.`,
  knowsAbout: [
    'Enrollment Automation',
    'Martial Arts Business Systems',
    'San Diego Martial Arts Industry',
    'SaaS Development',
    'No-Show Recovery',
    'BJJ Academy Management',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'MatBoss',
    url: SITE_URL,
  },
  homeLocation: {
    '@type': 'City',
    name: 'San Diego',
    containedInPlace: { '@type': 'State', name: 'California' },
  },
};

function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

function buildFAQSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildBlogPostSchema(post: {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  category: string;
  thumbnail: string;
  readTime: string;
  content: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/news/${post.category}/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail.startsWith('http') ? post.thumbnail : `${SITE_URL}${post.thumbnail}`,
    datePublished: post.date,
    dateModified: post.date,
    wordCount: post.content.join(' ').split(/\s+/).length,
    timeRequired: `PT${parseInt(post.readTime)}M`,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#founder`,
      name: FOUNDER,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'MatBoss',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${post.category}/${post.slug}`,
    },
    articleSection: post.category,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: [
      { '@type': 'Thing', name: 'San Diego Martial Arts' },
      { '@type': 'Thing', name: 'Enrollment Automation' },
      { '@type': 'Thing', name: 'Martial Arts School Management' },
    ],
    keywords: `MatBoss, ${FOUNDER}, San Diego martial arts, enrollment automation, ${post.category}, dojo management, BJJ San Diego`,
  };
}

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  article,
  noindex = false,
  jsonLd,
  breadcrumbs,
  faq,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const pageUrl = canonical ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`) : SITE_URL;
  const pageImage = ogImage || DEFAULT_IMAGE;

  // Collect all JSON-LD schemas to inject
  const schemas: Record<string, unknown>[] = [organizationSchema, websiteSchema, personSchema];
  if (breadcrumbs) schemas.push(buildBreadcrumbSchema(breadcrumbs));
  if (faq) schemas.push(buildFAQSchema(faq));
  if (jsonLd) {
    if (Array.isArray(jsonLd)) schemas.push(...jsonLd);
    else schemas.push(jsonLd);
  }

  return (
    <Helmet>
      {/* Core */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={pageUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />}

      {/* Geo-targeting — San Diego hyper-local */}
      <meta name="geo.region" content="US-CA" />
      <meta name="geo.placename" content="San Diego" />
      <meta name="geo.position" content="32.7157;-117.1611" />
      <meta name="ICBM" content="32.7157, -117.1611" />

      {/* Extended keywords for indexing */}
      <meta
        name="keywords"
        content={`MatBoss, MatBoss Official Website, ${FOUNDER}, San Diego martial arts, enrollment automation, BJJ academy San Diego, martial arts school management, no-show recovery, San Diego dojo, martial arts enrollment system, dojo automation San Diego, karate school San Diego, MMA gym San Diego, martial arts CRM, trial student conversion, enrollment leakage, San Diego BJJ, martial arts business software, dojo management system, martial arts SaaS San Diego`}
      />

      {/* Author */}
      <meta name="author" content={FOUNDER} />
      <meta name="creator" content={FOUNDER} />
      <meta name="publisher" content="MatBoss" />

      {/* Open Graph — full suite */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} — Enrollment Automation for San Diego Martial Arts Schools`} />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OG */}
      {article && <meta property="article:published_time" content={article.publishedTime} />}
      {article && <meta property="article:author" content={article.author} />}
      {article && <meta property="article:section" content={article.section} />}

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — San Diego Martial Arts Enrollment Automation`} />

      {/* Structured Data — all schemas injected at once */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
