import { productService } from './database';

export const sampleProducts = [
  {
    title: "Urban Solitude #1",
    description: "Architectural photography print on premium paper. This stunning black and white composition captures the essence of modern urban architecture with dramatic angles and lighting. Perfect for contemporary spaces.",
    category: "art",
    base_price: 150.00,
    images: [
      "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    variants: [
      { size: "8x10", price: 75.00 },
      { size: "11x14", price: 125.00 },
      { size: "16x20", price: 180.00 },
      { size: "20x24", price: 250.00 }
    ],
    tags: ["architecture", "black and white", "urban", "modern"],
    is_active: true,
    is_digital: false,
    inventory_count: 5,
    printful_product_id: null,
    metadata: {
      dimensions: "Various sizes available",
      materials: "Premium archival paper",
      print_type: "Giclée print"
    }
  },
  {
    title: "Golden Hour Portrait Series",
    description: "High-resolution digital collection of 10 portrait photographs. Captured during the magical golden hour, these portraits showcase the warmth and beauty of natural light. Includes RAW and edited JPEG files.",
    category: "digital",
    base_price: 75.00,
    images: [
      "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "Digital Download", price: 75.00 }
    ],
    tags: ["portraits", "golden hour", "digital", "photography collection"],
    is_active: true,
    is_digital: true,
    inventory_count: null,
    printful_product_id: null,
    metadata: {
      file_format: "JPEG + RAW",
      resolution: "6000x4000px",
      total_images: "10 photos"
    }
  },
  {
    title: "Abstract Landscapes Collection",
    description: "Set of 3 experimental landscape prints featuring abstract interpretations of natural scenery. Each piece uses long exposure techniques to create dreamy, ethereal compositions that blur the line between reality and imagination.",
    category: "art",
    base_price: 200.00,
    images: [
      "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "12x16 (Set of 3)", price: 200.00 },
      { size: "16x20 (Set of 3)", price: 300.00 },
      { size: "20x24 (Set of 3)", price: 400.00 }
    ],
    tags: ["landscape", "abstract", "long exposure", "set"],
    is_active: true,
    is_digital: false,
    inventory_count: 20,
    printful_product_id: null,
    metadata: {
      dimensions: "Various sizes available",
      materials: "Museum-quality paper",
      print_type: "Fine art print",
      quantity: "Set of 3 prints"
    }
  },
  {
    title: "Photography Workshop Guide",
    description: "Comprehensive digital guide with techniques and presets. Learn professional photography techniques from composition to post-processing. Includes 50+ Lightroom presets, video tutorials, and a detailed PDF guide.",
    category: "digital",
    base_price: 45.00,
    images: [
      "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "PDF + Presets", price: 45.00 }
    ],
    tags: ["education", "tutorial", "presets", "workshop"],
    is_active: true,
    is_digital: true,
    inventory_count: null,
    printful_product_id: null,
    metadata: {
      file_format: "PDF + .xmp preset files",
      pages: "120-page guide",
      presets: "50+ Lightroom presets",
      videos: "10 tutorial videos"
    }
  },
  {
    title: "Signature Coffee Mug",
    description: "Premium ceramic mug featuring iconic photograph. Start your mornings with art! This high-quality ceramic mug features one of our most popular photographs printed with vivid colors and dishwasher-safe ink.",
    category: "merchandise",
    base_price: 25.00,
    images: [
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "11oz", price: 25.00 },
      { size: "15oz", price: 30.00 }
    ],
    tags: ["merchandise", "mug", "gift", "coffee"],
    is_active: true,
    is_digital: false,
    inventory_count: 50,
    printful_product_id: null,
    metadata: {
      materials: "Ceramic",
      care: "Dishwasher and microwave safe",
      print_type: "Full-color print"
    }
  },
  {
    title: "Street Chronicles - Collector's Edition",
    description: "Hand-signed limited edition print with certificate of authenticity. Only 10 prints will ever be produced. This powerful street photography piece captures a decisive moment in urban life. Each print is personally signed and numbered.",
    category: "limited",
    base_price: 350.00,
    images: [
      "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "16x20", price: 350.00 },
      { size: "20x24", price: 450.00 }
    ],
    tags: ["limited edition", "street photography", "signed", "collector"],
    is_active: true,
    is_digital: false,
    inventory_count: 2,
    printful_product_id: null,
    metadata: {
      edition: "Limited to 10 prints",
      materials: "Fine art cotton paper",
      print_type: "Giclée print",
      extras: "Hand-signed, numbered, with certificate"
    }
  },
  {
    title: "Minimalist Black & White Prints",
    description: "A collection of 5 minimalist black and white prints perfect for modern interiors. Clean lines, negative space, and striking contrast define this curated collection. Ideal for creating a cohesive gallery wall.",
    category: "art",
    base_price: 180.00,
    images: [
      "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "8x10 (Set of 5)", price: 180.00 },
      { size: "11x14 (Set of 5)", price: 280.00 }
    ],
    tags: ["minimalist", "black and white", "set", "modern"],
    is_active: true,
    is_digital: false,
    inventory_count: 15,
    printful_product_id: null,
    metadata: {
      dimensions: "Various sizes available",
      materials: "Matte archival paper",
      print_type: "Fine art print",
      quantity: "Set of 5 prints"
    }
  },
  {
    title: "Nature Macro Photography Pack",
    description: "Digital download pack featuring 25 high-resolution macro photography shots of nature. From water droplets to flower petals, this collection showcases the intricate beauty of the natural world up close.",
    category: "digital",
    base_price: 65.00,
    images: [
      "https://images.pexels.com/photos/1181317/pexels-photo-1181317.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    variants: [
      { size: "Digital Download", price: 65.00 }
    ],
    tags: ["macro", "nature", "digital", "high resolution"],
    is_active: true,
    is_digital: true,
    inventory_count: null,
    printful_product_id: null,
    metadata: {
      file_format: "JPEG",
      resolution: "6000x4000px",
      total_images: "25 photos",
      license: "Commercial use allowed"
    }
  }
];

export const seedProducts = async () => {
  console.log('Seeding products...');

  for (const product of sampleProducts) {
    try {
      await productService.createProduct(product as any);
      console.log(`✓ Created: ${product.title}`);
    } catch (error) {
      console.error(`✗ Failed to create ${product.title}:`, error);
    }
  }

  console.log('Product seeding complete!');
};
