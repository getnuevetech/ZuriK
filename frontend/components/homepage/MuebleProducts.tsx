'use client';

import React from 'react';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'Kente Gown',
    category: 'Dresses',
    price: 450,
    image: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=533&fit=crop',
    isNew: false,
    href: '/products',
  },
  {
    id: 2,
    name: 'Ankara Set',
    category: 'Dresses',
    price: 295,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f8f?w=400&h=533&fit=crop',
    isNew: true,
    href: '/products',
  },
  {
    id: 3,
    name: 'Royal Dashiki',
    category: 'Dresses',
    price: 180,
    image: 'https://images.unsplash.com/photo-1627225793904-a9f0c6b50d2a?w=400&h=533&fit=crop',
    isNew: false,
    href: '/products',
  },
  {
    id: 4,
    name: 'Emerald Caftan',
    category: 'Dresses',
    price: 380,
    image: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400&h=533&fit=crop',
    isNew: false,
    href: '/products',
  },
  {
    id: 5,
    name: 'Kitenge Fabric',
    category: 'Fabrics',
    price: 85,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=533&fit=crop',
    isNew: false,
    href: '/fabrics',
  },
  {
    id: 6,
    name: 'Headwrap Set',
    category: 'Accessories',
    price: 120,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=533&fit=crop',
    isNew: true,
    href: '/products',
  },
  {
    id: 7,
    name: 'Boubou Gown',
    category: 'Dresses',
    price: 520,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=533&fit=crop',
    isNew: false,
    href: '/products',
  },
  {
    id: 8,
    name: 'Wax Print Bundle',
    category: 'Fabrics',
    price: 150,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop',
    isNew: false,
    href: '/fabrics',
  },
];

export function MuebleProducts() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold text-[#1a237e]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Latest products added
          </h2>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-white">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-xs px-2 py-1 font-medium">
                    NEW
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs uppercase tracking-wider text-gray-500">{product.category}</span>
                <h3
                  className="text-lg font-semibold text-[#1a237e] mt-1"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {product.name}
                </h3>
                <p className="text-gray-500 mt-1">$ {product.price}.00 USD</p>
                <Link
                  href={product.href}
                  className="inline-block mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors"
                >
                  View more
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-block text-[#1a237e] hover:text-[#00c853] transition-colors underline underline-offset-4"
          >
            view all products
          </Link>
        </div>
      </div>
    </section>
  );
}
