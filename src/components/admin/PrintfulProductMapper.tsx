import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Package, DollarSign, Plus, X, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { productService } from '../../lib/database';
import { apiClient } from '../../lib/apiClient';

interface MediaItem {
  id: string;
  title: string;
  public_url: string;
  width: number;
  height: number;
}

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
  product_data: any;
}

const PrintfulProductMapper: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [printfulProducts, setPrintfulProducts] = useState<PrintfulProduct[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPrintfulProduct, setSelectedPrintfulProduct] = useState<PrintfulProduct | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState(40);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const mediaResponse = await supabase
        .from('media_items')
        .select('*')
        .eq('media_type', 'image')
        .order('created_at', { ascending: false });

      if (mediaResponse.error) throw mediaResponse.error;
      setMediaItems(mediaResponse.data || []);

      try {
        const printfulData = await apiClient.printfulSync('list');
        setPrintfulProducts(printfulData.products || []);
      } catch (error) {
        console.error('Error loading Printful products:', error);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
    if (!productTitle) {
      setProductTitle(media.title || 'Untitled Print');
    }
  };

  const handlePrintfulProductSelect = (product: PrintfulProduct) => {
    setSelectedPrintfulProduct(product);
    setSelectedVariants([]);
  };

  const toggleVariant = (variantId: number) => {
    setSelectedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const calculateRetailPrice = (baseCost: number) => {
    return baseCost * (1 + markupPercentage / 100);
  };

  const handleCreateProduct = async () => {
    if (!selectedMedia || !selectedPrintfulProduct || selectedVariants.length === 0) {
      alert('Please select a photo, Printful product, and at least one variant');
      return;
    }

    setCreating(true);
    try {
      const variants = selectedPrintfulProduct.sizes
        .filter(size => selectedVariants.includes(size.id))
        .map(size => ({
          size: size.name,
          price: calculateRetailPrice(size.price),
          printful_variant_id: size.id.toString(),
        }));

      const lowestPrice = Math.min(...variants.map(v => v.price));

      const productData = {
        title: productTitle,
        description: productDescription,
        category: 'art',
        base_price: lowestPrice,
        images: [selectedMedia.public_url],
        variants,
        tags: ['print', 'photography', selectedPrintfulProduct.category],
        is_active: true,
        is_digital: false,
        inventory_count: null,
        printful_product_id: selectedPrintfulProduct.printful_id,
        fulfillment_method: 'printful',
        metadata: {
          printful_product_name: selectedPrintfulProduct.name,
          printful_category: selectedPrintfulProduct.category,
          media_id: selectedMedia.id,
          markup_percentage: markupPercentage,
        },
      };

      await productService.createProduct(productData);

      alert('Product created successfully!');

      setSelectedMedia(null);
      setSelectedPrintfulProduct(null);
      setSelectedVariants([]);
      setProductTitle('');
      setProductDescription('');
      setMarkupPercentage(40);

    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Check console for details.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-display text-white mb-4">Map Photo to Printful Product</h2>
        <p className="text-white/60 mb-6">
          Select your photography, choose a Printful product type, configure variants and pricing to create a new shop product.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Select Photo */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-white font-semibold">Select Your Photo</h3>
            </div>

            {selectedMedia ? (
              <div className="relative">
                <img
                  src={selectedMedia.public_url}
                  alt={selectedMedia.title}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-white text-sm">{selectedMedia.title}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {mediaItems.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleMediaSelect(media)}
                    className="cursor-pointer rounded-lg overflow-hidden border-2 border-white/10 hover:border-yellow-400/50 transition-all"
                  >
                    <img
                      src={media.public_url}
                      alt={media.title}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Select Printful Product */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-white font-semibold">Select Print Type</h3>
            </div>

            {selectedPrintfulProduct ? (
              <div className="relative">
                <div className="border border-yellow-400/50 rounded-lg p-3 bg-yellow-400/10 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPrintfulProduct.product_data.image && (
                      <img
                        src={selectedPrintfulProduct.product_data.image}
                        alt={selectedPrintfulProduct.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{selectedPrintfulProduct.name}</p>
                      <p className="text-white/60 text-xs">{selectedPrintfulProduct.sizes.length} variants</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPrintfulProduct(null)}
                    className="btn-secondary w-full text-xs"
                  >
                    Change Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {printfulProducts.slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handlePrintfulProductSelect(product)}
                    className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {product.product_data.image && (
                        <img
                          src={product.product_data.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{product.name}</p>
                        <p className="text-white/50 text-xs">${product.base_cost.toFixed(2)}+</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Configure Variants */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-white font-semibold">Select Variants</h3>
            </div>

            {selectedPrintfulProduct ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedPrintfulProduct.sizes.map((variant) => (
                  <div
                    key={variant.id}
                    onClick={() => toggleVariant(variant.id)}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      selectedVariants.includes(variant.id)
                        ? 'bg-yellow-400/10 border-yellow-400/50'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-white text-sm font-medium">{variant.name}</p>
                      <div className="text-right">
                        <p className="text-white/50 text-xs">Cost: ${variant.price.toFixed(2)}</p>
                        <p className="text-green-400 text-xs font-semibold">
                          Sell: ${calculateRetailPrice(variant.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">{variant.size}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm text-center py-8">
                Select a Printful product first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Form */}
      {selectedMedia && selectedPrintfulProduct && selectedVariants.length > 0 && (
        <div className="glass-card p-8">
          <h3 className="text-xl font-display text-white mb-6">Product Details</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Product Title</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Mountain Sunset Print"
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Description</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="A stunning capture of golden hour in the mountains..."
                  className="input-glass w-full h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Markup Percentage</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-semibold w-16 text-right">{markupPercentage}%</span>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  Higher markup = more profit per sale
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-4">Pricing Summary</h4>
              <div className="space-y-3">
                {selectedPrintfulProduct.sizes
                  .filter(v => selectedVariants.includes(v.id))
                  .map((variant) => {
                    const retailPrice = calculateRetailPrice(variant.price);
                    const profit = retailPrice - variant.price;
                    return (
                      <div key={variant.id} className="border-b border-white/10 pb-3">
                        <p className="text-white text-sm mb-1">{variant.name}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">Cost:</span>
                          <span className="text-white">${variant.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">Retail:</span>
                          <span className="text-white">${retailPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-400">Profit:</span>
                          <span className="text-green-400 font-semibold">${profit.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCreateProduct}
              disabled={creating || !productTitle}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {creating ? 'Creating Product...' : 'Create Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintfulProductMapper;
