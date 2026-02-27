'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { readyToWearApi } from '../../lib/api';
import type { ReadyToWearProduct } from '../../types/product';

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Kente Gown', category: 'Dresses', customerPrice: 450, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=533&fit=crop'], isNew: false },
  { id: '2', name: 'Ankara Set', category: 'Dresses', customerPrice: 295, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b7571?w=400&h=533&fit=crop'], isNew: true },
  { id: '3', name: 'Royal Dashiki', category: 'Dresses', customerPrice: 180, images: ['https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=400&h=533&fit=crop'], isNew: false },
  { id: '4', name: 'Emerald Caftan', category: 'Dresses', customerPrice: 380, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop'], isNew: false },
  { id: '5', name: 'Kitenge Fabric', category: 'Fabrics', customerPrice: 85, images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=533&fit=crop'], isNew: false },
  { id: '6', name: 'Headwrap Set', category: 'Accessories', customerPrice: 120, images: ['https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=400&h=533&fit=crop'], isNew: true },
  { id: '7', name: 'Boubou Gown', category: 'Dresses', customerPrice: 520, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop'], isNew: false },
  { id: '8', name: 'Wax Print Bundle', category: 'Fabrics', customerPrice: 150, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=533&fit=crop'], isNew: false },
];

type DisplayProduct = Pick<ReadyToWearProduct, 'id' | 'name' | 'category' | 'customerPrice' | 'images' | 'createdAt'> & { isNew?: boolean };

export function MuebleProducts() {
  const [products, setProducts] = useState<DisplayProduct[]>(FALLBACK_PRODUCTS as unknown as DisplayProduct[]);

  useEffect(() => {
    readyToWearApi.list({ limit: 8, sort: 'newest' })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          setProducts(
            res.items.map((p) => ({ ...p, isNew: new Date(p.createdAt) > cutoff }))
          );
        }
      })
      .catch(() => {/* fall back to static data */});
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Latest products added
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="group bg-white hover:-translate-y-1 transition-transform duration-300">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.images?.[0] ?? '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-[#00c853] text-white text-xs px-2 py-1">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs uppercase tracking-wider text-gray-500">{product.category ?? 'Fashion'}</span>
                <h3 className="text-lg font-semibold text-[#1a237e] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {product.name}
                </h3>
                <p className="text-gray-500 mt-1 text-sm">$ {(product.customerPrice ?? 0).toFixed(2)} USD</p>
                <Link
                  href={`/ready-to-wear/${product.id}`}
                  className="inline-block mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors"
                >
                  View more
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-block text-[#1a237e] hover:text-[#00c853] transition-colors underline underline-offset-4"
          >
            view all products
          </Link>
        </div>
      </div>
    </section>
  );
}
