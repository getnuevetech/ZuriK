'use client';

import React from 'react';

const images = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1594938298603-c8148c4b7571?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
];

export function MuebleInstagram() {
  return (
    <section className="py-16 lg:py-24">
      <div className="w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-xs uppercase tracking-wider text-gray-500">—Instagram</span>
        </div>

        <div className="flex overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 relative group cursor-pointer">
              <img
                src={image}
                alt={`Instagram ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#1a237e]/0 group-hover:bg-[#1a237e]/30 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#1a237e] hover:text-[#00c853] transition-colors"
          >
            <span className="text-sm">— Follow us</span>
            <span className="font-semibold">@AfricanFashion</span>
          </a>
        </div>
      </div>
    </section>
  );
}
