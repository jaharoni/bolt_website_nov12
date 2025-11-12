import { createClient } from '@supabase/supabase-js';
import type {
  Product,
  Order,
  OrderItem,
  Customer,
  LTOOffer,
  LTOVariant,
  PrintfulProduct,
  SiteZone,
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries
export async function getBackgroundConfig(): Promise<SiteZone[] | null> {
  const { data, error } = await supabase
    .from('site_zones')
    .select('*')
    .order('key');

  if (error) {
    console.error('Error fetching background config:', error);
    return null;
  }

  return data as SiteZone[] | null;
}

export async function updateBackgroundConfig(
  key: string,
  config: SiteZone['config_json'],
): Promise<SiteZone> {
  const { data, error } = await supabase
    .from('site_zones')
    .update({ config_json: config, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) {
    console.error('Error updating background config:', error);
    throw error;
  }

  return data as SiteZone;
}

export async function getMediaFolders() {
  const { data, error } = await supabase
    .from('media_folders')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching media folders:', error);
    return [];
  }

  return data || [];
}

export async function getEssays() {
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching essays:', error);
    return [];
  }

  return data || [];
}

export async function getGalleries() {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching galleries:', error);
    return [];
  }

  return data || [];
}
