import { supabase, Product, Order, OrderItem, Customer } from './supabase';

export const productService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },

  async getProductsByCategory(category: string) {
    if (category === 'all') {
      return this.getAllProducts();
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Product | null;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchProducts(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },
};

export const orderService = {
  async createOrder(orderData: {
    customer_email: string;
    customer_name: string;
    shipping_address: any;
    items: Array<{
      product_id: string;
      product_title: string;
      product_image: string;
      variant: string;
      quantity: number;
      unit_price: number;
      is_digital: boolean;
    }>;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
  }) {
    const orderNumber = await this.generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        shipping_address: orderData.shipping_address,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        tax: orderData.tax,
        total: orderData.total,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_image: item.product_image,
      variant: item.variant,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      is_digital: item.is_digital,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order as Order;
  },

  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getOrderByNumber(orderNumber: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getOrdersByCustomerEmail(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updateOrderPaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string) {
    const updates: any = { payment_status: paymentStatus };
    if (paymentIntentId) {
      updates.payment_intent_id = paymentIntentId;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updateOrderTracking(id: string, trackingNumber: string, trackingUrl: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        status: 'shipped',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updatePrintfulOrderId(id: string, printfulOrderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ printful_order_id: printfulOrderId })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async generateOrderNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_order_number');

    if (error) {
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `ORD-${date}-${random}`;
    }

    return data as string;
  },
};

export const customerService = {
  async getOrCreateCustomer(email: string, name?: string, phone?: string) {
    const { data: existing, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return existing as Customer;
    }

    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        email,
        name: name || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newCustomer as Customer;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async getCustomerByEmail(email: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data as Customer | null;
  },
};
