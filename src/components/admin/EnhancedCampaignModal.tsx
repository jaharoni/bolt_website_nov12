import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, DollarSign, Settings, Image as ImageIcon, Check } from 'lucide-react';
import { ltoService, mediaService, LTOOfferWithDetails } from '../../lib/ltoService';
import { LTOOffer } from '../../lib/supabase';
import { apiClient } from '../../lib/apiClient';

interface PrintfulProduct {
  id: string;
  printful_id: string;
  name: string;
  category: string;
  sizes: Array<{
    id: number;
    name: string;
    size: string;
    color: string;
    price: number;
    image: string;
  }>;
  base_cost: number;
  product_data: {
    image: string;
    brand: string;
    model: string;
    variant_count: number;
  };
}

interface SelectedVariant {
  printfulProductId: string;
  printfulVariantId: string;
  name: string;
  size: string;
  baseCost: number;
  suggestedPrice: number;
}

type EndConditionType = 'manual' | 'date' | 'quantity' | 'revenue';

interface EnhancedCampaignModalProps {
  offer: LTOOfferWithDetails | null;
  onClose: () => void;
  onSave: () => void;
}

const EnhancedCampaignModal: React.FC<EnhancedCampaignModalProps> = ({ offer, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    slug: offer?.slug || '',
    title: offer?.title || '',
    description: offer?.description || null,
    media_id: offer?.media_id || null,
    status: offer?.status || 'draft',
    max_quantity_per_order: offer?.max_quantity_per_order || 10,
    is_featured: offer?.is_featured || false,
    end_condition_type: (offer?.end_condition_type || ['manual']) as EndConditionType[],
    start_date: offer?.start_date || null,
    end_date: offer?.end_date || null,
    total_quantity_limit: offer?.total_quantity_limit || null,
    target_revenue_goal: offer?.target_revenue_goal || null,
    metadata: offer?.metadata || {},
    campaign_ended_reason: null,
    campaign_ended_at: null,
  });

  const [media, setMedia] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [printfulProducts, setPrintfulProducts] = useState<PrintfulProduct[]>([]);
  const [loadingPrintful, setLoadingPrintful] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [priceMarkup, setPriceMarkup] = useState(2.5);

  const roundToNearest5 = (price: number): number => {
    return Math.round(price / 5) * 5;
  };

  useEffect(() => {
    loadMedia();
  }, [searchQuery]);

  const loadMedia = async () => {
    try {
      const data = searchQuery
        ? await mediaService.searchMedia(searchQuery)
        : await mediaService.getAllMedia();
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const loadPrintfulProducts = async () => {
    setLoadingPrintful(true);
    try {
      const data = await apiClient.printfulSync('list');
      setPrintfulProducts(data.products || []);
    } catch (error) {
      console.error('Error loading Printful products:', error);
    } finally {
      setLoadingPrintful(false);
    }
  };

  const toggleEndCondition = (condition: EndConditionType) => {
    const current = formData.end_condition_type;
    if (current.includes(condition)) {
      setFormData({
        ...formData,
        end_condition_type: current.filter(c => c !== condition),
      });
    } else {
      setFormData({
        ...formData,
        end_condition_type: [...current, condition],
      });
    }
  };

  const toggleVariant = (product: PrintfulProduct, variant: any) => {
    const variantKey = `${product.printful_id}-${variant.id}`;
    const existingIndex = selectedVariants.findIndex(
      v => `${v.printfulProductId}-${v.printfulVariantId}` === variantKey
    );

    if (existingIndex >= 0) {
      setSelectedVariants(selectedVariants.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedVariants([
        ...selectedVariants,
        {
          printfulProductId: product.printful_id,
          printfulVariantId: String(variant.id),
          name: `${product.name} - ${variant.size}`,
          size: variant.size,
          baseCost: variant.price,
          suggestedPrice: roundToNearest5(variant.price * priceMarkup),
        },
      ]);
    }
  };

  const isVariantSelected = (product: PrintfulProduct, variant: any) => {
    const variantKey = `${product.printful_id}-${variant.id}`;
    return selectedVariants.some(
      v => `${v.printfulProductId}-${v.printfulVariantId}` === variantKey
    );
  };

  const updateVariantPrice = (index: number, price: number) => {
    const updated = [...selectedVariants];
    updated[index].suggestedPrice = price;
    setSelectedVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.slug) {
        throw new Error('Campaign title and slug are required');
      }

      if (!formData.media_id) {
        throw new Error('Please select a hero image for the campaign');
      }

      if (!formData.end_condition_type || formData.end_condition_type.length === 0) {
        throw new Error('Please select at least one end condition for the campaign');
      }

      if (formData.end_condition_type.includes('date') && !formData.end_date) {
        throw new Error('End date is required when using date-based end condition');
      }

      if (formData.end_condition_type.includes('quantity') && (!formData.total_quantity_limit || formData.total_quantity_limit <= 0)) {
        throw new Error('Total quantity limit is required when using quantity-based end condition');
      }

      if (formData.end_condition_type.includes('revenue') && (!formData.target_revenue_goal || formData.target_revenue_goal <= 0)) {
        throw new Error('Revenue goal is required when using revenue-based end condition');
      }

      if (!offer && selectedVariants.length === 0) {
        throw new Error('Please select at least one print variant for the campaign');
      }

      console.log('Creating campaign with data:', formData);

      let savedOffer: LTOOffer;

      if (offer) {
        savedOffer = await ltoService.updateOffer(offer.id, formData);
      } else {
        savedOffer = await ltoService.createOffer(formData);
      }

      console.log('Campaign saved successfully:', savedOffer);

      if (selectedVariants.length > 0 && !offer) {
        console.log('Creating variants:', selectedVariants);
        for (let i = 0; i < selectedVariants.length; i++) {
          const variant = selectedVariants[i];
          await ltoService.createVariant({
            offer_id: savedOffer.id,
            variant_label: variant.name,
            variant_description: `Print size: ${variant.size}`,
            printful_product_id: variant.printfulProductId,
            printful_variant_id: variant.printfulVariantId,
            price_cents: variant.suggestedPrice * 100,
            cost_cents: variant.baseCost * 100,
            sort_order: i,
            is_available: true,
            stock_limit: null,
            metadata: {},
          });
        }
        console.log('All variants created successfully');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      const errorMessage = error?.message || 'Failed to save campaign. Please check all required fields.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return formData.title && formData.slug && formData.media_id;
    }
    if (currentStep === 2) {
      if (formData.end_condition_type.includes('date')) {
        return formData.end_date;
      }
      if (formData.end_condition_type.includes('quantity')) {
        return formData.total_quantity_limit && formData.total_quantity_limit > 0;
      }
      if (formData.end_condition_type.includes('revenue')) {
        return formData.target_revenue_goal && formData.target_revenue_goal > 0;
      }
      return formData.end_condition_type.includes('manual');
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-2xl font-display text-white">
              {offer ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {currentStep === 1 && 'Basic campaign information'}
              {currentStep === 2 && 'Campaign end conditions'}
              {currentStep === 3 && 'Select print products and sizes'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all ${
                step <= currentStep ? 'bg-yellow-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-glass w-full"
                    placeholder="No Place Like Home"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    className="input-glass w-full"
                    placeholder="no-place-like-home"
                  />
                  <p className="text-white/40 text-xs mt-1">URL: /lto/{formData.slug}</p>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass w-full h-24"
                  placeholder="Tell the story behind this print..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-glass w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Max Per Order</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_quantity_per_order}
                    onChange={(e) =>
                      setFormData({ ...formData, max_quantity_per_order: parseInt(e.target.value) })
                    }
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer h-10">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-white/80 text-sm">Show on shop page</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Hero Image *
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass w-full mb-3"
                  placeholder="Search media library..."
                />
                <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setFormData({ ...formData, media_id: item.id })}
                      className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                        formData.media_id === item.id
                          ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={item.public_url}
                        alt={item.title}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-white/80 font-semibold mb-3">
                  <Settings className="w-4 h-4 inline mr-2" />
                  When should this campaign end?
                </label>
                <p className="text-white/60 text-sm mb-4">
                  Select one or more conditions. The campaign will end when ANY condition is met.
                </p>

                <div className="space-y-3">
                  <div
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      formData.end_condition_type.includes('manual')
                        ? 'ring-2 ring-yellow-400'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleEndCondition('manual')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          formData.end_condition_type.includes('manual')
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'border-white/30'
                        }`}
                      >
                        {formData.end_condition_type.includes('manual') && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Manual Control</h4>
                        <p className="text-white/60 text-sm">
                          Campaign only ends when you manually change the status
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      formData.end_condition_type.includes('date')
                        ? 'ring-2 ring-yellow-400'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleEndCondition('date')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          formData.end_condition_type.includes('date')
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'border-white/30'
                        }`}
                      >
                        {formData.end_condition_type.includes('date') && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          End by Date
                        </h4>
                        <p className="text-white/60 text-sm mb-3">
                          Campaign ends automatically at a specific date and time
                        </p>
                        {formData.end_condition_type.includes('date') && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/60 text-xs mb-1">Start Date</label>
                              <input
                                type="datetime-local"
                                value={formData.start_date?.slice(0, 16) || ''}
                                onChange={(e) =>
                                  setFormData({ ...formData, start_date: e.target.value })
                                }
                                className="input-glass w-full text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-xs mb-1">End Date *</label>
                              <input
                                type="datetime-local"
                                value={formData.end_date?.slice(0, 16) || ''}
                                onChange={(e) =>
                                  setFormData({ ...formData, end_date: e.target.value })
                                }
                                className="input-glass w-full text-sm"
                                onClick={(e) => e.stopPropagation()}
                                required={formData.end_condition_type.includes('date')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      formData.end_condition_type.includes('quantity')
                        ? 'ring-2 ring-yellow-400'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleEndCondition('quantity')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          formData.end_condition_type.includes('quantity')
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'border-white/30'
                        }`}
                      >
                        {formData.end_condition_type.includes('quantity') && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Limited Edition - End by Quantity
                        </h4>
                        <p className="text-white/60 text-sm mb-3">
                          Campaign ends when total prints sold reaches the limit
                        </p>
                        {formData.end_condition_type.includes('quantity') && (
                          <div>
                            <label className="block text-white/60 text-xs mb-1">
                              Total Prints Available *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.total_quantity_limit || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  total_quantity_limit: parseInt(e.target.value) || null,
                                })
                              }
                              className="input-glass w-full"
                              placeholder="100"
                              onClick={(e) => e.stopPropagation()}
                              required={formData.end_condition_type.includes('quantity')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      formData.end_condition_type.includes('revenue')
                        ? 'ring-2 ring-yellow-400'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleEndCondition('revenue')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          formData.end_condition_type.includes('revenue')
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'border-white/30'
                        }`}
                      >
                        {formData.end_condition_type.includes('revenue') && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          End by Revenue Goal
                        </h4>
                        <p className="text-white/60 text-sm mb-3">
                          Campaign ends when revenue reaches the target amount
                        </p>
                        {formData.end_condition_type.includes('revenue') && (
                          <div>
                            <label className="block text-white/60 text-xs mb-1">
                              Revenue Goal (USD) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              value={formData.target_revenue_goal || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  target_revenue_goal: parseFloat(e.target.value) || null,
                                })
                              }
                              className="input-glass w-full"
                              placeholder="5000.00"
                              onClick={(e) => e.stopPropagation()}
                              required={formData.end_condition_type.includes('revenue')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <label className="block text-white/80 font-semibold mb-3">
                  <Package className="w-4 h-4 inline mr-2" />
                  Select Print Products and Sizes
                </label>
                <p className="text-white/60 text-sm mb-4">
                  Choose which Printful products and sizes will be available for this campaign
                </p>

                {!loadingPrintful && printfulProducts.length === 0 && (
                  <div className="glass-card p-8 text-center">
                    <p className="text-white/60 mb-4">No Printful products loaded</p>
                    <button
                      type="button"
                      onClick={loadPrintfulProducts}
                      className="btn-primary"
                    >
                      Load Printful Products
                    </button>
                  </div>
                )}

                {loadingPrintful && (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
                    <p className="text-white/60 mt-4">Loading Printful products...</p>
                  </div>
                )}

                {printfulProducts.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">
                          {selectedVariants.length} variants selected
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-white/60 text-sm">Price Markup:</label>
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={priceMarkup}
                          onChange={(e) => {
                            const newMarkup = parseFloat(e.target.value) || 2.5;
                            setPriceMarkup(newMarkup);
                            setSelectedVariants(
                              selectedVariants.map((v) => ({
                                ...v,
                                suggestedPrice: roundToNearest5(v.baseCost * newMarkup),
                              }))
                            );
                          }}
                          className="input-glass w-20 text-sm"
                        />
                        <span className="text-white/60 text-sm">x</span>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {printfulProducts.filter((p) => p.is_available).map((product) => (
                        <div key={product.id} className="glass-card p-4">
                          <div className="flex gap-4 mb-3">
                            {product.product_data.image && (
                              <img
                                src={product.product_data.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{product.name}</h4>
                              <p className="text-white/60 text-sm">{product.category}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {product.sizes.map((size) => (
                              <div
                                key={size.id}
                                onClick={() => toggleVariant(product, size)}
                                className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                                  isVariantSelected(product, size)
                                    ? 'bg-yellow-400/20 border-2 border-yellow-400'
                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                                }`}
                              >
                                <div className="font-semibold text-white text-xs mb-1">
                                  {size.size}
                                </div>
                                <div className="text-white/60 text-xs">
                                  Cost: ${size.price.toFixed(2)}
                                </div>
                                <div className="text-green-400 text-xs">
                                  Sell: ${roundToNearest5(size.price * priceMarkup).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedVariants.length > 0 && (
                      <div className="mt-6 glass-card p-4">
                        <h4 className="text-white font-semibold mb-3">Selected Variants</h4>
                        <div className="space-y-2">
                          {selectedVariants.map((variant, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white/5 rounded"
                            >
                              <span className="text-white text-sm">{variant.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-white/60 text-xs">
                                  Cost: ${variant.baseCost.toFixed(2)}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={variant.suggestedPrice}
                                  onChange={(e) =>
                                    updateVariantPrice(index, parseFloat(e.target.value) || 0)
                                  }
                                  className="input-glass w-24 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 justify-between pt-4 border-t border-white/10">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="btn-primary"
                  disabled={!canProceedToNextStep()}
                >
                  Next
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : offer
                    ? 'Update Campaign'
                    : 'Create Campaign'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCampaignModal;
