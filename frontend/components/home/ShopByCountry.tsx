'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const COUNTRIES = [
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', fabrics: ['Ankara', 'Adire', 'Aso-Oke'], image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', fabrics: ['Kente', 'Batakari', 'Fugu'], image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', fabrics: ['Kikoy', 'Maasai Shuka', 'Kanga'], image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=80' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', fabrics: ['Shweshwe', 'Ndebele', 'Xhosa'], image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600&q=80' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', fabrics: ['Habesha Kemis', 'Netela', 'Gabi'], image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', fabrics: ['Thioup', 'Bazin', 'Wax Print'], image: 'https://images.unsplash.com/photo-1574177556859-1362f72ed6f9?w=600&q=80' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', fabrics: ['Kitenge', 'Kanga', 'Khanga'], image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', fabrics: ['Djellaba', 'Caftan', 'Berber'], image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', fabrics: ['Toghu', 'Ndop', 'Atoghu'], image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80' },
  { name: 'Ivory Coast', code: 'CI', flag: '🇨🇮', fabrics: ['Baoulé', 'Sénoufo', 'Wax'], image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80' },
  { name: 'Mali', code: 'ML', flag: '🇲🇱', fabrics: ['Bogolan', 'Mudcloth', 'Bazin'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  { name: 'DR Congo', code: 'CD', flag: '🇨🇩', fabrics: ['Liputa', 'Wax', 'Sapeur'], image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ShopByCountry() {
  const [countries, setCountries] = useState(COUNTRIES);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCountries(shuffleArray(COUNTRIES));
  }, []);

  useEffect(() => {
    function updateVisible() {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    }
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIndex = Math.max(0, countries.length - visibleCount);

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setIndex((i) => Math.min(maxIndex, i + 1));
  }

  const cardWidthPct = 100 / visibleCount;

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

        <div className="relative">
          {index > 0 && (
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${index * cardWidthPct}%)` }}
            >
              {countries.map((country) => (
                <div
                  key={country.code}
                  style={{ width: `${cardWidthPct}%`, flexShrink: 0 }}
                  className="px-1"
                >
                  <Link
                    href={`/products?country=${encodeURIComponent(country.name)}`}
                    className="group block relative overflow-hidden aspect-[3/4] bg-neutral-900"
                  >
                    <Image
                      src={country.image}
                      alt={`Traditional fabrics and textiles from ${country.name}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 text-2xl leading-none">{country.flag}</span>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="font-bold text-white text-base leading-tight">{country.name}</div>
                      <div className="text-white/75 text-xs mt-1 font-light">{country.fabrics.join(' · ')}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {index < maxIndex && (
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
