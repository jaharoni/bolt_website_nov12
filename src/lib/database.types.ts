/**
 * COMPREHENSIVE DATABASE SCHEMA TYPES
 *
 * Auto-generated from Supabase database schema extraction
 * This file provides complete TypeScript types for all database tables,
 * relationships, functions, and storage buckets.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      media_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          created_at: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          created_at?: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          created_at?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }
      media_items: {
        Row: {
          id: string
          title: string
          alt_text: string | null
          bucket_name: string
          storage_path: string
          public_url: string
          media_type: string
          file_size: number | null
          width: number | null
          height: number | null
          page_context: string | null
          tags: string[] | null
          is_active: boolean
          folder_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          alt_text?: string | null
          bucket_name?: string
          storage_path: string
          public_url: string
          media_type?: string
          file_size?: number | null
          width?: number | null
          height?: number | null
          page_context?: string | null
          tags?: string[] | null
          is_active?: boolean
          folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          alt_text?: string | null
          bucket_name?: string
          storage_path?: string
          public_url?: string
          media_type?: string
          file_size?: number | null
          width?: number | null
          height?: number | null
          page_context?: string | null
          tags?: string[] | null
          is_active?: boolean
          folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_folder_id_fkey"
            columns: ["folder_id"]
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }
      essays: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image_url: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string
          excerpt?: string | null
          featured_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          featured_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      essays_media: {
        Row: {
          id: string
          essay_id: string
          media_id: string
          position: number
        }
        Insert: {
          id?: string
          essay_id: string
          media_id: string
          position?: number
        }
        Update: {
          id?: string
          essay_id?: string
          media_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "essays_media_essay_id_fkey"
            columns: ["essay_id"]
            referencedRelation: "essays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essays_media_media_id_fkey"
            columns: ["media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
      galleries: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_media_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_media_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_media_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_cover_media_id_fkey"
            columns: ["cover_media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
      gallery_items: {
        Row: {
          id: string
          gallery_id: string
          media_id: string
          position: number
        }
        Insert: {
          id?: string
          gallery_id: string
          media_id: string
          position?: number
        }
        Update: {
          id?: string
          gallery_id?: string
          media_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_gallery_id_fkey"
            columns: ["gallery_id"]
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_media_id_fkey"
            columns: ["media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
      gallery_projects: {
        Row: {
          id: string
          title: string
          slug: string
          category: string
          description: string | null
          thumbnail_media_id: string | null
          is_featured: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category?: string
          description?: string | null
          thumbnail_media_id?: string | null
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category?: string
          description?: string | null
          thumbnail_media_id?: string | null
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_projects_thumbnail_media_id_fkey"
            columns: ["thumbnail_media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
      project_media: {
        Row: {
          id: string
          project_id: string
          media_id: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          media_id: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          media_id?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "gallery_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_media_id_fkey"
            columns: ["media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
      site_zones: {
        Row: {
          id: string
          key: string
          config_json: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          config_json?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          config_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      text_blocks: {
        Row: {
          id: string
          key: string
          content_md: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          content_md?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          content_md?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_background_history: {
        Row: {
          id: string
          page_key: string
          media_id: string
          shown_at: string
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          page_key: string
          media_id: string
          shown_at?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          page_key?: string
          media_id?: string
          shown_at?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_background_history_media_id_fkey"
            columns: ["media_id"]
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      // No views currently defined
    }
    Functions: {
      get_recent_backgrounds: {
        Args: {
          p_page_key: string
          p_limit?: number
        }
        Returns: Array<{ media_id: string }>
      }
      record_background_view: {
        Args: {
          p_page_key: string
          p_media_id: string
          p_session_id?: string | null
        }
        Returns: void
      }
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: unknown
      }
    }
    Enums: {
      // No enums currently defined
    }
  }
}

/**
 * STORAGE BUCKETS
 *
 * Note: Storage buckets are managed separately from the database schema.
 * Query storage.buckets to see current configuration.
 */
