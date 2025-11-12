// src/lib/pages.ts
export type PageId =
  | 'home'
  | 'commercial'
  | 'events'
  | 'photoEssays'
  | 'digitalMedia'
  | 'printShop'
  | 'contact'
  | 'about';

export interface PageConfig {
  id: PageId;
  label: string;
  inScroll: boolean;
  inMenu: boolean;
}

export const pages: PageConfig[] = [
  { id: 'home', label: 'Home', inScroll: false, inMenu: false },
  { id: 'commercial', label: 'Commercial', inScroll: true, inMenu: true },
  { id: 'events', label: 'Events', inScroll: true, inMenu: true },
  { id: 'photoEssays', label: 'Photo Essays', inScroll: true, inMenu: true },
  { id: 'digitalMedia', label: 'Digital Media', inScroll: true, inMenu: true },
  { id: 'printShop', label: 'Gallery / Print Shop', inScroll: false, inMenu: true },
  { id: 'contact', label: 'Contact', inScroll: false, inMenu: true },
  { id: 'about', label: 'About', inScroll: false, inMenu: true },
];
