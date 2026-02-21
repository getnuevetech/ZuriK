'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { getUserDisplayName } from '../../lib/utils';
import type { Product } from '../../types';

interface DesignerInfo {
  id: string;
  name: string;
  country: string;
  initials: string;
  productCount: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: '🇳🇬', Ghana: '🇬🇭', Kenya: '🇰🇪', 'South Africa': '🇿🇦',
  Senegal: '🇸🇳', Ethiopia: '🇪🇹', Cameroon: '🇨🇲', Tanzania: '🇹🇿',
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function extractDesigners(products: Product[]): DesignerInfo[] {
  const map = new Map<string, DesignerInfo>();
  for (const p of products) {
    if (!p.designer) continue;
    const id = p.designer.id;
    if (map.has(id)) {
      map.get(id)!.productCount += 1;
    } else {
      const name = getUserDisplayName(p.designer);
      map.set(id, {
        id,
        name,
        country: p.country || '',
        initials: getInitials(name),
        productCount: 1,
      });
    }
  }
  return Array.from(map.values()).slice(0, 6);
}

export function DesignerSpotlight() {
  const [designers, setDesigners] = useState<DesignerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.list()
      .then((res) => setDesigners(extractDesigners(res.items)))
      .catch(() => setDesigners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 bg-neutral-50" aria-labelledby="designer-spotlight-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 id="designer-spotlight-heading" className="font-heading text-4xl font-bold text-neutral-900 mb-2">
              The Artisans Behind Your Style
            </h2>
            <p className="text-neutral-500 text-lg">Meet the designers keeping African fashion traditions alive</p>
          </div>
          <Link
            href="/designers"
            className="inline-flex items-center gap-2 border border-neutral-300 hover:border-primary-400 text-neutral-700 hover:text-primary-700 font-medium px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            View All Designers →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : designers.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { initials: 'AO', name: 'Amara Okafor', country: 'Nigeria' },
              { initials: 'KM', name: 'Kwame Mensah', country: 'Ghana' },
              { initials: 'NJ', name: 'Nia Johari', country: 'Kenya' },
              { initials: 'FS', name: 'Fatou Sow', country: 'Senegal' },
            ].map((d, i) => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-neutral-100 text-center shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mx-auto mb-3 flex items-center justify-center text-white font-heading font-bold text-xl">
                  {d.initials}
                </div>
                <div className="font-semibold text-neutral-800">{d.name}</div>
                <div className="text-sm text-neutral-500 mt-1">
                  {COUNTRY_FLAGS[d.country] || '🌍'} {d.country}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {designers.map((d) => (
              <Link
                key={d.id}
                href={`/designers/${d.id}`}
                className="p-5 bg-white rounded-2xl border border-neutral-100 text-center shadow-card hover:shadow-card-hover transition-shadow group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mx-auto mb-3 flex items-center justify-center text-white font-heading font-bold text-xl group-hover:scale-110 transition-transform">
                  {d.initials}
                </div>
                <div className="font-semibold text-neutral-800">{d.name}</div>
                <div className="text-sm text-neutral-500 mt-1">
                  {COUNTRY_FLAGS[d.country] || '🌍'} {d.country}
                </div>
                <div className="text-xs text-primary-500 mt-1">{d.productCount} design{d.productCount !== 1 ? 's' : ''}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
