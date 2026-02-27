'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageApi } from '../../lib/api';
import type { Product } from '../../types';

const STATIC_PRODUCTS = [
  {
    id: 'static-1',
    name: 'Royal Kente Gown',
    designer: 'Kwame Mensah',
    price: 425,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4bb7?w=600&q=80',
    rating: 4.8,
    reviews: 124,
    category: 'Ready-to-Wear',
  },
  {
    id: 'static-2',
    name: 'Emerald Caftan',
    designer: 'Fatou Sow',
    price: 380,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    rating: 4.9,
    reviews: 87,
    category: 'Custom Design',
  },
  {
    id: 'static-3',
    name: 'Ankara Maxi Set',
    designer: 'Amara Okafor',
    price: 295,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
    rating: 4.7,
    reviews: 203,
    category: 'Ready-to-Wear',
  },
  {
    id: 'static-4',
    name: 'Royal Dashiki',
    designer: 'Nia Johari',
    price: 480,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    rating: 5.0,
    reviews: 56,
    category: 'Custom Design',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill={star <= Math.round(rating) ? '#C97B3A' : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageApi.getFeaturedProducts()
      .then((res: Array<{ items?: Product[]; products?: Product[] }>) => {
        const products: Product[] = [];
        res.forEach((section) => {
          const sectionItems = Array.isArray(section.items)
            ? section.items
            : Array.isArray(section.products)
              ? section.products
              : [];
          if (sectionItems.length > 0) {
            products.push(...sectionItems);
          }
        });
        setApiProducts(products.slice(0, 4));
      })
      .catch(() => setApiProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = apiProducts.length > 0
    ? apiProducts.map((p) => ({
        id: p.id,
        name: p.name,
        designer: (p.designer as any)?.firstName ? `${(p.designer as any).firstName} ${(p.designer as any).lastName || ''}`.trim() : 'Designer',
        price: Number(p.customerPrice),
        image: (p.images as string[])?.[0] || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
        rating: p.averageRating ?? 4.7,
        reviews: p.totalReviews ?? 50,
        category: p.category || 'Fashion',
      }))
    : STATIC_PRODUCTS;

  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="featured-products-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="inline-block border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-1.5 rounded-full mb-4">
              Hand-Picked for You
            </span>
            <h2 id="featured-products-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link href="/products" className="hidden md:inline text-sm font-medium text-[#C97B3A] hover:text-[#b06a2a] transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[3/4] mb-4" />
                <div className="bg-neutral-200 h-3 w-1/3 rounded mb-2" />
                <div className="bg-neutral-200 h-4 w-3/4 rounded mb-2" />
                <div className="bg-neutral-200 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                {/* Image with sharp corners */}
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Heart icon */}
                  <button
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Add to wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-neutral-400 mb-1">{product.category} · {product.designer}</div>
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

        <div className="mt-8 text-center md:hidden">
          <Link href="/products" className="text-sm font-medium text-[#C97B3A] hover:text-[#b06a2a] transition-colors">View All →</Link>
        </div>
      </div>
    </section>
  );
}
