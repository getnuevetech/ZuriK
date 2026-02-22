'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import { ProductCard } from '../products/ProductCard';
import { Spinner } from '../ui/Spinner';
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

  const activeSections = data.filter((item) => item.products.length > 0);
  const showSectionTitles = activeSections.length > 1;

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="featured-products-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Hand-Picked for You</p>
            <h2 id="featured-products-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : data.every((d) => d.products.length === 0) ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm uppercase tracking-widest">No featured products at the moment. Check back soon.</p>
          </div>
        ) : (
          activeSections.map((item) => (
            <div key={item.section.id} className="mb-12 last:mb-0">
              {showSectionTitles && (
                <h3 className="text-xl font-semibold text-neutral-800 mb-6">{item.section.title}</h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {item.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/products"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest"
          >
            View All →
          </Link>
        </div>
      </div>
    </section>
  );
}
