import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingConfigMessage =
  'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. ' +
  'Dynamic content editing features are disabled in this environment.';

type MinimalSupabaseError = { message: string };

type StubResponse<T = null> = {
  data: T;
  error: MinimalSupabaseError;
  count: number | null;
};

type StubPromise<T = null> = Promise<StubResponse<T>>;

type StubQueryBuilder = {
  select: (...args: unknown[]) => StubQueryBuilder;
  eq: (...args: unknown[]) => StubQueryBuilder;
  neq: (...args: unknown[]) => StubQueryBuilder;
  order: (...args: unknown[]) => StubQueryBuilder;
  in: (...args: unknown[]) => StubQueryBuilder;
  contains: (...args: unknown[]) => StubQueryBuilder;
  overlaps: (...args: unknown[]) => StubQueryBuilder;
  limit: (...args: unknown[]) => StubQueryBuilder;
  range: (...args: unknown[]) => StubQueryBuilder;
  gte: (...args: unknown[]) => StubQueryBuilder;
  lte: (...args: unknown[]) => StubQueryBuilder;
  single: () => StubPromise;
  maybeSingle: () => StubPromise;
  insert: (...args: unknown[]) => StubQueryBuilder;
  update: (...args: unknown[]) => StubQueryBuilder;
  delete: (...args: unknown[]) => StubQueryBuilder;
  upsert: (...args: unknown[]) => StubQueryBuilder;
  match: (...args: unknown[]) => StubQueryBuilder;
  filter: (...args: unknown[]) => StubQueryBuilder;
  not: (...args: unknown[]) => StubQueryBuilder;
  or: (...args: unknown[]) => StubQueryBuilder;
  ilike: (...args: unknown[]) => StubQueryBuilder;
  textSearch: (...args: unknown[]) => StubQueryBuilder;
  then: StubPromise['then'];
  catch: StubPromise['catch'];
  finally: StubPromise['finally'];
};

const missingSupabaseError: MinimalSupabaseError = { message: missingConfigMessage };

const createStubQueryBuilder = () => {
  const stubResponse: StubResponse = { data: null, error: missingSupabaseError, count: null };
  const promise = Promise.resolve(stubResponse);

  const builder = {} as Partial<StubQueryBuilder>;
  const chain = () => builder as StubQueryBuilder;

  builder.select = chain;
  builder.eq = chain;
  builder.neq = chain;
  builder.order = chain;
  builder.in = chain;
  builder.contains = chain;
  builder.overlaps = chain;
  builder.limit = chain;
  builder.range = chain;
  builder.gte = chain;
  builder.lte = chain;
  builder.insert = chain;
  builder.update = chain;
  builder.delete = chain;
  builder.upsert = chain;
  builder.match = chain;
  builder.filter = chain;
  builder.not = chain;
  builder.or = chain;
  builder.ilike = chain;
  builder.textSearch = chain;
  builder.single = () => promise;
  builder.maybeSingle = () => promise;
  builder.then = promise.then.bind(promise);
  builder.catch = promise.catch.bind(promise);
  builder.finally = promise.finally.bind(promise);

  return builder as StubQueryBuilder;
};

const createStubStorageBucket = () => ({
  getPublicUrl: () => ({ data: { publicUrl: '' }, error: missingSupabaseError }),
  upload: async () => ({ data: null, error: missingSupabaseError }),
  remove: async () => ({ data: null, error: missingSupabaseError }),
  list: async () => ({ data: [], error: missingSupabaseError }),
});

const createStubSupabaseClient = (): SupabaseClient<unknown, unknown, unknown> =>
  ({
    from: () => createStubQueryBuilder(),
    rpc: async () => ({ data: null, error: missingSupabaseError }),
    storage: {
      from: () => createStubStorageBucket(),
      listBuckets: async () => ({ data: [], error: missingSupabaseError }),
      createBucket: async () => ({ data: null, error: missingSupabaseError }),
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: missingSupabaseError }),
      getSession: async () => ({ data: { session: null }, error: missingSupabaseError }),
      signInWithPassword: async () => ({ data: null, error: missingSupabaseError }),
      signInWithOtp: async () => ({ data: null, error: missingSupabaseError }),
      signUp: async () => ({ data: null, error: missingSupabaseError }),
      signOut: async () => ({ error: missingSupabaseError }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: missingSupabaseError }),
    },
    functions: {
      invoke: async () => ({ data: null, error: missingSupabaseError }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  } as unknown as SupabaseClient<unknown, unknown, unknown>);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(missingConfigMessage);
}

export const supabase: SupabaseClient<unknown, unknown, unknown> = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createStubSupabaseClient();

// Helper functions for common queries
export async function getBackgroundConfig() {
  if (!isSupabaseConfigured) {
    console.warn('getBackgroundConfig returning null because Supabase is not configured.');
    return null;
  }
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

export async function updateBackgroundConfig(key: string, config: Record<string, unknown>) {
  if (!isSupabaseConfigured) {
    throw new Error(`Cannot update background config without Supabase. ${missingConfigMessage}`);
  }
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
  if (!isSupabaseConfigured) {
    console.warn('getMediaFolders returning empty array because Supabase is not configured.');
    return [];
  }
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
  if (!isSupabaseConfigured) {
    console.warn('getEssays returning empty array because Supabase is not configured.');
    return [];
  }
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
  if (!isSupabaseConfigured) {
    console.warn('getGalleries returning empty array because Supabase is not configured.');
    return [];
  }
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
