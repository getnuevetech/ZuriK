'use client';

import React from 'react';
import { Store, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';

const features = [
  {
    Icon: Store,
    title: 'Great Prices',
    description: 'Authentic African fashion at fair prices',
  },
  {
    Icon: RotateCcw,
    title: 'Free Returns',
    description: 'Try it first or return it within 30 days',
  },
  {
    Icon: ShieldCheck,
    title: 'Safe Shopping',
    description: 'Powered by secure payment systems',
  },
  {
    Icon: ShoppingBag,
    title: 'Best Store',
    description: 'Curated collection from across Africa',
  },
];

export function MuebleFeatures() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200">
          {features.map(({ Icon, title, description }, index) => (
            <div
              key={index}
              className={`p-8 text-center bg-white ${
                index < features.length - 1
                  ? 'border-b sm:border-b-0 sm:border-r border-gray-200'
                  : ''
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1a237e]/10 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-[#1a237e]" />
              </div>
              <h3
                className="text-lg font-semibold text-[#1a237e]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
