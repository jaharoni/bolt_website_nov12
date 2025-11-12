import React, { useState, useEffect } from 'react';
import { X, Save, Eye, DollarSign } from 'lucide-react';
import { MediaItem, mediaService } from '../../../lib/mediaService';

interface MediaEditModalProps {
  items: MediaItem[];
  onClose: () => void;
  onSave: (updates: Partial<MediaItem>, applyToAll: boolean) => void;
  visibilityLocations: Array<{ value: string; label: string; icon: string }>;
}

const MediaEditModal: React.FC<MediaEditModalProps> = ({
  items,
  onClose,
  onSave,
  visibilityLocations
}) => {
  const isMultiple = items.length > 1;
  const firstItem = items[0];

  const [formData, setFormData] = useState({
    title: firstItem?.title || '',
    description: firstItem?.description || '',
    alt_text: firstItem?.alt_text || '',
    tags: firstItem?.tags?.join(', ') || '',
    is_visible: firstItem?.is_visible || false,
    is_active: firstItem?.is_active || false,
    page_context: firstItem?.page_context || '',
  });

  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    firstItem?.visibility_locations || []
  );

  const [pricingData, setPricingData] = useState({
    enablePricing: false,
    basePrice: 0,
    variants: [] as Array<{ name: string; price: number }>,
  });

  const [loadingPricing, setLoadingPricing] = useState(false);
  const [applyToAll, setApplyToAll] = useState(true);

  useEffect(() => {
    if (!isMultiple && firstItem) {
      loadPricing();
    }
  }, [firstItem]);

  const loadPricing = async () => {
    if (!firstItem) return;
    setLoadingPricing(true);
    try {
      const pricing = await mediaService.getMediaPricing(firstItem.id);
      if (pricing) {
        setPricingData({
          enablePricing: true,
          basePrice: pricing.base_price,
          variants: pricing.variants || [],
        });
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleToggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleSave = async () => {
    const updates: Partial<MediaItem> = {
      title: formData.title,
      description: formData.description,
      alt_text: formData.alt_text,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_visible: formData.is_visible,
      is_active: formData.is_active,
      page_context: formData.page_context,
    };

    if (selectedLocations.length > 0) {
      for (const item of isMultiple && applyToAll ? items : [firstItem]) {
        await mediaService.updateMediaVisibility(item.id, selectedLocations);
      }
    }

    if (pricingData.enablePricing && pricingData.basePrice > 0) {
      for (const item of isMultiple && applyToAll ? items : [firstItem]) {
        const existing = await mediaService.getMediaPricing(item.id);
        if (existing) {
          await mediaService.updateMediaPricing(item.id, {
            base_price: pricingData.basePrice,
            variants: pricingData.variants,
          });
        } else {
          await mediaService.createMediaPricing(item.id, {
            base_price: pricingData.basePrice,
            variants: pricingData.variants,
          });
        }
      }
    }

    onSave(updates, isMultiple ? applyToAll : false);
  };

  const addVariant = () => {
    setPricingData({
      ...pricingData,
      variants: [...pricingData.variants, { name: '', price: 0 }],
    });
  };

  const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
    const newVariants = [...pricingData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setPricingData({ ...pricingData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setPricingData({
      ...pricingData,
      variants: pricingData.variants.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass-card p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display text-white">
            {isMultiple ? `Edit ${items.length} Items` : 'Edit Media Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isMultiple && (
          <div className="mb-6 p-4 bg-yellow-400/20 border border-yellow-400/50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-white font-semibold">
                Apply changes to all {items.length} selected items
              </span>
            </label>
            <p className="text-white/60 text-sm mt-1">
              Uncheck to only edit the first item
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Preview</h4>
            <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
              <img
                src={firstItem?.public_url}
                alt={firstItem?.title || ''}
                className="w-full h-full object-cover"
              />
            </div>
            {isMultiple && (
              <p className="text-white/60 text-sm">
                + {items.length - 1} more item{items.length > 2 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Basic Information</h4>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-glass w-full"
                  placeholder={isMultiple ? 'Mixed values' : ''}
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass w-full h-20 resize-none"
                  placeholder={isMultiple ? 'Mixed values' : ''}
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Alt Text</label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="input-glass w-full"
                  placeholder={isMultiple ? 'Mixed values' : ''}
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-glass w-full"
                  placeholder="landscape, nature, sunset"
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visibility Settings
              </h4>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Visible on site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Active (enable in system)</span>
                </label>
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Show in these locations:</label>
                <div className="grid grid-cols-2 gap-2">
                  {visibilityLocations.map(loc => (
                    <label
                      key={loc.value}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc.value)}
                        onChange={() => handleToggleLocation(loc.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-white text-sm">{loc.icon} {loc.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Configuration */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </h4>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingData.enablePricing}
                  onChange={(e) => setPricingData({ ...pricingData, enablePricing: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white">Enable pricing (make available for purchase)</span>
              </label>

              {pricingData.enablePricing && (
                <div className="ml-6 space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricingData.basePrice}
                      onChange={(e) => setPricingData({ ...pricingData, basePrice: parseFloat(e.target.value) })}
                      className="input-glass w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-white/80 text-sm">Size Variants (Optional)</label>
                      <button
                        onClick={addVariant}
                        className="text-sm text-yellow-400 hover:text-yellow-300"
                      >
                        + Add Variant
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pricingData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="e.g., 16x20"
                            className="input-glass flex-1"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                            placeholder="Price"
                            className="input-glass w-32"
                          />
                          <button
                            onClick={() => removeVariant(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handleSave}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="btn-secondary px-6"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditModal;
