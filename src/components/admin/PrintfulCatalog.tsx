import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, DollarSign, Grid2x2 as Grid, Search, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';

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
  last_synced: string;
  is_available: boolean;
}

interface PrintfulCatalogProps {
  onSelectProduct?: (product: PrintfulProduct) => void;
}

const PrintfulCatalog: React.FC<PrintfulCatalogProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const SESSION_STORAGE_KEY = 'printful_catalog_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    loadProductsFromCache();
  }, []);

  const loadProductsFromCache = () => {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) {
      try {
        const { products: cachedProducts, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (!isExpired && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setHasAttemptedLoad(true);
          return;
        }
      } catch (error) {
        console.error('Error reading cache:', error);
      }
    }

    loadProducts();
  };

  const loadProducts = async () => {
    setLoading(true);
    setLoadError(null);
    setHasAttemptedLoad(true);
    try {
      const data = await apiClient.printfulSync('list');
      const productList = data.products || [];
      setProducts(productList);

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        products: productList,
        timestamp: Date.now()
      }));
    } catch (error: any) {
      console.error('Error loading Printful products:', error);
      const errorMsg = error.message || 'Unknown error';
      setLoadError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setShowConfirm(false);
    setSyncing(true);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      const data = await apiClient.printfulSync('sync');
      addToast(`Successfully synced ${data.synced_count} wall art product(s) from Printful!`, 'success');
      await loadProducts();
    } catch (error) {
      console.error('Error syncing Printful catalog:', error);
      addToast('Failed to sync Printful catalog. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('printful_products')
        .update({ is_available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_available: !currentStatus } : p
      ));
      addToast(`Product ${!currentStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling product availability:', error);
      addToast('Failed to update product availability', 'error');
    }
  };

  const toggleCategoryAvailability = async (category: string, makeAvailable: boolean) => {
    try {
      const categoryProducts = products.filter(p => p.category === category);
      const { error } = await supabase
        .from('printful_products')
        .update({ is_available: makeAvailable })
        .in('id', categoryProducts.map(p => p.id));

      if (error) throw error;

      setProducts(products.map(p =>
        p.category === category ? { ...p, is_available: makeAvailable } : p
      ));

      addToast(`${makeAvailable ? 'Enabled' : 'Disabled'} ${categoryProducts.length} products in ${category}`, 'success');
    } catch (error) {
      console.error('Error toggling category availability:', error);
      addToast('Failed to update category availability', 'error');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display text-white mb-2">Printful Catalog</h2>
          <p className="text-white/60 text-sm">
            Wall Art Products Only
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={syncing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Package className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Wall Art...' : 'Sync Wall Art'}
          </button>
        </div>
      </div>

      {products.length > 0 && (
        <>
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-400" />
                Wall Art Categories
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const wallArtCategories = categories.filter(c => c !== 'all');
                    for (const category of wallArtCategories) {
                      await toggleCategoryAvailability(category, true);
                    }
                  }}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-xs font-medium transition-all"
                >
                  Enable All
                </button>
                <button
                  onClick={async () => {
                    const wallArtCategories = categories.filter(c => c !== 'all');
                    for (const category of wallArtCategories) {
                      await toggleCategoryAvailability(category, false);
                    }
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-xs font-medium transition-all"
                >
                  Disable All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c !== 'all').map(category => {
                const categoryProducts = products.filter(p => p.category === category);
                const availableCount = categoryProducts.filter(p => p.is_available).length;
                const isFullyEnabled = availableCount === categoryProducts.length;
                return (
                  <div key={category} className={`flex items-center gap-2 rounded-lg p-2 transition-all ${
                    isFullyEnabled
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <span className="text-white text-sm font-medium">
                      {category} ({availableCount}/{categoryProducts.length})
                    </span>
                    <button
                      onClick={() => toggleCategoryAvailability(category, true)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded text-xs transition-all"
                      title="Enable all in category"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleCategoryAvailability(category, false)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded text-xs transition-all"
                      title="Disable all in category"
                    >
                      <EyeOff className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass w-full pl-10"
              />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-glass-dark"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <p className="text-white/60 mt-4">Loading Printful catalog...</p>
        </div>
      ) : loadError ? (
        <div className="text-center py-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <Package className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-display text-white mb-4">Connection Error</h3>
            <p className="text-white/60 mb-6">Unable to connect to Printful API</p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-mono">{loadError}</p>
            </div>

            <div className="text-left space-y-4 mb-6">
              <p className="text-white/80 font-semibold">Troubleshooting Steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-white/60 text-sm">
                <li>Make sure you're running <code className="bg-white/10 px-2 py-1 rounded">npm run dev:netlify</code> (NOT <code className="bg-white/10 px-2 py-1 rounded">npm run dev</code>)</li>
                <li>Add these keys to your <code className="bg-white/10 px-2 py-1 rounded">.env</code> file:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code className="bg-white/10 px-1 rounded text-xs">VITE_PRINTFUL_API_KEY</code></li>
                    <li><code className="bg-white/10 px-1 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code></li>
                  </ul>
                </li>
                <li>Restart the dev server after adding keys</li>
                <li>Check terminal for detailed error messages</li>
                <li>Verify your Printful API key is valid and has proper permissions</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button onClick={loadProducts} className="btn-primary flex-1">
                Try Again
              </button>
              <a
                href="https://www.printful.com/dashboard/settings?panel=api"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex-1"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      ) : !hasAttemptedLoad ? (
        <div className="text-center py-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <Package className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-display text-white mb-4">Printful Catalog</h3>
            <p className="text-white/60 mb-6">Sync wall art products (posters, canvas, framed prints)</p>

            <div className="text-left space-y-4 mb-6 bg-white/5 rounded-lg p-6">
              <p className="text-white/80 font-semibold">Setup Required:</p>
              <ol className="list-decimal list-inside space-y-2 text-white/60 text-sm">
                <li>Run <code className="bg-white/10 px-2 py-1 rounded">npm run dev:netlify</code> (NOT npm run dev)</li>
                <li>Add these keys to your <code className="bg-white/10 px-2 py-1 rounded">.env</code> file:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><code className="bg-white/10 px-1 rounded text-xs">VITE_PRINTFUL_API_KEY</code> - Get from Printful Dashboard</li>
                    <li><code className="bg-white/10 px-1 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code> - Get from Supabase Dashboard</li>
                  </ul>
                </li>
                <li>Restart dev server and click a button below</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button onClick={loadProducts} className="btn-secondary flex-1">
                Reload Catalog
              </button>
              <button onClick={() => setShowConfirm(true)} className="btn-primary flex-1">
                Sync from Printful
              </button>
            </div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">No wall art products synced yet</p>
          <button onClick={() => setShowConfirm(true)} className="btn-primary">
            Sync Wall Art
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {products[0]?.last_synced && (
              <p className="text-white/40 text-xs">
                Last synced: {new Date(products[0].last_synced).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => onSelectProduct?.(product)}
              >
                <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                  {product.product_data.image ? (
                    <img
                      src={product.product_data.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-white/20" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm leading-tight flex-1">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="glass-badge text-white/70 text-xs">
                      {product.category}
                    </span>
                    <span className="glass-badge text-white/70 text-xs">
                      {product.sizes.length} variants
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Base Cost</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-white font-semibold">
                          ${product.base_cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {product.product_data.brand && (
                      <div className="text-right">
                        <p className="text-white/50 text-xs mb-1">Brand</p>
                        <p className="text-white/80 text-xs">{product.product_data.brand}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProductAvailability(product.id, product.is_available);
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        product.is_available
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                      title={product.is_available ? 'Hide from customers' : 'Make available to customers'}
                    >
                      {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    {onSelectProduct && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Use This Product
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showConfirm && (
        <ConfirmDialog
          title="Sync Wall Art Products"
          message="This will fetch the latest wall art products (posters, canvas, framed prints) from Printful and hide all non-wall-art items. Continue?"
          onConfirm={handleSync}
          onCancel={() => setShowConfirm(false)}
          confirmText="Start Sync"
          cancelText="Cancel"
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PrintfulCatalog;
