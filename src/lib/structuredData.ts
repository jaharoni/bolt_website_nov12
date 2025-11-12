interface Address {
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string;
}

interface Image {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export const createPersonSchema = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Justin Aharoni',
  alternateName: 'J. Aharoni',
  jobTitle: 'Visual Storyteller & Photographer',
  description: 'Professional photographer and filmmaker specializing in commercial photography, event coverage, and artistic visual storytelling.',
  url: siteUrl,
  image: `${siteUrl}/images/justin-aharoni.jpg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'North Fork',
    addressRegion: 'NY',
    addressCountry: 'US',
  } as Address,
  sameAs: [
    'https://instagram.com/justinaharoni',
    'https://linkedin.com/in/justinaharoni',
    'https://twitter.com/justinaharoni',
  ],
  knowsAbout: [
    'Photography',
    'Videography',
    'Visual Storytelling',
    'Commercial Photography',
    'Event Photography',
    'Wedding Photography',
    'Portrait Photography',
    'Digital Media',
    'Film Production',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Photographer',
    occupationLocation: {
      '@type': 'City',
      name: 'New York',
    },
  },
});

export const createOrganizationSchema = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Justin Aharoni Photography',
  description: 'Professional photography and filmmaking services specializing in commercial, event, and artistic work.',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/images/studio.jpg`,
  telephone: '+1-XXX-XXX-XXXX',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'North Fork',
    addressRegion: 'NY',
    addressCountry: 'US',
  } as Address,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.9,
    longitude: -72.4,
  },
  priceRange: '$$-$$$',
  openingHours: 'Mo-Fr 09:00-18:00',
  areaServed: [
    {
      '@type': 'City',
      name: 'New York',
    },
    {
      '@type': 'State',
      name: 'New York',
    },
  ],
  sameAs: [
    'https://instagram.com/justinaharoni',
    'https://linkedin.com/in/justinaharoni',
  ],
});

export const createArticleSchema = (
  title: string,
  description: string,
  publishedDate: string,
  modifiedDate: string,
  imageUrl: string,
  url: string,
  tags: string[] = []
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description: description,
  image: {
    '@type': 'ImageObject',
    url: imageUrl,
    width: 1200,
    height: 630,
  },
  datePublished: publishedDate,
  dateModified: modifiedDate,
  author: {
    '@type': 'Person',
    name: 'Justin Aharoni',
    url: 'https://justinaharoni.com/about',
  },
  publisher: {
    '@type': 'Person',
    name: 'Justin Aharoni',
    logo: {
      '@type': 'ImageObject',
      url: 'https://justinaharoni.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url,
  },
  keywords: tags.join(', '),
});

export const createProductSchema = (
  name: string,
  description: string,
  price: number,
  currency: string,
  imageUrl: string,
  url: string,
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' = 'InStock'
) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: name,
  description: description,
  image: imageUrl,
  url: url,
  offers: {
    '@type': 'Offer',
    price: price,
    priceCurrency: currency,
    availability: `https://schema.org/${availability}`,
    url: url,
    seller: {
      '@type': 'Person',
      name: 'Justin Aharoni',
    },
  },
  brand: {
    '@type': 'Brand',
    name: 'Justin Aharoni Photography',
  },
  category: 'Photography & Fine Art',
});

export const createImageObjectSchema = (
  imageUrl: string,
  title: string,
  description: string,
  width?: number,
  height?: number,
  creator?: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  contentUrl: imageUrl,
  name: title,
  description: description,
  width: width,
  height: height,
  creator: creator || {
    '@type': 'Person',
    name: 'Justin Aharoni',
  },
  copyrightNotice: '© Justin Aharoni. All rights reserved.',
  creditText: 'Justin Aharoni Photography',
  license: 'https://justinaharoni.com/license',
});

export const createEventSchema = (
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  location: string,
  imageUrl: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: name,
  description: description,
  startDate: startDate,
  endDate: endDate,
  location: {
    '@type': 'Place',
    name: location,
  },
  image: imageUrl,
  organizer: {
    '@type': 'Person',
    name: 'Justin Aharoni',
    url: 'https://justinaharoni.com',
  },
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createPortfolioSchema = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Justin Aharoni Photography Portfolio',
  description: 'A collection of commercial, event, and personal photography work by visual storyteller Justin Aharoni.',
  url: `${siteUrl}/gallery`,
  creator: {
    '@type': 'Person',
    name: 'Justin Aharoni',
    url: siteUrl,
  },
  genre: ['Photography', 'Visual Arts', 'Commercial Photography'],
  inLanguage: 'en-US',
});

export const createWebPageSchema = (
  title: string,
  description: string,
  url: string,
  breadcrumb?: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: url,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Justin Aharoni Photography',
    url: 'https://justinaharoni.com',
  },
  ...(breadcrumb && {
    breadcrumb: createBreadcrumbSchema(breadcrumb),
  }),
  author: {
    '@type': 'Person',
    name: 'Justin Aharoni',
  },
  inLanguage: 'en-US',
});
