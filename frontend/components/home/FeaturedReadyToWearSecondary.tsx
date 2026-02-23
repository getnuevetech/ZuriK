'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { readyToWearApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { PriceDisplay } from '../common/PriceDisplay';
import type { ReadyToWearProduct } from '../../types';

interface CardProps {
  image?: string;
  name: string;
  price: number;
  href: string;
  badge?: string;
}

function ProductCard({ image, name, price, href, badge }: CardProps) {
  return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
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

const DEMO_SECONDARY_PRODUCTS: ReadyToWearProduct[] = [
  { id: 'demo-rtw-s1', name: 'Printed Kaftan Dress', description: '', customerPrice: 95, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s2', name: 'Tie-Dye Boubou', description: '', customerPrice: 110, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s3', name: 'Embroidered Agbada', description: '', customerPrice: 220, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s4', name: 'Wax Print Co-ord Set', description: '', customerPrice: 130, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s5', name: 'Dashiki Shirt', description: '', customerPrice: 48, images: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s6', name: 'Batik Wrap Dress', description: '', customerPrice: 78, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s7', name: 'Iro and Buba Set', description: '', customerPrice: 160, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-s8', name: 'Indigo Linen Kaftan', description: '', customerPrice: 195, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
];

export function FeaturedReadyToWearSecondary() {
  const [products, setProducts] = useState<ReadyToWearProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readyToWearApi.featured()
      .then((data) => setProducts(data.slice(8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const displayProducts = products.length > 0 ? products : DEMO_SECONDARY_PRODUCTS;

  return (
    <section className="py-16 px-4 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">More Styles</p>
            <h2 className="font-heading text-3xl font-bold text-neutral-900">More Ready-to-Wear</h2>
          </div>
          <Link href="/ready-to-wear" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            Browse All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              image={product.images?.[0]}
              name={product.name}
              price={product.customerPrice}
              href={`/ready-to-wear/${product.id}`}
              badge="In Stock"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
