import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Image as ImageIcon, DollarSign, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { productService } from '../../lib/database';
import ImageService from '../../lib/imageService';

const PRINT_SIZES = [
  { size: '5x7"', price: 15.00, printful_variant_id: '' },
  { size: '8x10"', price: 25.00, printful_variant_id: '' },
  { size: '11x14"', price: 35.00, printful_variant_id: '' },
  { size: '16x20"', price: 50.00, printful_variant_id: '' },
  { size: '18x24"', price: 65.00, printful_variant_id: '' },
  { size: '24x36"', price: 95.00, printful_variant_id: '' },
];

const MERCH_OPTIONS = [
  { type: 'T-Shirt', basePrice: 25.00, sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { type: 'Mug', basePrice: 15.00, sizes: ['11oz', '15oz'] },
  { type: 'Tote Bag', basePrice: 18.00, sizes: ['Standard'] },
  { type: 'Phone Case', basePrice: 20.00, sizes: ['iPhone', 'Samsung'] },
  { type: 'Poster', basePrice: 12.00, sizes: ['12x18"', '18x24"', '24x36"'] },
];

interface ProductCreatorProps {
  onProductCreated?: () => void;
}

const ProductCreator: React.FC<ProductCreatorProps> = ({ onProductCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('art');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [selectedPrints, setSelectedPrints] = useState<typeof PRINT_SIZES>(PRINT_SIZES);
  const [selectedMerch, setSelectedMerch] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadAvailableImages();
  }, []);

  const loadAvailableImages = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('item_type', 'image')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const img = new window.Image();
      img.onload = async () => {
        const { data: mediaItem, error: dbError } = await supabase
          .from('media_items')
          .insert({
            title: file.name,
            description: '',
            item_type: 'image',
            storage_path: filePath,
            public_url: publicUrl,
            width: img.width,
            height: img.height,
            file_size: file.size,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setSelectedImage(publicUrl);
        await loadAvailableImages();
        setUploadProgress(0);
      };
      img.src = publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handlePrintPriceChange = (index: number, price: number) => {
    const updated = [...selectedPrints];
    updated[index].price = price;
    setSelectedPrints(updated);
  };

  const toggleMerch = (merchType: string) => {
    setSelectedMerch(prev =>
      prev.includes(merchType)
        ? prev.filter(m => m !== merchType)
        : [...prev, merchType]
    );
  };

  const handleCreateProduct = async () => {
    if (!title || !selectedImage) {
      alert('Please provide a title and select an image');
      return;
    }

    setCreating(true);

    try {
      const variants = selectedPrints.map(print => ({
        size: print.size,
        price: print.price,
        printful_variant_id: print.printful_variant_id || undefined,
      }));

      selectedMerch.forEach(merchType => {
        const merch = MERCH_OPTIONS.find(m => m.type === merchType);
        if (merch) {
          merch.sizes.forEach(size => {
            variants.push({
              size: `${merchType} - ${size}`,
              price: merch.basePrice,
            });
          });
        }
      });

      const productData = {
        title,
        description,
        category,
        base_price: Math.min(...variants.map(v => v.price)),
        images: [selectedImage],
        variants,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_active: true,
        is_digital: false,
        inventory_count: null,
        printful_product_id: null,
        metadata: {
          hasPrints: true,
          hasMerch: selectedMerch.length > 0,
          merchTypes: selectedMerch,
        },
      };

      await productService.createProduct(productData);

      alert('Product created successfully!');

      setTitle('');
      setDescription('');
      setCategory('art');
      setSelectedImage(null);
      setSelectedPrints(PRINT_SIZES);
      setSelectedMerch([]);
      setTags('');

      if (onProductCreated) {
        onProductCreated();
      }

    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-display text-white mb-6">Create New Product</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Info & Image */}
        <div className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 text-sm">Product Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sunset Over Mountains"
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A beautiful landscape captured at golden hour..."
              className="input-glass w-full h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-glass-dark w-full"
            >
              <option value="art">Art</option>
              <option value="merchandise">Merchandise</option>
              <option value="limited">Limited Edition</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="landscape, sunset, nature"
              className="input-glass w-full"
            />
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-white/80 mb-2 text-sm">Product Image</label>

            <div className="mb-4">
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload New Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {selectedImage && (
              <div className="relative mb-4">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {availableImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img.public_url)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.public_url
                      ? 'border-yellow-400 scale-95'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={img.public_url}
                    alt={img.title}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Print Sizes & Merch */}
        <div className="space-y-6">
          <div>
            <label className="block text-white/80 mb-3 text-sm font-semibold">Print Sizes & Pricing</label>
            <div className="space-y-2">
              {selectedPrints.map((print, index) => (
                <div key={print.size} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                  <Package className="w-4 h-4 text-white/60" />
                  <span className="text-white flex-1">{print.size}</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-white/60" />
                    <input
                      type="number"
                      value={print.price}
                      onChange={(e) => handlePrintPriceChange(index, parseFloat(e.target.value))}
                      className="input-glass w-20 text-sm"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 mb-3 text-sm font-semibold">Merchandise Options</label>
            <div className="space-y-2">
              {MERCH_OPTIONS.map((merch) => (
                <div
                  key={merch.type}
                  onClick={() => toggleMerch(merch.type)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedMerch.includes(merch.type)
                      ? 'bg-yellow-400/10 border-yellow-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{merch.type}</span>
                    <span className="text-yellow-400">${merch.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="text-white/60 text-xs">
                    Sizes: {merch.sizes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleCreateProduct}
          disabled={creating || !title || !selectedImage}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          {creating ? 'Creating Product...' : 'Create Product'}
        </button>
      </div>
    </div>
  );
};

export default ProductCreator;
