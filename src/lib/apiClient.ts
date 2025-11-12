import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const apiClient = {
  async call(endpoint: string, options: RequestInit = {}) {
    const url = `${supabaseUrl}/functions/v1/${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.statusText} - ${text}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  },

  async printfulSync(action: 'sync' | 'list' | 'categories') {
    const apiUrl = `${supabaseUrl}/functions/v1/printful-sync?action=${action}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to sync with Printful');
    }

    return await response.json();
  },

  async printfulFulfillOrder(orderId: string) {
    return this.call('printful-fulfill-order', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  },

  async printfulGenerateMockup(variantId: number, imageUrl: string) {
    return this.call('printful-generate-mockup', {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, image_url: imageUrl }),
    });
  },
};
