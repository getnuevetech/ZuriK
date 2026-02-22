'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { designsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { getUserDisplayName } from '../../lib/utils';
import type { Design } from '../../types';

interface DesignerInfo {
  id: string;
  name: string;
  country: string;
  initials: string;
  productCount: number;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function extractDesigners(products: Design[]): DesignerInfo[] {
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
        country: p.designer.country || '',
        initials: getInitials(name),
        productCount: 1,
      });
    }
  }
  return Array.from(map.values()).slice(0, 6);
}

const PLACEHOLDER_DESIGNERS = [
  { initials: 'AO', name: 'Amara Okafor', country: 'Nigeria' },
  { initials: 'KM', name: 'Kwame Mensah', country: 'Ghana' },
  { initials: 'NJ', name: 'Nia Johari', country: 'Kenya' },
  { initials: 'FS', name: 'Fatou Sow', country: 'Senegal' },
];

export function DesignerSpotlight() {
  const [designers, setDesigners] = useState<DesignerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    designsApi.list()
      .then((res) => setDesigners(extractDesigners(res.items)))
      .catch(() => setDesigners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="designer-spotlight-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">The Makers</p>
            <h2 id="designer-spotlight-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              The Artisans Behind Your Style
            </h2>
          </div>
          <Link
            href="/designers"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-4 whitespace-nowrap"
          >
            View All Designers
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : designers.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLACEHOLDER_DESIGNERS.map((d, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="font-bold text-neutral-600 text-lg">{d.initials}</span>
                </div>
                <div className="font-medium text-neutral-900 text-sm">{d.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-light">{d.country}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {designers.map((d) => (
              <Link
                key={d.id}
                href={`/designers/${d.id}`}
                className="group text-center"
              >
                <div className="w-20 h-20 bg-neutral-100 group-hover:bg-neutral-200 mx-auto mb-4 flex items-center justify-center transition-colors">
                  <span className="font-bold text-neutral-600 text-lg">{d.initials}</span>
                </div>
                <div className="font-medium text-neutral-900 text-sm">{d.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-light">{d.country}</div>
                <div className="text-xs text-neutral-400 mt-0.5 font-light">{d.productCount} design{d.productCount !== 1 ? 's' : ''}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
