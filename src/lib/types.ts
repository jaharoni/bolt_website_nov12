export type Media = {
  id: string;
  filename: string;
  storage_path: string;
  bucket_name: string;
  public_url: string;
  media_type: string;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
  tags?: string[] | null;
  page_context?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  folder_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type Essay = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  featured_image_id?: string | null;
  publish_status: "draft" | "published";
  is_featured?: boolean | null;
  tags?: string[] | null;
  view_count?: number;
  read_time_minutes?: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  base_price: number;
  images: any;
  variants: any;
  tags: string[];
  is_active: boolean;
  is_digital: boolean;
  inventory_count?: number | null;
  printful_product_id?: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaFolder = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
};

export type EssayMedia = {
  id: string;
  essay_id: string;
  media_id: string;
  position: number;
};

export type Gallery = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover_media_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  gallery_id: string;
  media_id: string;
  position: number;
};

export type SiteZone = {
  id: string;
  key: string;
  config_json: ZoneConfig;
  randomization_enabled?: boolean;
  carousel_enabled?: boolean;
  carousel_interval_ms?: number;
  carousel_transition?: string;
  static_media_id?: string | null;
  last_updated_by?: string | null;
  updated_at: string;
};

export type ZoneConfig = {
  mode: "sequence" | "random" | "weighted";
  source: {
    type: "tag" | "folder" | "gallery";
    value: string;
  };
  limit?: number;
  weights?: Record<string, number>;
  refreshSec?: number;
  randomization_enabled?: boolean;
};

export type TextBlock = {
  id: string;
  key: string;
  content_md: string;
  updated_at: string;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  page_type: 'standard' | 'portfolio' | 'landing' | 'about' | 'contact' | 'custom';
  template: string;
  hero_media_id?: string | null;
  content_json: Record<string, any>;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type PageMedia = {
  id: string;
  page_id: string;
  media_id: string;
  media_role: 'hero' | 'gallery' | 'thumbnail' | 'inline';
  position: number;
};

export type GalleryProject = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string | null;
  thumbnail_media_id?: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectMedia = {
  id: string;
  project_id: string;
  media_id: string;
  position: number;
};

export type Customer = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  default_address?: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_email: string;
  customer_name: string;
  shipping_address: Record<string, any>;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string | null;
  printful_order_id?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  notes?: string | null;
  metadata: Record<string, any>;
  lto_offer_id?: string | null;
  lto_variant_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_title: string;
  product_image?: string | null;
  variant: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  printful_item_id?: string | null;
  is_digital: boolean;
  download_url?: string | null;
  download_expires_at?: string | null;
  created_at: string;
};

export type PrintfulProduct = {
  id: string;
  printful_id: string;
  name: string;
  category?: string | null;
  sizes: any;
  base_cost?: number | null;
  shipping_cost?: number | null;
  product_data: Record<string, any>;
  last_synced: string;
  is_available: boolean;
  created_at: string;
};

export type AdminSettings = {
  id: string;
  ai_provider: string;
  ai_model: string;
  ai_max_tokens: number;
  budget_alert_threshold: number;
  budget_hard_limit: number;
  daily_budget_limit: number;
  rate_limit: { hourly: number; daily: number };
  created_at: string;
  updated_at: string;
};

export type ChatSession = {
  id: string;
  session_id: string;
  ip_address: string;
  user_agent?: string | null;
  first_seen: string;
  last_seen: string;
  request_count: number;
  total_tokens_used: number;
  is_blocked: boolean;
  created_at: string;
};

export type ChatRateLimit = {
  id: string;
  ip_address: string;
  session_id: string;
  hourly_count: number;
  daily_count: number;
  hourly_reset_at?: string | null;
  daily_reset_at?: string | null;
  last_request_at: string;
  cooldown_until?: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatUsageLog = {
  id: string;
  session_id: string;
  ip_address: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  model_used: string;
  moderation_flagged: boolean;
  moderation_categories?: Record<string, any> | null;
  turnstile_verified: boolean;
  created_at: string;
};

export type ChatBudgetTracker = {
  id: string;
  date: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  budget_limit: number;
  is_shutdown: boolean;
  alert_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type BlockedIP = {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string;
  blocked_until?: string | null;
  violation_count: number;
  created_at: string;
};

export type ChatModerationLog = {
  id: string;
  session_id: string;
  ip_address: string;
  message_content: string;
  moderation_result: Record<string, any>;
  categories_flagged?: string[] | null;
  max_score?: number | null;
  action_taken: string;
  created_at: string;
};
