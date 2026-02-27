'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const heroProducts = [
  { id: 1, name: 'Kente Gown', price: 450, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&h=200&fit=crop' },
  { id: 2, name: 'Ankara Set', price: 295, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b7571?w=200&h=200&fit=crop' },
  { id: 3, name: 'Royal Dashiki', price: 180, image: 'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=200&h=200&fit=crop' },
];

export function MuebleHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="relative">
      <div className="relative w-full h-[500px] lg:h-[650px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&h=900&fit=crop"
          alt="African Fashion Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Overlay card */}
        <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 transform -translate-y-1/2 bg-white p-6 sm:p-8 max-w-xs shadow-xl">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">New Collection 2026</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a237e] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Discover our new Collection
          </h2>
          <p className="text-gray-600 mb-6">Shop from $49</p>
          <Link
            href="/products"
            className="inline-block bg-[#00c853] hover:bg-[#00b248] text-white px-6 py-3 font-medium transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Product list strip */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-gray-500">Featured Products</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)}
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                aria-label="Previous"
              >
                &#8249;
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroProducts.length)}
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                aria-label="Next"
              >
                &#8250;
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {heroProducts.map((product, index) => (
              <div
                key={product.id}
                className={`flex items-center gap-3 min-w-[200px] p-2 border-b-2 transition-all cursor-pointer ${
                  index === currentSlide ? 'border-[#1a237e]' : 'border-transparent'
                }`}
                onClick={() => setCurrentSlide(index)}
              >
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1a237e] text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">$ {product.price}.00 USD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
