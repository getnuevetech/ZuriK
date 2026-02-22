import React from 'react';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { ShopByCountry } from '../components/home/ShopByCountry';
import { PromoBanner } from '../components/home/PromoBanner';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { CategoryBanners } from '../components/home/CategoryBanners';
import { CollectionPosts } from '../components/home/CollectionPosts';
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
      <PromoBanner />
      <FeaturedProducts />
      <CategoryBanners />
      <CollectionPosts />
      <TrendingProducts />
      <TryOnShowcase />
      <HowItWorks />
      <DesignerSpotlight />
      <CulturalHeritage />
      <Newsletter />
    </div>
  );
}