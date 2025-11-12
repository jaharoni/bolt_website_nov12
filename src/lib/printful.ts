import axios, { AxiosInstance } from 'axios';

const PRINTFUL_API_BASE = 'https://api.printful.com';

export class PrintfulClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: PRINTFUL_API_BASE,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProducts() {
    try {
      const response = await this.client.get('/store/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching Printful products:', error);
      throw error;
    }
  }

  async getProduct(productId: string) {
    try {
      const response = await this.client.get(`/store/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Printful product ${productId}:`, error);
      throw error;
    }
  }

  async getCatalogProducts() {
    try {
      const response = await this.client.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching Printful catalog:', error);
      throw error;
    }
  }

  async getCatalogProduct(productId: string) {
    try {
      const response = await this.client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching catalog product ${productId}:`, error);
      throw error;
    }
  }

  async getCatalogVariant(variantId: string) {
    try {
      const response = await this.client.get(`/products/variant/${variantId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching variant ${variantId}:`, error);
      throw error;
    }
  }

  async calculateShipping(recipient: any, items: any[]) {
    try {
      const response = await this.client.post('/shipping/rates', {
        recipient,
        items,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }

  async createOrder(orderData: PrintfulOrderCreate) {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating Printful order:', error);
      throw error;
    }
  }

  async estimateCosts(orderData: PrintfulOrderCreate) {
    try {
      const response = await this.client.post('/orders/estimate-costs', orderData);
      return response.data;
    } catch (error) {
      console.error('Error estimating costs:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const response = await this.client.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }

  async confirmOrder(orderId: string) {
    try {
      const response = await this.client.post(`/orders/${orderId}/confirm`);
      return response.data;
    } catch (error) {
      console.error(`Error confirming order ${orderId}:`, error);
      throw error;
    }
  }
}

export type PrintfulOrderCreate = {
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    variant_id: number;
    quantity: number;
    files?: Array<{
      url: string;
    }>;
  }>;
  retail_costs?: {
    currency: string;
    subtotal: string;
    discount?: string;
    shipping: string;
    tax: string;
  };
  confirm?: boolean;
};

export type PrintfulProduct = {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
};

export type PrintfulVariant = {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string;
  currency: string;
  is_ignored: boolean;
  files: Array<{
    id: number;
    type: string;
    hash: string;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi: number;
    status: string;
    created: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
  }>;
};

let printfulClient: PrintfulClient | null = null;

export const getPrintfulClient = (): PrintfulClient | null => {
  const apiKey = import.meta.env.VITE_PRINTFUL_API_KEY;

  if (!apiKey || apiKey === 'your_printful_api_key_here') {
    console.warn('Printful integration is disabled. API key not configured.');
    return null;
  }

  if (!printfulClient) {
    printfulClient = new PrintfulClient(apiKey);
  }

  return printfulClient;
};

export const printfulService = {
  isEnabled(): boolean {
    const apiKey = import.meta.env.VITE_PRINTFUL_API_KEY;
    return !!(apiKey && apiKey !== 'your_printful_api_key_here');
  },

  async syncProducts() {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.getProducts();
  },

  async syncCatalog() {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.getCatalogProducts();
  },

  async getProductDetails(productId: string) {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.getProduct(productId);
  },

  async calculateShipping(address: any, items: any[]) {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.calculateShipping(address, items);
  },

  async createOrder(orderData: PrintfulOrderCreate) {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.createOrder(orderData);
  },

  async estimateOrderCosts(orderData: PrintfulOrderCreate) {
    const client = getPrintfulClient();
    if (!client) throw new Error('Printful is not enabled');
    return await client.estimateCosts(orderData);
  },
};
