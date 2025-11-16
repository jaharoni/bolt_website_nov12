import { supabase, isSupabaseConfigured } from '../supabase';

export type ResolvedBackground = {
  urls: string[];
  carouselEnabled: boolean;
  carouselIntervalMs: number;
  randomizationEnabled: boolean;
};

const pageCache = new Map<string, { resolved: ResolvedBackground; timestamp: number }>();
const CACHE_TTL = 30000;

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

  const { data: zone } = await supabase
    .from('site_zones')
    .select('carousel_enabled, carousel_interval_ms, randomization_enabled, config_json')
    .eq('key', zoneKey)
    .maybeSingle();

  const carouselEnabled = zone?.carousel_enabled ?? false;
  const carouselIntervalMs = zone?.carousel_interval_ms ?? 7000;
  const randomizationEnabled = zone?.randomization_enabled ?? true;
  const configJson = (zone?.config_json as any) || {};

  if (randomizationEnabled || carouselEnabled) {
    const urls = await resolveUrls(pageKey, configJson);
    return {
      urls,
      carouselEnabled,
      carouselIntervalMs,
      randomizationEnabled
    };
  }

  const cached = pageCache.get(pageKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.resolved;
  }

  const urls = await resolveUrls(pageKey, configJson);

  const resolved = {
    urls,
    carouselEnabled: false,
    carouselIntervalMs,
    randomizationEnabled: false
  };

  pageCache.set(pageKey, { resolved, timestamp: Date.now() });

  return resolved;
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

  return imageList;
}
