'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi } from '../../lib/api';
import { getUserDisplayName } from '../../lib/utils';
import type { Design } from '../../types';

interface DesignerInfo {
  id: string;
  name: string;
  country: string;
  flag: string;
  initials: string;
  productCount: number;
  specialties: string;
  image: string | null;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Senegal': '🇸🇳', 'Ethiopia': '🇪🇹', 'Tanzania': '🇹🇿', 'Morocco': '🇲🇦',
};

const PLACEHOLDER_DESIGNERS: DesignerInfo[] = [
  { id: 'p1', name: 'Amara Okafor', country: 'Nigeria', flag: '🇳🇬', initials: 'AO', productCount: 24, specialties: 'Ankara & Adire', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
  { id: 'p2', name: 'Kwame Mensah', country: 'Ghana', flag: '🇬🇭', initials: 'KM', productCount: 18, specialties: 'Kente & Batakari', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { id: 'p3', name: 'Nia Johari', country: 'Kenya', flag: '🇰🇪', initials: 'NJ', productCount: 31, specialties: 'Maasai & Kikoy', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
  { id: 'p4', name: 'Fatou Sow', country: 'Senegal', flag: '🇸🇳', initials: 'FS', productCount: 15, specialties: 'Bazin & Thioup', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80' },
];

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function StarRating({ rating = 4.8 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill={star <= Math.round(rating) ? '#C97B3A' : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function extractDesigners(products: Product[]): DesignerInfo[] {
  const map = new Map<string, DesignerInfo>();
  for (const p of products) {
    if (!p.designer) continue;
    const id = (p.designer as any).id;
    if (map.has(id)) {
      map.get(id)!.productCount += 1;
    } else {
      const name = getUserDisplayName(p.designer as any);
      const country = (p as any).country || '';
      map.set(id, {
        id, name, country,
        flag: COUNTRY_FLAGS[country] || '🌍',
        initials: getInitials(name),
        productCount: 1,
        specialties: 'African Fashion',
        image: null,
      });
    }
  }
  return Array.from(map.values()).slice(0, 4);
}

export function DesignerSpotlight() {
  const [designers, setDesigners] = useState<DesignerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.list()
      .then((res) => {
        const extracted = extractDesigners(res.items);
        setDesigners(extracted.length > 0 ? extracted : PLACEHOLDER_DESIGNERS);
      })
      .catch(() => setDesigners(PLACEHOLDER_DESIGNERS))
      .finally(() => setLoading(false));
  }, []);

  const displayDesigners = designers.length > 0 ? designers : PLACEHOLDER_DESIGNERS;

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="designer-spotlight-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="inline-block border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-1.5 rounded-full mb-4">
              The Makers
            </span>
            <h2 id="designer-spotlight-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              The Artisans Behind Your Style
            </h2>
          </div>
          <Link href="/designers" className="text-sm font-medium hover:text-[#C97B3A] transition-colors whitespace-nowrap" style={{ color: '#C97B3A' }}>
            View All Designers →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-square mb-4" />
                <div className="bg-neutral-200 h-4 w-3/4 rounded mb-2" />
                <div className="bg-neutral-200 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayDesigners.map((designer) => (
              <Link key={designer.id} href={`/designers/${designer.id}`} className="group block">
                {/* Designer image - SHARP CORNERS */}
                <div className="relative aspect-square overflow-hidden bg-neutral-100 mb-4">
                  {designer.image ? (
                    <Image
                      src={designer.image}
                      alt={designer.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                      <span className="text-3xl font-bold text-neutral-500">{designer.initials}</span>
                    </div>
                  )}
                  {/* Country flag badge */}
                  <div className="absolute top-2 left-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm text-sm">
                    {designer.flag}
                  </div>
                  {/* Product count badge */}
                  {designer.productCount > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {designer.productCount} designs
                    </div>
                  )}
                </div>
                <StarRating />
                <div className="font-bold text-neutral-900 text-sm mt-2">{designer.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-light">{designer.specialties}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
