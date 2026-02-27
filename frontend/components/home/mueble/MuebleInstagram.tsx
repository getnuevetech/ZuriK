'use client';

import React from 'react';

const images = [
  { bg: 'from-[#1a237e] to-[#283593]', emoji: '👗' },
  { bg: 'from-[#004d40] to-[#00695c]', emoji: '🧵' },
  { bg: 'from-[#b71c1c] to-[#c62828]', emoji: '🎨' },
  { bg: 'from-[#4a148c] to-[#6a1b9a]', emoji: '👑' },
  { bg: 'from-[#e65100] to-[#ef6c00]', emoji: '🌺' },
];

export default function MuebleInstagram() {
  return (
    <section className="py-16 lg:py-24">
      <div className="w-full">
        {/* Instagram label */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-xs uppercase tracking-widest text-gray-500">—Instagram</span>
        </div>

        {/* Image strip */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {images.map((img, index) => (
            <a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram post ${index + 1}`}
              className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 relative group"
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${img.bg} flex items-center justify-center`}
              >
                <span className="text-6xl">{img.emoji}</span>
              </div>
              <div className="absolute inset-0 bg-[#1a237e]/0 group-hover:bg-[#1a237e]/40 transition-colors flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Follow us */}
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
