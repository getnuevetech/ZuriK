'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { designsApi, readyToWearApi, fabricsApi } from '../../lib/api';
import { Spinner } from '../ui/Spinner';
import { PriceDisplay } from '../common/PriceDisplay';
import type { Design, ReadyToWearProduct, Fabric } from '../../types';

interface SectionCardProps {
  id: string;
  image?: string;
  name: string;
  price: number;
  href: string;
  badge?: string;
}

const FALLBACK_DESIGNS: SectionCardProps[] = [
  {
    id: 'fallback-design-1',
    name: 'Bespoke Kente Jacket',
    price: 520,
    href: '/designs',
    badge: 'Custom',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  },
  {
    id: 'fallback-design-2',
    name: 'Royal Ankara Set',
    price: 480,
    href: '/designs',
    badge: 'Custom',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  },
  {
    id: 'fallback-design-3',
    name: 'Modern Dashiki Robe',
    price: 430,
    href: '/designs',
    badge: 'Custom',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 'fallback-design-4',
    name: 'Adire Evening Gown',
    price: 610,
    href: '/designs',
    badge: 'Custom',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4bb7?w=800&q=80',
  },
];

const FALLBACK_RTW: SectionCardProps[] = [
  {
    id: 'fallback-rtw-1',
    name: 'Ready Kitenge Shirt',
    price: 180,
    href: '/ready-to-wear',
    badge: 'Ready to Ship',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  },
  {
    id: 'fallback-rtw-2',
    name: 'Heritage Wrap Dress',
    price: 260,
    href: '/ready-to-wear',
    badge: 'Ready to Ship',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  },
  {
    id: 'fallback-rtw-3',
    name: 'Contemporary Kaftan',
    price: 230,
    href: '/ready-to-wear',
    badge: 'Ready to Ship',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
  },
  {
    id: 'fallback-rtw-4',
    name: 'Classic Dashiki',
    price: 145,
    href: '/ready-to-wear',
    badge: 'Ready to Ship',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
];

const FALLBACK_FABRICS: SectionCardProps[] = [
  {
    id: 'fallback-fabric-1',
    name: 'Premium Ankara Print',
    price: 45,
    href: '/fabrics',
    badge: 'Fabric',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    id: 'fallback-fabric-2',
    name: 'Kente Woven Textile',
    price: 65,
    href: '/fabrics',
    badge: 'Fabric',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
  },
  {
    id: 'fallback-fabric-3',
    name: 'Adire Indigo Cloth',
    price: 52,
    href: '/fabrics',
    badge: 'Fabric',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80',
  },
  {
    id: 'fallback-fabric-4',
    name: 'Shweshwe Cotton',
    price: 39,
    href: '/fabrics',
    badge: 'Fabric',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
  },
];

function SectionCard({ image, name, price, href, badge }: SectionCardProps) {
  return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
        )}
        {badge && (
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)' }}
          >
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

  const displayDesignCards: SectionCardProps[] = featuredDesigns.length > 0
    ? featuredDesigns.slice(0, 8).map((design) => ({
      id: design.id,
      image: design.images?.[0],
      name: design.name,
      price: Number(design.customerPrice),
      href: `/designs/${design.id}`,
      badge: 'Custom',
    }))
    : FALLBACK_DESIGNS;

  const displayRTWCards: SectionCardProps[] = featuredRTW.length > 0
    ? featuredRTW.slice(0, 8).map((product) => ({
      id: product.id,
      image: product.images?.[0],
      name: product.name,
      price: Number(product.customerPrice),
      href: `/ready-to-wear/${product.id}`,
      badge: 'Ready to Ship',
    }))
    : FALLBACK_RTW;

  const displayFabricCards: SectionCardProps[] = featuredFabrics.length > 0
    ? featuredFabrics.slice(0, 8).map((fabric) => ({
      id: fabric.id,
      image: fabric.images?.[0],
      name: fabric.name,
      price: Number(fabric.customerPrice),
      href: `/fabrics/${fabric.id}`,
      badge: 'Fabric',
    }))
    : FALLBACK_FABRICS;

  return (
    <>
      {/* Featured Designs */}
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
            {displayDesignCards.map((design) => (
              <SectionCard
                key={design.id}
                {...design}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ready-to-Wear */}
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
            {displayRTWCards.map((product) => (
              <SectionCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fabrics */}
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
            {displayFabricCards.map((fabric) => (
              <SectionCard
                key={fabric.id}
                {...fabric}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
