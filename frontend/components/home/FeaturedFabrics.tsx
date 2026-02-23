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
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🧵</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 text-sm leading-tight mb-1 line-clamp-1">{name}</h3>
        <PriceDisplay amount={price} className="text-indigo-600 font-bold text-sm" />
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
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Premium Materials</p>
            <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Fabrics</h2>
          </div>
          <Link href="/fabrics" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            Browse All →
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
