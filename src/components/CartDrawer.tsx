import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart, loading } = useCart();

  const handleCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-black/90 backdrop-blur-xl border-l border-white/20 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-xl font-display text-white">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4 text-sm">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((cartItem) => {
                  const image = Array.isArray(cartItem.product.images) && cartItem.product.images.length > 0
                    ? cartItem.product.images[0]
                    : 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=200';

                  return (
                    <div key={`${cartItem.productId}-${cartItem.selectedVariant}`} className="glass-card p-4">
                      <div className="flex gap-4">
                        <Link to={`/shop/product/${cartItem.productId}`} onClick={onClose}>
                          <img
                            src={image}
                            alt={cartItem.product.title}
                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/shop/product/${cartItem.productId}`} onClick={onClose}>
                            <h3 className="text-white font-medium text-sm hover:text-yellow-400 transition-colors cursor-pointer">
                              {cartItem.product.title}
                            </h3>
                          </Link>
                          <p className="text-white/60 text-xs">{cartItem.selectedVariant}</p>
                          <p className="text-white font-semibold">${cartItem.price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => removeFromCart(cartItem.productId, cartItem.selectedVariant)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(cartItem.productId, cartItem.selectedVariant, cartItem.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm w-8 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItem.productId, cartItem.selectedVariant, cartItem.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-white/20 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total:</span>
                <span className="text-white font-bold text-xl">${getTotal().toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-3"
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full btn-ghost py-2 text-sm"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;