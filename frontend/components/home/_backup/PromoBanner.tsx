'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';
import type { PromoBanner as PromoBannerType } from '../../lib/api';

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

  if (!banner) {
    return null;
  }

  return (
    <section className="relative w-full aspect-[16/5] overflow-hidden" aria-label={banner.title}>
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="text-white/85 text-base md:text-lg max-w-xl mb-6 font-light">
            {banner.subtitle}
          </p>
        )}
        {banner.ctaText && banner.ctaLink && (
          <Link
            href={banner.ctaLink}
            className="inline-block border border-white text-white px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-colors"
          >
            {banner.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
