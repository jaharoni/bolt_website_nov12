import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Justin Aharoni - Visual Storyteller',
  description = 'Professional photographer and filmmaker specializing in commercial photography, event coverage, and artistic visual storytelling. Based in North Fork, Long Island, serving NYC and beyond.',
  keywords = ['photographer', 'visual storyteller', 'commercial photography', 'event photography', 'filmmaker', 'North Fork photographer', 'Long Island photographer', 'NYC photographer'],
  image = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200',
  url,
  type = 'website',
  noindex = false,
  article,
  structuredData,
}) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullTitle = title.includes('Justin Aharoni') ? title : `${title} | Justin Aharoni`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Justin Aharoni',
    jobTitle: 'Visual Storyteller & Photographer',
    url: siteUrl,
    image: image,
    description: 'Professional photographer and filmmaker specializing in commercial photography, event coverage, and artistic visual storytelling.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'North Fork',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    sameAs: [
      'https://instagram.com/justinaharoni',
      'https://linkedin.com/in/justinaharoni',
    ],
    knowsAbout: [
      'Photography',
      'Videography',
      'Visual Storytelling',
      'Commercial Photography',
      'Event Photography',
      'Digital Media',
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Justin Aharoni" />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <link rel="canonical" href={currentUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Justin Aharoni Photography" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@justinaharoni" />

      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
