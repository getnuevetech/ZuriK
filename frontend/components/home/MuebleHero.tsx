'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const heroProducts = [
  { id: 1, name: 'Kente Gown', price: 450, category: 'Dresses' },
  { id: 2, name: 'Ankara Set', price: 295, category: 'Dresses' },
  { id: 3, name: 'Royal Dashiki', price: 180, category: 'Dresses' },
];

export function MuebleHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="pt-[104px] relative">
      <div className="relative w-full h-[600px] lg:h-[700px] bg-gradient-to-r from-[#1a237e] to-[#3949ab]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a237e]/90 to-transparent" />

        {/* Overlay card */}
        <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 transform -translate-y-1/2 bg-white p-6 sm:p-8 max-w-sm shadow-xl z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a237e] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Discover our new Collection
          </h2>
          <p className="text-gray-600 mb-6">Shop from $49</p>
          <Link href="/products" className="inline-block bg-[#00c853] hover:bg-[#00b248] text-white px-6 py-3 font-medium transition-colors">
            Shop Now
          </Link>
        </div>

        {/* Product list overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gray-500">Featured Products</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentSlide((p) => (p - 1 + heroProducts.length) % heroProducts.length)}
                  className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentSlide((p) => (p + 1) % heroProducts.length)}
                  className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                  aria-label="Next"
                >
                  ›
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
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-lg">👗</div>
                  <div>
                    <p className="font-medium text-[#1a237e]">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price}.00 USD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
