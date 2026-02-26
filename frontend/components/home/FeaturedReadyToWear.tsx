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
    <Link href={href} className="group mueble-card block overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/5] overflow-hidden relative rounded-t-2xl">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-surface)' }}>👗</div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 text-[var(--color-primary-dark)] text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f5d2a5] uppercase tracking-widest">
            {badge}
          </span>
        )}
        {/* Wishlist heart */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="font-medium text-neutral-900 text-sm leading-tight mb-1 truncate">{name}</h3>
        <span style={{ color: 'var(--color-primary-dark)' }}>
          <PriceDisplay amount={price} className="font-semibold text-base" />
        </span>
        <button
          className="mt-3 w-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white rounded-lg transition-all hover:opacity-95"
          style={{ backgroundColor: 'var(--color-primary-dark)' }}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

const DEMO_PRODUCTS: ReadyToWearProduct[] = [
  { id: 'demo-rtw-1', name: 'Ankara Maxi Dress', description: '', customerPrice: 85, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-2', name: 'Kente Print Blazer', description: '', customerPrice: 145, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-3', name: 'Dashiki Tunic', description: '', customerPrice: 55, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-4', name: 'Adire Wrap Skirt', description: '', customerPrice: 65, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-5', name: 'Bogolan Jacket', description: '', customerPrice: 175, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-6', name: 'Kitenge Jumpsuit', description: '', customerPrice: 120, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-7', name: 'Aso Oke Blouse', description: '', customerPrice: 45, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
  { id: 'demo-rtw-8', name: 'Shweshwe Midi Dress', description: '', customerPrice: 250, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'], isActive: true, stock: 10, createdAt: '', updatedAt: '' },
];

export function FeaturedReadyToWear() {
  const [products, setProducts] = useState<ReadyToWearProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readyToWearApi.featured()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;

  return (
    <section className="py-20 px-4" style={{ backgroundColor: '#f9f5ef' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="mueble-eyebrow mb-2">Ships immediately</p>
            <h2 className="font-heading text-3xl font-semibold mueble-section-title">Featured Ready-to-Wear</h2>
            <div className="mt-3 h-1 w-14 rounded" style={{ backgroundColor: 'var(--color-secondary)' }} />
          </div>
          <Link href="/ready-to-wear" className="hidden md:inline mueble-link transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.slice(0, 12).map((product) => (
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
