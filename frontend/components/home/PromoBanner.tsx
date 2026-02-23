'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import type { PromoBanner as PromoBannerType } from '../../lib/api';

const DEFAULT_BANNER: PromoBannerType = {
  id: 'default',
  title: 'New Season Collection',
  subtitle: 'Discover authentic African fashion from 500+ designers across the continent',
  ctaText: 'Shop Now →',
  ctaLink: '/products',
  imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80',
  displayOrder: 0,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

export function PromoBanner() {
  const [banner, setBanner] = useState<PromoBannerType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageApi.getPromoBanners()
      .then((banners) => setBanner(banners[0] ?? null))
      .catch(() => setBanner(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full aspect-[16/5] bg-neutral-200 animate-pulse" aria-label="Promotional banner loading" />
    );
  }

  const displayBanner = banner ?? DEFAULT_BANNER;

  return (
    <section className="relative w-full aspect-[16/5] overflow-hidden" aria-label={displayBanner.title}>
      <Image
        src={displayBanner.imageUrl}
        alt={displayBanner.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
          {displayBanner.title}
        </h2>
        {displayBanner.subtitle && (
          <p className="text-white/85 text-base md:text-lg max-w-xl mb-6 font-light">
            {displayBanner.subtitle}
          </p>
        )}
        {displayBanner.ctaText && displayBanner.ctaLink && (
          <Link
            href={displayBanner.ctaLink}
            className="inline-block border border-white text-white px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-colors"
          >
            {displayBanner.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
