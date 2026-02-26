'use client';

import React, { useEffect, useState } from 'react';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { PromoBannerSlot } from '../components/home/PromoBannerSlot';
import { ShopByCountry } from '../components/home/ShopByCountry';
import { FeaturedReadyToWear } from '../components/home/FeaturedReadyToWear';
import { FeaturedDesigns } from '../components/home/FeaturedDesigns';
import { FeaturedReadyToWearSecondary } from '../components/home/FeaturedReadyToWearSecondary';
import { FeaturedFabrics } from '../components/home/FeaturedFabrics';
import { CategoryBanners } from '../components/home/CategoryBanners';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { TryOnShowcase } from '../components/home/TryOnShowcase';
import { HowItWorks } from '../components/home/HowItWorks';
import { DesignerSpotlight } from '../components/home/DesignerSpotlight';
import { CulturalHeritage } from '../components/home/CulturalHeritage';
import { Newsletter } from '../components/home/Newsletter';
import { homepageApi, PromoBanner } from '../lib/api';

export default function Home() {
  const [banners, setBanners] = useState<Record<string, PromoBanner | null>>({});

  useEffect(() => {
    homepageApi.getPromoBannersByLocation()
      .then(setBanners)
      .catch(() => setBanners({}));
  }, []);

  return (
    <div className="mueble-home min-h-screen">
      <HeroBannerCarousel />
      <section className="px-4 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto admin-surface px-8 py-8 md:px-10 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <p className="mueble-eyebrow mb-3">Curated marketplace</p>
              <h2 className="font-heading text-3xl md:text-4xl mueble-section-title mb-3">
                Contemporary African fashion with a gallery-like shopping experience.
              </h2>
              <p className="text-sm md:text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Inspired by Mueble&apos;s editorial ecommerce style, this storefront highlights craftsmanship,
                premium texture, and modern minimalism while keeping discovery fast across ready-to-wear,
                custom designs, and fabrics.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="mueble-card p-4 text-center">
                <p className="font-heading text-2xl text-[var(--color-primary)]">500+</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Designers</p>
              </div>
              <div className="mueble-card p-4 text-center">
                <p className="font-heading text-2xl text-[var(--color-primary)]">10k+</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Products</p>
              </div>
              <div className="mueble-card p-4 text-center">
                <p className="font-heading text-2xl text-[var(--color-primary)]">150+</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PromoBannerSlot banner={banners['AFTER_HERO']} />
      <ShopByCountry />
      <FeaturedReadyToWear />
      <PromoBannerSlot banner={banners['AFTER_RTW']} />
      <FeaturedDesigns />
      <FeaturedReadyToWearSecondary />
      <FeaturedFabrics />
      <PromoBannerSlot banner={banners['AFTER_FABRICS']} />
      <CategoryBanners />
      <TrendingProducts />
      <TryOnShowcase />
      <HowItWorks />
      <PromoBannerSlot banner={banners['AFTER_HOW_IT_WORKS']} />
      <DesignerSpotlight />
      <CulturalHeritage />
      <PromoBannerSlot banner={banners['AFTER_HERITAGE']} />
      <Newsletter />
    </div>
  );
}