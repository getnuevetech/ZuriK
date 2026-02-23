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

const DEMO_DESIGNS: Design[] = [
  { id: 'demo-design-1', name: 'Custom Dashiki Suit', description: '', customerPrice: 350, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-2', name: 'Bespoke Agbada Set', description: '', customerPrice: 500, images: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-3', name: 'Tailored Ankara Gown', description: '', customerPrice: 280, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-4', name: 'Royal Kente Ensemble', description: '', customerPrice: 650, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-5', name: 'Modern Aso Ebi', description: '', customerPrice: 420, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-6', name: 'Couture Boubou', description: '', customerPrice: 380, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-7', name: 'Silk Kaftan Design', description: '', customerPrice: 300, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
  { id: 'demo-design-8', name: 'Embroidered Senegalese Set', description: '', customerPrice: 450, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'], isActive: true, createdAt: '', updatedAt: '' },
];

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

  const displayDesigns = designs.length > 0 ? designs : DEMO_DESIGNS;

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
          {displayDesigns.slice(0, 8).map((design) => (
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
