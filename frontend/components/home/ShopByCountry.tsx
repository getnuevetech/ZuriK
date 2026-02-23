'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';

interface CountryItem {
  name: string;
  code: string;
  flag: string;
  image: string;
  designerCount?: number;
  productCount?: number;
  fabrics?: string[];
}

const FALLBACK_COUNTRIES: CountryItem[] = [
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', fabrics: ['Kitenge', 'Kanga', 'Khanga'], image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', fabrics: ['Toghu', 'Ndop', 'Atoghu'], image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', fabrics: ['Kente', 'Batakari', 'Fugu'], image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', fabrics: ['Djellaba', 'Caftan', 'Berber'], image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', fabrics: ['Habesha Kemis', 'Netela', 'Gabi'], image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', fabrics: ['Ankara', 'Adire', 'Aso-Oke'], image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', fabrics: ['Kikoy', 'Maasai Shuka', 'Kanga'], image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=80' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', fabrics: ['Thioup', 'Bazin', 'Wax Print'], image: 'https://images.unsplash.com/photo-1574177556859-1362f72ed6f9?w=600&q=80' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', fabrics: ['Shweshwe', 'Ndebele', 'Xhosa'], image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600&q=80' },
];

export function ShopByCountry() {
  const [countries, setCountries] = useState<CountryItem[]>(FALLBACK_COUNTRIES);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    homepageApi.getShopByCountry()
      .then((data) => {
        if (data && data.length > 0) {
          const fallbackByCode = new Map(FALLBACK_COUNTRIES.map((f) => [f.code, f]));
          const mapped: CountryItem[] = data.map((d: any) => ({
            name: d.countryName,
            code: d.countryCode,
            flag: d.flag,
            image: d.heroImage ?? fallbackByCode.get(d.countryCode)?.image ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
            designerCount: d.designerCount,
            productCount: d.productCount,
            fabrics: fallbackByCode.get(d.countryCode)?.fabrics,
          }));
          setCountries(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function updateVisible() {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(3);
      else setVisibleCount(4);
    }
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIndex = Math.max(0, countries.length - visibleCount);
  const cardWidthPct = 100 / visibleCount;

  return (
    <section className="py-24 px-4" style={{ backgroundColor: '#F9F6F2' }} aria-labelledby="shop-by-country-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-1.5 rounded-full mb-4">
            Explore the Continent
          </span>
          <h2 id="shop-by-country-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            Shop by Country
          </h2>
          <p className="text-neutral-500 text-base max-w-md mx-auto font-light">
            Discover traditional fabrics, designs, and artisans from across the continent
          </p>
        </div>

        <div className="relative">
          {index > 0 && (
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous"
              className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 shadow-md hover:shadow-lg text-neutral-700 transition-all"
              style={{ borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${index * cardWidthPct}%)` }}
            >
              {countries.map((country) => (
                <div
                  key={country.code || country.name}
                  style={{ width: `${cardWidthPct}%`, flexShrink: 0 }}
                  className="px-2"
                >
                  <Link href={`/products?country=${encodeURIComponent(country.name)}`} className="group block">
                    {/* Image container - sharp corners */}
                    <div className="relative overflow-hidden aspect-[3/2] bg-neutral-200">
                      <span className="absolute top-3 left-3 z-10 text-2xl leading-none">{country.flag}</span>
                      <Image
                        src={country.image}
                        alt={`Fashion from ${country.name}`}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    {/* Text below image */}
                    <div className="pt-3 pb-2">
                      <div className="font-bold text-neutral-900 text-base">{country.name}</div>
                      <div className="text-neutral-500 text-xs mt-1 font-light">{country.fabrics?.join(' · ')}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {index < maxIndex && (
            <button
              onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
              aria-label="Next"
              className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 shadow-md hover:shadow-lg text-neutral-700 transition-all"
              style={{ borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
