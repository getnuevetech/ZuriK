import React from 'react';
import Hero from '@/components/home/Hero';
import FeaturedDesigns from '@/components/home/FeaturedDesigns';
import DesignerSpotlight from '@/components/home/DesignerSpotlight';
import LocationHighlight from '@/components/home/LocationHighlight';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedDesigns />
      <DesignerSpotlight />
      <LocationHighlight />
    </div>
  );
}
