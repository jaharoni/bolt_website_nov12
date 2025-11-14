import { getBGConfig, matchRule, type PageBGRule } from '../backgrounds';
import { supabase } from '../supabase';

export type ResolvedBackground = {
  urls: string[];
  slideshow: boolean;
  intervalMs: number;
  randomizationEnabled: boolean;
};

const pageCache = new Map<string, { resolved: ResolvedBackground; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function resolveBackgroundsForPage(pageKey: string): Promise<ResolvedBackground> {
  const config = await getBGConfig();
  const rule = matchRule(config, pageKey);

  if (rule.randomizationEnabled) {
    const urls = await resolveUrls(rule);
    return {
      urls,
      slideshow: rule.slideshow || false,
      intervalMs: rule.intervalMs || 6000,
      randomizationEnabled: true
    };
  }

  const cached = pageCache.get(pageKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.resolved;
  }

  const urls = await resolveUrls(rule);

  const resolved = {
    urls,
    slideshow: rule.slideshow || false,
    intervalMs: rule.intervalMs || 6000,
    randomizationEnabled: false
  };

  pageCache.set(pageKey, { resolved, timestamp: Date.now() });

  return resolved;
}

async function resolveUrls(rule: PageBGRule): Promise<string[]> {
  let imageList: string[] = [];

  if (rule.mode === "specific" && rule.images.length > 0) {
    imageList = rule.images;
  } else if (rule.folders.length > 0) {
    for (const folderSlug of rule.folders) {
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
  }

  return imageList;
}
