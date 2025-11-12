import React, { useEffect, useState } from 'react';
import { ShoppingBag, Star, Filter, Grid2x2 as Grid, List, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { productService } from '../lib/database';
import { Product } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import ImageService from '../lib/imageService';
import ComingSoonBanner from '../components/ComingSoonBanner';
import { supabase } from '../lib/supabase';

const Shop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopEnabled, setShopEnabled] = useState(true);
  const [comingSoonMessage, setComingSoonMessage] = useState('Stay Tuned');
  const { setIsOpen } = useCart();

  useEffect(() => {
    setIsVisible(true);
    loadProducts();
    loadShopSettings();
  }, []);

  const loadShopSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['shop_enabled', 'shop_coming_soon_message']);

      if (settings) {
        const shopEnabledSetting = settings.find(s => s.key === 'shop_enabled');
        const messageSetting = settings.find(s => s.key === 'shop_coming_soon_message');

        if (shopEnabledSetting) {
          setShopEnabled(shopEnabledSetting.value === true || shopEnabledSetting.value === 'true');
        }
        if (messageSetting && typeof messageSetting.value === 'string') {
          setComingSoonMessage(messageSetting.value.replace(/^"|"$/g, ''));
        }
      }
    } catch (error) {
      console.error('Error loading shop settings:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      const data = await productService.getProductsByCategory(category);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'art', label: 'Art' },
    { id: 'digital', label: 'Digital Downloads' },
    { id: 'merchandise', label: 'Merchandise' },
    { id: 'limited', label: 'Limited Editions' }
  ];


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  const getProductImage = (product: Product, size: 'thumbnail' | 'small' | 'medium' = 'medium') => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (imageUrl.includes('/storage/v1/object/public/')) {
        const urlParts = imageUrl.split('/storage/v1/object/public/');
        if (urlParts[1]) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const path = pathParts.join('/');
          return ImageService.getOptimizedUrl(bucket, path, size);
        }
      }
      return imageUrl;
    }
    return 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const getProductVariants = (product: Product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.map(v => v.size);
    }
    return ['Standard'];
  };

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="Shop"
        description="Browse and purchase fine art prints, limited editions, and merchandise from photographer Justin Aharoni. High-quality prints available for delivery or digital download."
        keywords={['art prints', 'photography prints', 'limited edition prints', 'fine art photography', 'buy photography', 'photography shop', 'photo merchandise']}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white/98 mb-6 text-smart-contrast">
            Shop
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-display tracking-wide text-smart-contrast">
            Thank you for visiting—that you're on this page means the world to me. As with the rest of this site, I'm building the shop from the ground up, ensuring your experience here is both satisfactory and safe. As I continue building and testing, I'll update progress below with frequent flash sales.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className={`flex justify-center items-center mb-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-yellow-400/15 border-yellow-400/50 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white/90'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-300 ${
                  viewMode === 'grid' ? 'bg-white/15 text-yellow-400' : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-300 ${
                  viewMode === 'list' ? 'bg-white/15 text-yellow-400' : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Out of Ink Banner */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '300ms' }}>
          <div className="relative w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="glass-card p-8 text-center relative overflow-hidden border border-white/10">
                <div className="mb-6 inline-block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-white/5 border border-white/10 rounded-full p-6 backdrop-blur-xl">
                      <Droplets className="w-12 h-12 text-blue-400" />
                    </div>
                  </div>
                </div>

                <h2 className="text-5xl md:text-6xl font-display text-white/98 mb-4 tracking-wide text-smart-contrast">
                  Out of Ink
                </h2>

                <p className="text-xl text-white/80 font-body max-w-xl mx-auto leading-relaxed text-smart-contrast">
                  New and improved print shop coming soon
                </p>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-blue-400/30" />
                  <div className="w-2 h-2 bg-blue-400/50 rounded-full animate-pulse" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-blue-400/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-white/60 mt-4">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No products found in this category</p>
          </div>
        ) : (
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }`}
          style={{ transitionDelay: '500ms' }}>
            {products.map((product, index) => (
            <div
              key={product.id}
              className={`group glass-card overflow-hidden border border-white/10 transition-all duration-700 hover:scale-[1.02] hover:border-white/20 ${
                viewMode === 'list' ? 'flex' : ''
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${600 + index * 100}ms`
              }}
            >
              {/* Image */}
              <Link to={`/shop/product/${product.id}`}>
                <div className={`overflow-hidden relative ${
                  viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                }`}>
                  <img
                    src={getProductImage(product, viewMode === 'list' ? 'small' : 'medium')}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Digital Badge */}
                  {product.is_digital && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-500/20 border border-blue-500/40 text-blue-200 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        Digital
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <Link to={`/shop/product/${product.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white/98 font-semibold text-lg hover:text-yellow-400 transition-colors">
                      {product.title}
                    </h3>
                  </div>
                </Link>

                <p className="text-white/85 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Sizes */}
                <div className="mb-4">
                  <p className="text-white/50 text-xs mb-2">Available options:</p>
                  <div className="flex flex-wrap gap-2">
                    {getProductVariants(product).slice(0, 3).map((size) => (
                      <span key={size} className="bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded text-xs">
                        {size}
                      </span>
                    ))}
                    {getProductVariants(product).length > 3 && (
                      <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded text-xs">
                        +{getProductVariants(product).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Purchase */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-white/98">
                    <span className="text-xl font-display font-semibold">${product.base_price.toFixed(2)}</span>
                  </div>
                  <Link to={`/shop/product/${product.id}`}>
                    <button className="bg-white/10 border border-white/20 text-white hover:bg-yellow-400/10 hover:border-yellow-400/40 hover:text-yellow-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                      <ShoppingBag className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        </div>

        {/* Newsletter Signup */}
        <div className={`glass-card p-12 mt-12 mb-24 text-center transition-all duration-1000 border border-white/10 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '800ms' }}>
          <h2 className="text-4xl font-display text-white mb-4 text-smart-contrast">
            Stay Updated
          </h2>
          <p className="text-lg text-white/75 mb-8 font-body text-smart-contrast">
            Get notified about new releases and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-full px-6 py-3 focus:outline-none focus:border-yellow-400/50 focus:bg-white/8 transition-all duration-300 backdrop-blur-sm"
            />
            <button className="bg-yellow-400/15 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/25 px-8 py-3 rounded-full transition-all duration-300 font-medium backdrop-blur-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;