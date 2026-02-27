'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { heroBannersApi, homepageApi, HeroBanner } from '../../lib/api';

interface HeroStat {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
}

const FALLBACK_STATS: HeroStat[] = [
  { id: 'countries', value: '150', label: 'Countries', displayOrder: 0, isActive: true },
  { id: 'designers', value: '500', label: 'Designers', displayOrder: 1, isActive: true },
  { id: 'products', value: '10K', label: 'Products', displayOrder: 2, isActive: true },
];

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
  const [stats, setStats] = useState<HeroStat[]>(FALLBACK_STATS);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      heroBannersApi.listActive(),
      homepageApi.getHeroStats(),
    ])
      .then(([bannersResult, statsResult]) => {
        if (bannersResult.status === 'fulfilled' && bannersResult.value.length > 0) {
          setBanners(bannersResult.value);
        } else {
          if (bannersResult.status === 'rejected') {
            console.error('[HeroBanner] Failed to fetch banners:', bannersResult.reason);
          }
          setBanners(DEFAULT_BANNERS);
        }

        if (statsResult.status === 'fulfilled' && statsResult.value.length > 0) {
          setStats(statsResult.value);
        } else if (statsResult.status === 'rejected') {
          console.error('[HeroBanner] Failed to fetch hero stats:', statsResult.reason);
        }
      })
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
      <div className="relative w-full min-h-[92vh] flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-secondary)', borderTopColor: 'transparent' }} />
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
      className="relative w-full min-h-[92vh] overflow-hidden flex flex-col justify-center"
      style={{ backgroundColor: 'var(--color-primary-dark)' }}
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
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-primary)', ...overlayStyle }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(122deg, #111a2f 0%, #1c2b4f 42%, #253c72 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 72% 26%, #C88B49, transparent 52%)' }} />
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
          <span className="inline-flex items-center gap-2 border text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm" style={{ borderColor: 'rgba(255,255,255,0.28)', color: '#f5dcc0', backgroundColor: 'rgba(17,27,49,0.45)' }}>
            ✦ New seasonal edit
          </span>
        </div>

        {/* Main heading */}
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] mb-6 max-w-5xl text-white">
          {titleParts.length > 1 ? (
            <>
              {titleParts[0]}<span style={{ color: '#f5d2a5' }}>Fashion</span>{titleParts[1]}
            </>
          ) : (
            banner.title
          )}
        </h1>

        {banner.subtitle && (
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-white/75 font-light">
            {banner.subtitle}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {banner.ctaText && banner.ctaLink && (
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#f5d2a5', color: '#182642' }}
            >
              {banner.ctaText} →
            </Link>
          )}
          <Link
            href="/designers"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-white/30 text-white hover:bg-white/10 font-semibold text-sm transition-colors backdrop-blur-sm"
          >
            Explore Designers
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 border-t border-white/20 pt-10">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-3xl font-bold text-white font-heading">
                {stat.value}<sup className="text-sm" style={{ color: '#f5d2a5' }}>+</sup>
              </div>
              <div className="text-white/70 text-xs uppercase tracking-[0.2em] mt-1">{stat.label}</div>
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
              className="rounded-full transition-all duration-300"
              style={i === current ? { width: '1.5rem', height: '0.5rem', backgroundColor: '#f5d2a5' } : { width: '0.5rem', height: '0.5rem', backgroundColor: 'rgba(255,255,255,0.35)' }}
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
        <div className="bg-[#111b31]/55 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-xs font-medium flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f5d2a5' }} />
          AI Try-On
        </div>
      </div>
    </section>
  );
}
