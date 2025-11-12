import { supabase } from './supabase';

interface PreloadedImage {
  url: string;
  loaded: boolean;
  element: HTMLImageElement;
}

class BackgroundImagePreloader {
  private images: Map<string, PreloadedImage> = new Map();
  private preloadPromise: Promise<void> | null = null;
  private initialized = false;

  async preloadAll(): Promise<void> {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = this.fetchAndPreload();
    return this.preloadPromise;
  }

  private async fetchAndPreload(): Promise<void> {
    try {
      const { data: folder } = await supabase
        .from('media_folders')
        .select('id')
        .eq('slug', 'backgrounds')
        .maybeSingle();

      if (!folder) return;

      const { data: media } = await supabase
        .from('media_items')
        .select('public_url')
        .eq('folder_id', folder.id)
        .eq('is_active', true)
        .eq('media_type', 'image')
        .order('created_at');

      if (!media || media.length === 0) return;

      const preloadPromises = media.map(item => this.preloadImage(item.public_url));
      await Promise.allSettled(preloadPromises);

      this.initialized = true;
    } catch (error) {
      console.warn('Background preload error:', error);
    }
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.images.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      const preloadedImage: PreloadedImage = {
        url,
        loaded: false,
        element: img
      };

      this.images.set(url, preloadedImage);

      img.onload = () => {
        preloadedImage.loaded = true;
        resolve();
      };

      img.onerror = () => {
        resolve();
      };

      img.src = url;
    });
  }

  isPreloaded(url: string): boolean {
    return this.images.get(url)?.loaded || false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getPreloadedUrls(): string[] {
    return Array.from(this.images.keys());
  }
}

export const backgroundImagePreloader = new BackgroundImagePreloader();
