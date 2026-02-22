'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { designsApi, readyToWearApi, fabricsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Design, ReadyToWearProduct, Fabric } from '../../types';

interface SectionCardProps {
  image?: string;
  name: string;
  price: number;
  href: string;
  badge?: string;
}

function SectionCard({ image, name, price, href, badge }: SectionCardProps) {
  return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 text-sm leading-tight mb-1 line-clamp-1">{name}</h3>
        <PriceDisplay amount={price} className="text-indigo-600 font-bold text-sm" />
      </div>
    </Link>
  );
}

export function FeaturedSections() {
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>([]);
  const [featuredRTW, setFeaturedRTW] = useState<ReadyToWearProduct[]>([]);
  const [featuredFabrics, setFeaturedFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      designsApi.featured().catch(() => []),
      readyToWearApi.featured().catch(() => []),
      fabricsApi.featured().catch(() => []),
    ]).then(([designs, rtw, fabrics]) => {
      setFeaturedDesigns(designs);
      setFeaturedRTW(rtw);
      setFeaturedFabrics(fabrics);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  const hasFeatured = featuredDesigns.length > 0 || featuredRTW.length > 0 || featuredFabrics.length > 0;
  if (!hasFeatured) return null;

  return (
    <>
      {/* Featured Designs */}
      {featuredDesigns.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Custom Orders</p>
                <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Designs</h2>
              </div>
              <Link href="/designs" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Browse All Designs →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredDesigns.slice(0, 8).map((design) => (
                <SectionCard
                  key={design.id}
                  image={design.images?.[0]}
                  name={design.name}
                  price={design.customerPrice}
                  href={`/designs/${design.id}`}
                  badge="Custom"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Ready-to-Wear */}
      {featuredRTW.length > 0 && (
        <section className="py-16 px-4 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Ship Immediately</p>
                <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Ready-to-Wear</h2>
              </div>
              <Link href="/ready-to-wear" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Browse All Ready-to-Wear →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredRTW.slice(0, 8).map((product) => (
                <SectionCard
                  key={product.id}
                  image={product.images?.[0]}
                  name={product.name}
                  price={product.customerPrice}
                  href={`/ready-to-wear/${product.id}`}
                  badge="In Stock"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Fabrics */}
      {featuredFabrics.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-2">Premium Materials</p>
                <h2 className="font-heading text-3xl font-bold text-neutral-900">Featured Fabrics</h2>
              </div>
              <Link href="/fabrics" className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Browse All Fabrics →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredFabrics.slice(0, 8).map((fabric) => (
                <SectionCard
                  key={fabric.id}
                  image={fabric.images?.[0]}
                  name={fabric.name}
                  price={fabric.customerPrice}
                  href={`/fabrics/${fabric.id}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
