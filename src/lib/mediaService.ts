import { supabase } from './supabase';

export interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  bucket_name: string;
  public_url: string;
  media_type: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  tags: string[];
  page_context: string | null;
  is_active: boolean;
  is_visible: boolean;
  pricing_enabled: boolean;
  visibility_locations: string[];
  collection_id: string | null;
  upload_batch_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaVisibility {
  id: string;
  media_id: string;
  location: string;
  is_active: boolean;
  priority: number;
  settings: Record<string, any>;
}

export interface MediaPricing {
  id: string;
  media_id: string;
  is_available: boolean;
  base_price: number;
  variants: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
  is_limited_edition: boolean;
  total_quantity: number | null;
  sold_count: number;
  remaining_count: number | null;
  metadata: Record<string, any>;
}

export interface MediaCollection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  collection_type: string;
  cover_media_id: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UploadBatch {
  id: string;
  batch_name: string | null;
  upload_count: number;
  upload_config: Record<string, any>;
  uploaded_by: string | null;
  created_at: string;
}

export interface UploadConfig {
  visibilityLocations: string[];
  enablePricing: boolean;
  basePrice?: number;
  variants?: Array<{ name: string; price: number }>;
  tags: string[];
  bucket: string;
  pageContext: string;
  collectionId?: string;
  batchName?: string;
  isVisible: boolean;
}

class MediaService {
  async getAllMedia(filters?: {
    isVisible?: boolean;
    pricingEnabled?: boolean;
    locations?: string[];
    collectionId?: string;
    batchId?: string;
    searchQuery?: string;
  }) {
    let query = supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.isVisible !== undefined) {
        query = query.eq('is_visible', filters.isVisible);
      }
      if (filters.pricingEnabled !== undefined) {
        query = query.eq('pricing_enabled', filters.pricingEnabled);
      }
      if (filters.collectionId) {
        query = query.eq('collection_id', filters.collectionId);
      }
      if (filters.batchId) {
        query = query.eq('upload_batch_id', filters.batchId);
      }
      if (filters.locations && filters.locations.length > 0) {
        query = query.overlaps('visibility_locations', filters.locations);
      }
      if (filters.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,filename.ilike.%${filters.searchQuery}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as MediaItem[];
  }

  async getMediaById(id: string) {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MediaItem;
  }

  async getMediaWithDetails(id: string) {
    const { data, error } = await supabase
      .rpc('get_media_full_details', { media_id_param: id });

    if (error) throw error;
    return data;
  }

  async createUploadBatch(config: Partial<UploadBatch>) {
    const { data, error } = await supabase
      .from('media_upload_batches')
      .insert(config)
      .select()
      .single();

    if (error) throw error;
    return data as UploadBatch;
  }

  async uploadMedia(file: File, config: UploadConfig, batchId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${config.bucket}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(filePath);

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    const { data: mediaItem, error: dbError } = await supabase
      .from('media_items')
      .insert({
        filename: file.name,
        storage_path: filePath,
        bucket_name: config.bucket,
        public_url: publicUrl,
        media_type: 'image',
        mime_type: file.type,
        file_size: file.size,
        width: img.width,
        height: img.height,
        title: file.name.replace(/\.[^/.]+$/, ''),
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
        tags: config.tags,
        page_context: config.pageContext,
        is_active: true,
        is_visible: config.isVisible,
        pricing_enabled: config.enablePricing,
        upload_batch_id: batchId,
        collection_id: config.collectionId || null,
        sort_order: 0,
      })
      .select()
      .single();

    URL.revokeObjectURL(img.src);

    if (dbError) throw dbError;

    if (config.visibilityLocations.length > 0) {
      await this.updateMediaVisibility(mediaItem.id, config.visibilityLocations);
    }

    if (config.enablePricing && config.basePrice) {
      await this.createMediaPricing(mediaItem.id, {
        base_price: config.basePrice,
        variants: config.variants || [],
      });
    }

    return mediaItem as MediaItem;
  }

