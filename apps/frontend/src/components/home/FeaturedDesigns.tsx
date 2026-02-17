import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockDesigns } from '@/data/mockDesigns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice, getCountryFlag } from '@/utils/helpers';

const FeaturedDesigns: React.FC = () => {
  const featuredDesigns = mockDesigns.slice(0, 6);

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
            Featured Designs
          </h2>
          <p className="text-lg text-dark-lighter max-w-2xl mx-auto">
            Discover our curated collection of stunning African fashion pieces from talented
            designers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredDesigns.map((design) => (
            <Link key={design.id} href={`/designs/${design.id}`}>
              <Card hover padding="none" className="overflow-hidden h-full">
                <div className="relative h-64 bg-cream-dark">
                  <Image
                    src={design.images[0]}
                    alt={design.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="gold" size="sm">
                      {getCountryFlag(design.country)} {design.country}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-semibold text-xl text-dark mb-2 line-clamp-1">
                    {design.name}
                  </h3>

                  <p className="text-sm text-dark-lighter mb-3">
                    by {design.designer.firstName} {design.designer.lastName}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">
                      {formatPrice(design.price)}
                    </span>

                    <div className="flex items-center gap-1 text-sm text-dark-lighter">
                      <span className="text-gold">⭐</span>
                      <span>{design.rating.toFixed(1)}</span>
                      <span>({design.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/designs">
            <Button variant="primary" size="lg">
              View All Designs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDesigns;
