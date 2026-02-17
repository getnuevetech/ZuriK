'use client';

import React from 'react';
import Link from 'next/link';
import { mockDesigns } from '@/data/mockDesigns';
import DesignCard from '@/components/designs/DesignCard';
import Button from '@/components/ui/Button';

export default function FeaturedDesigns() {
  const featuredDesigns = mockDesigns.filter(d => d.featured).slice(0, 6);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-african-dark mb-4">
            Featured Designs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked pieces from our talented designers. Each design celebrates 
            African heritage with contemporary style.
          </p>
        </div>

        {/* Design Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/designs">
            <Button size="lg" variant="outline">
              View All Designs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
