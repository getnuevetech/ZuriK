import { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'Ready-to-Wear', 'Fabrics', 'Custom Designs'];

const products = [
  {
    id: 1,
    name: 'Burgundy Boubou Gown',
    designer: 'Fatou Sow',
    country: 'Senegal',
    price: 520,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    category: 'Ready-to-Wear',
    badge: 'Trending',
  },
  {
    id: 2,
    name: 'Kitenge Fabric Roll',
    designer: 'Traditional Weavers',
    country: 'Tanzania',
    price: 85,
    rating: 4.8,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    category: 'Fabrics',
    badge: 'Trending',
  },
  {
    id: 3,
    name: 'African Print Blazer',
    designer: 'Amara Okafor',
    country: 'Nigeria',
    price: 340,
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=400&q=80',
    category: 'Ready-to-Wear',
    badge: null,
  },
  {
    id: 4,
    name: 'Custom Wedding Attire',
    designer: 'Kwame Mensah',
    country: 'Ghana',
    price: 1200,
    rating: 5.0,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    category: 'Custom Designs',
    badge: 'Trending',
  },
  {
    id: 5,
    name: 'Ankara Maxi Dress',
    designer: 'Nia Johari',
    country: 'Kenya',
    price: 280,
    rating: 4.6,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    category: 'Ready-to-Wear',
    badge: null,
  },
  {
    id: 6,
    name: 'Premium Wax Print',
    designer: 'Vlisco Collection',
    country: 'Netherlands/Ghana',
    price: 120,
    rating: 4.9,
    reviews: 456,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    category: 'Fabrics',
    badge: 'Trending',
  },
];

export default function Trending() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section className="py-20 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-[#e07a3d] text-sm uppercase tracking-widest mb-4 block">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Trending Now</h2>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-none ${
                activeCategory === category
                  ? 'bg-white text-[#1a1a1a]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badge */}
                {product.badge && (
                  <Badge className="absolute top-3 left-3 bg-[#e07a3d] text-white text-xs px-2 py-1 rounded-none">
                    {product.badge}
                  </Badge>
                )}

                {/* Category Badge */}
                <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-none">
                  {product.category}
                </Badge>

                {/* Add to Cart Button */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="w-full bg-white text-[#1a1a1a] hover:bg-white/90 rounded-none text-sm font-medium">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>{product.designer}</span>
                  <span>·</span>
                  <span>{product.country}</span>
                </div>
                <h3 className="text-white font-medium text-lg">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-sm">{product.rating}</span>
                  </div>
                  <span className="text-white/40 text-sm">({product.reviews} reviews)</span>
                </div>
                <p className="text-white font-semibold text-lg">${product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            View all products
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
