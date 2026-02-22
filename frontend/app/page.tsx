import React from 'react';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { PromoBanner } from '../components/home/PromoBanner';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { CategoryBanners } from '../components/home/CategoryBanners';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { TryOnShowcase } from '../components/home/TryOnShowcase';
import { HowItWorks } from '../components/home/HowItWorks';
import { DesignerSpotlight } from '../components/home/DesignerSpotlight';
import { CulturalHeritage } from '../components/home/CulturalHeritage';
import { Newsletter } from '../components/home/Newsletter';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroBannerCarousel />
      <PromoBanner />
      <FeaturedProducts />
      <CategoryBanners />
      <TrendingProducts />
      <TryOnShowcase />
      <HowItWorks />
      <DesignerSpotlight />
      <CulturalHeritage />
      <Newsletter />
    </div>
  );
}
