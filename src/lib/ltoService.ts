import { supabase, LTOOffer, LTOVariant } from './supabase';

export type LTOOfferWithDetails = LTOOffer & {
  media?: {
    id: string;
    public_url: string;
    title: string;
    alt_text: string;
    width: number;
    height: number;
  };
  variants?: LTOVariant[];
};

export const ltoService = {
  async getActiveOffers() {
    const { data, error } = await supabase
      .from('lto_offers')
      .select(`
        *,
        media:media_items!lto_offers_media_id_fkey(id, public_url, title, alt_text, width, height)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LTOOfferWithDetails[];
  },

  async getOfferBySlug(slug: string) {
    const { data, error } = await supabase
      .from('lto_offers')
      .select(`
        *,
        media:media_items!lto_offers_media_id_fkey(id, public_url, title, alt_text, width, height),
        variants:lto_variants(*)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data as LTOOfferWithDetails | null;
  },

  async getOffer(id: string) {
    const { data, error } = await supabase
      .from('lto_offers')
      .select(`
        *,
        media:media_items!lto_offers_media_id_fkey(id, public_url, title, alt_text, width, height),
        variants:lto_variants(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as LTOOfferWithDetails | null;
  },

  async getAllOffers() {
    const { data, error } = await supabase
      .from('lto_offers')
      .select(`
        *,
        media:media_items!lto_offers_media_id_fkey(id, public_url, title, alt_text, width, height)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LTOOfferWithDetails[];
  },

  async createOffer(offer: Omit<LTOOffer, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'orders_count' | 'revenue_total'>) {
    const { data, error } = await supabase
      .from('lto_offers')
      .insert(offer)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating offer:', error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
    return data as LTOOffer;
  },

  async updateOffer(id: string, updates: Partial<LTOOffer>) {
    const { data, error } = await supabase
      .from('lto_offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating offer:', error);
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
    return data as LTOOffer;
  },

  async deleteOffer(id: string) {
    const { error } = await supabase
      .from('lto_offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementViews(slug: string) {
    const { error } = await supabase.rpc('increment_lto_views', { offer_slug: slug });
    if (error) console.error('Error incrementing views:', error);
  },

  async getVariants(offerId: string) {
    const { data, error } = await supabase
      .from('lto_variants')
      .select('*')
      .eq('offer_id', offerId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as LTOVariant[];
  },

  async getVariant(id: string) {
    const { data, error } = await supabase
      .from('lto_variants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as LTOVariant | null;
  },

  async createVariant(variant: Omit<LTOVariant, 'id' | 'created_at' | 'updated_at' | 'sold_count'>) {
    const { data, error } = await supabase
      .from('lto_variants')
      .insert(variant)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating variant:', error);
      throw new Error(`Failed to create variant: ${error.message}`);
    }
    return data as LTOVariant;
  },

  async updateVariant(id: string, updates: Partial<LTOVariant>) {
    const { data, error } = await supabase
      .from('lto_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LTOVariant;
  },

  async deleteVariant(id: string) {
    const { error } = await supabase
      .from('lto_variants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateOrderStats(offerId: string, variantId: string, orderTotal: number, itemQuantity: number) {
    const { error } = await supabase.rpc('update_lto_order_stats', {
      offer_uuid: offerId,
      variant_uuid: variantId,
      order_total: orderTotal,
      item_quantity: itemQuantity,
    });

    if (error) throw error;
  },

  async getOfferAnalytics(offerId: string) {
    const { data: offer, error: offerError } = await supabase
      .from('lto_offers')
      .select('views_count, orders_count, revenue_total')
      .eq('id', offerId)
      .single();

    if (offerError) throw offerError;

    const { data: variants, error: variantsError } = await supabase
      .from('lto_variants')
      .select('variant_label, sold_count, price_cents')
      .eq('offer_id', offerId)
      .order('sold_count', { ascending: false });

    if (variantsError) throw variantsError;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, total, status')
      .eq('lto_offer_id', offerId)
      .order('created_at', { ascending: true });

    if (ordersError) throw ordersError;

    return {
      ...offer,
      variants,
      orders,
      conversionRate: offer.views_count > 0
        ? ((offer.orders_count / offer.views_count) * 100).toFixed(2)
        : '0.00',
    };
  },

  async getCampaignProgress(offerId: string) {
    const { data, error } = await supabase.rpc('get_campaign_progress', { offer_uuid: offerId });
    if (error) throw error;
    return data;
  },

  async checkAndEndCampaigns() {
    const { data, error } = await supabase.rpc('check_and_end_campaigns');
    if (error) throw error;
    return data;
  },

  async checkCampaignEndConditions(offerId: string) {
    const { data, error } = await supabase.rpc('check_campaign_end_conditions', { offer_uuid: offerId });
    if (error) throw error;
    return data;
  },
};

export const mediaService = {
  async getAllMedia() {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async searchMedia(query: string) {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMediaById(id: string) {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
