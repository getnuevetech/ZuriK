import { Star, ArrowRight } from 'lucide-react';

const designers = [
  {
    id: 1,
    name: 'Amara Okafor',
    initials: 'AO',
    country: 'Nigeria',
    rating: 4.9,
    products: 45,
    specialty: 'Ankara & Adire',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: 2,
    name: 'Kwame Mensah',
    initials: 'KM',
    country: 'Ghana',
    rating: 5.0,
    products: 62,
    specialty: 'Kente & Traditional',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 3,
    name: 'Nia Johari',
    initials: 'NJ',
    country: 'Kenya',
    rating: 4.8,
    products: 38,
    specialty: 'Kitenge & Modern',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: 4,
    name: 'Fatou Sow',
    initials: 'FS',
    country: 'Senegal',
    rating: 4.9,
    products: 51,
    specialty: 'Bazin & Embroidery',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  },
];

export default function Designers() {
  return (
    <section className="py-20 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-[#e07a3d] text-sm uppercase tracking-widest mb-4 block">
              The Makers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">The Artisans Behind Your Style</h2>
          </div>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            View All Designers
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Designers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designers.map((designer) => (
            <a key={designer.id} href="#" className="group">
              <div className="relative aspect-[3/4] overflow-hidden mb-4">
                <img
                  src={designer.image}
                  alt={designer.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Country Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs">
                  {designer.country}
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-white text-xs">{designer.rating}</span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#e07a3d] flex items-center justify-center text-white font-semibold text-sm">
                      {designer.initials}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{designer.name}</h3>
                      <p className="text-white/70 text-sm">{designer.specialty}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs">{designer.products} products</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
