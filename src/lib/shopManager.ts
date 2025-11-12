// Shop Management System
export interface ShopItem {
  id: string;
  title: string;
  description: string;
  category: 'art' | 'digital' | 'merchandise' | 'limited';
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  inStock: boolean;
  inventory?: number;
  limited?: {
    isLimited: boolean;
    totalQuantity: number;
    remaining: number;
  };
  rating: number;
  reviews: number;
  tags: string[];
  metadata: {
    dimensions?: string;
    materials?: string;
    weight?: string;
    printType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  selectedSize: string;
  addedAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    email: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

class ShopManager {
  private items: ShopItem[] = [];
  private cart: CartItem[] = [];
  private orders: Order[] = [];

  // Add shop item
  addItem(item: Omit<ShopItem, 'id' | 'createdAt' | 'updatedAt'>): ShopItem {
    const newItem: ShopItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.items.push(newItem);
    return newItem;
  }

  // Get items by category
  getItemsByCategory(category: string): ShopItem[] {
    if (category === 'all') return this.items;
    return this.items.filter(item => item.category === category);
  }

  // Add to cart
  addToCart(itemId: string, quantity: number = 1, selectedSize: string): void {
    const existingItem = this.cart.find(
      item => item.itemId === itemId && item.selectedSize === selectedSize
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        itemId,
        quantity,
        selectedSize,
        addedAt: new Date().toISOString()
      });
    }
  }

  // Get cart items with full details
  getCartItems(): Array<CartItem & { item: ShopItem }> {
    return this.cart.map(cartItem => ({
      ...cartItem,
      item: this.items.find(item => item.id === cartItem.itemId)!
    })).filter(item => item.item);
  }

  // Calculate cart total
  getCartTotal(): number {
    return this.getCartItems().reduce((total, cartItem) => {
      return total + (cartItem.item.price * cartItem.quantity);
    }, 0);
  }

  // Remove from cart
  removeFromCart(itemId: string, selectedSize: string): void {
    this.cart = this.cart.filter(
      item => !(item.itemId === itemId && item.selectedSize === selectedSize)
    );
  }

  // Clear cart
  clearCart(): void {
    this.cart = [];
  }

  // Create order
  createOrder(customerInfo: Order['customerInfo']): Order {
    const order: Order = {
      id: this.generateId(),
      items: [...this.cart],
      total: this.getCartTotal(),
      status: 'pending',
      customerInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.clearCart();
    return order;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const shopManager = new ShopManager();