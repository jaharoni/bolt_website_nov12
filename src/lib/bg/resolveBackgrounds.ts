import { supabase, isSupabaseConfigured } from '../supabase';

export type ResolvedBackground = {
  urls: string[];
  carouselEnabled: boolean;
  carouselIntervalMs: number;
  randomizationEnabled: boolean;
};

const configCache = new Map<string, { config: any; timestamp: number }>();
const CONFIG_CACHE_TTL = 60000;

export async function resolveBackgroundsForPage(pageKey: string): Promise<ResolvedBackground> {
  if (!isSupabaseConfigured) {
    return {
      urls: [],
      carouselEnabled: false,
      carouselIntervalMs: 7000,
      randomizationEnabled: true
    };
  }

  const zoneKey = pageKey === 'home' ? 'home.background' : `page.${pageKey}.background`;

  const cached = configCache.get(zoneKey);
  const now = Date.now();

  let zone;
  if (cached && (now - cached.timestamp) < CONFIG_CACHE_TTL) {
    zone = cached.config;
  } else {
    const { data } = await supabase
      .from('site_zones')
      .select('carousel_enabled, carousel_interval_ms, randomization_enabled, config_json')
      .eq('key', zoneKey)
      .maybeSingle();

    zone = data;
    if (zone) {
      configCache.set(zoneKey, { config: zone, timestamp: now });
    }
  }

  const carouselEnabled = zone?.carousel_enabled ?? false;
  const carouselIntervalMs = zone?.carousel_interval_ms ?? 7000;
  const randomizationEnabled = zone?.randomization_enabled ?? true;
  const configJson = (zone?.config_json as any) || {};

  const urls = await resolveUrls(pageKey, configJson);

  return {
    urls,
    carouselEnabled,
    carouselIntervalMs,
    randomizationEnabled
  };
}

async function resolveUrls(pageKey: string, configJson: any): Promise<string[]> {
  let imageList: string[] = [];

  const folders = configJson.folders || ['backgrounds'];

  for (const folderSlug of folders) {
    const { data: folder } = await supabase
      .from('media_folders')
      .select('id, name, slug')
      .eq('slug', folderSlug)
      .maybeSingle();

    if (folder) {
      const { data: media } = await supabase
        .from('media_items')
        .select('public_url')
        .eq('folder_id', folder.id)
        .eq('is_active', true)
        .eq('media_type', 'image')
        .order('created_at');

      if (media && media.length > 0) {
        imageList.push(...media.map(m => m.public_url));
      }
    }
  }

  if (imageList.length === 0) {
    const { data: fallbackFolder } = await supabase
      .from('media_folders')
      .select('id')
      .eq('slug', 'backgrounds')
      .maybeSingle();

    if (fallbackFolder) {
      const { data: fallbackMedia } = await supabase
        .from('media_items')
        .select('public_url')
        .eq('folder_id', fallbackFolder.id)
        .eq('is_active', true)
        .eq('media_type', 'image')
        .order('created_at');

      if (fallbackMedia && fallbackMedia.length > 0) {
        imageList.push(...fallbackMedia.map(m => m.public_url));
      }
    }
  }

  if (imageList.length === 0) {
    console.warn('[resolveBackgrounds] No images found in configured folders, trying any active images');
    const { data: anyImages } = await supabase
      .from('media_items')
      .select('public_url')
      .eq('is_active', true)
      .eq('media_type', 'image')
      .order('created_at')
      .limit(20);

    if (anyImages && anyImages.length > 0) {
      imageList.push(...anyImages.map(m => m.public_url));
    }
  }

  return imageList;
}

export function clearBackgroundCache() {
  configCache.clear();
}
