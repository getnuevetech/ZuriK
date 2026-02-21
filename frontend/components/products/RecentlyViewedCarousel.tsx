'use client';

import React, { useRef } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/Button';
import type { Product } from '../../types';

interface RecentlyViewedCarouselProps {
  products: Product[];
  title?: string;
  onClear?: () => void;
}

export function RecentlyViewedCarousel({
  products,
  title = 'Recently Viewed',
  onClear,
}: RecentlyViewedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-bold text-neutral-900">{title}</h2>
        {onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear History
          </Button>
        )}
      </div>

      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          ‹
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-56">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          ›
        </button>
      </div>
    </div>
  );
}
