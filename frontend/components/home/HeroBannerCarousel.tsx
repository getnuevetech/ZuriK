'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      <div className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-primary-950 via-primary-900 to-accent-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const banner = banners[current];
  const overlayStyle = banner.overlayOpacity !== undefined
    ? { opacity: banner.overlayOpacity / 100 }
    : { opacity: 0.5 };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mediaUrl = (isMobile && banner.mobileMediaUrl) ? banner.mobileMediaUrl : banner.mediaUrl;

  return (
    <section
      className="relative w-full h-[70vh] min-h-[500px] overflow-hidden"
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black" style={overlayStyle} />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-accent-900">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-400 via-transparent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <span className="inline-block bg-secondary-500/20 text-secondary-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-secondary-500/30">
          Premium African Fashion Marketplace
        </span>
        <h1
          className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ color: banner.textColor || '#ffffff' }}
        >
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-neutral-200">
            {banner.subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {banner.ctaText && banner.ctaLink && (
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center justify-center px-8 py-3 bg-secondary-500 hover:bg-secondary-400 text-white font-semibold rounded-xl transition-colors min-w-40 text-center"
            >
              {banner.ctaText}
            </Link>
          )}
          <Link
            href="/designers"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/60 text-white hover:bg-white/10 font-semibold rounded-xl transition-colors min-w-40 text-center"
          >
            Explore Designers
          </Link>
        </div>
      </div>

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={[
                'w-2.5 h-2.5 rounded-full transition-all',
                i === current ? 'bg-secondary-400 w-6' : 'bg-white/50 hover:bg-white/80',
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Previous banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Next banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
