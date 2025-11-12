import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries
export async function getBackgroundConfig() {
  const { data, error } = await supabase
    .from('site_zones')
    .select('*')
    .order('key');

  if (error) {
    console.error('Error fetching background config:', error);
    return null;
  }

  return data;
}

export async function updateBackgroundConfig(key: string, config: any) {
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

  return data;
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

// Database types
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;
  images: string[];
  variants: any[];
  tags: string[];
  is_active: boolean;
  is_digital: boolean;
  inventory_count: number | null;
  printful_product_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  shipping_address: any;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: string;
  payment_status: string;
  payment_intent_id: string | null;
  printful_order_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  lto_offer_id: string | null;
  lto_variant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_image: string | null;
  variant: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  printful_item_id: string | null;
  is_digital: boolean;
  download_url: string | null;
  download_expires_at: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  default_address: any;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LTOOffer {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  media_id: string | null;
  status: 'draft' | 'active' | 'paused' | 'ended';
  start_date: string | null;
  end_date: string | null;
  max_quantity_per_order: number;
  metadata: Record<string, any>;
  views_count: number;
  orders_count: number;
  revenue_total: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface LTOVariant {
  id: string;
  offer_id: string;
  variant_label: string;
  variant_description: string | null;
  printful_product_id: string | null;
  printful_variant_id: string | null;
  price_cents: number;
  cost_cents: number;
  sort_order: number;
  is_available: boolean;
  stock_limit: number | null;
  sold_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PrintfulProduct {
  id: string;
  printful_id: string;
  name: string;
  category: string | null;
  sizes: any[];
  base_cost: number | null;
  shipping_cost: number | null;
  product_data: Record<string, any>;
  last_synced: string;
  is_available: boolean;
  created_at: string;
}
