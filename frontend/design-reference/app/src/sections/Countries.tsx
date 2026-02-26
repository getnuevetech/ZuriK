import { motion } from 'framer-motion';
import { useRef } from 'react';

const countries = [
  { flag: '🇹🇿', name: 'Tanzania', fabrics: 'Kitenge · Kanga · Khanga', image: '/images/country-tanzania.jpg' },
  { flag: '🇨🇲', name: 'Cameroon', fabrics: 'Toghu · Ndop · Atoghu', image: '/images/country-cameroon.jpg' },
  { flag: '🇬🇭', name: 'Ghana', fabrics: 'Kente · Batakari · Fugu', image: '/images/country-ghana.jpg' },
  { flag: '🇲🇦', name: 'Morocco', fabrics: 'Djellaba · Caftan · Berber', image: '/images/country-morocco.jpg' },
  { flag: '🇪🇹', name: 'Ethiopia', fabrics: 'Habesha Kemis · Netela · Gabi', image: '/images/country-ethiopia.jpg' },
  { flag: '🇨🇮', name: 'Ivory Coast', fabrics: 'Baoulé · Sénoufo · Wax', image: '/images/country-ivorycoast.jpg' },
  { flag: '🇸🇳', name: 'Senegal', fabrics: 'Thioup · Bazin · Wax Print', image: '/images/country-senegal.jpg' },
  { flag: '🇳🇬', name: 'Nigeria', fabrics: 'Ankara · Adire · Aso Oke', image: '/images/country-nigeria.jpg' },
];

function CountryCard({ country, index }: { country: typeof countries[0]; index: number }) {
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
      whileHover={{ y: -8 }}
      className="group relative flex-shrink-0 w-[280px] h-[360px] overflow-hidden sharp-corners"
    >
      {/* Image */}
      <img
        src={country.image}
        alt={country.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 sharp-corners"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 card-gradient transition-opacity duration-300 group-hover:opacity-90" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{country.flag}</span>
          <h3 className="font-serif text-xl font-semibold text-white">
            {country.name}
          </h3>
        </div>
        <p className="text-sm text-white/70">{country.fabrics}</p>
      </div>
    </motion.a>
  );
}

export function Countries() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Explore the Continent
          </h2>
          <p className="text-lg text-primary font-medium mb-2">Shop by Country</p>
          <p className="text-white/60 max-w-xl mx-auto">
            Each country, a unique story in thread and colour. Discover traditional fabrics and designs from across Africa.
          </p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {countries.map((country, index) => (
            <div key={country.name} style={{ scrollSnapAlign: 'start' }}>
              <CountryCard country={country} index={index} />
            </div>
          ))}
        </div>

        {/* Scroll Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-sm mt-6 lg:hidden"
        >
          Swipe to explore more countries
        </motion.p>
      </div>
    </section>
  );
}
