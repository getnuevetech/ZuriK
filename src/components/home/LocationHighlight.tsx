import React from 'react';
import Link from 'next/link';

export default function LocationHighlight() {
  // Select featured countries
  const featuredCountries = [
    { name: 'Nigeria', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600', count: 120 },
    { name: 'Ghana', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', count: 85 },
    { name: 'Kenya', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600', count: 72 },
    { name: 'South Africa', image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600', count: 95 },
    { name: 'Ethiopia', image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600', count: 48 },
    { name: 'Egypt', image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600', count: 34 },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-african-dark mb-4">
            Browse by Location
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore authentic designs from different African countries. 
            Each region brings its unique style, patterns, and traditions.
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCountries.map((country) => (
            <Link
              key={country.name}
              href={`/designs?country=${encodeURIComponent(country.name)}`}
              className="group relative overflow-hidden rounded-lg aspect-square"
            >
              <img
                src={country.image}
                alt={country.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {country.name}
                  </h3>
                  <p className="text-african-cream text-sm">
                    {country.count} designs
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All Countries Button */}
        <div className="mt-12 text-center">
          <Link
            href="/designs"
            className="text-gold hover:text-gold-dark font-semibold"
          >
            View Designs from All Countries →
          </Link>
        </div>
      </div>
    </section>
  );
}
