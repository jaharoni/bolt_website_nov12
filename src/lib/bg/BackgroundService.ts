type CacheEntry = {
  url: string;
  img: HTMLImageElement;
  lastUsed: number;
};

class BackgroundService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxCacheSize = 10;
  private preloadQueue: Set<string> = new Set();
  private listeners: Set<(pageKey: string, imageUrl: string) => void> = new Set();

  subscribe(callback: (pageKey: string, imageUrl: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(pageKey: string, imageUrl: string): void {
    this.listeners.forEach(listener => listener(pageKey, imageUrl));
  }

  preload(url: string): Promise<HTMLImageElement> {
    const cached = this.cache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      return Promise.resolve(cached.img);
    }

    if (this.preloadQueue.has(url)) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const entry = this.cache.get(url);
          if (entry) {
            clearInterval(checkInterval);
            resolve(entry.img);
          }
        }, 50);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Preload timeout'));
        }, 10000);
      });
    }

    this.preloadQueue.add(url);

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.preloadQueue.delete(url);

        if (this.cache.size >= this.maxCacheSize) {
          this.evictLRU();
        }

        const entry: CacheEntry = {
          url,
          img,
          lastUsed: Date.now()
        };

        this.cache.set(url, entry);
        resolve(img);
      };

      img.onerror = () => {
        this.preloadQueue.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  async preloadMultiple(urls: string[]): Promise<void> {
    const promises = urls.slice(0, 4).map(url =>
      this.preload(url).catch(err => console.warn(`Failed to preload ${url}:`, err))
    );
    await Promise.all(promises);
  }

  isPreloaded(url: string): boolean {
    return this.cache.has(url);
  }

  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  async loadForPage(pageKey: string, imageUrl: string): Promise<void> {
    await this.preload(imageUrl);
    this.notify(pageKey, imageUrl);
  }
}

export const backgroundService = new BackgroundService();
