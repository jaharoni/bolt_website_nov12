import React, { useState } from 'react';
import { seedProducts } from '../lib/seedProducts';
import { productService } from '../lib/database';

const Test: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  const handleSeed = async () => {
    setLoading(true);
    setMessage('Seeding products...');
    try {
      await seedProducts();
      setMessage('✅ Products seeded successfully!');

      const prods = await productService.getAllProducts();
      setProducts(prods);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const prods = await productService.getAllProducts();
      setProducts(prods);
      setMessage(`Loaded ${prods.length} products`);
    } catch (error: any) {
      setMessage(`❌ Error loading products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass-card p-12 max-w-2xl w-full">
        <h1 className="text-4xl font-display text-white mb-6 text-center">
          Setup Your Shop
        </h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? 'Working...' : 'Seed Sample Products (8 items)'}
          </button>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="btn-secondary w-full py-4 text-lg disabled:opacity-50"
          >
            Check Current Products
          </button>

          <a href="/shop" className="btn-secondary w-full py-4 text-lg block text-center">
            Go to Shop
          </a>

          <a href="/admin" className="btn-secondary w-full py-4 text-lg block text-center">
            Go to Admin Dashboard
          </a>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.includes('Error') || message.includes('❌')
              ? 'bg-red-500/20 border border-red-500/30 text-red-300'
              : 'bg-green-500/20 border border-green-500/30 text-green-300'
          }`}>
            <p className="font-semibold">{message}</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-semibold mb-4">
              Current Products ({products.length}):
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-white/5 p-3 rounded flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{product.title}</p>
                    <p className="text-white/60 text-xs">${product.base_price} • {product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-6 mt-6">
          <h3 className="text-white font-semibold mb-3">📋 Next Steps:</h3>
          <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
            <li>Click "Seed Sample Products" above</li>
            <li>Wait for success message</li>
            <li>Click "Go to Shop" to see your products</li>
            <li>Browse, add to cart, test checkout</li>
            <li>View orders in Admin Dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Test;