export interface StorageBuckets {
  backgrounds: {
    name: 'backgrounds'
    public: boolean
    description: 'Background images for site pages'
  }
  media: {
    name: 'media'
    public: boolean
    description: 'General media storage for essays, galleries, and projects'
  }
}

/**
 * HELPER TYPES FOR COMMON QUERIES
 */

// Media item with folder information
export type MediaItemWithFolder = Database['public']['Tables']['media_items']['Row'] & {
  folder?: Database['public']['Tables']['media_folders']['Row'] | null
}

// Essay with media
export type EssayWithMedia = Database['public']['Tables']['essays']['Row'] & {
  essays_media?: Array<
    Database['public']['Tables']['essays_media']['Row'] & {
      media_item?: Database['public']['Tables']['media_items']['Row']
    }
  >
}

// Gallery with items
export type GalleryWithItems = Database['public']['Tables']['galleries']['Row'] & {
  cover_media?: Database['public']['Tables']['media_items']['Row'] | null
  gallery_items?: Array<
    Database['public']['Tables']['gallery_items']['Row'] & {
      media_item?: Database['public']['Tables']['media_items']['Row']
    }
  >
}

// Gallery project with media
export type GalleryProjectWithMedia = Database['public']['Tables']['gallery_projects']['Row'] & {
  thumbnail_media?: Database['public']['Tables']['media_items']['Row'] | null
  project_media?: Array<
    Database['public']['Tables']['project_media']['Row'] & {
      media_item?: Database['public']['Tables']['media_items']['Row']
    }
  >
}

/**
 * SITE ZONE CONFIG TYPES
 */
export interface SiteZoneConfig {
  folderId?: string
  folderSlug?: string
  refreshMode?: 'session' | 'page' | 'static'
  staticImageId?: string
}

/**
 * TABLE DESCRIPTIONS
 */
export const TABLE_DESCRIPTIONS = {
  media_folders: {
    name: 'media_folders',
    purpose: 'Hierarchical folder structure for organizing media items',
    key_columns: ['id', 'name', 'slug', 'parent_id'],
    relationships: ['Self-referencing for nested folders', 'Referenced by media_items']
  },
  media_items: {
    name: 'media_items',
    purpose: 'Central media library storing all images and files with metadata',
    key_columns: ['id', 'title', 'bucket_name', 'storage_path', 'public_url', 'folder_id', 'tags'],
    relationships: [
      'Belongs to media_folders',
      'Referenced by essays_media',
      'Referenced by galleries (cover)',
      'Referenced by gallery_items',
      'Referenced by gallery_projects (thumbnail)',
      'Referenced by project_media',
      'Referenced by page_background_history'
    ]
  },
  essays: {
    name: 'essays',
    purpose: 'Blog posts/articles with rich content and publishing workflow',
    key_columns: ['id', 'title', 'slug', 'content', 'is_published', 'published_at'],
    relationships: ['Has many essays_media']
  },
  essays_media: {
    name: 'essays_media',
    purpose: 'Junction table linking essays to media items with ordering',
    key_columns: ['essay_id', 'media_id', 'position'],
    relationships: ['Belongs to essays', 'Belongs to media_items']
  },
  galleries: {
    name: 'galleries',
    purpose: 'Image gallery collections with cover images',
    key_columns: ['id', 'title', 'slug', 'cover_media_id', 'is_active'],
    relationships: ['Has one media_item (cover)', 'Has many gallery_items']
  },
  gallery_items: {
    name: 'gallery_items',
    purpose: 'Junction table linking galleries to media items with ordering',
    key_columns: ['gallery_id', 'media_id', 'position'],
    relationships: ['Belongs to galleries', 'Belongs to media_items']
  },
  gallery_projects: {
    name: 'gallery_projects',
    purpose: 'Portfolio projects with categories, featured status, and thumbnails',
    key_columns: ['id', 'title', 'slug', 'category', 'thumbnail_media_id', 'is_featured', 'sort_order'],
    relationships: ['Has one media_item (thumbnail)', 'Has many project_media']
  },
  project_media: {
    name: 'project_media',
    purpose: 'Junction table linking gallery projects to media items with ordering',
    key_columns: ['project_id', 'media_id', 'sort_order'],
    relationships: ['Belongs to gallery_projects', 'Belongs to media_items']
  },
  site_zones: {
    name: 'site_zones',
    purpose: 'Configuration storage for different site areas/pages',
    key_columns: ['id', 'key', 'config_json'],
    relationships: ['None - standalone configuration']
  },
  text_blocks: {
    name: 'text_blocks',
    purpose: 'Reusable markdown text content blocks for site pages',
    key_columns: ['id', 'key', 'content_md'],
    relationships: ['None - standalone content']
  },
  page_background_history: {
    name: 'page_background_history',
    purpose: 'Tracks which background images were shown to users for rotation logic',
    key_columns: ['page_key', 'media_id', 'shown_at', 'session_id'],
    relationships: ['Belongs to media_items']
  }
} as const

