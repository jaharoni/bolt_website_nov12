import { productService } from './database';
import { mediaService } from './mediaService';
import { essayService } from './essayService';
import { supabase } from './supabase';

export interface SearchResult {
  type: 'page' | 'media' | 'shop' | 'essay';
  id: string;
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: any;
  image?: string;
}

export interface LLMResponse {
  intent: string;
  confidence: number;
  suggestedRoute: string;
  explanation: string;
  results: SearchResult[];
}

class SearchManager {
  private searchHistory: string[] = [];

  // Main search function that will integrate with LLM
  async search(query: string): Promise<LLMResponse> {
    this.addToHistory(query);
    
    // For now, we'll use rule-based routing until LLM is connected
    const response = await this.processQuery(query);
    
    // TODO: Replace with actual LLM API call
    // const llmResponse = await this.queryLLM(query);
    
    return response;
  }

  // Process query with database integration
  private async processQuery(query: string): Promise<LLMResponse> {
    const normalized = query.toLowerCase().trim();

    // Enhanced routing logic with database search
    if (this.matchesIntent(normalized, ['essay', 'documentary', 'narrative', 'story', 'article', 'blog'])) {
      const results = await this.getEssayResults(query);
      return {
        intent: 'view_essays',
        confidence: 0.9,
        suggestedRoute: '/essays',
        explanation: 'Looking for photo essays and documentary work',
        results
      };
    }

    if (this.matchesIntent(normalized, ['about', 'bio', 'who', 'background', 'experience'])) {
      return {
        intent: 'learn_about',
        confidence: 0.95,
        suggestedRoute: '/about',
        explanation: 'Want to learn about Justin and his background',
        results: []
      };
    }

    if (this.matchesIntent(normalized, ['gallery', 'portfolio', 'work', 'photos', 'commercial', 'event'])) {
      const results = await this.getGalleryResults(query);
      return {
        intent: 'view_portfolio',
        confidence: 0.9,
        suggestedRoute: '/gallery',
        explanation: 'Looking to browse photography portfolio',
        results
      };
    }

    if (this.matchesIntent(normalized, ['shop', 'buy', 'print', 'purchase', 'store', 'merch'])) {
      const results = await this.getShopResults(query);
      return {
        intent: 'browse_shop',
        confidence: 0.9,
        suggestedRoute: '/shop',
        explanation: 'Interested in purchasing prints or merchandise',
        results
      };
    }

    if (this.matchesIntent(normalized, ['contact', 'hire', 'reach', 'email', 'phone', 'book'])) {
      return {
        intent: 'get_in_touch',
        confidence: 0.95,
        suggestedRoute: '/contact',
        explanation: 'Want to get in touch or hire for a project',
        results: []
      };
    }

    // For general queries, search across all content types
    const [essays, gallery, shop] = await Promise.all([
      this.getEssayResults(query),
      this.getGalleryResults(query),
      this.getShopResults(query)
    ]);

    const allResults = [...essays, ...gallery, ...shop]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    // Determine best route based on results
    let suggestedRoute = '/gallery';
    if (essays.length > gallery.length && essays.length > shop.length) {
      suggestedRoute = '/essays';
    } else if (shop.length > gallery.length && shop.length > essays.length) {
      suggestedRoute = '/shop';
    }

    return {
      intent: 'explore_work',
      confidence: 0.6,
      suggestedRoute,
      explanation: 'General exploration of photography work',
      results: allResults
    };
  }

