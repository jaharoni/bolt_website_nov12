import { supabase } from "./supabase";
import { Media } from "./types";

interface CachedBackground {
  media: Media;
  image: HTMLImageElement;
  timestamp: number;
}

class BackgroundPreloader {
  private cache = new Map<string, CachedBackground>();
  private loadingQueue = new Set<string>();
  private readonly CACHE_TTL = 30 * 60 * 1000;
  private zoneConfigCache: Map<string, any> = new Map();
  private mediaQueryCache: Map<string, Media[]> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async preloadForPage(pageKey: string, forceRefresh: boolean = false): Promise<Media | null> {
    const cached = this.cache.get(pageKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Using cached background for ${pageKey}`);
      return cached.media;
    }

    if (this.loadingQueue.has(pageKey)) {
      const existingCached = this.cache.get(pageKey);
      if (existingCached) {
        return existingCached.media;
      }
      return null;
    }

    this.loadingQueue.add(pageKey);

    try {
      const media = await this.fetchMediaForPage(pageKey, forceRefresh);
      if (media) {
        await this.decodeAndCache(pageKey, media);
        await this.recordBackgroundView(pageKey, media.id);
        return media;
      }
    } catch (error) {
      console.warn(`Error preloading background for ${pageKey}:`, error);
    } finally {
      this.loadingQueue.delete(pageKey);
    }

    return null;
  }

  async preloadMultiple(pageKeys: string[]): Promise<void> {
    await Promise.allSettled(pageKeys.map(key => this.preloadForPage(key)));
  }

  private async decodeAndCache(pageKey: string, media: Media): Promise<void> {
    const img = new Image();
    img.decoding = "async";
    img.src = media.public_url;

    try {
      if ((img as any).decode) {
        await (img as any).decode();
      } else {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image load failed"));
        });
      }

      this.cache.set(pageKey, {
        media,
        image: img,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn(`Failed to decode image for ${pageKey}:`, error);
    }
  }

  private async fetchMediaForPage(pageKey: string, forceRefresh: boolean = false): Promise<Media | null> {
    const zoneKey = pageKey === "home" ? "home.background" : `page.${pageKey}.background`;

    let zoneConfig = this.zoneConfigCache.get(zoneKey);
    if (!zoneConfig || forceRefresh) {
      const { data: zone } = await supabase
        .from("site_zones")
        .select("*")
        .eq("key", zoneKey)
        .maybeSingle();

      if (zone) {
        zoneConfig = {
          randomization_enabled: zone.randomization_enabled ?? true,
          static_media_id: zone.static_media_id,
          ...zone.config_json
        };
        this.zoneConfigCache.set(zoneKey, zoneConfig);
      }
    }

    if (zoneConfig?.randomization_enabled === false && zoneConfig?.static_media_id) {
      const { data: staticMedia } = await supabase
        .from("media_items")
        .select("*")
        .eq("id", zoneConfig.static_media_id)
        .maybeSingle();

      if (staticMedia) {
        return staticMedia as Media;
      }
    }

    const recentIds = await this.getRecentBackgroundIds(pageKey);

    if (zoneConfig?.source) {
      const cfg = zoneConfig.source;

      if (cfg.type === "gallery") {
        const cacheKey = `gallery:${cfg.value}`;
        let mediaList = this.mediaQueryCache.get(cacheKey);

        if (!mediaList || forceRefresh) {
          const { data } = await supabase
            .from("gallery_items")
            .select("media:media_items(*)")
            .eq("gallery_id", cfg.value);
          mediaList = (data ?? []).map((r: any) => r.media as Media).filter(Boolean);
          if (mediaList.length > 0) {
            this.mediaQueryCache.set(cacheKey, mediaList);
          }
        }

        return this.pickRandomExcluding(mediaList, recentIds);
      } else if (cfg.type === "folder") {
        const cacheKey = `folder:${cfg.value}`;
        let mediaList = this.mediaQueryCache.get(cacheKey);

        if (!mediaList || forceRefresh) {
          const { data } = await supabase
            .from("media_items")
            .select("*")
            .eq("folder_id", cfg.value)
            .eq("is_active", true);
          mediaList = (data ?? []) as Media[];
          if (mediaList.length > 0) {
            this.mediaQueryCache.set(cacheKey, mediaList);
          }
        }

        return this.pickRandomExcluding(mediaList, recentIds);
      } else if (cfg.type === "tag") {
        const cacheKey = `tag:${cfg.value}`;
        let mediaList = this.mediaQueryCache.get(cacheKey);

        if (!mediaList || forceRefresh) {
          const { data } = await supabase
            .from("media_items")
            .select("*")
            .contains("tags", [cfg.value])
            .eq("is_active", true);
          mediaList = (data ?? []) as Media[];
          if (mediaList.length > 0) {
            this.mediaQueryCache.set(cacheKey, mediaList);
          }
        }

        return this.pickRandomExcluding(mediaList, recentIds);
      }
    }

    const { data: backgroundsFolderData } = await supabase
      .from("media_folders")
      .select("id")
      .eq("slug", "backgrounds")
      .maybeSingle();

    if (backgroundsFolderData) {
      const { data: legacy } = await supabase
        .from("media_items")
        .select("*")
        .eq("folder_id", backgroundsFolderData.id)
        .eq("is_active", true)
        .or(`page_context.eq.${pageKey},page_context.eq.background`);

      if (legacy?.length) {
        return this.pickRandomExcluding(legacy as Media[], recentIds);
      }
    }

    const { data: tagMatch } = await supabase
      .from("media_items")
      .select("*")
      .eq("is_active", true)
      .contains("tags", [pageKey]);

    if (tagMatch?.length) {
      return this.pickRandomExcluding(tagMatch as Media[], recentIds);
    }

    const { data: homebg } = await supabase
      .from("media_items")
      .select("*")
      .eq("is_active", true)
      .contains("tags", ["homebg"]);

    return this.pickRandomExcluding((homebg ?? []) as Media[], recentIds);
  }

  private async getRecentBackgroundIds(pageKey: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_backgrounds', {
        p_page_key: pageKey,
        p_limit: 5
      });

      if (error) {
        console.warn('Error fetching recent backgrounds:', error);
        return [];
      }

      return (data ?? []).map((r: any) => r.media_id);
    } catch (error) {
      console.warn('Error fetching recent backgrounds:', error);
      return [];
    }
  }

  private async recordBackgroundView(pageKey: string, mediaId: string): Promise<void> {
    try {
      await supabase.rpc('record_background_view', {
        p_page_key: pageKey,
        p_media_id: mediaId,
        p_session_id: this.sessionId
      });
    } catch (error) {
      console.warn('Error recording background view:', error);
    }
  }

  private pickRandom<T>(arr: T[]): T | null {
    if (!arr || !arr.length) return null;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx] ?? null;
  }

  private pickRandomExcluding(arr: Media[], excludeIds: string[]): Media | null {
    if (!arr || !arr.length) return null;

    const filtered = arr.filter(m => !excludeIds.includes(m.id));

    if (filtered.length === 0) {
      return this.pickRandom(arr);
    }

    return this.pickRandom(filtered);
  }

  getCached(pageKey: string): CachedBackground | null {
    const cached = this.cache.get(pageKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }
    return null;
  }

  clearCache(): void {
    this.cache.clear();
    this.zoneConfigCache.clear();
    this.mediaQueryCache.clear();
    this.loadingQueue.clear();
  }

  clearPageCache(pageKey: string): void {
    this.cache.delete(pageKey);
  }

  refreshZoneConfig(pageKey?: string): void {
    if (pageKey) {
      const zoneKey = pageKey === "home" ? "home.background" : `page.${pageKey}.background`;
      this.zoneConfigCache.delete(zoneKey);
    } else {
      this.zoneConfigCache.clear();
    }
  }

  prefetchAllPages(): void {
    const allPages = ["home", "about", "gallery", "essays", "shop", "contact"];
    requestIdleCallback(() => {
      this.preloadMultiple(allPages);
    }, { timeout: 5000 });
  }
}

export const backgroundPreloader = new BackgroundPreloader();
