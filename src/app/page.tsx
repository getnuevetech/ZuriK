import React from 'react';
import Hero from '@/components/home/Hero';
import FeaturedDesigns from '@/components/home/FeaturedDesigns';
import DesignerSpotlight from '@/components/home/DesignerSpotlight';
import LocationHighlight from '@/components/home/LocationHighlight';

// Use dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

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
