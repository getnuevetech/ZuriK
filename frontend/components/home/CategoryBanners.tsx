'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageApi } from '../../lib/api';

interface CollectionCard {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  ctaText: string | null;
  ctaLink: string | null;
}

const FALLBACK_COLLECTIONS = [
  {
    id: 'c1',
    name: 'Ready-to-Wear',
    description: 'Curated African Fashion, Ready to Ship. Discover our handpicked selection of premium ready-to-wear pieces.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    ctaText: 'Shop Now →',
    ctaLink: '/products',
  },
  {
    id: 'c2',
    name: 'Premium Fabrics',
    description: 'Authentic African Textiles from the finest craftspeople across the continent.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ctaText: 'Browse Fabrics →',
    ctaLink: '/fabrics',
  },
  {
    id: 'c3',
    name: 'Custom Designs',
    description: 'Your Body, Your Fabric, Your Style. Work with top designers to create something uniquely yours.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    ctaText: 'Start Designing →',
    ctaLink: '/orders/custom-design',
  },
];

export function CategoryBanners() {
  const [cards, setCards] = useState<CollectionCard[]>([]);

  useEffect(() => {
    homepageApi.getCollections()
      .then((data: CollectionCard[]) => {
        if (data && data.length > 0) setCards(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const displayCards = cards.length > 0 ? cards : FALLBACK_COLLECTIONS;

  return (
    <section className="py-24 px-4" style={{ backgroundColor: 'var(--color-surface)' }} aria-labelledby="collections-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block border text-xs font-medium px-4 py-1.5 rounded-full mb-4" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
            Collections
          </span>
          <h2 id="collections-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-2">
            Explore Our Collections
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded" style={{ backgroundColor: 'var(--color-secondary)' }} />
          <p className="text-neutral-500 text-base max-w-md mx-auto font-light mt-4">
            From ready-to-wear to custom-made, discover fashion celebrating African heritage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCards.map((card, idx) => (
            <Link
              key={card.id}
              href={card.ctaLink || '/products'}
              className="group relative overflow-hidden flex flex-col justify-end aspect-[3/4]"
            >
              {/* Background image */}
              {card.image ? (
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-primary)' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Numbered icon at top */}
              <div className="absolute top-6 left-6 z-10">
                <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold text-sm">
                  {String(idx + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Content at bottom */}
              <div className="relative z-10 p-8">
                <h3 className="font-heading text-2xl font-bold text-white mb-2">{card.name}</h3>
                {card.description && (
                  <p className="text-white/70 text-sm font-light mb-4 max-w-xs">{card.description}</p>
                )}
                <span className="text-sm font-semibold group-hover:underline" style={{ color: 'var(--color-secondary)' }}>
                  {card.ctaText || 'Explore →'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
