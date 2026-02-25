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
    <div className="min-h-screen">
      <HeroBannerCarousel />
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