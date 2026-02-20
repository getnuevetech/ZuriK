'use client';

import React from 'react';
import Link from 'next/link';

const COUNTRIES = [
  { name: 'Nigeria', flag: '🇳🇬', fabric: 'Ankara, Adire, Aso-oke', accent: 'from-green-700 to-green-900', textAccent: 'text-green-300' },
  { name: 'Ghana', flag: '🇬🇭', fabric: 'Kente', accent: 'from-yellow-600 to-yellow-800', textAccent: 'text-yellow-200' },
  { name: 'Kenya', flag: '🇰🇪', fabric: 'Kikoy, Maasai Shuka', accent: 'from-red-700 to-red-900', textAccent: 'text-red-300' },
  { name: 'South Africa', flag: '🇿🇦', fabric: 'Shweshwe', accent: 'from-blue-700 to-blue-900', textAccent: 'text-blue-300' },
  { name: 'Senegal', flag: '🇸🇳', fabric: 'Bazin, Thioup', accent: 'from-teal-600 to-teal-900', textAccent: 'text-teal-300' },
  { name: 'Ethiopia', flag: '🇪🇹', fabric: 'Habesha Kemis', accent: 'from-amber-600 to-amber-900', textAccent: 'text-amber-200' },
  { name: 'Cameroon', flag: '🇨🇲', fabric: 'Toghu', accent: 'from-emerald-700 to-red-900', textAccent: 'text-emerald-300' },
  { name: 'Tanzania', flag: '🇹🇿', fabric: 'Kitenge, Kanga', accent: 'from-cyan-700 to-green-900', textAccent: 'text-cyan-300' },
];

export function ShopByCountry() {
  return (
    <section className="py-20 px-4 bg-white" aria-labelledby="shop-by-country-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="shop-by-country-heading" className="font-heading text-4xl font-bold text-neutral-900 mb-4">
            Shop by Country
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            Discover Africa&apos;s Finest — each country, a unique story in thread and colour
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 snap-x snap-mandatory">
          {COUNTRIES.map((country) => (
            <Link
              key={country.name}
              href={`/products?country=${encodeURIComponent(country.name)}`}
              className={`
                group flex-shrink-0 w-48 md:w-auto snap-start
                relative overflow-hidden rounded-2xl
                bg-gradient-to-br ${country.accent}
                p-6 min-h-[160px] flex flex-col justify-between
                hover:scale-105 transition-transform duration-200 shadow-card hover:shadow-card-hover
              `}
            >
              <div className="text-5xl mb-2">{country.flag}</div>
              <div>
                <div className="text-white font-heading font-bold text-lg leading-tight">{country.name}</div>
                <div className={`text-sm mt-1 ${country.textAccent}`}>{country.fabric}</div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
