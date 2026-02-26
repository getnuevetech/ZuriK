import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const products = [
  {
    id: 1,
    name: 'Royal Kente Gown',
    designer: 'Amara Okafor',
    country: 'Ghana',
    price: 450,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    badge: 'Bestseller',
    badgeColor: 'bg-[#e07a3d]',
  },
  {
    id: 2,
    name: 'Emerald Caftan',
    designer: 'Youssef Hassan',
    country: 'Morocco',
    price: 380,
    rating: 4.8,
    reviews: 96,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80',
    badge: 'New',
    badgeColor: 'bg-green-600',
  },
  {
    id: 3,
    name: 'Ankara Maxi Set',
    designer: 'Nia Johari',
    country: 'Nigeria',
    price: 295,
    rating: 4.7,
    reviews: 84,
    image: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=400&q=80',
    badge: null,
    badgeColor: '',
  },
  {
    id: 4,
    name: 'Royal Dashiki',
    designer: 'Kwame Mensah',
    country: 'Ghana',
    price: 180,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    badge: 'Popular',
    badgeColor: 'bg-purple-600',
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-[#e07a3d] text-sm uppercase tracking-widest mb-4 block">
              Hand-Picked for You
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Featured Products</h2>
          </div>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            View All
            <span className="text-lg">→</span>
          </a>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badge */}
                {product.badge && (
                  <Badge
                    className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-none`}
                  >
                    {product.badge}
                  </Badge>
                )}

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                  <Heart className="w-4 h-4 text-white" />
                </button>

                {/* Quick Add Button */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="w-full bg-white text-[#1a1a1a] hover:bg-white/90 rounded-none text-sm font-medium">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Quick Add
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
      </div>
    </section>
  );
}
