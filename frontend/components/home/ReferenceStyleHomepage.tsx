'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { heroBannersApi, type HeroBanner as ApiHeroBanner } from '../../lib/api';

const DESIGN_REFERENCE_IMAGE_BASE = '/images';

const img = (name: string) => `${DESIGN_REFERENCE_IMAGE_BASE}/${name}`;

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  mediaType: string;
  mediaUrl: string;
  thumbName: string;
  thumbPrice: string;
  thumbImage: string;
};

const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Discover our new Collection',
    subtitle: 'Shop from $49',
    ctaText: 'Learn more',
    ctaLink: '/products',
    mediaType: 'image',
    mediaUrl: img('hero-bg.jpg'),
    thumbName: 'Kente Gown',
    thumbPrice: '$ 450.00 USD',
    thumbImage: img('product-1.jpg'),
  },
  {
    id: 'fallback-2',
    title: 'Authentic African Craftsmanship',
    subtitle: 'Premium quality, curated globally',
    ctaText: 'Shop now',
    ctaLink: '/products',
    mediaType: 'image',
    mediaUrl: img('category-dresses.jpg'),
    thumbName: 'Ankara Set',
    thumbPrice: '$ 295.00 USD',
    thumbImage: img('product-2.jpg'),
  },
  {
    id: 'fallback-3',
    title: 'Made for Modern African Style',
    subtitle: 'Styles for every occasion',
    ctaText: 'View products',
    ctaLink: '/products',
    mediaType: 'image',
    mediaUrl: img('category-fabrics.jpg'),
    thumbName: 'Dashiki',
    thumbPrice: '$ 180.00 USD',
    thumbImage: img('product-3.jpg'),
  },
];

const categories = [
  {
    title: 'Fabrics',
    description: '—Find authentic fabrics your wardrobe will love',
    image: img('category-fabrics.jpg'),
    href: '/fabrics',
  },
  {
    title: 'Dresses',
    description: '—Top colors for our new season collection',
    image: img('category-dresses.jpg'),
    href: '/products',
  },
];

const products = [
  { id: 1, name: 'Kente Gown', category: 'Dresses', price: 450, image: img('product-1.jpg'), isNew: false },
  { id: 2, name: 'Ankara Set', category: 'Dresses', price: 295, image: img('product-2.jpg'), isNew: true },
  { id: 3, name: 'Royal Dashiki', category: 'Dresses', price: 180, image: img('product-3.jpg'), isNew: false },
  { id: 4, name: 'Emerald Caftan', category: 'Dresses', price: 380, image: img('product-4.jpg'), isNew: false },
  { id: 5, name: 'Kitenge Fabric', category: 'Fabrics', price: 85, image: img('product-5.jpg'), isNew: false },
  { id: 6, name: 'Headwrap Set', category: 'Accessories', price: 120, image: img('product-6.jpg'), isNew: true },
  { id: 7, name: 'Boubou Gown', category: 'Dresses', price: 520, image: img('product-7.jpg'), isNew: false },
  { id: 8, name: 'Wax Print Bundle', category: 'Fabrics', price: 150, image: img('product-8.jpg'), isNew: false },
];

const posts = [
  { id: 1, title: 'Discover a world of authentic African fashion', category: 'Promos', image: img('blog-1.jpg') },
  { id: 2, title: 'It is time to renew your wardrobe with our new collection', category: 'News', image: img('blog-2.jpg') },
  { id: 3, title: 'Fresh colors for our new season fabrics', category: 'Promos', image: img('blog-3.jpg') },
];

const instagramImages = [
  img('product-1.jpg'),
  img('product-2.jpg'),
  img('category-fabrics.jpg'),
  img('blog-1.jpg'),
  img('product-4.jpg'),
];

