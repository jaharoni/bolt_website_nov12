import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { orderService, customerService } from '../lib/database';
import Footer from '../components/Footer';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  useEffect(() => {
    if (cartItems.length === 0 && step !== 'confirmation') {
      navigate('/shop');
    }
  }, [cartItems, step, navigate]);

  const validateShipping = () => {
    return (
      shippingInfo.name &&
      shippingInfo.email &&
      shippingInfo.address1 &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zip
    );
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const subtotal = getTotal();
      const shippingCost = 9.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shippingCost + tax;

      const orderData = {
        customer_email: shippingInfo.email,
        customer_name: shippingInfo.name,
        shipping_address: {
          name: shippingInfo.name,
          address1: shippingInfo.address1,
          address2: shippingInfo.address2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo.zip,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        items: cartItems.map(item => ({
          product_id: item.productId,
          product_title: item.product.title,
          product_image: Array.isArray(item.product.images) ? item.product.images[0] : '',
          variant: item.selectedVariant,
          quantity: item.quantity,
          unit_price: item.price,
          is_digital: item.product.is_digital,
        })),
        subtotal,
        shipping_cost: shippingCost,
        tax,
        total,
      };

      const order = await orderService.createOrder(orderData);
      await customerService.getOrCreateCustomer(
        shippingInfo.email,
        shippingInfo.name,
        shippingInfo.phone
      );

      setOrderId(order.order_number);
      clearCart();
      setStep('confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotal();
  const shippingCost = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen pb-8 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-display text-white mb-4">Order Confirmed!</h1>
            <p className="text-white/70 mb-2">Thank you for your purchase</p>
            <p className="text-yellow-400 font-semibold text-xl mb-8">Order #{orderId}</p>

            <div className="border-t border-white/10 pt-6 mb-8">
              <p className="text-white/60 text-sm mb-4">
                A confirmation email has been sent to <span className="text-white">{shippingInfo.email}</span>
              </p>
              <p className="text-white/60 text-sm">
                You can track your order status using your order number.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/shop')} className="btn-secondary">
                Continue Shopping
              </button>
              <button onClick={() => navigate(`/orders/${orderId}`)} className="btn-primary">
                Track Order
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-8 px-4 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display text-white mb-8 text-center">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 gap-4">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-yellow-400' : 'text-white/60'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'shipping' ? 'bg-yellow-400/20 border-2 border-yellow-400' : 'bg-white/10'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-semibold">Shipping</span>
          </div>

          <ArrowRight className="w-5 h-5 text-white/30" />

          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-yellow-400' : 'text-white/60'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-yellow-400/20 border-2 border-yellow-400' : 'bg-white/10'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-semibold">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="glass-card p-8">
                <h2 className="text-2xl font-display text-white mb-6">Shipping Information</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="input-glass w-full"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="input-glass w-full"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phone</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="input-glass w-full"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                      className="input-glass w-full"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingInfo.address2}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                      className="input-glass w-full"
                      placeholder="Apt, Suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="input-glass w-full"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-2">State *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="input-glass w-full"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        className="input-glass w-full"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-8">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <div className="glass-card p-8">
                <h2 className="text-2xl font-display text-white mb-6">Payment Information</h2>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> Stripe integration will be added in the next phase.
                    For now, this is a test order flow.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      className="input-glass w-full"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Card Number</label>
                    <input
                      type="text"
                      className="input-glass w-full"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Expiry Date</label>
                      <input
                        type="text"
                        className="input-glass w-full"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-2">CVV</label>
                      <input
                        type="text"
                        className="input-glass w-full"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('shipping')} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-xl font-display text-white mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.selectedVariant}`} className="flex gap-3">
                    <img
                      src={Array.isArray(item.product.images) ? item.product.images[0] : ''}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.product.title}</p>
                      <p className="text-white/60 text-xs">{item.selectedVariant}</p>
                      <p className="text-white/80 text-sm">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-yellow-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
