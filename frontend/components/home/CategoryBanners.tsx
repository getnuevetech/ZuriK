'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Ready-to-Wear',
    subtitle: 'Curated African Fashion, Ready to Ship',
    href: '/products',
    bg: 'bg-neutral-900',
    cta: 'Shop Now',
  },
  {
    title: 'Premium Fabrics',
    subtitle: 'Authentic African Textiles from Across the Continent',
    href: '/fabrics',
    bg: 'bg-secondary-600',
    cta: 'Browse Fabrics',
  },
  {
    title: 'Custom Designs',
    subtitle: 'Your Body. Your Fabric. Your Style.',
    href: '/orders/custom-design',
    bg: 'bg-neutral-700',
    cta: 'Start Designing',
  },
  {
    title: 'Meet Our Designers',
    subtitle: 'Artisans Keeping African Tradition Alive',
    href: '/designers',
    bg: 'bg-neutral-800',
    cta: 'Explore Designers',
  },
];

export function CategoryBanners() {
  return (
    <section className="py-24 px-4 bg-white" aria-labelledby="category-banners-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">Collections</p>
          <h2 id="category-banners-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            Explore Our Collections
          </h2>
          <p className="text-neutral-500 text-base max-w-md mx-auto font-light">
            From ready-to-wear to custom-made, discover fashion that celebrates African heritage
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative overflow-hidden ${cat.bg} p-10 min-h-[220px] flex flex-col justify-between transition-opacity hover:opacity-95`}
            >
              <div>
                <h3 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">{cat.title}</h3>
                <p className="text-white/70 text-sm font-light max-w-xs">{cat.subtitle}</p>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 text-white text-sm font-semibold uppercase tracking-wider border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                  {cat.cta}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
