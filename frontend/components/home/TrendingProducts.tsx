'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import { ProductCard } from '../products/ProductCard';
import type { Product } from '../../types';

const PRODUCTS_LIMIT = 10;

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Ready-to-Wear', value: 'ready-to-wear' },
  { label: 'Fabrics', value: 'fabrics' },
  { label: 'Custom Designs', value: 'custom-designs' },
];

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-64 snap-start animate-pulse">
      <div className="bg-neutral-200 h-48 w-full mb-3" />
      <div className="px-1 space-y-2">
        <div className="bg-neutral-200 h-3 w-1/3 rounded" />
        <div className="bg-neutral-200 h-4 w-3/4 rounded" />
        <div className="bg-neutral-200 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    homepageApi.getTrending(10)
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Curated Selection</p>
            <h2 id="trending-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              Trending Now
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              View all →
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

        {/* Category tabs */}
        <div className="flex gap-0 border-b border-neutral-200 mb-10 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeCategory === cat.value
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product carousel */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm uppercase tracking-widest">No products found. Check back soon.</p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Right fade gradient */}
            <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        )}

        {/* Mobile "View all" link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/products"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest"
          >
            View all →
          </Link>
        </div>
      </div>
    </section>
  );
}
