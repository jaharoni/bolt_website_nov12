import { SearchResult } from './searchManager';

export interface AISearchOptions {
  enableAI?: boolean;
  enableRerank?: boolean;
  limit?: number;
}

export interface AISearchResponse {
  results: SearchResult[];
  explanations?: Record<string, string>;
  confidence?: number;
  usedAI: boolean;
  usedRerank: boolean;
  responseTime?: number;
  error?: string;
}

class AISearchClient {
  private apiUrl: string;
  private abortController: AbortController | null = null;
  private cache: Map<string, { response: AISearchResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.apiUrl = `${supabaseUrl}/functions/v1/ai-search`;
  }

  async search(
    query: string,
    options: AISearchOptions = {}
  ): Promise<AISearchResponse> {
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    try {
      const startTime = Date.now();

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          enableAI: options.enableAI ?? true,
          enableRerank: options.enableRerank ?? false,
          limit: options.limit ?? 10,
        }),
        signal: this.abortController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      const searchResponse: AISearchResponse = {
        ...data,
        responseTime: Date.now() - startTime,
      };

      this.setCache(cacheKey, searchResponse);
      return searchResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Search cancelled');
      }

      console.error('AI search error:', error);

      return {
        results: [],
        usedAI: false,
        usedRerank: false,
        error: error.message || 'Search failed',
      };
    } finally {
      this.abortController = null;
    }
  }

  async rerankResults(
    query: string,
    results: SearchResult[]
  ): Promise<AISearchResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/rerank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          results,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reranking failed');
      }

      return {
        ...data,
        usedRerank: true,
      };
    } catch (error: any) {
      console.error('AI rerank error:', error);

      return {
        results,
        usedAI: false,
        usedRerank: false,
        error: error.message,
      };
    }
  }

  async explainResult(
    query: string,
    result: SearchResult
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          result,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Explanation failed');
      }

      return data.explanation || '';
    } catch (error: any) {
      console.error('AI explain error:', error);
      return '';
    }
  }

  cancelSearch() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private getCacheKey(query: string, options: AISearchOptions): string {
    return `${query}:${options.enableAI}:${options.enableRerank}:${options.limit}`;
  }

  private getFromCache(key: string): AISearchResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  private setCache(key: string, response: AISearchResponse) {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });

    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const aiSearchClient = new AISearchClient();
