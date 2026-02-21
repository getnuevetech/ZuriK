'use client';

import React from 'react';
import Link from 'next/link';

const COUNTRIES = [
  { name: 'Nigeria', flag: '🇳🇬', fabric: 'Ankara · Adire · Aso-oke' },
  { name: 'Ghana', flag: '🇬🇭', fabric: 'Kente' },
  { name: 'Kenya', flag: '🇰🇪', fabric: 'Kikoy · Maasai Shuka' },
  { name: 'South Africa', flag: '🇿🇦', fabric: 'Shweshwe' },
  { name: 'Senegal', flag: '🇸🇳', fabric: 'Bazin · Thioup' },
  { name: 'Ethiopia', flag: '🇪🇹', fabric: 'Habesha Kemis' },
  { name: 'Cameroon', flag: '🇨🇲', fabric: 'Toghu' },
  { name: 'Tanzania', flag: '🇹🇿', fabric: 'Kitenge · Kanga' },
];

export function ShopByCountry() {
  return (
    <section className="py-24 px-4 bg-neutral-50" aria-labelledby="shop-by-country-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Explore the Continent</p>
          <h2 id="shop-by-country-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            Shop by Country
          </h2>
          <p className="text-neutral-500 text-base max-w-md mx-auto font-light">
            Each country, a unique story in thread and colour
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 snap-x snap-mandatory">
          {COUNTRIES.map((country) => (
            <Link
              key={country.name}
              href={`/products?country=${encodeURIComponent(country.name)}`}
              className="group flex-shrink-0 w-44 md:w-auto snap-start relative overflow-hidden bg-white border border-neutral-200 hover:border-neutral-900 transition-all duration-300"
            >
              <div className="aspect-[3/4] bg-neutral-100 overflow-hidden flex items-center justify-center">
                <span className="text-6xl transition-transform duration-500 group-hover:scale-110">
                  {country.flag}
                </span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-neutral-900 text-sm">{country.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-light">{country.fabric}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