  // Future LLM integration point
  private async queryLLM(query: string): Promise<LLMResponse> {
    // TODO: Implement actual LLM API call
    // This could be OpenAI, Anthropic, or a local model
    
    const apiEndpoint = '/api/search'; // Future API endpoint
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: {
            site: 'photography_portfolio',
            sections: ['about', 'gallery', 'essays', 'shop', 'contact'],
            history: this.searchHistory.slice(-5) // Last 5 searches for context
          }
        })
      });

      if (!response.ok) {
        throw new Error('LLM API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('LLM search failed:', error);
      // Fallback to rule-based system
      return this.processQuery(query);
    }
  }

  private matchesIntent(query: string, keywords: string[]): boolean {
    return keywords.some(keyword => query.includes(keyword));
  }

  private calculateRelevance(item: any, query: string): number {
    const q = query.toLowerCase();
    let score = 0;

    const title = (item.title || '').toLowerCase();
    const description = (item.description || item.excerpt || '').toLowerCase();
    const tags = item.tags || [];

    if (title.includes(q)) score += 0.5;
    if (title.startsWith(q)) score += 0.3;
    if (description.includes(q)) score += 0.2;

    for (const tag of tags) {
      if (tag.toLowerCase().includes(q)) score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private async getEssayResults(query: string): Promise<SearchResult[]> {
    try {
      const essays = await essayService.getPublishedEssays();

      const results: SearchResult[] = essays
        .map(essay => ({
          type: 'essay' as const,
          id: essay.id,
          title: essay.title,
          description: essay.excerpt || essay.subtitle || '',
          url: `/essays/${essay.slug}`,
          relevance: this.calculateRelevance(essay, query),
          image: essay.featured_image?.public_url,
          metadata: {
            published_at: essay.published_at,
            tags: essay.tags,
            read_time: essay.read_time_minutes
          }
        }))
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);

      return results;
    } catch (error) {
      console.error('Error searching essays:', error);
      return [];
    }
  }

  private async getGalleryResults(query: string): Promise<SearchResult[]> {
    try {
      const media = await mediaService.getAllMedia({
        isVisible: true,
        searchQuery: query
      });

      const results: SearchResult[] = media
        .map(item => ({
          type: 'media' as const,
          id: item.id,
          title: item.title || item.filename,
          description: item.description || item.alt_text || '',
          url: `/gallery?media=${item.id}`,
          relevance: this.calculateRelevance(item, query),
          image: item.public_url,
          metadata: {
            dimensions: item.width && item.height ? `${item.width}x${item.height}` : null,
            tags: item.tags,
            page_context: item.page_context
          }
        }))
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 8);

      return results;
    } catch (error) {
      console.error('Error searching gallery:', error);
      return [];
    }
  }

  private async getShopResults(query: string): Promise<SearchResult[]> {
    try {
      const products = await productService.searchProducts(query);

      if (!products || products.length === 0) {
        console.log('No products found for query:', query);
        return [];
      }

      const results: SearchResult[] = products
        .map(product => ({
          type: 'shop' as const,
          id: product.id,
          title: product.title,
          description: product.description,
          url: `/shop/${product.id}`,
          relevance: this.calculateRelevance(product, query),
          image: product.images[0],
          metadata: {
            price: product.base_price,
            category: product.category,
            variants: product.variants,
            in_stock: product.inventory_count === null || product.inventory_count > 0
          }
        }))
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 6);

      return results;
    } catch (error) {
      console.error('Error searching products:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private addToHistory(query: string): void {
    this.searchHistory.push(query);
    // Keep only last 20 searches
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(-20);
    }
  }

  // Get search suggestions based on history and content
  async getSuggestions(partial: string): Promise<string[]> {
    const suggestions: string[] = [];

    if (!partial || partial.length < 2) {
      return [
        'photo essays',
        'prints for sale',
        'recent work',
        'portfolio',
        'contact for booking'
      ];
    }

    try {
      const [essays, media, products] = await Promise.all([
        essayService.getPublishedEssays(),
        mediaService.getAllMedia({ isVisible: true }),
        productService.getAllProducts()
      ]);

      essays.forEach(essay => {
        if (essay.title.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.push(essay.title);
        }
        essay.tags.forEach(tag => {
          if (tag.toLowerCase().includes(partial.toLowerCase()) && !suggestions.includes(tag)) {
            suggestions.push(tag);
          }
        });
      });

      products.forEach(product => {
        if (product.title.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.push(product.title);
        }
      });

      const uniqueSuggestions = [...new Set(suggestions)];
      return uniqueSuggestions.slice(0, 5);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return this.searchHistory
        .filter(h => h.toLowerCase().includes(partial.toLowerCase()))
        .slice(-5);
    }
  }
}

export const searchManager = new SearchManager();