import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, Copy, BarChart3, ExternalLink, Calendar, Package, DollarSign, Clock } from 'lucide-react';
import { ltoService, mediaService, LTOOfferWithDetails } from '../../lib/ltoService';
import { LTOOffer, LTOVariant } from '../../lib/supabase';
import EnhancedCampaignModal from './EnhancedCampaignModal';

const CampaignEndConditions: React.FC<{ offer: LTOOfferWithDetails }> = ({ offer }) => {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (offer.status === 'active') {
      loadProgress();
    }
  }, [offer.id]);

  const loadProgress = async () => {
    try {
      const data = await ltoService.getCampaignProgress(offer.id);
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  if (!offer.end_condition_type || offer.end_condition_type.length === 0) {
    return null;
  }

  const hasDate = offer.end_condition_type.includes('date');
  const hasQuantity = offer.end_condition_type.includes('quantity');
  const hasRevenue = offer.end_condition_type.includes('revenue');
  const isManual = offer.end_condition_type.includes('manual') && offer.end_condition_type.length === 1;

  if (isManual) {
    return (
      <div className="mb-3 flex items-center gap-2 text-xs">
        <Clock className="w-3 h-3 text-white/40" />
        <span className="text-white/60">Manual control only</span>
      </div>
    );
  }

  return (
    <div className="mb-3 space-y-2">
      {hasDate && offer.end_date && (
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3 h-3 text-blue-400" />
          <span className="text-white/60">
            Ends: {new Date(offer.end_date).toLocaleDateString()} at{' '}
            {new Date(offer.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {hasQuantity && progress && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-3 h-3 text-green-400" />
            <span className="text-white/60">
              {progress.total_sold} / {progress.total_quantity_limit} prints sold
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-green-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(progress.quantity_progress_percent || 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {hasRevenue && progress && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="w-3 h-3 text-yellow-400" />
            <span className="text-white/60">
              ${progress.revenue_total.toFixed(2)} / ${progress.target_revenue_goal.toFixed(2)} goal
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-yellow-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(progress.revenue_progress_percent || 0, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const LTOCampaignManager: React.FC = () => {
  const [offers, setOffers] = useState<LTOOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<LTOOfferWithDetails | null>(null);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<LTOOfferWithDetails | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await ltoService.getAllOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }

    try {
      await ltoService.deleteOffer(id);
      setOffers(offers.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleToggleStatus = async (offer: LTOOfferWithDetails) => {
    const newStatus = offer.status === 'active' ? 'paused' : 'active';
    try {
      await ltoService.updateOffer(offer.id, { status: newStatus });
      setOffers(offers.map(o => o.id === offer.id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDuplicate = async (offer: LTOOfferWithDetails) => {
    const newSlug = `${offer.slug}-copy-${Date.now()}`;
    try {
      const newOffer = await ltoService.createOffer({
        ...offer,
        slug: newSlug,
        title: `${offer.title} (Copy)`,
        status: 'draft',
      });

      if (offer.variants) {
        for (const variant of offer.variants) {
          await ltoService.createVariant({
            offer_id: newOffer.id,
            variant_label: variant.variant_label,
            variant_description: variant.variant_description,
            printful_product_id: variant.printful_product_id,
            printful_variant_id: variant.printful_variant_id,
            price_cents: variant.price_cents,
            cost_cents: variant.cost_cents,
            sort_order: variant.sort_order,
            is_available: variant.is_available,
            stock_limit: variant.stock_limit,
            metadata: variant.metadata,
          });
        }
      }

      await loadOffers();
      alert('Campaign duplicated successfully');
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      alert('Failed to duplicate campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-500/20 text-gray-300',
      active: 'bg-green-500/20 text-green-300',
      paused: 'bg-yellow-500/20 text-yellow-300',
      ended: 'bg-red-500/20 text-red-300',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="text-white">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-white">Print Campaigns</h2>
          <p className="text-white/60 text-sm mt-1">
            Manage limited-time print offers with custom variants and pricing
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/60 mb-4">No campaigns yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card p-6 hover:bg-white/5 transition-colors">
              <div className="flex gap-4">
                {offer.media && (
                  <img
                    src={offer.media.public_url}
                    alt={offer.media.alt_text || offer.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-display text-white mb-1">{offer.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <code className="bg-white/5 px-2 py-1 rounded">/lto/{offer.slug}</code>
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(offer)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title={offer.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {offer.status === 'active' ? (
                          <EyeOff className="w-4 h-4 text-white/60" />
                        ) : (
                          <Eye className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setShowCreateModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(offer)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {offer.description && (
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{offer.description}</p>
                  )}

                  <CampaignEndConditions offer={offer} />

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-white/40 text-xs">Views</div>
                      <div className="text-white font-semibold">{offer.views_count}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Orders</div>
                      <div className="text-white font-semibold">{offer.orders_count}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Revenue</div>
                      <div className="text-white font-semibold">${offer.revenue_total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Variants</div>
                      <div className="text-white font-semibold">{offer.variants?.length || 0}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOffer(offer);
                        setShowVariantsModal(true);
                      }}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      Manage Variants
                    </button>
                    <a
                      href={`/lto/${offer.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </a>
                    <button
                      className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <EnhancedCampaignModal
          offer={editingOffer}
          onClose={() => {
            setShowCreateModal(false);
            setEditingOffer(null);
          }}
          onSave={() => {
            loadOffers();
            setShowCreateModal(false);
            setEditingOffer(null);
          }}
        />
      )}

      {showVariantsModal && selectedOffer && (
        <VariantsModal
          offer={selectedOffer}
          onClose={() => {
            setShowVariantsModal(false);
            setSelectedOffer(null);
          }}
          onSave={() => {
            loadOffers();
          }}
        />
      )}
    </div>
  );
};

const VariantsModal: React.FC<{
  offer: LTOOfferWithDetails;
  onClose: () => void;
  onSave: () => void;
}> = ({ offer, onClose, onSave }) => {
  const [variants, setVariants] = useState<LTOVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<LTOVariant | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    try {
      const data = await ltoService.getVariants(offer.id);
      setVariants(data);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this variant?')) return;

    try {
      await ltoService.deleteVariant(id);
      setVariants(variants.filter(v => v.id !== id));
      onSave();
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Failed to delete variant');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-display text-white">Manage Variants</h2>
          <p className="text-white/60 text-sm mt-1">{offer.title}</p>
        </div>

        <div className="p-6 space-y-4">
          {variants.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-white/60 mb-4">No variants yet</p>
            </div>
          )}

          {variants.map((variant) => (
            <div key={variant.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold">{variant.variant_label}</h4>
                  {!variant.is_available && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                {variant.variant_description && (
                  <p className="text-white/60 text-sm mb-2">{variant.variant_description}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-white/40">Price:</span>
                    <span className="text-white ml-1">${(variant.price_cents / 100).toFixed(2)}</span>
                  </div>
                  {variant.cost_cents > 0 && (
                    <div>
                      <span className="text-white/40">Cost:</span>
                      <span className="text-white ml-1">${(variant.cost_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/40">Sold:</span>
                    <span className="text-white ml-1">{variant.sold_count}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVariant(variant);
                    setShowForm(true);
                  }}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <Edit2 className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  className="p-2 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setEditingVariant(null);
              setShowForm(true);
            }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        <div className="p-6 border-t border-white/10">
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>

      {showForm && (
        <VariantForm
          offerId={offer.id}
          variant={editingVariant}
          onClose={() => {
            setShowForm(false);
            setEditingVariant(null);
          }}
          onSave={() => {
            loadVariants();
            setShowForm(false);
            setEditingVariant(null);
            onSave();
          }}
        />
      )}
    </div>
  );
};

const VariantForm: React.FC<{
  offerId: string;
  variant: LTOVariant | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ offerId, variant, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    variant_label: variant?.variant_label || '',
    variant_description: variant?.variant_description || '',
    printful_product_id: variant?.printful_product_id || '',
    printful_variant_id: variant?.printful_variant_id || '',
    price_cents: variant ? variant.price_cents : 0,
    cost_cents: variant ? variant.cost_cents : 0,
    sort_order: variant ? variant.sort_order : 0,
    is_available: variant ? variant.is_available : true,
    stock_limit: variant?.stock_limit || null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (variant) {
        await ltoService.updateVariant(variant.id, formData);
      } else {
        await ltoService.createVariant({
          offer_id: offerId,
          ...formData,
          metadata: {},
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="glass-card max-w-2xl w-full">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-display text-white">
            {variant ? 'Edit Variant' : 'New Variant'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Variant Label *</label>
            <input
              type="text"
              required
              value={formData.variant_label}
              onChange={(e) => setFormData({ ...formData, variant_label: e.target.value })}
              className="input-glass w-full"
              placeholder="Poster - 12×18"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Description</label>
            <input
              type="text"
              value={formData.variant_description || ''}
              onChange={(e) => setFormData({ ...formData, variant_description: e.target.value })}
              className="input-glass w-full"
              placeholder="Museum-quality matte finish"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Printful Product ID</label>
              <input
                type="text"
                value={formData.printful_product_id || ''}
                onChange={(e) => setFormData({ ...formData, printful_product_id: e.target.value })}
                className="input-glass w-full"
                placeholder="123"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Printful Variant ID</label>
              <input
                type="text"
                value={formData.printful_variant_id || ''}
                onChange={(e) => setFormData({ ...formData, printful_variant_id: e.target.value })}
                className="input-glass w-full"
                placeholder="456"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Price (USD) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={(formData.price_cents / 100).toFixed(2)}
                onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                className="input-glass w-full"
                placeholder="45.00"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Cost (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={(formData.cost_cents / 100).toFixed(2)}
                onChange={(e) => setFormData({ ...formData, cost_cents: Math.round(parseFloat(e.target.value) * 100) })}
                className="input-glass w-full"
                placeholder="20.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Stock Limit</label>
              <input
                type="number"
                value={formData.stock_limit || ''}
                onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value ? parseInt(e.target.value) : null })}
                className="input-glass w-full"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white/80 text-sm">Available for purchase</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LTOCampaignManager;
