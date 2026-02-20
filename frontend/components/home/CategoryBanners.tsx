'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Ready-to-Wear',
    subtitle: 'Curated African Fashion, Ready to Ship',
    href: '/products',
    gradient: 'from-primary-700 to-primary-950',
    icon: '👗',
    cta: 'Shop Now',
  },
  {
    title: 'Premium Fabrics',
    subtitle: 'Authentic African Textiles from Across the Continent',
    href: '/fabrics',
    gradient: 'from-secondary-600 to-secondary-900',
    icon: '🧵',
    cta: 'Browse Fabrics',
  },
  {
    title: 'Custom Designs',
    subtitle: 'Your Body. Your Fabric. Your Style.',
    href: '/orders/custom-design',
    gradient: 'from-accent-600 to-accent-950',
    icon: '✂️',
    cta: 'Start Designing',
  },
  {
    title: 'Meet Our Designers',
    subtitle: 'Artisans Keeping African Tradition Alive',
    href: '/designers',
    gradient: 'from-emerald-700 to-teal-950',
    icon: '🎨',
    cta: 'Explore Designers',
  },
];

export function CategoryBanners() {
  return (
    <section className="py-20 px-4 bg-neutral-50" aria-labelledby="category-banners-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="category-banners-heading" className="font-heading text-4xl font-bold text-neutral-900 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            From ready-to-wear to custom-made, discover fashion that celebrates African heritage
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`
                group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.gradient}
                p-10 min-h-[240px] flex flex-col justify-between
                hover:shadow-2xl transition-all duration-300
              `}
            >
              {/* Background pattern overlay */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />

              <div className="relative z-10">
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="font-heading text-2xl font-bold text-white mb-2">{cat.title}</h3>
                <p className="text-white/80 text-base max-w-xs">{cat.subtitle}</p>
              </div>

              <div className="relative z-10 mt-6">
                <span className="inline-flex items-center gap-2 bg-white/20 group-hover:bg-white/30 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
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
