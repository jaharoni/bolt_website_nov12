import { supabase } from "./supabase";
import { Media, ZoneConfig } from "./types";

export interface SiteZone {
  id?: string;
  key: string;
  config_json: ZoneConfig;
  updated_at?: string;
}

const ZONE_KEYS = {
  HOME_BACKGROUND: 'home.background',
  ABOUT_BACKGROUND: 'page.about.background',
  CONTACT_BACKGROUND: 'page.contact.background',
  SHOP_BACKGROUND: 'page.shop.background',
  GALLERY_BACKGROUND: 'page.gallery.background',
  ESSAYS_BACKGROUND: 'page.essays.background',
  GLOBAL_BACKGROUND: 'global.background',
} as const;

export async function getZone(key: string): Promise<SiteZone | null> {
  const { data, error } = await supabase
    .from('site_zones')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching zone:', error);
    return null;
  }

  return data;
}

export async function getAllZones(): Promise<SiteZone[]> {
  const { data, error } = await supabase
    .from('site_zones')
    .select('*')
    .order('key');

  if (error) {
    console.error('Error fetching zones:', error);
    return [];
  }

  return data || [];
}

export async function updateZone(key: string, config: ZoneConfig): Promise<boolean> {
  const { error } = await supabase
    .from('site_zones')
    .upsert({
      key,
      config_json: config,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'key'
    });

  if (error) {
    console.error('Error updating zone:', error);
    return false;
  }

  return true;
}

export function getPageNameFromZoneKey(key: string): string {
  const pageNames: Record<string, string> = {
    'home.background': 'Homepage',
    'page.about.background': 'About Page',
    'page.contact.background': 'Contact Page',
    'page.shop.background': 'Shop Page',
    'page.gallery.background': 'Gallery Page',
    'page.essays.background': 'Essays Page',
    'global.background': 'Global Fallback',
  };

  return pageNames[key] || key;
}

export async function getZoneMedia(key: string): Promise<Media[]> {
  const { data: zone } = await supabase.from("site_zones").select("*").eq("key", key).maybeSingle();

  const config: ZoneConfig = zone?.config_json || {
    mode: "random",
    source: { type: "tag", value: "homebg" },
    limit: 5,
  };

  let media: Media[] = [];

  if (config.source.type === "tag") {
    const { data } = await supabase
      .from("media_items")
      .select("*")
      .contains("tags", [config.source.value])
      .eq("is_active", true);
    media = (data ?? []) as Media[];
  } else if (config.source.type === "folder") {
    const { data } = await supabase
      .from("media_items")
      .select("*")
      .eq("folder_id", config.source.value)
      .eq("is_active", true);
    media = (data ?? []) as Media[];
  } else if (config.source.type === "gallery") {
    const { data: items } = await supabase
      .from("gallery_items")
      .select("media_id, media_items(*)")
      .eq("gallery_id", config.source.value)
      .order("position", { ascending: true });

    media = (items ?? [])
      .map((i: any) => i.media_items)
      .filter(Boolean) as Media[];
  }

  const limit = config.limit ?? media.length;

  if (config.mode === "sequence") {
    return media.slice(0, limit);
  }

  if (config.mode === "weighted" && config.weights) {
    const arr = [...media];
    const out: Media[] = [];
    while (arr.length && out.length < limit) {
      const total = arr.reduce((s, m) => s + (config.weights![m.id] ?? 1), 0);
      let pick = Math.random() * total;
      let idx = -1;
      for (let i = 0; i < arr.length; i++) {
        pick -= config.weights![arr[i].id] ?? 1;
        if (pick <= 0) {
          idx = i;
          break;
        }
      }
      if (idx === -1) idx = 0;
      out.push(arr.splice(idx, 1)[0]);
    }
    return out;
  }

  return shuffle(media).slice(0, limit);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
