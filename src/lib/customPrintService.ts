import { supabase } from './supabase';

export interface PrintType {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price_multiplier: number;
  available: boolean;
  sort_order: number;
}

export interface PrintSize {
  id: string;
  name: string;
  width_inches: number;
  height_inches: number;
  base_price: number;
  is_custom: boolean;
  available: boolean;
  sort_order: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  base_cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
  available: boolean;
  sort_order: number;
}

export interface CustomPrintOrder {
  id?: string;
  order_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status?: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_status?: string;
  customer_notes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  media_item_id: string;
  print_type_id: string;
  print_size_id: string;
  custom_width?: number;
  custom_height?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface OrderWithDetails extends CustomPrintOrder {
  order_number: string;
  created_at: string;
  updated_at: string;
}

class CustomPrintService {
  async getPrintTypes(): Promise<PrintType[]> {
    const { data, error } = await supabase
      .from('print_types')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPrintSizes(): Promise<PrintSize[]> {
    const { data, error } = await supabase
      .from('print_sizes')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getShippingOptions(): Promise<ShippingOption[]> {
    const { data, error } = await supabase
      .from('shipping_options')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  calculatePrice(
    printType: PrintType,
    printSize: PrintSize,
    customWidth?: number,
    customHeight?: number,
    quantity: number = 1
  ): number {
    let basePrice = printSize.base_price;

    if (printSize.is_custom && customWidth && customHeight) {
      const area = customWidth * customHeight;
      basePrice = area * 0.5;
    }

    const typeMultiplier = printType.base_price_multiplier;
    const unitPrice = basePrice * typeMultiplier;

    return unitPrice * quantity;
  }

  async createOrder(order: CustomPrintOrder): Promise<OrderWithDetails> {
    const { items, ...orderData } = order;

    const { data: createdOrder, error: orderError } = await supabase
      .from('custom_print_orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      ...item,
      order_id: createdOrder.id
    }));

    const { error: itemsError } = await supabase
      .from('custom_print_order_items')
      .insert(orderItems);

    if (itemsError) {
      await supabase
        .from('custom_print_orders')
        .delete()
        .eq('id', createdOrder.id);
      throw itemsError;
    }

    return createdOrder as OrderWithDetails;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from('custom_print_orders')
      .select(`
        *,
        items:custom_print_order_items(
          *,
          media_item:media_items(*),
          print_type:print_types(*),
          print_size:print_sizes(*)
        )
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) throw error;
    return data as OrderWithDetails | null;
  }

  async getAllOrders(status?: string): Promise<OrderWithDetails[]> {
    let query = supabase
      .from('custom_print_orders')
      .select(`
        *,
        items:custom_print_order_items(count)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as OrderWithDetails[];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('custom_print_orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }

  async updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
    const { error } = await supabase
      .from('custom_print_orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', orderId);

    if (error) throw error;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    const { error } = await supabase
      .from('custom_print_orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (error) throw error;
  }
}

export const customPrintService = new CustomPrintService();