  async updateMedia(id: string, updates: Partial<MediaItem>) {
    const { data, error } = await supabase
      .from('media_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MediaItem;
  }

  async updateMediaBulk(ids: string[], updates: Partial<MediaItem>) {
    const { data, error } = await supabase
      .from('media_items')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;
    return data as MediaItem[];
  }

  async deleteMedia(id: string) {
    const media = await this.getMediaById(id);

    const { error: storageError } = await supabase.storage
      .from(media.bucket_name)
      .remove([media.storage_path]);

    if (storageError) console.error('Storage delete error:', storageError);

    const { error: dbError } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  }

  async deleteMediaBulk(ids: string[]) {
    const mediaItems = await Promise.all(ids.map(id => this.getMediaById(id)));

    const storageDeletePromises = mediaItems.map(media =>
      supabase.storage.from(media.bucket_name).remove([media.storage_path])
    );

    await Promise.all(storageDeletePromises);

    const { error } = await supabase
      .from('media_items')
      .delete()
      .in('id', ids);

    if (error) throw error;
  }

  async getMediaVisibility(mediaId: string) {
    const { data, error } = await supabase
      .from('media_visibility')
      .select('*')
      .eq('media_id', mediaId);

    if (error) throw error;
    return data as MediaVisibility[];
  }

  async updateMediaVisibility(mediaId: string, locations: string[]) {
    const existing = await this.getMediaVisibility(mediaId);
    const existingLocations = existing.map(v => v.location);

    const toAdd = locations.filter(loc => !existingLocations.includes(loc));
    const toRemove = existingLocations.filter(loc => !locations.includes(loc));

    if (toAdd.length > 0) {
      const inserts = toAdd.map(location => ({
        media_id: mediaId,
        location,
        is_active: true,
        priority: 0,
      }));

      const { error: insertError } = await supabase
        .from('media_visibility')
        .insert(inserts);

      if (insertError) throw insertError;
    }

    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('media_visibility')
        .delete()
        .eq('media_id', mediaId)
        .in('location', toRemove);

      if (deleteError) throw deleteError;
    }
  }

  async updateMediaVisibilityBulk(mediaIds: string[], locations: string[]) {
    await Promise.all(mediaIds.map(id => this.updateMediaVisibility(id, locations)));
  }

  async getMediaPricing(mediaId: string) {
    const { data, error } = await supabase
      .from('media_pricing')
      .select('*')
      .eq('media_id', mediaId)
      .maybeSingle();

    if (error) throw error;
    return data as MediaPricing | null;
  }

  async createMediaPricing(mediaId: string, pricing: {
    base_price: number;
    variants?: Array<{ name: string; price: number; description?: string }>;
    is_limited_edition?: boolean;
    total_quantity?: number;
  }) {
    const { data, error } = await supabase
      .from('media_pricing')
      .insert({
        media_id: mediaId,
        is_available: true,
        base_price: pricing.base_price,
        variants: pricing.variants || [],
        is_limited_edition: pricing.is_limited_edition || false,
        total_quantity: pricing.total_quantity || null,
        sold_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    await this.updateMedia(mediaId, { pricing_enabled: true });

    return data as MediaPricing;
  }

  async updateMediaPricing(mediaId: string, updates: Partial<MediaPricing>) {
    const { data, error } = await supabase
      .from('media_pricing')
      .update(updates)
      .eq('media_id', mediaId)
      .select()
      .single();

    if (error) throw error;
    return data as MediaPricing;
  }

  async deleteMediaPricing(mediaId: string) {
    const { error } = await supabase
      .from('media_pricing')
      .delete()
      .eq('media_id', mediaId);

    if (error) throw error;

    await this.updateMedia(mediaId, { pricing_enabled: false });
  }

  async getAllCollections() {
    const { data, error } = await supabase
      .from('media_collections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as MediaCollection[];
  }

  async createCollection(collection: Partial<MediaCollection>) {
    const { data, error } = await supabase
      .from('media_collections')
      .insert(collection)
      .select()
      .single();

    if (error) throw error;
    return data as MediaCollection;
  }

  async addMediaToCollection(collectionId: string, mediaIds: string[]) {
    const inserts = mediaIds.map((mediaId, index) => ({
      collection_id: collectionId,
      media_id: mediaId,
      sort_order: index,
    }));

    const { error } = await supabase
      .from('media_collection_items')
      .insert(inserts);

    if (error) throw error;
  }

  async getAllBatches() {
    const { data, error } = await supabase
      .from('media_upload_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UploadBatch[];
  }
}

export const mediaService = new MediaService();