/**
 * RLS POLICY SUMMARY
 */
export const RLS_POLICIES = {
  media_folders: {
    select: 'Public - anyone can view',
    all: 'Authenticated users only'
  },
  media_items: {
    select: 'Public - only active items',
    all: 'Authenticated users only'
  },
  essays: {
    select: 'Public - only published essays',
    all: 'Authenticated users only'
  },
  essays_media: {
    select: 'Public - anyone can view',
    all: 'Authenticated users only'
  },
  galleries: {
    select: 'Public - only active galleries',
    all: 'Authenticated users only'
  },
  gallery_items: {
    select: 'Public - only items from active galleries',
    all: 'Authenticated users only'
  },
  gallery_projects: {
    select: 'Public - only active projects',
    all: 'Authenticated users only'
  },
  project_media: {
    select: 'Public - only media from active projects',
    all: 'Authenticated users only'
  },
  site_zones: {
    select: 'Public - anyone can view',
    all: 'Authenticated users only'
  },
  text_blocks: {
    select: 'Public - anyone can view',
    all: 'Authenticated users only'
  },
  page_background_history: {
    select: 'Public - anyone can view',
    insert: 'Public - anyone can insert',
    all: 'Authenticated users have full access'
  }
} as const

/**
 * INDEXES
 */
export const DATABASE_INDEXES = [
  // Essays
  'idx_essays_published',
  'idx_essays_slug',

  // Essays Media
  'idx_essays_media_essay',

  // Gallery Items
  'idx_gallery_items_gallery',

  // Gallery Projects
  'idx_gallery_projects_active',
  'idx_gallery_projects_category',
  'idx_gallery_projects_slug',
  'idx_gallery_projects_sort',

  // Media Folders
  'idx_media_folders_slug',

  // Media Items
  'idx_media_items_active',
  'idx_media_items_bucket',
  'idx_media_items_folder',
  'idx_media_items_tags',

  // Page Background History
  'idx_bg_history_media',
  'idx_bg_history_page_time',
  'idx_bg_history_session',

  // Project Media
  'idx_project_media_media',
  'idx_project_media_project',
  'idx_project_media_sort'
] as const

/**
 * CURRENT DATA SUMMARY (as of extraction)
 */
export const DATA_SUMMARY = {
  media_folders: {
    count: 2,
    description: 'Contains "Backgrounds" and "media" folders'
  },
  media_items: {
    count: 14,
    description: 'Background images in the Backgrounds folder'
  },
  essays: {
    count: 0,
    description: 'No essays created yet'
  },
  galleries: {
    count: 0,
    description: 'No galleries created yet'
  },
  gallery_projects: {
    count: 0,
    description: 'No gallery projects created yet'
  },
  site_zones: {
    count: 7,
    description: 'Configured zones: home, about, contact, essays, gallery, shop, admin'
  },
  page_background_history: {
    count: 161,
    description: 'Background view tracking history'
  }
} as const
