'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const heroProducts = [
  { id: 1, name: 'Kente Gown', price: 450, image: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=96&h=96&fit=crop' },
  { id: 2, name: 'Ankara Set', price: 295, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f8f?w=96&h=96&fit=crop' },
  { id: 3, name: 'Dashiki', price: 180, image: 'https://images.unsplash.com/photo-1627225793904-a9f0c6b50d2a?w=96&h=96&fit=crop' },
];

export function MuebleHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="relative">
      {/* Full-width hero image */}
      <div className="relative w-full h-[500px] lg:h-[680px] bg-[#1a237e]/10">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&h=700&fit=crop"
          alt="African Fashion Collection"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Overlay card */}
        <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 transform -translate-y-1/2 bg-white p-6 sm:p-8 max-w-xs sm:max-w-sm shadow-xl">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1a237e] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
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

      {/* Product list overlay */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-500">Featured</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)}
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroProducts.length)}
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                aria-label="Next product"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide">
            {heroProducts.map((product, index) => (
              <div
                key={product.id}
                className={`flex items-center gap-3 min-w-[200px] p-2 border-b-2 transition-all cursor-pointer ${
                  index === currentSlide ? 'border-[#1a237e]' : 'border-transparent'
                }`}
                onClick={() => setCurrentSlide(index)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-medium text-[#1a237e]">{product.name}</p>
                  <p className="text-sm text-gray-500">$ {product.price}.00 USD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
