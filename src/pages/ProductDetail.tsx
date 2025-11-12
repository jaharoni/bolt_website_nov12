import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, Check, X } from 'lucide-react';
import Footer from '../components/Footer';
import { productService } from '../lib/database';
import { Product } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import ImageService from '../lib/imageService';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const data = await productService.getProduct(productId);
      setProduct(data);

      if (data && Array.isArray(data.variants) && data.variants.length > 0) {
        setSelectedVariant(data.variants[0].size);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    setIsAddingToCart(true);
    addToCart(product.id, quantity, selectedVariant);

    setTimeout(() => {
      setIsAddingToCart(false);
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 3000);
    }, 500);
  };

  const getSelectedPrice = () => {
    if (!product) return 0;
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      return product.base_price;
    }
    const variant = product.variants.find(v => v.size === selectedVariant);
    return variant?.price || product.base_price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <p className="text-white/60 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass-card p-12 max-w-md">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl text-white font-display mb-4">Product Not Found</h2>
          <p className="text-white/60 mb-6">Sorry, we couldn't find the product you're looking for.</p>
          <Link to="/shop">
            <button className="btn-primary">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getOptimizedImage = (imageUrl: string, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'fullscreen' = 'large') => {
    if (imageUrl.includes('/storage/v1/object/public/')) {
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts[1]) {
        const [bucket, ...pathParts] = urlParts[1].split('/');
        const path = pathParts.join('/');
        return ImageService.getOptimizedUrl(bucket, path, size);
      }
    }
    return imageUrl;
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  return (
    <div className="relative min-h-screen pb-8 px-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          className="glass-card inline-flex items-center gap-2 px-4 py-2 mb-8 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span className="text-white">Back to Shop</span>
        </button>

        {/* Success Message */}
        {showAddedMessage && (
          <div className="fixed top-24 right-4 z-50 glass-card p-4 animate-slide-in-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Added to cart!</p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="text-yellow-400 text-sm hover:underline"
                >
                  View cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="glass-card overflow-hidden aspect-square">
              <img
                src={getOptimizedImage(images[selectedImage], 'fullscreen')}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`glass-card overflow-hidden aspect-square transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-yellow-400'
                        : 'hover:ring-2 hover:ring-white/30'
                    }`}
                  >
                    <img
                      src={getOptimizedImage(image, 'thumbnail')}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="glass-card p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-display text-white">{product.title}</h1>
                <button className="p-3 glass-button glass-button-enhanced text-white hover:text-red-400">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="glass-badge">{product.category}</span>
                {product.is_digital && (
                  <span className="glass-badge text-blue-300 border-blue-500/30">Digital Product</span>
                )}
                {product.inventory_count !== null && product.inventory_count < 10 && (
                  <span className="glass-badge text-red-300 border-red-500/30">
                    Only {product.inventory_count} left!
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-display text-yellow-400">
              ${getSelectedPrice().toFixed(2)}
            </div>

            {/* Description */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-white/80 leading-relaxed">{product.description}</p>
            </div>

            {/* Variants */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="border-t border-white/10 pt-6">
                <label className="text-white font-semibold mb-3 block">
                  Select Size / Option
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedVariant(variant.size)}
                      className={`glass-card p-4 text-center transition-all ${
                        selectedVariant === variant.size
                          ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold">{variant.size}</div>
                      {variant.price !== product.base_price && (
                        <div className="text-sm text-white/60">${variant.price.toFixed(2)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="border-t border-white/10 pt-6">
              <label className="text-white font-semibold mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="glass-button glass-button-enhanced w-10 h-10 flex items-center justify-center text-white"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-white text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="glass-button glass-button-enhanced w-10 h-10 flex items-center justify-center text-white"
                  disabled={product.inventory_count !== null && quantity >= product.inventory_count}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t border-white/10 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedVariant}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Details */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-3">Product Details</h3>
                <dl className="space-y-2 text-sm">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-white/60 capitalize">{key.replace(/_/g, ' ')}:</dt>
                      <dd className="text-white">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
