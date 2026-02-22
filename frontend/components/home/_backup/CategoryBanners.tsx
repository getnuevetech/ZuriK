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

const FALLBACK_CATEGORIES: CollectionCard[] = [
  {
    id: 'fallback-1',
    name: 'Ready-to-Wear',
    description: 'Curated African Fashion, Ready to Ship',
    image: null,
    ctaText: 'Shop Now',
    ctaLink: '/products',
  },
  {
    id: 'fallback-2',
    name: 'Premium Fabrics',
    description: 'Authentic African Textiles from Across the Continent',
    image: null,
    ctaText: 'Browse Fabrics',
    ctaLink: '/fabrics',
  },
  {
    id: 'fallback-3',
    name: 'Custom Designs',
    description: 'Your Body. Your Fabric. Your Style.',
    image: null,
    ctaText: 'Start Designing',
    ctaLink: '/orders/custom-design',
  },
  {
    id: 'fallback-4',
    name: 'Meet Our Designers',
    description: 'Artisans Keeping African Tradition Alive',
    image: null,
    ctaText: 'Explore Designers',
    ctaLink: '/designers',
  },
];

const FALLBACK_BG_COLORS = ['bg-neutral-900', 'bg-secondary-600', 'bg-neutral-700', 'bg-neutral-800'];

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden min-h-[320px] bg-neutral-200 animate-pulse" />
  );
}

export function CategoryBanners() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageApi
      .getCollections()
      .then((data: CollectionCard[]) => {
        setCards(data.slice(0, 4));
      })
      .catch((err) => {
        console.error('Failed to fetch collections:', err);
        setCards([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayCards = cards.length > 0 ? cards : FALLBACK_CATEGORIES;

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
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : displayCards.map((card, idx) => {
                const href = card.ctaLink || '/products';
                const cta = card.ctaText || 'Explore';
                return (
                  <Link
                    key={card.id}
                    href={href}
                    className="group relative overflow-hidden min-h-[320px] flex flex-col justify-end p-10"
                  >
                    {card.image ? (
                      <Image
                        src={card.image}
                        alt={`${card.name} collection banner`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className={`absolute inset-0 ${FALLBACK_BG_COLORS[idx % FALLBACK_BG_COLORS.length]}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">{card.name}</h3>
                      {card.description && (
                        <p className="text-white/70 text-sm font-light max-w-xs mb-6">{card.description}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-white text-sm font-semibold uppercase tracking-wider border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                        {cta}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
