import React from 'react';
import Link from 'next/link';

const images = [
  { bg: 'from-orange-300 to-orange-500', emoji: '👗' },
  { bg: 'from-purple-300 to-purple-500', emoji: '🧵' },
  { bg: 'from-green-300 to-green-500', emoji: '👒' },
  { bg: 'from-blue-300 to-blue-500', emoji: '✨' },
  { bg: 'from-red-300 to-red-500', emoji: '🌍' },
];

export function MuebleInstagram() {
  return (
    <section className="py-16 lg:py-24">
      <div className="w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-xs uppercase tracking-wider text-gray-500">—Instagram</span>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide">
          {images.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-64 h-64 relative group">
              <div className={`w-full h-full bg-gradient-to-br ${item.bg} flex items-center justify-center text-5xl`}>
                {item.emoji}
              </div>
              <div className="absolute inset-0 bg-[#1a237e]/0 group-hover:bg-[#1a237e]/30 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-3xl">📷</span>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <Link href="#" className="inline-flex items-center gap-2 text-[#1a237e] hover:text-[#00c853] transition-colors">
            <span className="text-sm">— Follow us</span>
            <span className="font-semibold">@AfricanFashion</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
