import { supabase } from './supabase';

export interface Essay {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  featured_image_id: string | null;
  publish_status: 'draft' | 'published';
  is_featured: boolean;
  tags: string[];
  view_count: number;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  featured_image?: {
    id: string;
    public_url: string;
    storage_path: string;
    bucket_name: string;
    title: string;
    alt_text: string | null;
  };
}

export interface EssaySection {
  id: string;
  essay_id: string;
  section_type: 'full-bleed' | 'side-by-side' | 'grid-2x2' | 'grid-3x3' | 'stacked' | 'text-block';
  content: any;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EssayMedia {
  id: string;
  essay_id: string;
  section_id: string | null;
  media_id: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  media_item?: {
    id: string;
    public_url: string;
    storage_path: string;
    bucket_name: string;
    title: string;
    alt_text: string | null;
    width: number | null;
    height: number | null;
  };
}

export const essayService = {
  async getPublishedEssays(): Promise<Essay[]> {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        featured_image:media_items!featured_image_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text
        )
      `)
      .eq('publish_status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching published essays:', error);
      throw error;
    }

    return data || [];
  },

  async getAllEssays(): Promise<Essay[]> {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        featured_image:media_items!featured_image_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all essays:', error);
      throw error;
    }

    return data || [];
  },

  async getEssayBySlug(slug: string): Promise<Essay | null> {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        featured_image:media_items!featured_image_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching essay by slug:', error);
      throw error;
    }

    return data;
  },

  async getEssaySections(essayId: string): Promise<EssaySection[]> {
    const { data, error } = await supabase
      .from('essay_sections')
      .select('*')
      .eq('essay_id', essayId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching essay sections:', error);
      throw error;
    }

    return data || [];
  },

  async getEssayMedia(essayId: string): Promise<EssayMedia[]> {
    const { data, error } = await supabase
      .from('essay_media')
      .select(`
        *,
        media_item:media_items!media_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text,
          width,
          height
        )
      `)
      .eq('essay_id', essayId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching essay media:', error);
      throw error;
    }

    return data || [];
  },

  async getSectionMedia(sectionId: string): Promise<EssayMedia[]> {
    const { data, error } = await supabase
      .from('essay_media')
      .select(`
        *,
        media_item:media_items!media_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text,
          width,
          height
        )
      `)
      .eq('section_id', sectionId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching section media:', error);
      throw error;
    }

    return data || [];
  },

  async createEssay(essay: Partial<Essay>): Promise<Essay> {
    const { data, error } = await supabase
      .from('essays')
      .insert([essay])
      .select()
      .single();

    if (error) {
      console.error('Error creating essay:', error);
      throw error;
    }

    return data;
  },

  async updateEssay(id: string, updates: Partial<Essay>): Promise<Essay> {
    const { data, error } = await supabase
      .from('essays')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating essay:', error);
      throw error;
    }

    return data;
  },

  async deleteEssay(id: string): Promise<void> {
    const { error } = await supabase
      .from('essays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting essay:', error);
      throw error;
    }
  },

  async createSection(section: Partial<EssaySection>): Promise<EssaySection> {
    const { data, error } = await supabase
      .from('essay_sections')
      .insert([section])
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      throw error;
    }

    return data;
  },

  async updateSection(id: string, updates: Partial<EssaySection>): Promise<EssaySection> {
    const { data, error } = await supabase
      .from('essay_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      throw error;
    }

    return data;
  },

  async deleteSection(id: string): Promise<void> {
    const { error } = await supabase
      .from('essay_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  async addMediaToEssay(essayMedia: Partial<EssayMedia>): Promise<EssayMedia> {
    const { data, error } = await supabase
      .from('essay_media')
      .insert([essayMedia])
      .select()
      .single();

    if (error) {
      console.error('Error adding media to essay:', error);
      throw error;
    }

    return data;
  },

  async removeMediaFromEssay(id: string): Promise<void> {
    const { error } = await supabase
      .from('essay_media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing media from essay:', error);
      throw error;
    }
  },

  async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_essay_view_count', {
      essay_id: id
    });

    if (error) {
      console.error('Error incrementing view count:', error);
    }
  },

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  async getEssaysByTag(tag: string): Promise<Essay[]> {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        featured_image:media_items!featured_image_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text
        )
      `)
      .eq('publish_status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching essays by tag:', error);
      throw error;
    }

    return data || [];
  },

  async getFeaturedEssay(): Promise<Essay | null> {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        featured_image:media_items!featured_image_id(
          id,
          public_url,
          storage_path,
          bucket_name,
          title,
          alt_text
        )
      `)
      .eq('publish_status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching featured essay:', error);
      throw error;
    }

    return data;
  }
};
