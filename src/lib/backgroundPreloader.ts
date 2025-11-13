import { supabase, isSupabaseConfigured } from "./supabase";
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
  private zoneConfigCache: Map<string, ZoneConfig | null> = new Map();
  private mediaQueryCache: Map<string, Media[]> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async preloadForPage(pageKey: string, forceRefresh: boolean = false): Promise<Media | null> {
    const zoneConfig = await this.resolveZoneConfig(pageKey, forceRefresh);
    const randomizationEnabled = zoneConfig?.randomization_enabled !== false;
    const cached = this.cache.get(pageKey);
    const cacheValid = cached && Date.now() - cached.timestamp < this.CACHE_TTL;

    if (!randomizationEnabled && !forceRefresh && cacheValid && cached) {
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
      const excludeIds = randomizationEnabled && cached ? [cached.media.id] : [];
      const media = await this.fetchMediaForPage(pageKey, zoneConfig, forceRefresh, excludeIds);
      if (media) {
        await this.decodeAndCache(pageKey, media);
        if (randomizationEnabled) {
          await this.recordBackgroundView(pageKey, media.id);
        }
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

  private async fetchMediaForPage(
    pageKey: string,
    zoneConfig: ZoneConfig | null,
    forceRefresh: boolean = false,
    extraExcludeIds: string[] = []
  ): Promise<Media | null> {
    if (!isSupabaseConfigured) {
      return null;
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
    const excludeIds = Array.from(new Set([...recentIds, ...extraExcludeIds]));

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

          return this.pickRandomExcluding(mediaList, excludeIds);
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

          return this.pickRandomExcluding(mediaList, excludeIds);
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

          return this.pickRandomExcluding(mediaList, excludeIds);
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
          return this.pickRandomExcluding(legacy as Media[], excludeIds);
      }
    }

    const { data: tagMatch } = await supabase
      .from("media_items")
      .select("*")
      .eq("is_active", true)
      .contains("tags", [pageKey]);

      if (tagMatch?.length) {
        return this.pickRandomExcluding(tagMatch as Media[], excludeIds);
    }

    const { data: homebg } = await supabase
      .from("media_items")
      .select("*")
      .eq("is_active", true)
      .contains("tags", ["homebg"]);

      return this.pickRandomExcluding((homebg ?? []) as Media[], excludeIds);
  }

  private async getRecentBackgroundIds(pageKey: string): Promise<string[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
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
    if (!isSupabaseConfigured) {
      return;
    }
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
    this.zoneConfigCache.delete(this.getZoneKey(pageKey));
  }

  refreshZoneConfig(pageKey?: string): void {
    if (pageKey) {
      this.zoneConfigCache.delete(this.getZoneKey(pageKey));
    } else {
      this.zoneConfigCache.clear();
    }
  }

  private getZoneKey(pageKey: string): string {
    return pageKey === "home" ? "home.background" : `page.${pageKey}.background`;
  }

  private async resolveZoneConfig(pageKey: string, forceRefresh = false): Promise<ZoneConfig | null> {
    const zoneKey = this.getZoneKey(pageKey);

    if (!isSupabaseConfigured) {
      return null;
    }

    let config = this.zoneConfigCache.get(zoneKey) ?? null;
    if (!config || forceRefresh) {
      const { data: zone, error } = await supabase
        .from("site_zones")
        .select("randomization_enabled, static_media_id, config_json")
        .eq("key", zoneKey)
        .maybeSingle();

      if (error) {
        console.warn(`Error fetching zone config for ${zoneKey}:`, error);
      }

      if (zone) {
        config = {
          randomization_enabled: zone.randomization_enabled ?? true,
          static_media_id: zone.static_media_id ?? null,
          ...(zone.config_json ?? {}),
        } as ZoneConfig;
      } else {
        config = null;
      }

      this.zoneConfigCache.set(zoneKey, config);
    }

    return config;
  }

  prefetchAllPages(): void {
    if (!isSupabaseConfigured) {
      return;
    }
    const allPages = ["home", "about", "gallery", "essays", "shop", "contact"];
    requestIdleCallback(() => {
      this.preloadMultiple(allPages);
    }, { timeout: 5000 });
  }
}

interface ZoneConfig {
  randomization_enabled?: boolean;
  static_media_id?: string | null;
  source?: {
    type: "gallery" | "folder" | "tag";
    value: string;
  };
  [key: string]: any;
}

export const backgroundPreloader = new BackgroundPreloader();
