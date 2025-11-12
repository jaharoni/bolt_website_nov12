import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Package, Image as ImageIcon, DollarSign } from 'lucide-react';
import useSupabaseTable from '../../hooks/useSupabaseTable';
import { Product, Media } from '../../lib/types';
import slugify from '../../lib/slugify';
import ConfirmDialogNew from './ConfirmDialogNew';
import ImageService from '../../lib/imageService';

export default function ProductsManager() {
  const { items: products, loading, error, insert, update, remove } = useSupabaseTable<Product>({
    table: 'products',
    order: { column: 'created_at', ascending: false },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleToggleActive = async (product: Product) => {
    await update('id', product.id, { is_active: !product.is_active } as any);
  };

  const handleDeleteProduct = async (product: Product) => {
    await remove('id', product.id);
    setConfirmDelete(null);
  };

  if (loading) {
    return <div className="text-white/70">Loading products...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error loading products: {String(error.message || error)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-white">Products</h2>
          <p className="text-white/60 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded flex items-center gap-2 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/50"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">
            {searchQuery || categoryFilter !== 'all' ? 'No products match your filters' : 'No products yet'}
          </p>
          <button
            onClick={() => setShowProductForm(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="glass-card p-4 hover:bg-white/5 transition-colors">
              <div className="relative mb-3">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-white/5 rounded flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!product.is_active && (
                    <span className="px-2 py-1 bg-red-500/80 text-white text-xs rounded">
                      Inactive
                    </span>
                  )}
                  {product.is_digital && (
                    <span className="px-2 py-1 bg-blue-500/80 text-white text-xs rounded">
                      Digital
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-white font-semibold mb-1 truncate">{product.title}</h3>
              <p className="text-white/60 text-sm mb-2 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-white">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{product.base_price.toFixed(2)}</span>
                </div>
                <span className="text-white/60 text-xs">
                  {product.category}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(product)}
                  className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors flex items-center justify-center gap-1"
                >
                  {product.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {product.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowProductForm(true);
                  }}
                  className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(product)}
                  className="px-2 py-1 bg-red-500/80 hover:bg-red-500 rounded text-white text-sm transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={async (productData) => {
            if (editingProduct) {
              await update('id', editingProduct.id, productData as any);
            } else {
              await insert(productData as any);
            }
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialogNew
          title="Delete Product"
          description={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteProduct(confirmDelete)}
        />
      )}
    </div>
  );
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    category: product?.category || 'art',
    base_price: product?.base_price || 0,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    is_digital: product?.is_digital || false,
    inventory_count: product?.inventory_count || null,
    tags: product?.tags?.join(', ') || '',
    images: product?.images || [],
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        base_price: formData.base_price,
        is_active: formData.is_active,
        is_digital: formData.is_digital,
        inventory_count: formData.inventory_count,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: formData.images,
        variants: product?.variants || [],
        metadata: product?.metadata || {},
      };

      await onSave(productData);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full my-8">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-display text-white">
            {product ? 'Edit Product' : 'New Product'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                placeholder="Premium Art Print"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                placeholder="art, prints, digital"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white h-24"
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Price (USD) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Inventory Count</label>
              <input
                type="number"
                min="0"
                value={formData.inventory_count || ''}
                onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                placeholder="Unlimited"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80 text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_digital}
                  onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80 text-sm">Digital Product</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
              placeholder="art, print, landscape"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Product Images</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="" className="w-full aspect-square object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      images: formData.images.filter((_, i) => i !== idx)
                    })}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
            >
              Add Images
            </button>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowMediaPicker(false)}
          onSelect={(urls) => {
            setFormData({ ...formData, images: [...formData.images, ...urls] });
            setShowMediaPicker(false);
          }}
        />
      )}
    </div>
  );
}

function MediaPickerModal({ onClose, onSelect }: {
  onClose: () => void;
  onSelect: (urls: string[]) => void;
}) {
  const { items: media } = useSupabaseTable<Media>({
    table: 'media_items',
    order: { column: 'created_at', ascending: false },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (url: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelected(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-display text-white">Select Images</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-3">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSelect(item.public_url)}
                className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                  selected.has(item.public_url)
                    ? 'border-white'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={ImageService.getOptimizedUrl(item.bucket_name, item.storage_path, 'small')}
                  alt={item.alt_text || ''}
                  className="w-full h-full object-cover"
                />
                {selected.has(item.public_url) && (
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(Array.from(selected))}
            disabled={selected.size === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors disabled:opacity-50"
          >
            Add {selected.size} Image{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
