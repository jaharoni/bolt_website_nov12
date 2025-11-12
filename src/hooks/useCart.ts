import { useState, useEffect } from 'react';
import { cartManager, CartItemWithProduct } from '../lib/cart';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    setLoading(true);
    try {
      const items = await cartManager.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string, quantity: number, selectedVariant: string) => {
    cartManager.addToCart(productId, quantity, selectedVariant);
    refreshCart();
  };

  const removeFromCart = (productId: string, selectedVariant: string) => {
    cartManager.removeFromCart(productId, selectedVariant);
    refreshCart();
  };

  const updateQuantity = (productId: string, selectedVariant: string, quantity: number) => {
    cartManager.updateQuantity(productId, selectedVariant, quantity);
    refreshCart();
  };

  const clearCart = () => {
    cartManager.clearCart();
    refreshCart();
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return cartManager.getCartCount();
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return {
    cartItems,
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    refreshCart,
    loading,
  };
};
