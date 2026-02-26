'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fabricsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Fabric } from '../../types';

interface CardProps {
  image?: string;
  name: string;
  price: number;
  href: string;
}

function FabricCard({ image, name, price, href }: CardProps) {
  return (
    <Link href={href} className="group block bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-300" style={{ borderColor: 'var(--color-border)' }}>
      <div className="aspect-[3/4] overflow-hidden relative rounded-t-xl">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-surface)' }}>🧵</div>
        )}
        {/* Wishlist heart */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-neutral-900 text-sm leading-tight mb-1 truncate">{name}</h3>
        <span style={{ color: 'var(--color-primary)' }}>
          <PriceDisplay amount={price} className="font-semibold text-base" />
        </span>
        <button
          className="mt-3 w-full py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

const DEMO_FABRICS: Fabric[] = [
  { id: 'demo-fabric-1', name: 'Ankara Wax Print - Blue', description: '', customerPrice: 25, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'], isActive: true, stock: 50, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-2', name: 'Kente Cloth - Gold', description: '', customerPrice: 45, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'], isActive: true, stock: 30, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-3', name: 'Adire Indigo Cotton', description: '', customerPrice: 30, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80'], isActive: true, stock: 40, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-4', name: 'Bogolan Mud Cloth', description: '', customerPrice: 35, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'], isActive: true, stock: 25, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-5', name: 'Kitenge Print - Sunset', description: '', customerPrice: 20, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'], isActive: true, stock: 60, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-6', name: 'Aso Oke Handwoven', description: '', customerPrice: 55, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80'], isActive: true, stock: 15, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-7', name: 'Shweshwe Three Cats', description: '', customerPrice: 18, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'], isActive: true, stock: 45, createdAt: '', updatedAt: '' },
  { id: 'demo-fabric-8', name: 'Batik Print - Earth', description: '', customerPrice: 22, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80'], isActive: true, stock: 35, createdAt: '', updatedAt: '' },
];

export function FeaturedFabrics() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fabricsApi.featured()
      .then((data) => setFabrics(data))
      .catch(() => setFabrics([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  const displayFabrics = fabrics.length > 0 ? fabrics : DEMO_FABRICS;

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Premium Materials</p>
            <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Fabrics</h2>
            <div className="mt-2 h-1 w-12 rounded" style={{ backgroundColor: 'var(--color-secondary)' }} />
          </div>
          <Link href="/fabrics" className="hidden md:inline text-sm font-semibold uppercase tracking-wider transition-colors hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayFabrics.slice(0, 8).map((fabric) => (
            <FabricCard
              key={fabric.id}
              image={fabric.images?.[0]}
              name={fabric.name}
              price={fabric.customerPrice}
              href={`/fabrics/${fabric.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
