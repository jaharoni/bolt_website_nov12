// Media Management System
export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  category: 'commercial' | 'events' | 'essays' | 'personal';
  url: string;
  thumbnailUrl: string;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for videos
    fileSize?: number;
    captureDate?: string;
    location?: string;
    equipment?: string;
  };
  pricing?: {
    available: boolean;
    price: number;
    sizes: string[];
    limited?: boolean;
    remaining?: number;
  };
  featured: boolean;
  recent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  items: MediaItem[];
  coverImage: string;
  featured: boolean;
}

class MediaManager {
  private items: MediaItem[] = [];
  private collections: MediaCollection[] = [];

  // Add media item
  addItem(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.items.push(newItem);
    return newItem;
  }

  // Get items by category
  getItemsByCategory(category: string): MediaItem[] {
    return this.items.filter(item => item.category === category);
  }

  // Get featured items
  getFeaturedItems(): MediaItem[] {
    return this.items.filter(item => item.featured);
  }

  // Get recent items
  getRecentItems(): MediaItem[] {
    return this.items.filter(item => item.recent);
  }

  // Search items
  searchItems(query: string): MediaItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.items.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get available shop items
  getShopItems(): MediaItem[] {
    return this.items.filter(item => item.pricing?.available);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const mediaManager = new MediaManager();