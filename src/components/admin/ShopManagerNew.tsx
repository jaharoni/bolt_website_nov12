import React, { useState, useEffect } from "react";
import { Store, Package, ShoppingCart, TrendingUp, Eye, EyeOff } from "lucide-react";
import ProductsManager from "./ProductsManager";
import { supabase } from "../../lib/supabase";

export default function ShopManagerNew() {
  const [shopEnabled, setShopEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');

  useEffect(() => {
    loadShopSettings();
  }, []);

  const loadShopSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'shop_enabled')
        .maybeSingle();

      if (!error && data) {
        setShopEnabled(data.value === true);
      }
    } catch (err) {
      console.error('Error loading shop settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShop = async () => {
    try {
      const newValue = !shopEnabled;
      const { error } = await supabase
        .from('site_settings')
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq('key', 'shop_enabled');

      if (error) throw error;

      setShopEnabled(newValue);
    } catch (err) {
      console.error('Error toggling shop:', err);
      alert('Failed to toggle shop status');
    }
  };

  if (loading) {
    return <div className="text-white/70 p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display text-white">Shop Manager</h2>
              <p className="text-white/60 text-sm">
                {shopEnabled ? 'Shop is currently visible to visitors' : 'Shop is currently hidden from visitors'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleShop}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              shopEnabled
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
            }`}
          >
            {shopEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {shopEnabled ? 'Disable Shop' : 'Enable Shop'}
          </button>
        </div>

        {!shopEnabled && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <p className="text-yellow-300 text-sm">
              ⚠️ The shop is currently disabled. Visitors will see a "Coming Soon" banner instead of products.
            </p>
          </div>
        )}
      </div>

      <div className="glass-card">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'orders' && <OrdersPlaceholder />}
          {activeTab === 'analytics' && <AnalyticsPlaceholder />}
        </div>
      </div>
    </div>
  );
}

function OrdersPlaceholder() {
  return (
    <div className="text-center py-12">
      <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Orders Management</h3>
      <p className="text-white/60">
        Order management interface coming soon.
      </p>
    </div>
  );
}

function AnalyticsPlaceholder() {
  return (
    <div className="text-center py-12">
      <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Shop Analytics</h3>
      <p className="text-white/60">
        Analytics dashboard coming soon.
      </p>
    </div>
  );
}
