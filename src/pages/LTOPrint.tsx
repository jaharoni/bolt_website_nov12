import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Info, Shield, Truck, Check } from 'lucide-react';
import { ltoService, LTOOfferWithDetails } from '../lib/ltoService';
import { LTOVariant } from '../lib/supabase';
import { useTurnstile } from '../hooks/useTurnstile';
import Footer from '../components/Footer';

const LTOPrint: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<LTOOfferWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<LTOVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { isReady, renderTurnstile, getToken, resetToken } = useTurnstile();

  useEffect(() => {
    if (slug) {
      loadOffer();
    }
  }, [slug]);

  useEffect(() => {
    if (offer?.variants && offer.variants.length > 0) {
      setSelectedVariant(offer.variants[0]);
    }
  }, [offer]);

  const loadOffer = async () => {
    try {
      const data = await ltoService.getOfferBySlug(slug!);

      if (!data) {
        navigate('/404');
        return;
      }

      if (data.status !== 'active') {
        alert('This campaign is not currently available');
        navigate('/shop');
        return;
      }

      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) {
        alert('This campaign has not started yet');
        navigate('/shop');
        return;
      }

      if (data.end_date && new Date(data.end_date) < now) {
        alert('This campaign has ended');
        navigate('/shop');
        return;
      }

      setOffer(data);
      await ltoService.incrementViews(slug!);
    } catch (error) {
      console.error('Error loading offer:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (offer?.max_quantity_per_order || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVariant || !offer) {
      alert('Please select a variant');
      return;
    }

    const token = await getToken();
    if (!token) {
      alert('Please complete the verification');
      return;
    }

    setSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-lto-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          slug: offer.slug,
          variant_id: selectedVariant.id,
          quantity,
          email: formData.email,
          shippingAddress: {
            name: formData.name,
            line1: formData.address1,
            line2: formData.address2,
            city: formData.city,
            state: formData.state,
            postal: formData.zip,
            country: formData.country,
            phone: formData.phone,
          },
          turnstileToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      alert(error.message || 'Failed to create checkout. Please try again.');
      resetToken();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!offer || !offer.media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Campaign not found</div>
      </div>
    );
  }

  const total = selectedVariant ? (selectedVariant.price_cents / 100) * quantity : 0;

  return (
    <div className="relative min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg shadow-2xl group">
              <img
                src={offer.media.public_url}
                alt={offer.media.alt_text || offer.title}
                className="w-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
                {offer.title}
              </h1>
              {offer.description && (
                <p className="text-white/70 text-lg leading-relaxed">
                  {offer.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-card p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-3">
                      Select Size
                    </label>
                    <div className="space-y-2">
                      {offer.variants?.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          disabled={!variant.is_available}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : variant.is_available
                              ? 'border-white/10 hover:border-white/30 bg-white/5'
                              : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-semibold">
                                {variant.variant_label}
                              </div>
                              {variant.variant_description && (
                                <div className="text-white/60 text-sm mt-1">
                                  {variant.variant_description}
                                </div>
                              )}
                            </div>
                            <div className="text-white font-bold text-lg">
                              ${(variant.price_cents / 100).toFixed(2)}
                            </div>
                          </div>
                          {variant.stock_limit && (
                            <div className="text-xs text-yellow-400 mt-2">
                              Limited: {variant.stock_limit - variant.sold_count} remaining
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white text-xl font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        disabled={quantity >= (offer.max_quantity_per_order || 10)}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-white font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-glass w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-glass w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      className="input-glass w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Apt, Suite (optional)</label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="input-glass w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="input-glass w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="input-glass w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">ZIP *</label>
                      <input
                        type="text"
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="input-glass w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-glass w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/80">Subtotal:</span>
                  <span className="text-white text-xl font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Shipping and taxes calculated at checkout
                </p>

                <div className="mb-4">
                  {renderTurnstile()}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isReady || !selectedVariant}
                  className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    'Processing...'
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Proceed to Checkout
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3 text-white/70">
                  <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-semibold">Secure Checkout</div>
                    <div>Powered by Stripe</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-white/70">
                  <Truck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-semibold">Print on Demand</div>
                    <div>Fulfilled by Printful</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-white/70">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-semibold">Quality Guaranteed</div>
                    <div>Museum-grade prints</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LTOPrint;
