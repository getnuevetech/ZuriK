'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { designsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Design } from '../../types';

interface CardProps {
  image?: string;
  name: string;
  price: number;
  href: string;
  badge?: string;
}

function DesignCard({ image, name, price, href, badge }: CardProps) {
  return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#C97B3A' }}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 text-sm leading-tight mb-1 line-clamp-1">{name}</h3>
        <PriceDisplay amount={price} className="text-indigo-600 font-bold text-sm" />
      </div>
    </Link>
  );
}

export function FeaturedDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    designsApi.featured()
      .then((data) => setDesigns(data))
      .catch(() => setDesigns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (designs.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Custom Orders</p>
            <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Designs</h2>
          </div>
          <Link href="/designs" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            Browse All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.slice(0, 8).map((design) => (
            <DesignCard
              key={design.id}
              image={design.images?.[0]}
              name={design.name}
              price={design.customerPrice}
              href={`/designs/${design.id}`}
              badge="Custom"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