export function ReferenceStyleHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(FALLBACK_HERO_SLIDES);

  useEffect(() => {
    heroBannersApi.listActive()
      .then((banners: ApiHeroBanner[]) => {
        if (!Array.isArray(banners) || banners.length === 0) return;
        const sorted = [...banners].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        const mapped: HeroSlide[] = sorted.map((banner, index) => {
          const fallback = FALLBACK_HERO_SLIDES[index % FALLBACK_HERO_SLIDES.length];
          const mediaUrl = banner.mediaUrl || fallback.mediaUrl;
          return {
            id: banner.id,
            title: banner.title || fallback.title,
            subtitle: banner.subtitle || fallback.subtitle,
            ctaText: banner.ctaText || fallback.ctaText,
            ctaLink: banner.ctaLink || fallback.ctaLink,
            mediaType: banner.mediaType || fallback.mediaType,
            mediaUrl,
            thumbName: banner.title || fallback.thumbName,
            thumbPrice: fallback.thumbPrice,
            thumbImage: banner.mediaType === 'image' && mediaUrl ? mediaUrl : fallback.thumbImage,
          };
        });
        setHeroSlides(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const activeSlide = heroSlides[currentSlide] ?? FALLBACK_HERO_SLIDES[0];
  const showVideo = activeSlide.mediaType === 'video' && Boolean(activeSlide.mediaUrl);
  const showGradient = activeSlide.mediaType === 'gradient';
  const heroImage = showGradient ? img('hero-bg.jpg') : activeSlide.mediaUrl;

  return (
    <div className="bg-white">
      <section className="pt-[104px] relative">
        <div className="relative w-full h-[600px] lg:h-[700px]">
          {showVideo ? (
            <video
              key={activeSlide.id}
              src={activeSlide.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={heroImage}
              alt={activeSlide.title}
              fill
              priority
              className="w-full h-full object-cover"
              sizes="100vw"
            />
          )}
          {showGradient && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f2d7a]/70 via-[#1f2d7a]/35 to-transparent" />
          )}

          <div className="absolute top-1/2 left-4 sm:left-8 lg:left-16 transform -translate-y-1/2 bg-white p-6 sm:p-8 max-w-sm shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a237e] mb-2 font-heading">
              {activeSlide.title}
            </h2>
            <p className="text-gray-600 mb-6">{activeSlide.subtitle}</p>
            <Link
              href={activeSlide.ctaLink || '/products'}
              className="inline-block bg-[#00c853] hover:bg-[#00b248] text-white px-6 py-3 font-medium transition-colors"
            >
              {activeSlide.ctaText || 'Learn more'}
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-500">Hero Banners</span>
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                    aria-label="Previous slide"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 bg-[#1a237e] text-white flex items-center justify-center hover:bg-[#0d1450] transition-colors"
                    aria-label="Next slide"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide">
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-3 min-w-[200px] p-2 border-b-2 transition-all cursor-pointer ${
                      index === currentSlide ? 'border-[#1a237e]' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <Image
                      src={slide.thumbImage}
                      alt={slide.thumbName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover"
                    />
                    <div>
                      <p className="font-medium text-[#1a237e] line-clamp-1">{slide.thumbName}</p>
                      <p className="text-sm text-gray-500">{slide.thumbPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link key={category.title} href={category.href} className="relative group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={1200}
                    height={900}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8">
                  <span className="text-xs uppercase tracking-wider text-gray-500">{category.title}</span>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2 font-heading">
                    {category.description}
                  </h3>
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
              <div key={product.id} className="group bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-xs px-2 py-1">
                      NEW
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">{product.category}</span>
                  <h3 className="text-lg font-semibold text-[#1a237e] mt-1 font-heading">{product.name}</h3>
                  <p className="text-gray-500 mt-1">$ {product.price}.00 USD</p>
                  <Link
                    href="/products"
                    className="inline-block mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors"
                  >
                    View more
                  </Link>
                </div>
              </div>
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
            <span className="text-xs uppercase tracking-wider text-gray-500">Journal</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e] mt-2 font-heading">Latest Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="group">
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
                  <span className="text-xs uppercase tracking-wider text-gray-500">{post.category}</span>
                  <h3 className="text-lg font-bold text-[#1a237e] mt-2 font-heading">—{post.title}</h3>
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
              { title: 'Great Prices', description: 'Authentic African fashion at fair prices' },
              { title: 'Free Returns', description: 'Try it first or return it within 30 days' },
              { title: 'Safe Shopping', description: 'Powered by secure payment systems' },
              { title: 'Best Store', description: 'Curated collection from across Africa' },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`p-8 text-center ${
                  index < 3 ? 'border-b sm:border-b-0 sm:border-r border-gray-200' : ''
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#1a237e]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1a237e] font-heading">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="w-full">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">—Instagram</span>
            </div>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {instagramImages.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-64 relative group">
                <Image
                  src={image}
                  alt={`Instagram ${index + 1}`}
                  fill
                  className="w-full h-full object-cover"
                  sizes="256px"
                />
                <div className="absolute inset-0 bg-[#1a237e]/0 group-hover:bg-[#1a237e]/30 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#1a237e] hover:text-[#00c853] transition-colors"
            >
              <span className="text-sm">— Follow us</span>
              <span className="font-semibold">@AfricanFashion</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

