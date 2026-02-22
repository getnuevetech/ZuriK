'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageApi } from '../../lib/api';
import type { Product } from '../../types';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Ready-to-Wear', value: 'ready-to-wear' },
  { label: 'Fabrics', value: 'fabrics' },
  { label: 'Custom Designs', value: 'custom-designs' },
];

const STATIC_TRENDING = [
  { id: 't1', name: 'Adire Silk Blouse', category: 'Ready-to-Wear', badge: 'Trending', badgeColor: 'bg-red-500', price: 185, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4bb7?w=600&q=80', designer: 'Amara Okafor', rating: 4.8, reviews: 92 },
  { id: 't2', name: 'Kente Wrap Dress', category: 'Ready-to-Wear', badge: 'Ready-to-Wear', badgeColor: 'bg-[#C97B3A]', price: 320, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', designer: 'Kwame Mensah', rating: 4.9, reviews: 145 },
  { id: 't3', name: 'Bespoke Ankara Suit', category: 'Custom Design', badge: 'Custom Design', badgeColor: 'bg-purple-600', price: 650, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', designer: 'Nia Johari', rating: 5.0, reviews: 34 },
  { id: 't4', name: 'Bogolan Jacket', category: 'Ready-to-Wear', badge: 'Trending', badgeColor: 'bg-red-500', price: 275, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', designer: 'Fatou Sow', rating: 4.7, reviews: 78 },
  { id: 't5', name: 'Ndop Print Set', category: 'Ready-to-Wear', badge: 'Ready-to-Wear', badgeColor: 'bg-[#C97B3A]', price: 410, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', designer: 'Amara Okafor', rating: 4.6, reviews: 113 },
  { id: 't6', name: 'Shweshwe Evening Gown', category: 'Custom Design', badge: 'Custom Design', badgeColor: 'bg-purple-600', price: 890, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', designer: 'Kwame Mensah', rating: 4.9, reviews: 27 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill={star <= Math.round(rating) ? '#C97B3A' : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TrendingProducts() {
  const [products, setProducts] = useState<typeof STATIC_TRENDING>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  const fetchProducts = useCallback((category: string) => {
    setLoading(true);
    homepageApi.getTrending(6)
      .then((data: Product[]) => {
        const filtered = category ? data.filter((p) => p.category === category) : data;
        if (filtered.length > 0) {
          setProducts(filtered.slice(0, 6).map((p, i) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Fashion',
            badge: i % 3 === 0 ? 'Trending' : i % 3 === 1 ? 'Ready-to-Wear' : 'Custom Design',
            badgeColor: i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-[#C97B3A]' : 'bg-purple-600',
            price: Number(p.price),
            image: (p.images as string[])?.[0] || STATIC_TRENDING[i % 6].image,
            designer: (p.designer as any)?.firstName || 'Designer',
            rating: 4.7,
            reviews: 80,
          })));
        } else {
          setProducts(STATIC_TRENDING);
        }
      })
      .catch(() => setProducts(STATIC_TRENDING))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-1.5 rounded-full mb-4">
              Curated Selection
            </span>
            <h2 id="trending-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              Trending Now
            </h2>
          </div>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                style={activeCategory === cat.value ? { backgroundColor: '#C97B3A' } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[3/4] mb-4" />
                <div className="bg-neutral-200 h-3 w-1/3 rounded mb-2" />
                <div className="bg-neutral-200 h-4 w-3/4 rounded mb-2" />
                <div className="bg-neutral-200 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                {/* Image with sharp corners */}
                <div className="relative overflow-hidden aspect-[3/4] bg-neutral-100 mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Badge overlay */}
                  <span className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    {product.badge}
                  </span>
                  {/* Heart icon */}
                  <button
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Add to wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-neutral-400 mb-1">{product.category}</div>
                <div className="font-semibold text-neutral-900 text-sm mb-2">{product.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-neutral-400">({product.reviews})</span>
                </div>
                <div className="font-bold text-neutral-900">${product.price.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#C97B3A] transition-colors">
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
