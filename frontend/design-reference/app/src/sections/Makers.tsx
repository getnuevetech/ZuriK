import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const designers = [
  {
    name: 'Amara Okafor',
    initials: 'AO',
    country: 'Nigeria',
    flag: '🇳🇬',
    rating: 4.9,
    products: 45,
    specialty: 'Ankara & Adire',
  },
  {
    name: 'Kwame Mensah',
    initials: 'KM',
    country: 'Ghana',
    flag: '🇬🇭',
    rating: 5.0,
    products: 62,
    specialty: 'Kente & Traditional',
  },
  {
    name: 'Nia Johari',
    initials: 'NJ',
    country: 'Kenya',
    flag: '🇰🇪',
    rating: 4.8,
    products: 38,
    specialty: 'Kitenge & Modern',
  },
  {
    name: 'Fatou Sow',
    initials: 'FS',
    country: 'Senegal',
    flag: '🇸🇳',
    rating: 4.9,
    products: 51,
    specialty: 'Bazin & Embroidery',
  },
];

function DesignerCard({ designer, index }: { designer: typeof designers[0]; index: number }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] 
      }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center text-center p-6 bg-card border border-border sharp-corners hover:border-primary/30 transition-colors"
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif text-2xl font-semibold transition-transform duration-300 group-hover:scale-105">
          {designer.initials}
        </div>
        {/* Flag */}
        <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-card rounded-full flex items-center justify-center text-lg border-2 border-card">
          {designer.flag}
        </span>
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="text-sm text-white font-medium">{designer.rating}</span>
        </div>
        <span className="text-sm text-white/40">·</span>
        <span className="text-sm text-white/40">{designer.products} products</span>
      </div>
      
      {/* Name */}
      <h3 className="font-serif text-lg font-semibold text-white mb-1 group-hover:text-primary transition-colors">
        {designer.name}
      </h3>
      
      {/* Specialty */}
      <p className="text-sm text-white/60">{designer.specialty}</p>
    </motion.a>
  );
}

export function Makers() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
              The Artisans Behind Your Style
            </h2>
          </div>
          <a 
            href="#" 
            className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-1"
          >
            View All Designers
            <span>→</span>
          </a>
        </motion.div>

        {/* Designers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designers.map((designer, index) => (
            <DesignerCard key={designer.name} designer={designer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
