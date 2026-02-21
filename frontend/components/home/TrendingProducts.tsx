'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import { ProductCard } from '../products/ProductCard';
import { Spinner } from '../ui/Spinner';
import type { Product } from '../../types';

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    homepageApi.getTrending(10)
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Curated Selection</p>
            <h2 id="trending-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              Trending Now
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-4">
              View all
            </Link>
            <div className="hidden md:flex gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-2 border border-neutral-200 hover:border-neutral-900 hover:text-neutral-900 text-neutral-400 transition-colors"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 border border-neutral-200 hover:border-neutral-900 hover:text-neutral-900 text-neutral-400 transition-colors"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm uppercase tracking-widest">No products yet. Check back soon.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-64 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
