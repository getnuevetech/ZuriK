import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'Ready-to-Wear',
    subtitle: 'Curated African Fashion, Ready to Ship',
    description: 'Discover our collection of ready-made garments, crafted with authentic African fabrics and modern silhouettes.',
    cta: 'Shop Now',
    image: '/images/collection-readytowear.jpg',
  },
  {
    title: 'Premium Fabrics',
    subtitle: 'Authentic African Textiles from Across the Continent',
    description: 'Source the finest Kente, Ankara, Kitenge, and more directly from master weavers and textile artisans.',
    cta: 'Browse Fabrics',
    image: '/images/collection-fabrics.jpg',
  },
  {
    title: 'Custom Designs',
    subtitle: 'Your Body. Your Fabric. Your Style.',
    description: 'Work with our artisans to create bespoke pieces tailored to your measurements and preferences.',
    cta: 'Start Designing',
    image: '/images/collection-custom.jpg',
  },
];

function CollectionCard({ collection, index }: { collection: typeof collections[0]; index: number }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="group relative h-[400px] overflow-hidden sharp-corners"
    >
      {/* Image */}
      <img
        src={collection.image}
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 sharp-corners"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-2 transition-transform duration-300 group-hover:-translate-y-1">
          {collection.title}
        </h3>
        <p className="text-sm text-white/80 mb-2">{collection.subtitle}</p>
        <p className="text-sm text-white/60 mb-4 line-clamp-2">{collection.description}</p>
        
        {/* CTA */}
        <span className="inline-flex items-center gap-2 text-primary font-medium text-sm transition-all duration-300 group-hover:gap-3">
          {collection.cta}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </motion.a>
  );
}

export function Collections() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-4">
            Explore Our Collections
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From ready-to-wear to custom-made, discover fashion that celebrates African heritage and contemporary style.
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <CollectionCard key={collection.title} collection={collection} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
