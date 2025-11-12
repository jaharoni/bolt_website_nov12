import { essayService } from './essayService';
import { productService } from './database';
import { supabase } from './supabase';

export interface SiteSearchContext {
  pages: Array<{ title: string; path: string; description: string }>;
  essays: Array<{ title: string; slug: string; excerpt: string; tags: string[] }>;
  products: Array<{ title: string; id: string; category: string; price: number }>;
  gallery: Array<{ title: string; category: string; slug: string }>;
  timestamp: number;
}

class SearchContextBuilder {
  private cache: SiteSearchContext | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private readonly STATIC_PAGES = [
    {
      title: "Home",
      path: "/",
      description: "Landing page with portfolio highlights and recent work"
    },
    {
      title: "About",
      path: "/about",
      description: "Biography, experience, client list, and photography approach"
    },
    {
      title: "Gallery",
      path: "/gallery",
      description: "Photography portfolio organized by categories: commercial, events, personal work"
    },
    {
      title: "Shop",
      path: "/shop",
      description: "Prints and merchandise for purchase"
    },
    {
      title: "Essays",
      path: "/essays",
      description: "Long-form photo documentary projects and narratives"
    },
    {
      title: "Contact",
      path: "/contact",
      description: "Get in touch for bookings, inquiries, and project consultations"
    }
  ];

  async getContext(): Promise<SiteSearchContext> {
    const now = Date.now();

    if (this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const [essays, products, galleryProjects] = await Promise.all([
        this.fetchEssays(),
        this.fetchProducts(),
        this.fetchGalleryProjects()
      ]);

      this.cache = {
        pages: this.STATIC_PAGES,
        essays,
        products,
        gallery: galleryProjects,
        timestamp: now
      };

      this.cacheExpiry = now + this.CACHE_TTL;
      return this.cache;
    } catch (error) {
      console.error('Failed to build search context:', error);

      return {
        pages: this.STATIC_PAGES,
        essays: [],
        products: [],
        gallery: [],
        timestamp: now
      };
    }
  }

  async getCompactContext(): Promise<string> {
    const context = await this.getContext();

    const compact = {
      pages: context.pages.map(p => ({ t: p.title, p: p.path })),
      essays: context.essays.slice(0, 10).map(e => ({
        t: e.title,
        s: e.slug,
        tags: e.tags.slice(0, 3)
      })),
      products: context.products.slice(0, 15).map(p => ({
        t: p.title,
        c: p.category,
        p: p.price
      })),
      gallery: context.gallery.slice(0, 8).map(g => ({
        t: g.title,
        c: g.category
      }))
    };

    return JSON.stringify(compact);
  }

  private async fetchEssays() {
    try {
      const essays = await essayService.getPublishedEssays();
      return essays.map(essay => ({
        title: essay.title,
        slug: essay.slug,
        excerpt: essay.excerpt || essay.subtitle || '',
        tags: essay.tags || []
      }));
    } catch (error) {
      console.error('Failed to fetch essays for context:', error);
      return [];
    }
  }

  private async fetchProducts() {
    try {
      const products = await productService.getAllProducts();
      return products
        .filter(p => p.is_active)
        .map(product => ({
          title: product.title,
          id: product.id,
          category: product.category,
          price: product.base_price
        }));
    } catch (error) {
      console.error('Failed to fetch products for context:', error);
      return [];
    }
  }

  private async fetchGalleryProjects() {
    try {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select('title, category, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(15);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch gallery projects for context:', error);
      return [];
    }
  }

  clearCache() {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export const searchContextBuilder = new SearchContextBuilder();
