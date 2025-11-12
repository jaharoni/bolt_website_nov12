/*
  # Complete PostgreSQL Schema Migration
  
  ## Purpose
  Rebuild database architecture from SQLite to proper PostgreSQL.
  Creates all missing tables with correct PostgreSQL types.
  
  ## New Tables Created
  1. **site_settings** - General site configuration (CRITICAL - fixes Settings tab crash)
  2. **products** - Shop products with variants
  3. **customers** - Customer information
  4. **orders** - Order management
  5. **order_items** - Order line items
  6. **printful_products** - Printful catalog cache
  7. **admin_settings** - Admin panel configuration
  8. **chat_sessions** - Chat session tracking
  9. **chat_rate_limits** - Rate limiting for chat
  10. **chat_usage_logs** - AI usage tracking
  11. **chat_budget_tracker** - Daily budget monitoring
  12. **blocked_ips** - IP blocking system
  13. **chat_moderation_logs** - Content moderation logs
  
  ## Zone Configuration
  - Adds admin page background zone
  
  ## Security
  - All tables have RLS enabled
  - Proper authentication policies
  - Public read where appropriate
  
  ## Data Types
  - Uses PostgreSQL native types (uuid, timestamptz, jsonb, numeric)
  - Proper constraints and checks
  - Foreign keys with cascade rules
  - Indexes for performance
*/

-- ============================================================================
-- 1. SITE SETTINGS TABLE (CRITICAL - Fixes Settings Tab)
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  description text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_public ON site_settings(is_public);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public settings"
  ON site_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Authenticated users can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true);

