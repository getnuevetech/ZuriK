import React from 'react';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { PromoBanner } from '../components/home/PromoBanner';
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

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroBannerCarousel />
      <ShopByCountry />
      <FeaturedReadyToWear />
      <FeaturedDesigns />
      <FeaturedReadyToWearSecondary />
      <FeaturedFabrics />
      <PromoBanner />
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