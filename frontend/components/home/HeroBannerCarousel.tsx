'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { heroBannersApi, HeroBanner } from '../../lib/api';

const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'default',
    title: 'Where African Fashion Meets the World',
    subtitle: 'Discover authentic designs, premium fabrics, and renowned artisans from across the African continent. Premium quality, worldwide delivery.',
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
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
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
      <div className="relative w-full min-h-screen bg-[#1A1412] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C97B3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const banner = banners[current];
  const overlayStyle = banner.overlayOpacity !== undefined
    ? { opacity: banner.overlayOpacity / 100 }
    : { opacity: 0.5 };
  const mediaUrl = banner.mediaUrl;

  const titleParts = banner.title.split('Fashion');

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center"
      style={{ background: '#1A1412' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero banner carousel"
    >
      {/* Background */}
      {mediaUrl && banner.mediaType !== 'gradient' ? (
        <>
          {banner.mediaType === 'video' ? (
            <video key={mediaUrl} src={mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Image key={mediaUrl} src={mediaUrl} alt={banner.title} fill priority={current === 0} sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-[#1A1412]" style={overlayStyle} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1412 0%, #2c1a0e 50%, #1A1412 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #C97B3A, transparent 50%)' }} />
        </div>
      )}

      {/* Content */}
      <div
        key={banner.id}
        className={[
          'relative z-10 flex flex-col items-center justify-center text-center px-6 py-24',
          'transition-opacity duration-700',
          mounted ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        {/* Premium badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-2 rounded-full bg-[#C97B3A]/10">
            ✦ Premium African Fashion Marketplace
          </span>
        </div>

        {/* Main heading */}
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-5xl text-white">
          {titleParts.length > 1 ? (
            <>
              {titleParts[0]}<span style={{ color: '#C97B3A' }}>Fashion</span>{titleParts[1]}
            </>
          ) : (
            banner.title
          )}
        </h1>

        {banner.subtitle && (
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-white/60 font-light">
            {banner.subtitle}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {banner.ctaText && banner.ctaLink && (
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: '#C97B3A' }}
            >
              {banner.ctaText} →
            </Link>
          )}
          <Link
            href="/designers"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 font-semibold text-sm transition-colors"
          >
            ▶ Explore Designers
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 border-t border-white/10 pt-10">
          {[
            { value: '150', label: 'Countries' },
            { value: '500', label: 'Designers' },
            { value: '10K', label: 'Products' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white font-heading">
                {stat.value}<sup className="text-[#C97B3A] text-sm">+</sup>
              </div>
              <div className="text-white/50 text-xs uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={[
                'rounded-full transition-all duration-300',
                i === current ? 'w-6 h-2 bg-[#C97B3A]' : 'w-2 h-2 bg-white/30 hover:bg-white/60',
              ].join(' ')}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation */}
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/60 hover:text-white transition-colors" aria-label="Previous banner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/60 hover:text-white transition-colors" aria-label="Next banner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {/* AI Try-On floating badge */}
      <div className="absolute bottom-8 right-6 z-20">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-[#C97B3A] rounded-full animate-pulse" />
          AI Try-On
        </div>
      </div>
    </section>
  );
}
