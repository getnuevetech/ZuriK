'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import type { Product } from '../../types';

interface FeaturedSection {
  id: string;
  title: string;
}

interface FeaturedData {
  section: FeaturedSection;
  products: Product[];
}

export function FeaturedProducts() {
  const [data, setData] = useState<FeaturedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageApi.getFeaturedProducts()
      .then((res) => setData(res))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const allProducts = data.flatMap((d) => d.products).slice(0, 12);
  const sectionTitle = data[0]?.section?.title ?? 'Featured Products';

  if (loading) {
    return (
      <section className="py-24 px-4 bg-white" aria-label="Featured products loading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-3 w-32 bg-neutral-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-neutral-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-80 bg-neutral-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="featured-products-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Handpicked for You</p>
          <h2 id="featured-products-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            {sectionTitle}
          </h2>
          <p className="text-neutral-500 text-base max-w-md mx-auto font-light">
            Curated selections from our finest designers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {allProducts.map((product) => {
            const imageUrl = product.images?.[0] ?? '';
            const shortDesc = product.description
              ? product.description.length > 60
                ? product.description.slice(0, 60) + '...'
                : product.description
              : '';
            const price = typeof product.customerPrice === 'number'
              ? `$${product.customerPrice.toFixed(2)}`
              : '';

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block relative overflow-hidden aspect-[3/4] bg-neutral-900"
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-bold text-white text-base leading-tight">{product.name}</div>
                  {price && <div className="text-white text-sm mt-1">{price}</div>}
                  {shortDesc && <div className="text-white/75 text-xs mt-1 font-light">{shortDesc}</div>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
