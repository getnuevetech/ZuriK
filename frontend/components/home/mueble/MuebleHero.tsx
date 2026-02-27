'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const heroProducts = [
  { id: 1, name: 'Kente Gown', price: 450, href: '/products' },
  { id: 2, name: 'Ankara Set', price: 295, href: '/products' },
  { id: 3, name: 'Royal Dashiki', price: 180, href: '/products' },
];

export default function MuebleHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);

  return (
    <section className="relative">
      {/* Full-width hero */}
      <div
        className="relative w-full h-[560px] lg:h-[680px] bg-[#1a237e] flex items-center"
        style={{
          background: 'linear-gradient(135deg, #0d1450 0%, #1a237e 40%, #283593 70%, #1a237e 100%)',
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Overlay card */}
        <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 transform -translate-y-1/2 bg-white p-6 sm:p-8 max-w-xs sm:max-w-sm shadow-xl z-10">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">New Collection</p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a237e] mb-2 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Discover our new Collection
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Authentic African fashion crafted with love
          </p>
          <p className="text-2xl font-bold text-[#1a237e] mb-4">From $49</p>
          <Link
            href="/products"
            className="inline-block bg-[#00c853] hover:bg-[#00b248] text-white px-6 py-3 font-medium transition-colors text-sm"
          >
            Shop Now
          </Link>
        </div>

        {/* Right side text */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:block text-right">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Premium Quality</p>
          <h3
            className="text-white text-4xl xl:text-5xl font-bold leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            African Fashion
            <br />
            <span className="text-[#00c853]">Marketplace</span>
          </h3>
          <p className="text-white/60 mt-4 text-sm max-w-xs ml-auto">
            Connecting African designers, fabric sellers, and fashion lovers worldwide.
          </p>
        </div>
      </div>

      {/* Product list overlay */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-gray-500">Featured Products</span>
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                aria-label="Previous product"
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next product"
                className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {heroProducts.map((product, index) => (
              <Link
                key={product.id}
                href={product.href}
                className={`flex items-center gap-3 min-w-[180px] sm:min-w-[200px] p-2 border-b-2 transition-all cursor-pointer hover:border-[#00c853] ${
                  index === currentSlide ? 'border-[#1a237e]' : 'border-transparent'
                }`}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="w-12 h-12 bg-gray-100 flex-shrink-0 flex items-center justify-center text-[#1a237e] text-xs font-bold">
                  AF
                </div>
                <div>
                  <p className="font-medium text-[#1a237e] text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price}.00 USD</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
