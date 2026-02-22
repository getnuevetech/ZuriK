'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { heroBannersApi, HeroBanner } from '../../lib/api';
import { Spinner } from '../ui/Spinner';

const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'default',
    title: 'Where African Fashion Meets the World',
    subtitle: 'Discover authentic designs, premium fabrics, and renowned artisans from across the African continent.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    mediaType: 'gradient',
    mediaUrl: '',
    sortOrder: 0,
    isActive: true,
  },
];

export function HeroBannerCarousel() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    heroBannersApi.listActive()
      .then((data) => setBanners(data.length > 0 ? data : DEFAULT_BANNERS))
      .catch(() => setBanners(DEFAULT_BANNERS))
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [banners.length, paused, next]);

  if (loading) {
    return (
      <div className="relative w-full h-screen min-h-[600px] bg-neutral-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const banner = banners[current];
  const overlayStyle = banner.overlayOpacity !== undefined
    ? { opacity: banner.overlayOpacity / 100 }
    : { opacity: 0.35 };

  const mediaUrl = (isMobile && banner.mobileMediaUrl) ? banner.mobileMediaUrl : banner.mediaUrl;

  return (
    <section
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero banner carousel"
    >
      {/* Background */}
      {mediaUrl && banner.mediaType !== 'gradient' ? (
        <>
          {banner.mediaType === 'video' ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              key={mediaUrl}
              src={mediaUrl}
              alt={banner.title}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black" style={overlayStyle} />
        </>
      ) : (
        <div className="absolute inset-0 bg-neutral-900">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-500 via-transparent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div
        key={banner.id}
        className={[
          'relative z-10 flex flex-col items-center justify-center h-full px-6 text-center',
          'transition-opacity duration-700',
          mounted ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <span className="inline-block text-secondary-400 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
          Premium African Fashion Marketplace
        </span>
        <h1
          className="font-heading text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6 max-w-5xl"
          style={{ color: banner.textColor || '#ffffff' }}
        >
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed text-white/70 font-light">
            {banner.subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {banner.ctaText && banner.ctaLink && (
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-neutral-900 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-100 transition-colors min-w-44 text-center"
            >
              {banner.ctaText}
            </Link>
          )}
          <Link
            href="/designers"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-white/60 text-white hover:border-white hover:bg-white/10 font-semibold text-sm uppercase tracking-widest transition-colors min-w-44 text-center"
          >
            Explore Designers
          </Link>
        </div>
      </div>

      {/* Navigation dots — minimal thin lines */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={[
                'h-0.5 transition-all duration-300',
                i === current ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70',
              ].join(' ')}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Previous banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Next banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
