'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { designsApi, readyToWearApi } from '../../lib/api';
import { useCurrency } from '../../lib/currency-context';
import type { Design, ReadyToWearProduct } from '../../types';

interface GridProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  href: string;
}

const HERO_PREVIEW_PRODUCTS = [
  { name: 'Kente Gown', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80' },
  { name: 'Ankara Set', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
  { name: 'Dashiki', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80' },
];

const CATEGORY_SHOWCASE = [
  {
    title: 'Fabrics',
    description: '—Find authentic fabrics your wardrobe will love',
    href: '/fabrics',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
  },
  {
    title: 'Dresses',
    description: '—Top colors for our new season collection',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80',
  },
];

const JOURNAL_POSTS = [
  {
    title: 'What to wear in your city this season',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80',
  },
  {
    title: 'How to style Ankara and Kitenge in modern ways',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
  },
  {
    title: 'The return of statement fabrics in global fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
  },
];

const INSTAGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=700&q=80',
  'https://images.unsplash.com/photo-1596704017254-975dc9f83f40?w=700&q=80',
  'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=700&q=80',
  'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=700&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&q=80',
];

const FALLBACK_PRODUCTS: GridProduct[] = [
  {
    id: 'fallback-r1',
    name: 'Royal Dashiki',
    price: 149,
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80',
    category: 'Ready-to-Wear',
    href: '/products',
  },
  {
    id: 'fallback-r2',
    name: 'Emerald Caftan',
    price: 179,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    category: 'Ready-to-Wear',
    href: '/products',
  },
  {
    id: 'fallback-r3',
    name: 'Kitenge Fabric',
    price: 89,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    category: 'Fabric',
    href: '/fabrics',
  },
  {
    id: 'fallback-r4',
    name: 'Headwrap Set',
    price: 45,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    category: 'Accessories',
    href: '/products',
  },
  {
    id: 'fallback-r5',
    name: 'Boubou Gown',
    price: 165,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    category: 'Ready-to-Wear',
    href: '/products',
  },
  {
    id: 'fallback-r6',
    name: 'Wax Print Bundle',
    price: 110,
    image: 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800&q=80',
    category: 'Fabric',
    href: '/fabrics',
  },
  {
    id: 'fallback-r7',
    name: 'Heritage Maxi',
    price: 198,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    category: 'Ready-to-Wear',
    href: '/products',
  },
  {
    id: 'fallback-r8',
    name: 'Ankara Layer Set',
    price: 132,
    image: 'https://images.unsplash.com/photo-1596704017254-975dc9f83f40?w=800&q=80',
    category: 'Ready-to-Wear',
    href: '/products',
  },
];

function toGridProduct(item: ReadyToWearProduct | Design, type: 'ready-to-wear' | 'design'): GridProduct {
  const firstImage = item.images?.[0] || FALLBACK_PRODUCTS[0].image;
  return {
    id: item.id,
    name: item.name,
    price: Number(item.customerPrice ?? 0),
    image: firstImage,
    category: item.category || (type === 'ready-to-wear' ? 'Ready-to-Wear' : 'Design'),
    href: type === 'ready-to-wear' ? `/ready-to-wear/${item.id}` : `/designs/${item.id}`,
  };
}

export function ReferenceStyleHomepage() {
  const [products, setProducts] = useState<GridProduct[]>(FALLBACK_PRODUCTS);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    Promise.allSettled([
      readyToWearApi.list({ sort: 'newest', limit: 4 }),
      designsApi.list({ sort: 'newest', limit: 4 }),
    ]).then(([rtwResult, designResult]) => {
      const merged: GridProduct[] = [];

      if (rtwResult.status === 'fulfilled') {
        merged.push(
          ...rtwResult.value.items
            .filter((item) => item.isActive)
            .slice(0, 4)
            .map((item) => toGridProduct(item, 'ready-to-wear')),
        );
      }

      if (designResult.status === 'fulfilled') {
        merged.push(
          ...designResult.value.items
            .filter((item) => item.isActive)
            .slice(0, 4)
            .map((item) => toGridProduct(item, 'design')),
        );
      }

      if (merged.length > 0) {
        setProducts(merged.slice(0, 8));
      }
    });
  }, []);

  const heroTicker = useMemo(
    () => [
      { label: 'Products', value: '10,000+' },
      { label: 'Designers', value: '500+' },
      { label: 'Countries', value: '150+' },
    ],
    [],
  );

  return (
    <div className="bg-white">
      <section className="pt-6 lg:pt-10 relative">
        <div className="relative w-full h-[560px] lg:h-[680px]">
          <Image
            src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=2000&q=80"
            alt="African fashion hero"
            fill
            priority
            className="w-full h-full object-cover"
            sizes="100vw"
          />
          <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 -translate-y-1/2 bg-white p-6 sm:p-8 max-w-sm shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a237e] mb-2 font-heading">
              Discover our new Collection
            </h1>
            <p className="text-gray-600 mb-6">Shop from $49</p>
            <Link
              href="/products"
              className="inline-block bg-[#00c853] hover:bg-[#00b248] text-white px-6 py-3 font-medium transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border-y border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-gray-500">Products</div>
              <div className="hidden sm:flex gap-4">
                {HERO_PREVIEW_PRODUCTS.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover"
                    />
                    <span className="text-sm text-[#1a237e] font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
              <Link href="/products" className="text-sm text-[#1a237e] hover:text-[#00c853] transition-colors">
                View more
              </Link>
            </div>
            <div className="mt-4 flex gap-6 sm:gap-10">
              {heroTicker.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1a237e]">{item.value}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CATEGORY_SHOWCASE.map((card) => (
              <Link key={card.title} href={card.href} className="relative group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={1200}
                    height={900}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8">
                  <p className="text-xs uppercase tracking-wider text-gray-500">{card.title}</p>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2">{card.description}</h2>
                  <span className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4">
                    shop now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e] font-heading">Latest products added</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={product.href} className="group bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                  <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-xs px-2 py-1">NEW</span>
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">{product.category}</p>
                  <h3 className="text-lg font-semibold text-[#1a237e] mt-1">{product.name}</h3>
                  <p className="text-gray-500 mt-1">{formatPrice(product.price)}</p>
                  <span className="inline-block mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors">
                    View more
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/products" className="inline-block text-[#1a237e] hover:text-[#00c853] transition-colors underline underline-offset-4">
              view all products
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-gray-500">Journal</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e] mt-2 font-heading">Latest Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {JOURNAL_POSTS.map((post) => (
              <article key={post.title} className="group">
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={1000}
                    height={750}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="bg-white p-6 -mt-8 mx-4 relative shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Post</p>
                  <h3 className="text-lg font-bold text-[#1a237e] mt-2">{post.title}</h3>
                  <Link href="/designers" className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4">
                    read more
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200">
            {[
              {
                title: 'Worldwide Delivery',
                text: 'Reliable shipping to over 150 countries',
                icon: (
                  <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0V3M3 12h18" />
                  </svg>
                ),
              },
              {
                title: 'Premium Quality',
                text: 'Authentic fabrics and meticulous craftsmanship',
                icon: (
                  <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
              {
                title: 'Secure Checkout',
                text: 'Protected payments and buyer assurance',
                icon: (
                  <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 11V6m0 5l5 5" />
                  </svg>
                ),
              },
              {
                title: 'Dedicated Support',
                text: 'Help from our fashion concierge team',
                icon: (
                  <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M18.364 5.636A9 9 0 105.636 18.364M15 9h.01M9 9h.01M8 13h8" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="p-8 text-center border-b sm:border-b-0 sm:border-r last:border-r-0 border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#1a237e]/10 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1a237e]">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center gap-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">—Instagram</p>
          </div>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide">
          {INSTAGRAM_IMAGES.map((image) => (
            <div key={image} className="flex-shrink-0 w-64 h-64 relative group">
              <Image src={image} alt="Instagram gallery" fill className="w-full h-full object-cover" sizes="256px" />
              <div className="absolute inset-0 bg-[#1a237e]/0 group-hover:bg-[#1a237e]/30 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[#1a237e] hover:text-[#00c853] transition-colors"
          >
            <span className="text-sm">— Follow us</span>
            <span className="font-semibold">@AfricanFashion</span>
          </a>
        </div>
      </section>
    </div>
  );
}

