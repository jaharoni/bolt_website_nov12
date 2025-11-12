export interface BrandLogo {
  name: string;
  logoUrl?: string;
  fallbackColor: string;
  initials: string;
}

const brands: BrandLogo[] = [
  {
    name: 'Google',
    fallbackColor: '#4285F4',
    initials: 'G'
  },
  {
    name: 'Nike',
    fallbackColor: '#111111',
    initials: 'N'
  },
  {
    name: 'National Pork Board',
    fallbackColor: '#C41E3A',
    initials: 'NPB'
  },
  {
    name: 'T-Mobile',
    fallbackColor: '#E20074',
    initials: 'T'
  },
  {
    name: 'The Barnstorm',
    fallbackColor: '#8B4513',
    initials: 'TB'
  },
  {
    name: 'NBC Sports Bay Area',
    fallbackColor: '#0056A5',
    initials: 'NBC'
  },
  {
    name: 'Food Network',
    fallbackColor: '#E87722',
    initials: 'FN'
  },
  {
    name: 'MSG',
    fallbackColor: '#0046AD',
    initials: 'MSG'
  },
  {
    name: 'Honda',
    fallbackColor: '#C41E3A',
    initials: 'H'
  }
];

export const getBrandLogos = (): BrandLogo[] => {
  return [...brands].sort(() => Math.random() - 0.5);
};

export const getBrandLogo = (name: string): BrandLogo | undefined => {
  return brands.find(brand => brand.name === name);
};
