import { Product } from './supabase';
import { productService } from './database';

const CART_STORAGE_KEY = 'shopping_cart';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariant: string;
  addedAt: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  price: number;
}

class CartManager {
  private getCartFromStorage(): CartItem[] {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveCartToStorage(cart: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  addToCart(productId: string, quantity: number, selectedVariant: string): void {
    const cart = this.getCartFromStorage();
    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.selectedVariant === selectedVariant
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId,
        quantity,
        selectedVariant,
        addedAt: new Date().toISOString(),
      });
    }

    this.saveCartToStorage(cart);
  }

  removeFromCart(productId: string, selectedVariant: string): void {
    const cart = this.getCartFromStorage();
    const filtered = cart.filter(
      item => !(item.productId === productId && item.selectedVariant === selectedVariant)
    );
    this.saveCartToStorage(filtered);
  }

  updateQuantity(productId: string, selectedVariant: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, selectedVariant);
      return;
    }

    const cart = this.getCartFromStorage();
    const item = cart.find(
      i => i.productId === productId && i.selectedVariant === selectedVariant
    );

    if (item) {
      item.quantity = quantity;
      this.saveCartToStorage(cart);
    }
  }

  async getCartItems(): Promise<CartItemWithProduct[]> {
    const cart = this.getCartFromStorage();
    const itemsWithProducts: CartItemWithProduct[] = [];

    for (const cartItem of cart) {
      try {
        const product = await productService.getProduct(cartItem.productId);
        if (product) {
          const price = this.getProductPrice(product, cartItem.selectedVariant);
          itemsWithProducts.push({
            ...cartItem,
            product,
            price,
          });
        }
      } catch (error) {
        console.error(`Error fetching product ${cartItem.productId}:`, error);
      }
    }

    return itemsWithProducts;
  }

  private getProductPrice(product: Product, variant: string): number {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const v = product.variants.find(v => v.size === variant);
      return v?.price || product.base_price;
    }
    return product.base_price;
  }

  async getCartTotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCartCount(): number {
    const cart = this.getCartFromStorage();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart(): void {
    this.saveCartToStorage([]);
  }
}

export const cartManager = new CartManager();