-- Insert default site settings
INSERT INTO site_settings (key, value, category, description, is_public) VALUES
  ('site_name', '"My Portfolio"'::jsonb, 'general', 'Website name', true),
  ('site_description', '"Artist portfolio and shop"'::jsonb, 'general', 'Website description', true),
  ('contact_email', '"contact@example.com"'::jsonb, 'general', 'Contact email', true),
  ('social_links', '{"twitter":"","instagram":"","facebook":""}'::jsonb, 'general', 'Social media links', true),
  ('enable_shop', 'true'::jsonb, 'features', 'Enable shop functionality', false),
  ('enable_chat', 'true'::jsonb, 'features', 'Enable AI chat widget', false),
  ('enable_blog', 'true'::jsonb, 'features', 'Enable essays/blog', false),
  ('maintenance_mode', 'false'::jsonb, 'system', 'Maintenance mode', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. SHOP SYSTEM TABLES
-- ============================================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'art',
  base_price numeric(10,2) NOT NULL CHECK (base_price >= 0),
  images jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_digital boolean NOT NULL DEFAULT false,
  inventory_count integer CHECK (inventory_count >= 0),
  printful_product_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  phone text,
  default_address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  shipping_address jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  tax numeric(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id text,
  printful_order_id text,
  tracking_number text,
  tracking_url text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  lto_offer_id uuid REFERENCES lto_offers(id) ON DELETE SET NULL,
  lto_variant_id uuid REFERENCES lto_variants(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (true);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  product_image text,
  variant text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  printful_item_id text,
  is_digital boolean DEFAULT false,
  download_url text,
  download_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true);

-- Printful products cache
CREATE TABLE IF NOT EXISTS printful_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  printful_id text NOT NULL UNIQUE,
  name text NOT NULL,
  category text,
  sizes jsonb DEFAULT '[]'::jsonb,
  base_cost numeric(10,2),
  shipping_cost numeric(10,2),
  product_data jsonb DEFAULT '{}'::jsonb,
  last_synced timestamptz NOT NULL DEFAULT now(),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_printful_products_printful_id ON printful_products(printful_id);
CREATE INDEX IF NOT EXISTS idx_printful_products_is_available ON printful_products(is_available);
CREATE INDEX IF NOT EXISTS idx_printful_products_category ON printful_products(category);

ALTER TABLE printful_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage printful products"
  ON printful_products FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- 3. ADMIN & AI SECURITY TABLES
-- ============================================================================

-- Admin settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_provider text DEFAULT 'openai',
  ai_model text DEFAULT 'gpt-4o-mini',
  ai_max_tokens integer DEFAULT 300 CHECK (ai_max_tokens > 0),
  budget_alert_threshold numeric(10,2) DEFAULT 100 CHECK (budget_alert_threshold >= 0),
  budget_hard_limit numeric(10,2) DEFAULT 150 CHECK (budget_hard_limit >= 0),
  daily_budget_limit numeric(10,2) DEFAULT 5 CHECK (daily_budget_limit >= 0),
  rate_limit jsonb DEFAULT '{"hourly":30,"daily":100}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage admin settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (true);

-- Insert default admin settings
INSERT INTO admin_settings (ai_provider, ai_model, ai_max_tokens, daily_budget_limit)
VALUES ('openai', 'gpt-4o-mini', 300, 5.0)
ON CONFLICT DO NOTHING;

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  ip_address text NOT NULL,
  user_agent text,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  request_count integer DEFAULT 0 CHECK (request_count >= 0),
  total_tokens_used integer DEFAULT 0 CHECK (total_tokens_used >= 0),
  is_blocked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ip_address ON chat_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_blocked ON chat_sessions(is_blocked);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage chat sessions"
  ON chat_sessions FOR ALL
  TO service_role
  USING (true);

-- Chat rate limits
CREATE TABLE IF NOT EXISTS chat_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  session_id text NOT NULL,
  hourly_count integer DEFAULT 0 CHECK (hourly_count >= 0),
  daily_count integer DEFAULT 0 CHECK (daily_count >= 0),
  hourly_reset_at timestamptz,
  daily_reset_at timestamptz,
  last_request_at timestamptz NOT NULL DEFAULT now(),
  cooldown_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ip_address, session_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_ip_address ON chat_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_session_id ON chat_rate_limits(session_id);

ALTER TABLE chat_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
  ON chat_rate_limits FOR ALL
  TO service_role
  USING (true);

-- Chat usage logs
CREATE TABLE IF NOT EXISTS chat_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_address text NOT NULL,
  prompt_tokens integer DEFAULT 0 CHECK (prompt_tokens >= 0),
  completion_tokens integer DEFAULT 0 CHECK (completion_tokens >= 0),
  total_tokens integer DEFAULT 0 CHECK (total_tokens >= 0),
  estimated_cost numeric(10,4) DEFAULT 0 CHECK (estimated_cost >= 0),
  model_used text DEFAULT 'gpt-4o-mini',
  moderation_flagged boolean DEFAULT false,
  moderation_categories jsonb,
  turnstile_verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_logs_session_id ON chat_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_logs_ip_address ON chat_usage_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_chat_usage_logs_created_at ON chat_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_usage_logs_moderation_flagged ON chat_usage_logs(moderation_flagged);

ALTER TABLE chat_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view usage logs"
  ON chat_usage_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage usage logs"
  ON chat_usage_logs FOR ALL
  TO service_role
  USING (true);

-- Chat budget tracker
CREATE TABLE IF NOT EXISTS chat_budget_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_requests integer DEFAULT 0 CHECK (total_requests >= 0),
  total_tokens integer DEFAULT 0 CHECK (total_tokens >= 0),
  total_cost numeric(10,4) DEFAULT 0 CHECK (total_cost >= 0),
  budget_limit numeric(10,2) DEFAULT 5.0 CHECK (budget_limit >= 0),
  is_shutdown boolean DEFAULT false,
  alert_sent boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_budget_tracker_date ON chat_budget_tracker(date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_budget_tracker_is_shutdown ON chat_budget_tracker(is_shutdown);

ALTER TABLE chat_budget_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view budget tracker"
  ON chat_budget_tracker FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage budget tracker"
  ON chat_budget_tracker FOR ALL
  TO service_role
  USING (true);

-- Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_by text DEFAULT 'system',
  blocked_until timestamptz,
  violation_count integer DEFAULT 1 CHECK (violation_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_blocked_until ON blocked_ips(blocked_until);

ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage blocked IPs"
  ON blocked_ips FOR ALL
  TO authenticated
  USING (true);

-- Chat moderation logs
CREATE TABLE IF NOT EXISTS chat_moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_address text NOT NULL,
  message_content text NOT NULL,
  moderation_result jsonb NOT NULL,
  categories_flagged text[],
  max_score numeric(5,4),
  action_taken text DEFAULT 'blocked',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_moderation_logs_session_id ON chat_moderation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_moderation_logs_ip_address ON chat_moderation_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_chat_moderation_logs_created_at ON chat_moderation_logs(created_at DESC);

ALTER TABLE chat_moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view moderation logs"
  ON chat_moderation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage moderation logs"
  ON chat_moderation_logs FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- 4. ADD ADMIN PAGE ZONE CONFIGURATION
-- ============================================================================

DO $$
DECLARE
  backgrounds_folder_id uuid;
BEGIN
  -- Get the Backgrounds folder ID
  SELECT id INTO backgrounds_folder_id
  FROM media_folders
  WHERE slug = 'backgrounds' AND parent_id IS NULL
  LIMIT 1;
  
  IF backgrounds_folder_id IS NOT NULL THEN
    -- Add admin page zone configuration
    INSERT INTO site_zones (key, config_json, randomization_enabled, carousel_enabled, carousel_interval_ms, carousel_transition)
    VALUES (
      'page.admin.background',
      jsonb_build_object(
        'mode', 'random',
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
        'limit', 10
      ),
      true,
      false,
      8000,
      'fade'
    )
    ON CONFLICT (key) DO UPDATE SET
      config_json = jsonb_build_object(
        'mode', 'random',
        'source', jsonb_build_object('type', 'folder', 'value', backgrounds_folder_id::text),
        'limit', 10
      ),
      randomization_enabled = true;
    
    RAISE NOTICE 'Admin page zone configured with Backgrounds folder';
  ELSE
    RAISE NOTICE 'Backgrounds folder not found - admin zone not configured';
  END IF;
END $$;

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_count int;
BEGIN
  -- Count new tables created
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'site_settings', 'products', 'customers', 'orders', 'order_items',
      'printful_products', 'admin_settings', 'chat_sessions', 'chat_rate_limits',
      'chat_usage_logs', 'chat_budget_tracker', 'blocked_ips', 'chat_moderation_logs'
    );
  
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Tables created/verified: %', table_count;
  RAISE NOTICE 'Site settings initialized: %', (SELECT COUNT(*) FROM site_settings);
  RAISE NOTICE 'Admin settings initialized: %', (SELECT COUNT(*) FROM admin_settings);
  RAISE NOTICE 'Total zones configured: %', (SELECT COUNT(*) FROM site_zones);
  RAISE NOTICE '========================';
END $$;
