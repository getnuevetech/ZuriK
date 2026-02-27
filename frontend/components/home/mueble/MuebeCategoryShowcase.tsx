'use client';

import React from 'react';
import Link from 'next/link';

export default function MuebeCategoryShowcase() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category 1 - Fabrics */}
          <div className="relative group overflow-hidden">
            <div
              className="aspect-[4/3] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <p className="text-6xl mb-4">🧵</p>
                  <p className="text-white/70 text-sm uppercase tracking-widest">Premium Collection</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8 transition-transform duration-300 group-hover:translate-y-0">
              <span className="text-xs uppercase tracking-widest text-gray-500">Fabrics</span>
              <h3
                className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                —Find authentic fabrics your wardrobe will love
              </h3>
              <Link
                href="/fabrics"
                className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4"
              >
                shop now
              </Link>
            </div>
          </div>

          {/* Category 2 - Dresses */}
          <div className="relative group overflow-hidden">
            <div
              className="aspect-[4/3] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <p className="text-6xl mb-4">👗</p>
                  <p className="text-white/70 text-sm uppercase tracking-widest">Ready to Wear</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8 transition-transform duration-300 group-hover:translate-y-0">
              <span className="text-xs uppercase tracking-widest text-gray-500">Dresses</span>
              <h3
                className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                —Top colors for our new season collection
              </h3>
              <Link
                href="/products"
                className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4"
              >
                shop now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
